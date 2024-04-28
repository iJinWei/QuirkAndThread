import { Component, Input } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SharedService } from 'src/app/shared.service';
import { ConfirmationModalComponent } from './user-confirmation-modal.component';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-user-edit-modal',
    template: `
    <div class="modal-header">
      <h4 class="modal-title">Edit User Roles</h4>
      <button type="button" class="btn-close" aria-label="Close" (click)="activeModal.dismiss()"></button>
    </div>
    <div class="modal-body">
      <form>
        <div class="mb-3">
          <label class="form-label">Roles</label>
          <div *ngFor="let role of availableRoles">
            <div class="form-check">
              <input
                type="checkbox"
                class="form-check-input"
                [checked]="user.roles.includes(role)"
                (change)="toggleRole(role)"
                id="role-{{ role }}"
              />
              <label class="form-check-label" for="role-{{ role }}">
                {{ role }}
              </label>
            </div>
          </div>
        </div>
      </form>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-primary" (click)="confirmAndSaveChanges()">Save</button>
      <button type="button" class="btn btn-secondary" (click)="activeModal.close()">Close</button>
    </div>
  `,
    styles: [`
      .form-check {
        margin-bottom: 8px; /* Adding space between checkboxes */
      }
      .form-check-input {
        margin-right: 8px; /* Adding space between checkbox and label */
      }
      .modal-footer {
        justify-content: flex-end; /* Align footer content to the end */
      }
    `],
})
export class UserEditModalComponent {
    @Input() user: any;

    // List of available roles to choose from
    availableRoles = ['admin', 'logistic', 'customer'];

    constructor(public activeModal: NgbActiveModal, private sharedService: SharedService) { }

    toggleRole(role: string): void {
        const index = this.user.roles.indexOf(role);
        if (index > -1) {
            // If role is already in the list, remove it
            this.user.roles.splice(index, 1);
        } else {
            // If role is not in the list, add it
            this.user.roles.push(role);
        }
    }

    confirmAndSaveChanges(): void {
        // Configure SweetAlert options for confirmation
        Swal.fire({
            title: 'Are you sure?',
            text: 'Do you want to save the changes?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, save it!',
            cancelButtonText: 'No, cancel',
        }).then((result) => {
            if (result.isConfirmed) {
                // If confirmed, save changes
                this.saveChanges();
            }
        });
    }

    saveChanges(): void {
        this.sharedService.updateUserRoles(this.user.uid, this.user.roles)
            .then(() => {
                // Show a toast message upon successful update
                Swal.fire({
                    toast: true,
                    position: 'top-end', // Position of the toast message
                    icon: 'success',
                    title: 'Roles updated successfully',
                    showConfirmButton: false, // No confirm button for toast
                    timer: 3000, // Duration in milliseconds
                    timerProgressBar: true, // Show progress bar for the timer
                });

                this.activeModal.close(); // Close the modal after a successful update
            })
            .catch((error) => {
                console.error('Error updating user roles:', error);
            });
    }
}
