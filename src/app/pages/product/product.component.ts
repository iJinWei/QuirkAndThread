import { Component, ViewChild, OnInit, ChangeDetectorRef, ElementRef } from '@angular/core';
import { ModalConfig, ModalComponent } from '../../_metronic/partials';
import { SharedService } from 'src/app/shared.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/modules/auth';
import { ImageUrlValidator, NumberValidator, PriceValidator } from '../validators';
import { FormValidationService } from '../form-validation.service';
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
  @ViewChild('productFormElem') productFormElem: ElementRef | undefined;
  constructor(
    private service: SharedService,
    private fb: FormBuilder,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private validationService: FormValidationService
  ) { }

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
      description: ['', [Validators.required, Validators.maxLength(100)]],
      imageUrl: ['', [Validators.required, ImageUrlValidator()]], // imageUrl: only accepts valid url with extensions 'jpg', 'jpeg', 'png', 'gif'
      name: ['', [Validators.required, Validators.maxLength(30)]],
      price: ['', [Validators.required, PriceValidator()]], // price: regex - ^\d+(\.\d{1,2})?$/ (number with up to 2 decimal points)
      stockQuantity: ['', [Validators.required, NumberValidator()]] // stockQuantity: only accept positive number
    });
  }

  displayAlert(message: string, icon: 'success' | 'error' | 'warning' | 'info' = 'error') {
    Swal.fire({
      title: message,
      icon: icon,
      confirmButtonText: 'OK',
    });
  }

  loadCategories() {
    this.service.getCategories().subscribe((res) => {
      this.categories = res;
    });
  }

  addProduct() {
    const newProduct = this.productForm.value;
    this.service.addProduct(newProduct).then((res) => {
      console.log('Product added successfully', res);
      this.refreshProducts();
      this.productForm.reset();
    }).catch((error) => {
      console.error('Error adding product:', error);
    });
  }

  deleteProduct(id: string) {
    this.errorMessage = null;

    // Ask for confirmation before deleting
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this product?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'No, keep it',
    }).then((result) => {
      if (result.isConfirmed) {
        // If the user confirms, proceed with the delete action
        this.authService.canPerformAction('admin').then(canPerform => {
          if (!canPerform) {
            this.displayAlert('Unauthorized: Insufficient permissions to perform this action.', 'error');
            return;
          }

          this.service.deleteProduct(id).then((res) => {
            this.displayAlert('Product deleted successfully', 'success');
            this.refreshProducts();
          }).catch(error => {
            console.error('Error deleting product:', error);
            this.displayAlert('Error deleting product. Please try again.', 'error');
          });

        }).catch(error => {
          console.error('Error checking permissions:', error);
          this.displayAlert('Error checking permissions. Please refresh the page or try again later.', 'error');
        });
      } else {
        // If the user cancels, display a message or take no action
        this.displayAlert('Deletion canceled by the user.', 'info');
      }
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
    this.errorMessage = null;

    // First, ask for confirmation before proceeding with the save action
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to save the product?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, save it',
      cancelButtonText: 'No, cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        // If the user confirms, show a loading indicator
        Swal.fire({
          title: 'Saving...',
          text: 'Please wait while the product is being saved.',
          allowOutsideClick: false,
          allowEscapeKey: false,
          didOpen: () => {
            Swal.showLoading(); // Show loading spinner
          },
        });

        this.authService.canPerformAction('admin').then(canPerform => {
          if (!canPerform) {
            Swal.fire({
              title: 'Unauthorized',
              text: 'You do not have permission to perform this action.',
              icon: 'error',
            });
            return;
          }

          if (this.productForm.valid) {
            const productData = this.productForm.value;

            this.validationService.validateProductForm(productData).subscribe(
              (response) => {
                const saveAction = this.editingProductId
                  ? this.service.updateProduct(this.editingProductId, productData)
                  : this.service.addProduct(productData);

                saveAction.then(() => {
                  Swal.fire({
                    title: 'Success!',
                    text: 'Product saved successfully.',
                    icon: 'success',
                  });
                  this.resetForm();
                }).catch(error => {
                  console.error('Error saving product:', error);
                  Swal.fire({
                    title: 'Error',
                    text: 'Error saving product. Please try again.',
                    icon: 'error',
                  });
                });
              },
              (error) => {
                console.error('Error validating product form:', error);
                Swal.fire({
                  title: 'Validation Error',
                  text: 'Please correct the form errors and try again.',
                  icon: 'error',
                });
              }
            );
          } else {
            console.error('Invalid form:', this.productForm.errors);
            Swal.fire({
              title: 'Invalid Form',
              text: 'Please correct the form errors and try again.',
              icon: 'warning',
            });
          }
        }).catch(error => {
          console.error('Error checking permissions:', error);
          Swal.fire({
            title: 'Permission Error',
            text: 'Error checking permissions. Please refresh or try again later.',
            icon: 'error',
          });
        });
      } else {
        // If the user cancels, display a cancellation message
        Swal.fire({
          title: 'Cancelled',
          text: 'Action canceled by the user.',
          icon: 'info',
        });
      }
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
