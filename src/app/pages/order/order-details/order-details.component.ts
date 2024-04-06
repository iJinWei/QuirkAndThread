import { Component, ViewChild, OnInit, ChangeDetectorRef } from '@angular/core';
import { ModalConfig, ModalComponent } from '../../../_metronic/partials';
import { SharedService } from 'src/app/shared.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators  } from '@angular/forms';
import { Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { IOrder } from 'src/app/modules/models/order.model';
import { Timestamp } from 'firebase/firestore';
import { CommonModule } from '@angular/common';
import { IOrderItem } from 'src/app/modules/models/order-item.model';
import { AuthService } from 'src/app/modules/auth';


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
  constructor(
    private service:SharedService, 
    private fb: FormBuilder, 
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  order$: Observable<IOrder>;
  orderItems$: Observable<Array<IOrderItem>>;
  editOrderForm: FormGroup;
  orderId: string;
  editMode: boolean;
  public errorMessage: string | null = null;
  isLogistic: boolean = false;
  isAdmin: boolean = false;

  ngOnInit() {
    this.authService.canPerformAction('admin').then(canPerform => {
      if (canPerform) {
        this.isAdmin = true;
      }
      this.authService.canPerformAction('logistic').then(canPerform => {
        if (canPerform) {
          this.isLogistic = true;
        }
        if (this.isAdmin || this.isLogistic) {
          this.refreshOrderDetails()
          this.cdr.detectChanges(); 
          console.log("Load Order Details page")
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

    this.editMode = false;
    this.editOrderForm = this.fb.group({
      orderStatus: ['', Validators.required],
      deliveryStatus: ['', Validators.required]
    });

    this.errorMessage = null;

    console.log("order-details =======> ngOnInit")
  }

  refreshOrderDetails() {
    this.route.params.subscribe(params => {
      this.orderId = params['id']
      this.order$ = this.service.getOrderById(this.orderId)
      this.orderItems$ = this.service.getOrderItemsByOrderId(this.orderId)
      console.log(this.order$)
    })
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
        orderStatus: order.orderStatus || '',
        deliveryStatus: order.deliveryStatus || ''
      })
    }
  }

  updateOrder(order: any) {
    this.authService.canPerformAction('logistic').then(canPerform => {
      if (canPerform) {
        if (this.editOrderForm.valid) {
          this.isLogistic = true
          const orderData = this.editOrderForm.value;
          order.orderStatus = orderData.orderStatus;
          order.deliveryStatus = orderData.deliveryStatus;
          console.log(order)
          this.service.updateOrder(order.id, order).then(() => {
            console.log('Order updated successfully');
            this.resetForm();
            this.toggleEditMode(order)
          }).catch(error => {
            console.error('Error updating order:', error);
            this.displayErrorAlert('Error in updating order. Please try again later.');
          });
        }

      } else {
        this.isLogistic = false;
        this.displayErrorAlert('Unauthorized: Insufficient permissions to perform this action.');
      }
    }).catch(error => {
      console.error('Error checking permissions:', error);
      this.displayErrorAlert('Error checking permissions. Please refresh the page or try again later.');
    });

  }

  resetForm() {
    this.editOrderForm.reset();
  }


  deleteOrder(id:string) {
    this.authService.canPerformAction('logistic').then(canPerform => {
      if (canPerform) {
        this.isLogistic = true
        if (confirm("Are you sure you want to delete this order?")) {
          this.service.deleteOrder(id)
          .then((res)=>{
            console.log('Order deleted successfully');
            this.router.navigate(['/order'])
          })
          .catch(error => {
            console.error('Error in deleting order:', error);
            this.displayErrorAlert('Error in deleting order. Please try again later.');
          })
        }
      } else {
        this.isLogistic = false;
        this.displayErrorAlert('Unauthorized: Insufficient permissions to perform this action.');
      }
    }).catch(error => {
      console.error('Error checking permissions:', error);
      this.displayErrorAlert('Error checking permissions. Please refresh the page or try again later.');
    });
  }
  

  back() {
    this.router.navigate(['/order'])
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
}
