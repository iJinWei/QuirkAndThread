import { AbstractControl } from '@angular/forms';

export class ConfirmPasswordValidator {
  /**
   * Check matching password with confirm password
   * @param control AbstractControl
   */
  static MatchPassword(control: AbstractControl): void {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('cPassword')?.value;

    if (password !== confirmPassword) {
      control.get('cPassword')?.setErrors({ ConfirmPassword: true });
    }
  }
}

  // This validator function checks if the password meets the following criteria:
  // At least one lowercase letter
  // At least one uppercase letter
  // At least one digit
  // At least one special character [@!#$%]
  // Minimum length of 8 characters
  export function strongPasswordValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const password = control.value;
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@!#$%])[A-Za-z\d@!#$%]{8,}$/;

    if (!regex.test(password)) {
      return { 'weakPassword': true };
    }
    return null;
  }