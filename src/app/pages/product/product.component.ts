import { Component, ViewChild, OnInit, ChangeDetectorRef, ElementRef } from '@angular/core';
import { ModalConfig, ModalComponent } from '../../_metronic/partials';
import { SharedService } from 'src/app/shared.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/modules/auth';
import { ImageUrlValidator, NumberValidator, PriceValidator } from '../validators';
import { FormValidationService } from '../form-validation.service';
import { CloudFunctionService } from 'src/app/cloud-function.service';
import Swal from 'sweetalert2';


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
  constructor(
    private service:SharedService, 
    private fb: FormBuilder, 
    private authService:AuthService, 
    private cdr: ChangeDetectorRef,
    private validationService: FormValidationService,
    private cloudFunctionService: CloudFunctionService
  ) {}

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
      categoryId: ['', Validators.required],
      description: ['', Validators.required],
      imageUrl: ['', [] ], // imageUrl: only accepts valid url with extensions 'jpg', 'jpeg', 'png', 'gif'
      name: ['', []],
      price: [''], // price: regex - ^\d+(\.\d{1,2})?$/ (number with up to 2 decimal points)
      stockQuantity: ['', []] // stockQuantity: only accept positive number
    });
  }

  loadCategories() {
    this.service.getCategories().subscribe((res) => {
      this.categories = res;
    });
  }

  deleteProduct(id:string) {
    this.errorMessage = null;
  
    this.authService.canPerformAction('admin').then(canPerform => {
      if (!canPerform) {
        // this.displayErrorAlert('Unauthorized: Insufficient permissions to perform this action.');
        Swal.fire({
          title: 'Error',
          text: 'Unauthorized: Insufficient permissions to perform this action.',
          icon: 'error',
        });
        return;
      } else {
        this.cloudFunctionService.callDeleteProductFunction({productData: id})
            .then(result => {
              this.refreshProducts()
              Swal.fire({
                title: 'Success!',
                text: 'Product deleted successfully.',
                icon: 'success',
              });
            })
            .catch(error => {
              console.error('Error deleting Product:', error);
                Swal.fire({
                  title: 'Error',
                  text: 'Error deleting Product. Please try again.',
                  icon: 'error',
                });
            });
      }
    }).catch(error => {
      console.error('Error checking permissions:', error);
      Swal.fire({
        title: 'Error',
        text: 'Error checking permissions.',
        icon: 'error',
      });
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
      categoryId: product.categoryId || '',
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
        // this.displayErrorAlert('Unauthorized: Insufficient permissions to perform this action.');
        Swal.fire({
          title: 'Error',
          text: 'Unauthorized: Insufficient permissions to perform this action.',
          icon: 'error',
        });
        return;
      } else {
        if (this.productForm.valid) {
          const data = this.productForm.value;
          if (this.editingProductId) {
            const productId = this.editingProductId;
            this.cloudFunctionService.callEditProductFunction({productId, data})
            .then(result => {
              Swal.fire({
                title: 'Success!',
                text: 'Product saved successfully.',
                icon: 'success',
              });
            })
            .catch(error => {
              console.error('Error updating Product:', error);
                Swal.fire({
                  title: 'Error',
                  text: 'Error saving Product. Please try again.',
                  icon: 'error',
                });
            });
          } else {
            this.cloudFunctionService.callCreateProductFunction({data})
            .then(result => {
              Swal.fire({
                title: 'Success!',
                text: 'Product created successfully.',
                icon: 'success',
              });
            })
            .catch(error => {
              console.error('Error creating Product:', error);
                Swal.fire({
                  title: 'Error',
                  text: 'Error creating Product. Please try again.',
                  icon: 'error',
                });
            });
          }
        } else {
          console.error('Invalid Form', this.productForm.errors);
          Swal.fire({
            title: 'Error',
            text: 'Invalid form. Please try again',
            icon: 'error',
          });
        }
      }

    }).catch(error => {
      console.error('Error checking permissions:', error);
      Swal.fire({
        title: 'Error',
        text: 'Error checking permissions. Please try again',
        icon: 'error',
      });
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

  onCategoryChange(event: any) {
    const selectedValue = event.target.value;
    // Update the value of categoryId FormControl when the dropdown selection changes
    const selectedCategory = this.categories.find(category => category.name === selectedValue);
    
    // Update the value of categoryId FormControl with the corresponding ID
    this.productForm?.get('categoryId')?.setValue(selectedCategory ? selectedCategory.id : '');
  }

}
