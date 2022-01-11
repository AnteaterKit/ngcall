import { Component, OnInit } from '@angular/core';
import { StreamManager } from 'openvidu-browser';
import { filter, tap } from 'rxjs';
import { VideoCallService } from './services/video-call.service';

@Component({
  selector: 'app-video-call',
  templateUrl: './video-call.component.html',
  styleUrls: ['./video-call.component.scss']
})
export class VideoCallComponent implements OnInit {

  users = [1, 2, 3, 4, 5, 6];
  currentUser: StreamManager  | undefined = undefined;
  constructor(private videoCallService: VideoCallService) { }

  ngOnInit() {
  }

  join() {
    this.videoCallService.join();

    this.videoCallService.currentUser$
    .pipe(
      filter(x => !!x),
      tap(x => {
        this.currentUser = x;
      })
    ).subscribe();
  }
}
