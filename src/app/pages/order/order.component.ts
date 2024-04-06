import { Component, ViewChild, OnInit, ChangeDetectorRef } from '@angular/core';
import { ModalConfig, ModalComponent } from '../../_metronic/partials';
import { SharedService } from 'src/app/shared.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/modules/auth';
import { Router } from '@angular/router';

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
  constructor(
    private service:SharedService, 
    private fb: FormBuilder,  
    private authService:AuthService, 
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  orders$: Observable<any[]>;
  public errorMessage: string | null = null;
  isLogistic: boolean = false;
  isAdmin: boolean = false;

  ngOnInit() {
    this.errorMessage = null;
    this.refreshOrders();
  }

  refreshOrders() {
    this.orders$ = this.service.getOrders();
    console.log("retrieving all orders")
  }

  private showAlert(message: string) {
    const alertElement = document.getElementById('alertMessage');
    if (alertElement) {
      alertElement.innerHTML = `
        <div class="alert alert-danger alert-dismissible fade show" role="alert">
          ${message}
          <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
      `;
      const closeButton = alertElement.querySelector('.btn-close');
      if (closeButton) {
        closeButton.addEventListener('click', () => {
          alertElement.innerHTML = ''; // Close the alert when the close button is clicked
        });
      }
    }
  }
  
  // for testing only.
  createOrder() {
    let order = {
      "name": "Tester",
      "date": new Date(),
      "orderStatus": "Processing",
      "deliveryStatus": "Shipped",
      "totalAmount": "100",
      "userId": "d6jCHdfYFzz8ltiI0VbP"
    }
    this.service.addOrder(order).then((res) => {
      const newOrderId = res.id
      let orderItem1 = {
        "productId": "vzI2ZrBAKjw8cZLPIaiH",
        "orderId": newOrderId,
        "price": "25",
        "quantity": "2",
        "productName": "Performance Running T-Shirt"
      }
      let orderItem2 = {
        "productId": "7d9AKgu0dFZ4fzcU2jWw",
        "orderId": newOrderId,
        "price": "50",
        "quantity": "1",
        "productName": "Fitness Training Tracksuit"
      }
      this.service.addOrderItem(orderItem1)
      this.service.addOrderItem(orderItem2)
    });

  }

}
