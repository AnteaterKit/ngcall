import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VideoCallComponent } from './video-call.component';
import { OvVideoModule } from './ov-video/ov-video.module';

@NgModule({
  imports: [
    CommonModule,
    OvVideoModule
  ],
  declarations: [VideoCallComponent],
  exports: [VideoCallComponent]
})
export class VideoCallModule { }
