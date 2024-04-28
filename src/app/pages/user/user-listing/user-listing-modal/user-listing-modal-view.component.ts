import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-user-details-modal',
    template: `
    <div class="modal-header">
      <h4 class="modal-title">User Details</h4>
      <button type="button" class="btn-close" aria-label="Close" (click)="activeModal.dismiss()"></button>
    </div>
    <div class="modal-body">
      <div class="user-details">
        <div class="detail">
          <span class="label"><strong>Name:</strong></span>
          <span class="value">{{ user.name }}</span>
        </div>
        <div class="detail">
          <span class="label"><strong>Email:</strong></span>
          <span class="value">{{ user.email }}</span>
        </div>
        <div class="detail">
            <span class="label"><strong>Last Login:</strong></span>
            <span class="value">{{ user.lastLogin }}</span>
        </div>
        <div class="detail">
            <span class="label"><strong>Join Date:</strong></span>
            <span class="value">{{ user.joinDate }}</span>
        </div>
        <div class="detail">
          <span class="label"><strong>Roles:</strong></span>
          <span class="value">{{ user.roles.join(', ') }}</span>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-primary" (click)="activeModal.close()">Close</button>
    </div>
  `,
    styles: [`
      .user-details {
        display: flex;
        flex-direction: column;
        gap: 8px; /* Adding space between details */
      }
      .detail {
        display: flex;
        justify-content: space-between;
        padding: 8px; /* Adding padding for consistency */
      }
      .label {
        font-weight: bold;
        color: #333; /* Consistent color for labels */
      }
      .value {
        color: #555; /* Consistent color for values */
      }
      .modal-footer {
        justify-content: flex-end; /* Align footer content to the end */
      }
    `],
})
export class UserViewModalComponent {
    @Input() user: any;

    constructor(public activeModal: NgbActiveModal) { }
}
