import { Component, ViewChild, OnInit } from '@angular/core';
import { ModalConfig, ModalComponent } from '../../../_metronic/partials';
import { SharedService } from 'src/app/shared.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { IOrder } from 'src/app/models/order.model';
import { Timestamp } from 'firebase/firestore';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-order-details',
  standalone: true,
  imports: [CommonModule],
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
  orderId: string;

  ngOnInit() {
    this.route.params.subscribe(params => {
      const orderId = params['id']
      this.order$ = this.service.getOrderById(orderId)
    })
    console.log("order-details =======> ngOnInit")
  }

  parseDate(date: any) {
    if (date !== undefined) {
      var formattedDate: String = date.toDate().toLocaleString();
      return formattedDate
    }
    return null
    
  }


}
