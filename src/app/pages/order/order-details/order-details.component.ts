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
import Swal from 'sweetalert2';
import { CloudFunctionService } from 'src/app/cloud-function.service';


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
    private validationService: FormValidationService,
    private cloudFunctionService: CloudFunctionService
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
    }
  }

  updateOrder(order: any) {

    // First, ask for confirmation before proceeding with the save action
  Swal.fire({
    title: 'Are you sure?',
    text: 'Do you really want to save the order?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, save it',
    cancelButtonText: 'No, cancel',
  }).then(async (result) => {
    if (result.isConfirmed) {
      // If the user confirms, show a loading indicator
      Swal.fire({
        title: 'Saving...',
        text: 'Please wait while the order is being saved.',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading(); // Show loading spinner
        },
      });

      this.isAdmin = await this.authService.canPerformAction('admin')
      this.isLogistic = await this.authService.canPerformAction('logistic')

      if (this.isAdmin || (this.isLogistic && this.orderAssignedToThisLogistic)) {
        if (this.editOrderForm.valid) {
          const orderData = {orderId: order.id, newData: this.editOrderForm.value};
          this.cloudFunctionService.callEditOrderFunction(orderData)
          .then(() => {
            Swal.fire({
              title: 'Success!',
              text: 'Order saved successfully.',
              icon: 'success',
            });
            console.log('Order updated successfully');
            // this.displaySuccessAlert("Order updated successfully");
            this.resetForm();
            this.toggleEditMode(order);
            // this.back();
          }).catch(error => {
            console.error('Error updating order:', error);
            Swal.fire({
              title: 'Error',
              text: 'Error saving order. Please try again.',
              icon: 'error',
            });
          })
          // this.validationService.validateEditOrderForm(orderData).subscribe(
          //   (response) => {
          //     order.deliveryPersonnelId = orderData.deliveryPersonnel;
          //     order.orderStatus = orderData.orderStatus;
          //     order.deliveryStatus = orderData.deliveryStatus;

          //     this.service.updateOrder(order.id, order).then(() => {
          //       Swal.fire({
          //         title: 'Success!',
          //         text: 'Order saved successfully.',
          //         icon: 'success',
          //       });
          //       console.log('Order updated successfully');
          //       // this.displaySuccessAlert("Order updated successfully");
          //       this.resetForm();
          //       this.toggleEditMode(order);
          //       // this.back();
          //     }).catch(error => {
          //       console.error('Error updating order:', error);
          //       Swal.fire({
          //         title: 'Error',
          //         text: 'Error saving order. Please try again.',
          //         icon: 'error',
          //       });
          //       // this.displayErrorAlert('Error in updating order. Please try again later.');
          //     });
          //   }, 
          //   (error) => {
          //     console.error('Invalid Form', error);
          //     Swal.fire({
          //       title: 'Error',
          //       text: 'Error validating order form. Please try again.',
          //       icon: 'error',
          //     });
          //     // this.displayErrorAlert('Error saving order. Please try again.');
          //   }
          // )
        } else {
          // this.displayErrorAlert('Invalid form.');
          Swal.fire({
            title: 'Error',
            text: 'Please correct the form errors and try again.',
            icon: 'warning',
          });
        }
      } else {
        Swal.fire({
          title: 'Permission Error',
          text: 'Unauthorized: Insufficient permissions to perform this action.',
          icon: 'error',
        });
        // this.displayErrorAlert('Unauthorized: Insufficient permissions to perform this action.');
      }
    } else {
      // If the user cancels, display a cancellation message
      Swal.fire({
        title: 'Cancelled',
        text: 'Action canceled by the user.',
        icon: 'info',
      });
    }
  })

  }

  resetForm() {
    this.editOrderForm.reset();
  }


  deleteOrder(orderId:string) {
    // Ask for confirmation before deleting
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this order?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'No, keep it',
    }).then((result) => {
      if (result.isConfirmed) {
        // If the user confirms, proceed with the delete action
        this.authService.canPerformAction('admin').then(canPerform => {
          if (!canPerform) {
            this.displayAlert('Unauthorized: Insufficient permissions to perform this action.', 'error');
            return;
          }
          this.cloudFunctionService.callDeleteOrderFunction(orderId)
          .then(result => {
            Swal.fire({
              title: 'Success!',
              text: 'Order deleted successfully.',
              icon: 'success',
            });
          })
          .catch(error => {
            console.error('Error deleting Order:', error);
              Swal.fire({
                title: 'Error',
                text: 'Error deleting Order. Please try again.',
                icon: 'error',
              });
          });

        }).catch(error => {
          console.error('Error checking permissions:', error);
          this.displayAlert('Error checking permissions. Please refresh the page or try again later.', 'error');
        });
      } else {
        // If the user cancels, display a message or take no action
        this.displayAlert('Deletion canceled by the user.', 'info');
      }
    });
  }
  //   this.isAdmin = await this.authService.canPerformAction('admin')
  //   if (this.isAdmin) {
  //     if (confirm("Are you sure you want to delete this order?")) {
  //       this.service.deleteOrder(id)
  //       .then((res)=>{
  //         console.log('Order deleted successfully');
  //         this.back()
  //       })
  //       .catch(error => {
  //         console.error('Error in deleting order:', error);
  //         this.displayErrorAlert('Error in deleting order. Please try again later.');
  //       })
  //     }
  //   } else {
  //     this.displayErrorAlert('Unauthorized: Insufficient permissions to perform this action.');
  //   }
  // }
  

  back() {
    this.router.navigate(['/order'])
  }

  displayAlert(message: string, icon: 'success' | 'error' | 'warning' | 'info' = 'error') {
    Swal.fire({
      title: message,
      icon: icon,
      confirmButtonText: 'OK',
    });
  }
  
  private showAlert(message: string, type: string) {
    let styleClass = "";
    if (type === "error") {
      styleClass = "alert-danger";
    } else {
      styleClass = "alert-success";
    }
    const alertElement = document.getElementById('alertMessage');
    if (alertElement) {
      alertElement.innerHTML = `
        <div class="alert ${styleClass} alert-dismissible fade show" role="alert">
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
    this.showAlert(message, "error");
    this.cdr.detectChanges(); 
    console.log('errorMessage: ' + message);
  }

  private displaySuccessAlert(message: string) {
    this.showAlert(message, "success");
    this.cdr.detectChanges(); 
  }
}
