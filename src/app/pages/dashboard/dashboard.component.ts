import { Component, ViewChild, OnInit } from '@angular/core';
import { ModalConfig, ModalComponent } from '../../_metronic/partials';
import { SharedService } from 'src/app/shared.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  modalConfig: ModalConfig = {
    modalTitle: 'Modal title',
    dismissButtonLabel: 'Submit',
    closeButtonLabel: 'Cancel'
  };
  @ViewChild('modal') private modalComponent: ModalComponent;
  constructor(private service:SharedService, private fb: FormBuilder) {}

  // products:any[];
  products$: Observable<any[]>;
  productForm: FormGroup;
  categories: any[] = [];


  refreshProducts() {
    this.products$ = this.service.getProducts();
  }

  ngOnInit() {
    this.refreshProducts();
    this.loadCategories();
    this.productForm = this.fb.group({
      category: [''],
      description: [''],
      imageUrl: [''],
      name: [''],
      price: [''],
      stockQuantity: ['']
    });
  }

  loadCategories() {
    this.service.getCategories().subscribe((res) => {
      this.categories = res;
    });
  }

  addProduct() {
    const newProduct = this.productForm.value;
    this.service.addProduct(newProduct).then((res)=>{
      console.log('Product added successfully', res);
      this.refreshProducts();
    }).catch((error) => {
      console.error('Error adding product:', error);
    });
  }

  deleteProduct(id:string) {
    this.service.deleteProduct(id).then((res)=>{
      console.log(res);
      this.refreshProducts();
    })
  }

  async openModal() {
    return await this.modalComponent.open();
  }
}
