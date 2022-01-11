import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OvVideoComponent } from './ov-video.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [OvVideoComponent],
  exports: [OvVideoComponent]
})
export class OvVideoModule { }
