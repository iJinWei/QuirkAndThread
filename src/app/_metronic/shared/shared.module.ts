import {NgModule} from '@angular/core';
import {KeeniconComponent} from './keenicon/keenicon.component';
import {CommonModule} from "@angular/common";

@NgModule({
  declarations: [
    KeeniconComponent
  ],
  imports: [
    CommonModule,
  ],
  exports: [
    KeeniconComponent
  ]
})
export class SharedModule {
}
