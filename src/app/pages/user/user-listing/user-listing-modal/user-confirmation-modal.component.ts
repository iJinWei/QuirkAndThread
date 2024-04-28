import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-confirmation-modal',
    template: `
    <div class="modal-header">
      <h4 class="modal-title">Confirm Action</h4>
      <button type="button" class="btn-close" aria-label="Close" (click)="activeModal.dismiss()"></button>
    </div>
    <div class="modal-body">
      <p>Are you sure you want to save changes?</p>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-danger" (click)="confirm()">Yes</button>
      <button type="button" class="btn btn-secondary" (click)="cancel()">No</button>
    </div>
  `,
})
export class ConfirmationModalComponent {
    constructor(public activeModal: NgbActiveModal) { }

    confirm() {
        this.activeModal.close(true); // Return true on confirmation
    }

    cancel() {
        this.activeModal.dismiss(false); // Return false on cancellation
    }
}
