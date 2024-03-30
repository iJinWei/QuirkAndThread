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
    console.log("refreshOrders()")
  }

  private showAlert(message: string, alertClass: string) {
    const alertElement = document.getElementById('alertMessage');
    if (alertElement) {
      alertElement.innerHTML = `
        <div class="alert ${alertClass} alert-dismissible fade show" role="alert">
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

  ngOnInit() {
    this.refreshOrders();
    console.log("ngOnInit()")
  }

  editOrder(order: any): void {
  }
  
  deleteOrder(id:string) {
    if (confirm("Are you sure you want to delete this order?")) {
      this.service.deleteOrder(id).then((res)=>{
        this.showAlert(`Order ${id} deleted successfully`, `alert-success`);
        this.refreshOrders();
      })
    }
  }

}
