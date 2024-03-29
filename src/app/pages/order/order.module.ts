import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { OrderComponent } from './order.component';
import { ModalsModule, WidgetsModule } from '../../_metronic/partials';

@NgModule({
  declarations: [OrderComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: OrderComponent,
      },
    ]),
    WidgetsModule,
    ModalsModule,
    ReactiveFormsModule,
  ],
})
export class OrderModule {}
