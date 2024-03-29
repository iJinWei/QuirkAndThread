import { Component, ViewChild, OnInit } from '@angular/core';
import { ModalConfig, ModalComponent } from '../../_metronic/partials';
import { SharedService } from 'src/app/shared.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrl: './product.component.scss'
})
export class ProductComponent implements OnInit {
  modalConfig: ModalConfig = {
    modalTitle: 'Modal title',
    dismissButtonLabel: 'Submit',
    closeButtonLabel: 'Cancel'
  };
  @ViewChild('modal') private modalComponent: ModalComponent;
  constructor(private service:SharedService, private fb: FormBuilder) {}

  products$: Observable<any[]>;
  productForm: FormGroup;
  categories: any[] = [];
  editingProductId: string | null = null;
  selectedCategory: string | null = null;

  refreshProducts() {
    this.applyCategoryFilter(this.selectedCategory);
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
      this.productForm.reset();
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

  filterProducts(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.selectedCategory = target.value;
    this.applyCategoryFilter(this.selectedCategory);
  }

  applyCategoryFilter(category: string | null) {
    if (category && category !== '') {
      this.products$ = this.service.getProductsByCategory(category);
    } else {
      this.products$ = this.service.getProducts();
    }
  }
  
  editProduct(product: any): void {
    // Assuming your form is named productForm and you want to fill it with product data for editing
    this.productForm.setValue({
      category: product.category || '', // Use || '' to avoid errors if any field is undefined
      description: product.description || '',
      imageUrl: product.imageUrl || '',
      name: product.name || '',
      price: product.price || '',
      stockQuantity: product.stockQuantity || ''
    });
  
    // Assuming you have a property to hold the ID of the product being edited
    this.editingProductId = product.id;
  }
  
  saveProduct() {
    const productData = this.productForm.value;
    if (this.editingProductId) {
      this.service.updateProduct(this.editingProductId, productData).then(() => {
        console.log('Product updated successfully');
        this.resetForm();
      }).catch(error => {
        console.error('Error updating product:', error);
      });
    } else {
      this.service.addProduct(productData).then(() => {
        console.log('Product added successfully');
        this.resetForm();
      }).catch(error => {
        console.error('Error adding product:', error);
      });
    }
  }

  resetForm() {
    this.productForm.reset();
    this.editingProductId = null; // Clear the editing state
    this.refreshProducts(); // Refresh the list to show the updated data
  }
}
