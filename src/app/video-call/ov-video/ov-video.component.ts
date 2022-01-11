import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { StreamManager } from 'openvidu-browser';

@Component({
  selector: 'app-ov-video',
  templateUrl: './ov-video.component.html',
  styleUrls: ['./ov-video.component.scss']
})
export class OvVideoComponent implements OnInit {

  @ViewChild('videoElement') elementRef: ElementRef | undefined;

  _streamManager: StreamManager | undefined;

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this._streamManager!.addVideoElement(this.elementRef!.nativeElement);
  }

  @Input()
  set stream(streamManager: StreamManager) {
    this._streamManager = streamManager;
    if (!!this.elementRef) {
      this._streamManager.addVideoElement(this.elementRef.nativeElement);
    }
  }

}
