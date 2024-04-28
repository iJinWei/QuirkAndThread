import { Component, ViewChild, OnInit, ChangeDetectorRef } from '@angular/core';
import { ModalConfig, ModalComponent } from '../../../_metronic/partials';
import { SharedService } from 'src/app/shared.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators  } from '@angular/forms';
import { Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { IOrder } from 'src/app/modules/models/order.model';
import { CommonModule } from '@angular/common';
import { AuthService } from 'src/app/modules/auth';
import { User, IUser } from 'src/app/modules/models/user.model';
import { FormValidationService } from '../../form-validation.service';


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
    private cdr: ChangeDetectorRef,
    private validationService: FormValidationService
  ) {}

  order$: Observable<IOrder>;

  editOrderForm: FormGroup;
  orderId: string;
  editMode: boolean;
  isLogistic: boolean = false;
  isAdmin: boolean = false;
  orderAssignedToThisLogistic: boolean = false;
  userId: string;

  orderStatuses: any[] = [];
  deliveryStatuses: any[] = [];
  
  // For loading list of delivery users
  deliveryUsers: any[] = [];

  // For using this order's delivery person details
  deliveryPersonForThisOrder$: Observable<IUser>;

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
          this.refreshOrderDetails();

          this.loadDeliveryPersonnel();
          this.loadOrderStatuses();
          this.loadDeliveryStatuses();

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
      deliveryPersonnel: ['', Validators.required],
      deliveryStatus: ['', Validators.required]
    });
  }

  refreshOrderDetails() {
    this.route.params.subscribe(params => {
      this.orderId = params['id']
      console.log("Refreshing order details")
      
      // Getting order details
      this.order$ = this.service.getOrderById(this.orderId)

      // Getting this user id
      this.authService.getUser().subscribe((user) => {
        this.userId = user.uid
        // Getting this order's delivery person details: name
        try {
          this.service.getField(this.order$, 'deliveryPersonnelId').subscribe((res) => {
            if (res) {
              if (this.isAdmin || (this.isLogistic && this.userId ==  res)) {
                this.orderAssignedToThisLogistic = true;
                this.deliveryPersonForThisOrder$ = this.service.getUserById(res)
              }
            }
          })
        } catch(err) {
          console.error("Encountered error when loading order details: " + err)
          this.displayErrorAlert('Encountered error when loading order details. Please try again later');
        }

      })
    })
  }

  
  loadDeliveryPersonnel() {
    this.service.getAllDeliveryPersonnel().subscribe((res) => {
      this.deliveryUsers = res;
    });
  }

  loadOrderStatuses() {
    this.service.getOrderStatuses().subscribe((res) => {
      this.orderStatuses = res;
    })
  }

  loadDeliveryStatuses() {
    this.service.getDeliveryStatuses().subscribe((res) => {
      this.deliveryStatuses = res;
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
        deliveryPersonnel: order.deliveryPersonnelId || '',
        deliveryStatus: order.deliveryStatus || ''
      })

      if (this.isLogistic && this.isAdmin) {
        this.editOrderForm.get('orderStatus')?.disable();
        this.editOrderForm.get('deliveryPersonnel')?.disable();
      }
    }
  }

  async updateOrder(order: any) {
    this.isAdmin = await this.authService.canPerformAction('admin')
    this.isLogistic = await this.authService.canPerformAction('logistic')

    if (this.isAdmin || (this.isLogistic && this.orderAssignedToThisLogistic)) {
      if (this.editOrderForm.valid) {
        const orderData = this.editOrderForm.value;
        this.validationService.validateEditOrderForm(orderData).subscribe(
          (response) => {
            order.deliveryPersonnelId = orderData.deliveryPersonnel;
            order.orderStatus = orderData.orderStatus;
            order.deliveryStatus = orderData.deliveryStatus;

            this.service.updateOrder(order.id, order).then(() => {
              console.log('Order updated successfully');
              this.resetForm();
              this.toggleEditMode(order);
              this.back();
            }).catch(error => {
              console.error('Error updating order:', error);
              this.displayErrorAlert('Error in updating order. Please try again later.');
            });
          }, 
          (error) => {
            console.error('Invalid Form', error);
            this.displayErrorAlert('Error saving product. Please try again.');
          }
        )
      } else {
        this.displayErrorAlert('Invalid form.');
      }
    } else {
      this.displayErrorAlert('Unauthorized: Insufficient permissions to perform this action.');
    }

  }

  resetForm() {
    this.editOrderForm.reset();
  }


  async deleteOrder(id:string) {
    this.isAdmin = await this.authService.canPerformAction('admin')
    if (this.isAdmin) {
      if (confirm("Are you sure you want to delete this order?")) {
        this.service.deleteOrder(id)
        .then((res)=>{
          console.log('Order deleted successfully');
          this.back()
        })
        .catch(error => {
          console.error('Error in deleting order:', error);
          this.displayErrorAlert('Error in deleting order. Please try again later.');
        })
      }
    } else {
      this.displayErrorAlert('Unauthorized: Insufficient permissions to perform this action.');
    }
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
