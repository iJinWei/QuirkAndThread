import { Component, ViewChild, OnInit } from '@angular/core';
import { ModalConfig, ModalComponent } from '../../../_metronic/partials';
import { SharedService } from 'src/app/shared.service';
import { FormBuilder, FormGroup, ReactiveFormsModule  } from '@angular/forms';
import { Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { IOrder } from 'src/app/models/order.model';
import { Timestamp } from 'firebase/firestore';
import { CommonModule } from '@angular/common';
import { IOrderItem } from 'src/app/models/order-item.model';


@Component({
  selector: 'app-order-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule ],
  templateUrl: './order-details.component.html',
  styleUrl: './order-details.component.scss'
})
export class OrderDetailsComponent implements OnInit {
  modalConfig: ModalConfig = {
    modalTitle: 'Modal title',
    dismissButtonLabel: 'Submit',
    closeButtonLabel: 'Cancel'
  };
  @ViewChild('modal') private modalComponent: ModalComponent;
  constructor(private service:SharedService, private fb: FormBuilder, private route: ActivatedRoute,) {

  }
  order$: Observable<IOrder>;
  orderItems$: Observable<Array<IOrderItem>>;
  editOrderForm: FormGroup;
  orderId: string;
  editMode: boolean;

  ngOnInit() {
    this.route.params.subscribe(params => {
      const orderId = params['id']
      this.order$ = this.service.getOrderById(orderId)
      this.orderItems$ = this.service.getOrderItemsByOrderId(orderId)
      console.log(this.order$)
    })
    this.editMode = false;
    this.editOrderForm = this.fb.group({
      // name: [''],
      status: ['']
    });
    console.log("order-details =======> ngOnInit")
  }

  parseDate(date: any) {
    if (date !== undefined) {
      var formattedDate: String = date.toDate().toLocaleString();
      return formattedDate
    }
    return null
    
  }

  toggleEditMode(order: any): void {
    this.editMode = !this.editMode;
    if (this.editMode === true) {
      this.editOrderForm.setValue({
        status: order.status || ''
      })
    }
  }

  // only updates the order status
  updateOrder(order: any) {
    const orderData = this.editOrderForm.value;
    order.status = orderData.status;
    console.log(order)
    this.service.updateOrder(order.id, order).then(() => {
      console.log('Order updated successfully');
      this.resetForm();
      this.toggleEditMode(order)
    }).catch(error => {
      console.error('Error updating product:', error);
    });
  }

  resetForm() {
    this.editOrderForm.reset();
  }

}
