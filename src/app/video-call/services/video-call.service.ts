import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { OpenVidu, Publisher, Session, StreamEvent, StreamManager } from 'openvidu-browser';
import { join } from 'path';
import { BehaviorSubject, catchError, from, of, switchMap, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VideoCallService {
  OPENVIDU_SERVER_URL = 'https://' + location.hostname + ':4443';
  OPENVIDU_SERVER_SECRET = 'MY_SECRET';

  OV!: OpenVidu;
  session!: Session;
  publisher: StreamManager | undefined;
  subscribers: StreamManager[] = [];

  sessionId: string = Math.round((new Date()).getTime() / 1000).toString();
  userName: string = Math.round((new Date()).getTime() / 1000).toString();

  users$ = new BehaviorSubject<StreamManager[]>(new Array<StreamManager>());
  currentUser$ = new BehaviorSubject<StreamManager | undefined>(undefined);

  constructor(private httpClient: HttpClient) { }

  join() {
    this.OV = new OpenVidu();
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

  initPublisher() {
    const publisher: Publisher = this.OV.initPublisher('', {
      audioSource: undefined,
      videoSource: undefined,
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
   
    });

    this.session.on('streamDestroyed', (event: any) => {
     
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

