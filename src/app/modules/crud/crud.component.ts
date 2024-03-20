import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output, Renderer2, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { DataTableDirective } from 'angular-datatables';
import { fromEvent } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';
import { SweetAlertOptions } from 'sweetalert2';

@Component({
  selector: 'app-crud',
  templateUrl: './crud.component.html',
  styleUrls: ['./crud.component.scss'],
})
export class CrudComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input() datatableConfig: DataTables.Settings = {};

  @Input() route: string = '/';

  // Reload emitter inside datatable
  @Input() reload: EventEmitter<boolean>;

  @Input() modal: TemplateRef<any>;

  @Output() deleteEvent = new EventEmitter<number>();
  @Output() editEvent = new EventEmitter<number>();
  @Output() createEvent = new EventEmitter<boolean>();

  dtOptions: DataTables.Settings = {};

  @ViewChild(DataTableDirective, { static: false })
  private datatableElement: DataTableDirective;

  @ViewChild('deleteSwal')
  public readonly deleteSwal!: SwalComponent;

  @ViewChild('successSwal')
  public readonly successSwal!: SwalComponent;

  private idInAction: number;

  modalConfig: NgbModalOptions = {
    modalDialogClass: 'modal-dialog modal-dialog-centered mw-650px',
  };

  swalOptions: SweetAlertOptions = { buttonsStyling: false };

  private modalRef: NgbModalRef;

  private clickListener: () => void;

  constructor(private renderer: Renderer2, private router: Router, private modalService: NgbModal) { }

  ngOnInit(): void {
    this.dtOptions = {
      dom: "<'row'<'col-sm-12'tr>>" +
        "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
      processing: true,
      language: {
        processing: '<span class="spinner-border spinner-border-sm align-middle"></span> Loading...'
      }, ...this.datatableConfig
    };
    this.renderActionColumn();

    this.setupSweetAlert();

    if (this.reload) {
      this.reload.subscribe(data => {
        this.modalService.dismissAll();
        this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => dtInstance.ajax.reload());
      });
    }
  }

  renderActionColumn(): void {
    const actionColumn = {
      sortable: false,
      title: 'Actions',
      render: (data: any, type: any, full: any) => {
        const editButton = `
          <button class="btn btn-icon btn-active-light-primary w-30px h-30px me-3" data-action="edit" data-id="${full.id}">
            <i class="ki-duotone ki-pencil fs-3"><span class="path1"></span><span class="path2"></span></i>
          </button>`;

        const deleteButton = `
          <button class="btn btn-icon btn-active-light-primary w-30px h-30px" data-action="delete" data-id="${full.id}">
            <i class="ki-duotone ki-trash fs-3">
              <span class="path1"></span><span class="path2"></span>
              <span class="path3"></span><span class="path4"></span><span class="path5"></span>
            </i>
          </button>`;

        const buttons = [];

        if (this.editEvent.observed) {
          buttons.push(editButton);
        }

        if (this.deleteEvent.observed) {
          buttons.push(deleteButton);
        }

        return buttons.join('');
      },
    };

    if (this.dtOptions.columns) {
      this.dtOptions.columns.push(actionColumn);
    }
  }

  ngAfterViewInit(): void {
    this.clickListener = this.renderer.listen(document, 'click', (event) => {
      const closestBtn = event.target.closest('.btn');
      if (closestBtn) {
        const { action, id } = closestBtn.dataset;
        this.idInAction = id;

        switch (action) {
          case 'view':
            this.router.navigate([`${this.route}/${id}`]);
            break;

          case 'create':
            this.createEvent.emit(true);
            this.modalRef = this.modalService.open(this.modal, this.modalConfig);
            break;

          case 'edit':
            this.editEvent.emit(this.idInAction);
            this.modalRef = this.modalService.open(this.modal, this.modalConfig);
            break;

          case 'delete':
            this.deleteSwal.fire().then((clicked) => {
              if (clicked.isConfirmed) {
                this.successSwal.fire();
              }
            });
            break;
        }
      }
    });

    this.triggerFilter();
  }

  ngOnDestroy(): void {
    this.reload.unsubscribe();
    if (this.clickListener) {
      this.clickListener();
    }
    this.modalService.dismissAll();
  }

  triggerDelete() {
    this.deleteEvent.emit(this.idInAction);
  }

  triggerFilter() {
    fromEvent<KeyboardEvent>(document, 'keyup')
      .pipe(
        debounceTime(50),
        map(event => {
          const target = event.target as HTMLElement;
          const action = target.getAttribute('data-action');
          const value = (target as HTMLInputElement).value?.trim().toLowerCase();

          return { action, value };
        })
      )
      .subscribe(({ action, value }) => {
        if (action === 'filter') {
          this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => dtInstance.search(value).draw());
        }
      });
  }

  setupSweetAlert() {
    this.swalOptions = {
      buttonsStyling: false,
    };
  }
}
