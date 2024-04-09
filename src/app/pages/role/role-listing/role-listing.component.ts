import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Renderer2,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { NgForm } from '@angular/forms';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { Observable, Subscription } from 'rxjs';
import { IRole } from 'src/app/modules/models/role.model';
import { SharedService } from 'src/app/shared.service';
import { SweetAlertOptions } from 'sweetalert2';

@Component({
  selector: 'app-role-listing',
  templateUrl: './role-listing.component.html',
  styleUrls: ['./role-listing.component.scss'],
})
export class RoleListingComponent implements OnInit, AfterViewInit, OnDestroy {
  private clickListener: () => void;

  constructor(
    private cdr: ChangeDetectorRef,
    private renderer: Renderer2,
    private modalService: NgbModal,
    private sharedService: SharedService
  ) {}

  @ViewChild('formModal')
  formModal: TemplateRef<any>;

  @ViewChild('noticeSwal')
  noticeSwal!: SwalComponent;

  swalOptions: SweetAlertOptions = {};

  modalConfig: NgbModalOptions = {
    modalDialogClass: 'modal-dialog modal-dialog-centered mw-650px',
  };

  isCollapsed1 = false;

  isLoading = false;

  isAdding = false;

  roleList$: Observable<IRole[]>;

  roleModel: IRole = { name: '', description: '' };

  reloadEvent: EventEmitter<boolean> = new EventEmitter();

  ngAfterViewInit(): void {
    this.clickListener = this.renderer.listen(document, 'click', (event) => {
      const closestBtn = event.target.closest('.btn');
      if (closestBtn) {
        const { action, id } = closestBtn.dataset;

        switch (action) {
          case 'view':
            break;

          case 'create':
            this.create();
            this.modalService.open(this.formModal, this.modalConfig);
            break;

          case 'edit':
            this.edit(id);
            this.modalService.open(this.formModal, this.modalConfig);
            break;

          case 'delete':
            break;
        }
      }
    });
  }

  ngOnInit(): void {
    this.loadRoles();
  }

  ngOnDestroy(): void {}

  loadRoles() {
    this.roleList$ = this.sharedService.getRoles();
  }

  create() {
    this.isAdding = true;
    this.roleModel = { name: '', description: '' };
  }

  edit(id: string) {
    this.isAdding = false;
    let roleModelSubscription: Subscription;

    roleModelSubscription = this.sharedService
      .getRole(id)
      .subscribe((role: IRole) => {
        this.roleModel = role;
      });
  }

  onSubmit(event: Event, myForm: NgForm) {
    if (myForm && myForm.invalid) {
      return;
    }

    this.isLoading = true;

    const successAlert: SweetAlertOptions = {
      icon: 'success',
      title: 'Success!',
      // text: this.roleList$. > 0 ? 'User updated successfully!' : 'User created successfully!',
    };

    const errorAlert: SweetAlertOptions = {
      icon: 'error',
      title: 'Error!',
      text: '',
    };

    const completeFn = () => {
      this.isLoading = false;
      this.modalService.dismissAll();
      this.roleList$ = this.sharedService.getRoles();
      this.cdr.detectChanges();
    };

    const createFn = () => {
      this.sharedService
        .addRole(this.roleModel)
        .then(() => {
          this.showAlert(successAlert);
          this.reloadEvent.emit(true);
          completeFn();
        })
        .catch((error) => {
          errorAlert.text = this.extractText(error);
          this.showAlert(errorAlert);
          this.isLoading = false;
          completeFn();
        });
    };

    const updateFn = () => {
      let roleData = {
        name: this.roleModel.name,
        description: this.roleModel.description,
      };

      this.sharedService
        .updateRole(this.roleModel.id!, roleData)
        .then(() => {
          this.showAlert(successAlert);
          this.reloadEvent.emit(true);
          completeFn();
        })
        .catch((error) => {
          errorAlert.text = this.extractText(error.error);
          this.showAlert(errorAlert);
          this.isLoading = false;
          completeFn();
        });
    };

    if (this.isAdding) {
      createFn();
    } else {
      updateFn();
    }
  }

  extractText(obj: any): string {
    var textArray: string[] = [];

    for (var key in obj) {
      if (typeof obj[key] === 'string') {
        // If the value is a string, add it to the 'textArray'
        textArray.push(obj[key]);
      } else if (typeof obj[key] === 'object') {
        // If the value is an object, recursively call the function and concatenate the results
        textArray = textArray.concat(this.extractText(obj[key]));
      }
    }

    // Use a Set to remove duplicates and convert back to an array
    var uniqueTextArray = Array.from(new Set(textArray));

    // Convert the uniqueTextArray to a single string with line breaks
    var text = uniqueTextArray.join('\n');

    return text;
  }

  showAlert(swalOptions: SweetAlertOptions) {
    let style = swalOptions.icon?.toString() || 'success';
    if (swalOptions.icon === 'error') {
      style = 'danger';
    }
    this.swalOptions = Object.assign(
      {
        buttonsStyling: false,
        confirmButtonText: 'Ok, got it!',
        customClass: {
          confirmButton: 'btn btn-' + style,
        },
      },
      swalOptions
    );
    this.cdr.detectChanges();
    this.noticeSwal.fire();
  }
}
