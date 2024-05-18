import { Component, ViewChild, OnInit, ChangeDetectorRef } from '@angular/core';
import { ModalConfig, ModalComponent } from '../../_metronic/partials';
import { SharedService } from 'src/app/shared.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/modules/auth';
import { Router } from '@angular/router';
import { CloudFunctionService } from 'src/app/cloud-function.service';

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
    private router: Router,
    private cloudFunctionService: CloudFunctionService
  ) {}

  orders$: Observable<any[]>;
  isLogistic: boolean = false;
  isAdmin: boolean = false;

  ngOnInit() {

    // check roles
    this.authService.canPerformAction('admin').then(canPerform => {
      if (canPerform) {
        this.isAdmin = true;
      }
      this.authService.canPerformAction('logistic').then(canPerform => {
        if (canPerform) {
          this.isLogistic = true;
        }

        if (this.isAdmin) {
          // if admin role, retrieve all orders
          this.refreshOrdersForAdmin();
          this.cdr.detectChanges(); 
          console.log("Load Orders page")
        } else if (this.isLogistic) {
          // if logistic role, retrieve all orders assigned to this logistic user
          this.authService.getUser().subscribe((res) => {
            // using user id, instead of uid
            const userId = res.uid;
            // this.refreshOrdersForAdmin();
            this.refreshOrdersForLogistic(userId)
            this.cdr.detectChanges();
            console.log("Load Orders page")
          })
        } else {
          this.displayErrorAlert('Unauthorized: Insufficient permissions to view this page.');
        }
      }).catch(error => {
        console.error('Error checking permissions:', error);
        this.displayErrorAlert('Error checking permissions. Please refresh the page or try again later.');
      })
    }).catch(error => {
      console.error('Error checking permissions:', error);
      this.displayErrorAlert('Error checking permissions. Please refresh the page or try again later.');
    });
  }

  refreshOrdersForAdmin() {
    this.orders$ = this.cloudFunctionService.callViewOrdersFunction({})
    console.log("retrieving all orders")
  }

  refreshOrdersForLogistic(userId: string) {
    this.orders$ = this.cloudFunctionService.callViewAssignedOrdersFunction({})
    console.log("retrieving all orders for logistic user")
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

  private displayErrorAlert(message: string) {
    this.showAlert(message);
    this.cdr.detectChanges(); 
    console.log('errorMessage: ' + message);
  }
  
  // for testing only.
  // createOrder() {
  //   let order = {
  //     "name": "Tester",
  //     "date": new Date(),
  //     "orderStatus": "Processing",
  //     "deliveryStatus": "Shipped",
  //     "totalAmount": "100",
  //     "userId": "d6jCHdfYFzz8ltiI0VbP",
  //     "deliveryPersonnelId": "DIp2hTTwFkToW8S7F3UX1rtrht73"
  //   }
  //   this.service.addOrder(order).then((res) => {
  //     const newOrderId = res.id
  //     let orderItem1 = {
  //       "productId": "vzI2ZrBAKjw8cZLPIaiH",
  //       "orderId": newOrderId,
  //       "price": "25",
  //       "quantity": "2",
  //       "productName": "Performance Running T-Shirt"
  //     }
  //     let orderItem2 = {
  //       "productId": "7d9AKgu0dFZ4fzcU2jWw",
  //       "orderId": newOrderId,
  //       "price": "50",
  //       "quantity": "1",
  //       "productName": "Fitness Training Tracksuit"
  //     }
  //     this.service.addOrderItem(orderItem1)
  //     this.service.addOrderItem(orderItem2)
  //   });

  // }

}
