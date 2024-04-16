import { Component, ViewChild, OnInit, ChangeDetectorRef, ElementRef } from '@angular/core';
import { ModalConfig, ModalComponent } from '../../_metronic/partials';
import { SharedService } from 'src/app/shared.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/modules/auth';
import { ImageUrlValidator, NumberValidator, PriceValidator } from '../validators';

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
  @ViewChild('productFormElem') productFormElem: ElementRef  | undefined;
  constructor(private service:SharedService, private fb: FormBuilder, private authService:AuthService, private cdr: ChangeDetectorRef) {}

  products$: Observable<any[]>;
  productForm: FormGroup;
  categories: any[] = [];
  editingProductId: string | null = null;
  selectedCategory: string | null = null;
  public errorMessage: string | null = null;
  
  refreshProducts() {
    this.applyCategoryFilter(this.selectedCategory);
  }

  ngOnInit() {

    this.refreshProducts();
    this.loadCategories();

    this.productForm = this.fb.group({
      category: ['', Validators.required],
      description: ['', [Validators.required, Validators.maxLength(100)]],
      imageUrl: ['', [Validators.required, ImageUrlValidator()] ], // imageUrl: only accepts valid url with extensions 'jpg', 'jpeg', 'png', 'gif'
      name: ['', [Validators.required, Validators.maxLength(30)]],
      price: ['', [Validators.required, PriceValidator()]], // price: regex - ^\d+(\.\d{1,2})?$/ (number with up to 2 decimal points)
      stockQuantity: ['', [Validators.required, NumberValidator()]] // stockQuantity: only accept positive number
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
    this.errorMessage = null;
  
    this.authService.canPerformAction('admin').then(canPerform => {
      if (!canPerform) {
        this.displayErrorAlert('Unauthorized: Insufficient permissions to perform this action.');
        return;
      } else {
        this.service.deleteProduct(id).then((res)=>{
          this.refreshProducts();
        }).catch(error => {
          console.error('Error deleting product:', error);
          this.displayErrorAlert('Error in deleting product. Please try again.');
        });
      }
    }).catch(error => {
      console.error('Error checking permissions:', error);
      this.displayErrorAlert('Error checking permissions. Please refresh the page or try again later.');
    });
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

    this.focusOnForm();
  }
  
  saveProduct() {
    // Clear any existing error messages at the start of the method
    this.errorMessage = null;
  
    this.authService.canPerformAction('admin').then(canPerform => {
      if (!canPerform) {
        this.displayErrorAlert('Unauthorized: Insufficient permissions to perform this action.');
        return;
      } else {
        if (this.productForm.valid) {
          const productData = this.productForm.value;
          if (this.editingProductId) {
            this.service.updateProduct(this.editingProductId, productData).then(() => {
              console.log('Product updated successfully');
              this.resetForm();
            }).catch(error => {
              console.error('Error updating product:', error);
              this.displayErrorAlert('Error updating product. Please try again.');
            });
          } else {
            this.service.addProduct(productData).then(() => {
              console.log('Product added successfully');
              this.resetForm();
            }).catch(error => {
              console.error('Error adding product:', error);
              this.displayErrorAlert('Error adding product. Please try again.');
            });
          }
        } else {
          console.error('Invalid Form');
          this.displayErrorAlert('Error saving product. Please try again.');
        }
      }

    }).catch(error => {
      console.error('Error checking permissions:', error);
      this.displayErrorAlert('Error checking permissions. Please refresh the page or try again later.');
    });
  }
  
  

  resetForm() {
    this.productForm.reset();
    this.editingProductId = null; // Clear the editing state
    this.refreshProducts(); // Refresh the list to show the updated data
  }

  focusOnForm() {
    if (this.productFormElem) {
      this.productFormElem.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
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
