import { Component, OnInit } from '@angular/core';
import { VideoCallService } from './services/video-call.service';

@Component({
  selector: 'app-video-call',
  templateUrl: './video-call.component.html',
  styleUrls: ['./video-call.component.scss']
})
export class VideoCallComponent implements OnInit {

  users = [1, 2, 3, 4, 5, 6];
  constructor(private videoCallService: VideoCallService) { }

  ngOnInit() {
  }

  join() {
    this.videoCallService.join();
  }
}
