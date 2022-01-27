import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { OpenVidu, Publisher, Session, StreamEvent, StreamManager, Subscriber } from 'openvidu-browser';
import { join } from 'path';
import { BehaviorSubject, catchError, from, of, switchMap, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VideoCallService {
  OPENVIDU_SERVER_URL = 'https://' + location.hostname + ':4443';
  OPENVIDU_SERVER_SECRET = 'MY_SECRET';

  OV: OpenVidu = new OpenVidu();
  session!: Session;
  publisher!: Publisher;
  screenPublisher!: Publisher;
  subscribers: StreamManager[] = [];

  sessionId: string = '7979798'; //Math.round((new Date()).getTime() / 1000).toString();
  userName: string = Math.round((new Date()).getTime() / 1000).toString();

  users$ = new BehaviorSubject<StreamManager[]>(new Array<StreamManager>());
  currentUser$ = new BehaviorSubject<StreamManager | undefined>(undefined);
  videoEnabled = true;
  deviceId = '';

  constructor(private httpClient: HttpClient) {
  }

  setDevice(userId: string) {
    from(this.OV.getDevices())
    .pipe(
      tap(x => {
        console.log('dev ', x);
        const videoDevices = x.filter(x => x.kind === 'videoinput');
        // videoDevices[0].
        console.log();
        if (userId === '1') {
          this.deviceId = videoDevices[0].deviceId;
        } else {
          this.deviceId = videoDevices[1].deviceId; 
        }
      })
    ).subscribe();
  }

  join() {
    this.session = this.OV.initSession();
    this.subscribeSessionEvents();

    from(this.getToken())
    .pipe(
      switchMap((token: string) => {
        return from(this.session.connect(token, { clientData: this.userName }))
      }),
      tap(() => {
        this.initPublisher();
      })
    ).subscribe();
  }

  enableVideo() {
    this.publisher!.publishVideo(true);
    this.videoEnabled = true;
  }

  disableVideo() {
    this.publisher!.publishVideo(false);
    this.videoEnabled = false;
  }

  shareScreen() {
    this.initScreenPublisher();

  }

  initPublisher() {
    const publisher: Publisher = this.OV.initPublisher('', {
      audioSource: undefined,
      videoSource: this.deviceId,
      publishAudio: true,
      publishVideo: true,
      resolution: '640x480',
      frameRate: 30,
      insertMode: 'APPEND',
      mirror: false
    });

    this.session.publish(publisher);
    this.publisher = publisher;
    this.currentUser$.next(publisher);
  }

  initScreenPublisher() {
    const publisher: Publisher = this.OV.initPublisher('', {
      audioSource: undefined,
      videoSource: 'screen',
      publishAudio: true,
      publishVideo: true,
      resolution: '640x480',
      frameRate: 30,
      insertMode: 'APPEND',
      mirror: false
    });

    this.session.publish(publisher);
    this.publisher = publisher;
    this.currentUser$.next(publisher);
  }

  subscribeSessionEvents() {
    this.session.on('streamCreated', (event: any) => {
      const subscriber: Subscriber = this.session.subscribe(event.stream, '');
      this.users$.value.push(subscriber);
      this.users$.next([...this.users$.value]);
    });

    this.session.on('streamDestroyed', (event: any) => {
     // Удалить пользователя с конференции
    });

    this.session.on('publisherStartSpeaking', (event: any) => {
      // пробросить событие и подстветить юзера с event.connection.connectionId
    });

    this.session.on('publisherStopSpeaking', (event: any) => {
      // пробросить событие и подстветить 
    });
  }

  getToken(): Promise<string> {
    return this.createSession(this.sessionId).then(
      sessionId => {
        return this.createToken(sessionId);
      })
  }

  createSession(sessionId: string): Promise<string> {
    return new Promise((resolve, reject) => {

      const body = JSON.stringify({ customSessionId: sessionId });
      const options = {
        headers: new HttpHeaders({
          'Authorization': 'Basic ' + btoa('OPENVIDUAPP:' + this.OPENVIDU_SERVER_SECRET),
          'Content-Type': 'application/json'
        })
      };
      return this.httpClient.post(this.OPENVIDU_SERVER_URL + '/openvidu/api/sessions', body, options)
        .pipe(
          catchError(error => {
            if (error.status === 409) {
              resolve(sessionId);
            } else {
              console.warn('No connection to OpenVidu Server. This may be a certificate error at ' + this.OPENVIDU_SERVER_URL);
              if (window.confirm('No connection to OpenVidu Server. This may be a certificate error at \"' + this.OPENVIDU_SERVER_URL +
                '\"\n\nClick OK to navigate and accept it. If no certificate warning is shown, then check that your OpenVidu Server' +
                'is up and running at "' + this.OPENVIDU_SERVER_URL + '"')) {
                location.assign(this.OPENVIDU_SERVER_URL + '/accept-certificate');
              }
            }
            return observableThrowError(error);
          })
        )
        .subscribe((response: any) => {
          console.log(response);
          resolve(response['id']);
        });
    });
  }

  createToken(sessionId: string): Promise<string> {
    return new Promise((resolve, reject) => {

      const body = {};
      const options = {
        headers: new HttpHeaders({
          'Authorization': 'Basic ' + btoa('OPENVIDUAPP:' + this.OPENVIDU_SERVER_SECRET),
          'Content-Type': 'application/json'
        })
      };
      return this.httpClient.post(this.OPENVIDU_SERVER_URL + '/openvidu/api/sessions/' + sessionId + '/connection', body, options)
        .pipe(
          catchError(error => {
            reject(error);
            return observableThrowError(error);
          })
        )
        .subscribe((response: any) => {
          console.log(response);
          resolve(response['token']);
        });
    });
  }
}

function observableThrowError(error: any): any {
  throw new Error('Function not implemented.');
}

