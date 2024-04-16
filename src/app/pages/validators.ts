import { AbstractControl, ValidatorFn, Validators } from '@angular/forms';

// Custom validator function for positive numbers
export function NumberValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    if (isNaN(control.value) || control.value <= 0) {
      return { 'invalidNumber': { value: control.value } };
    }
    return null;
  };
}

// Custom validator function for price
export function PriceValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const valid = /^\d+(\.\d{1,2})?$/.test(control.value); // Regular expression to check for valid price format
      return valid ? null : { 'invalidPrice': { value: control.value } };
    };
  }

// Custom validator function for image URLs
export function ImageUrlValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const url = control.value;
      if (!isValidUrl(url)) {
        return { 'invalidImageUrl': { value: control.value } };
      }
      // Check if the URL points to an image file
      const extension = url.substring(url.lastIndexOf('.') + 1).toLowerCase();
      const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif'];
      if (!allowedExtensions.includes(extension)) {
        return { 'invalidImageExtension': { value: control.value } };
      }
      return null;
    };
  }
  
  // Helper function to check if the value is a valid URL
  function isValidUrl(value: string): boolean {
    try {
      new URL(value);
      return true;
    } catch (err) {
      return false;
    }
  }

