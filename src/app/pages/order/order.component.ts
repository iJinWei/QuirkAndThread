import { Component, ViewChild, OnInit } from '@angular/core';
import { ModalConfig, ModalComponent } from '../../_metronic/partials';
import { SharedService } from 'src/app/shared.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrl: './order.component.scss'
})
export class OrderComponent implements OnInit {
  modalConfig: ModalConfig = {
    modalTitle: 'Modal title',
    dismissButtonLabel: 'Submit',
    closeButtonLabel: 'Cancel'
  };
  @ViewChild('modal') private modalComponent: ModalComponent;
  constructor(private service:SharedService, private fb: FormBuilder) {}

  orders$: Observable<any[]>;

  refreshOrders() {
    this.orders$ = this.service.getOrders();
  }

  ngOnInit() {
    this.refreshOrders();
  }

  editOrder(order: any): void {
  }
  
  deleteOrder(id:string) {
  }

}
