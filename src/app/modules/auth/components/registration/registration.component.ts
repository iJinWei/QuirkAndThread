import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subscription, Observable, of } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ConfirmPasswordValidator, strongPasswordValidator } from './confirm-password.validator';
import { UserModel } from '../../models/user.model';
import { concatMap, first, switchMap } from 'rxjs/operators';
import { SharedService } from 'src/app/shared.service';
import { ReCaptcha2Component } from 'ngx-captcha';
import { environment } from 'src/environments/environment';
import { AuthCloudService } from '../../services/auth-cloud.service';
import { FormValidationService } from 'src/app/pages/form-validation.service';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss'],
})
export class RegistrationComponent implements OnInit, OnDestroy {
  registrationForm: FormGroup;
  hasError: boolean;
  isLoading$: Observable<boolean>;

  // For captcha
  siteKey: string;
  @ViewChild('captchaElem') captchaElem: ReCaptcha2Component;
  public theme : 'light'|'dark' = 'light'
  public size : 'compact'|'normal' = 'normal'
  public lang = 'en'
  public type : 'image'|'audio' = 'image'
  recaptchaToken: string = '';
  recaptchaError: string | null = null;

  // private fields
  private unsubscribe: Subscription[] = []; // Read more: => https://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/
  

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private service:SharedService,
    private authCloudService: AuthCloudService,
    private validationService: FormValidationService
  ) {
    this.siteKey = environment.captcha.siteKey;
    this.isLoading$ = this.authService.isLoading$;
    // redirect to home if already logged in
    if (this.authService.currentUserValue) {
      this.router.navigate(['/']);
    }
  }

  ngOnInit(): void {
    this.initForm();
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.registrationForm.controls;
  }

  initForm() {
    this.registrationForm = this.fb.group(
      {
        fullname: [
          '',
          Validators.compose([
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(100),
          ]),
        ],
        email: [
          '',
          Validators.compose([
            Validators.required,
            Validators.email,
            Validators.minLength(3),
            Validators.maxLength(320), // https://stackoverflow.com/questions/386294/what-is-the-maximum-length-of-a-valid-email-address
          ]),
        ],
        password: [
          '',
          Validators.compose([
            Validators.required,
            strongPasswordValidator
          ]),
        ],
        cPassword: [
          '',
          Validators.compose([
            Validators.required,
            strongPasswordValidator
          ]),
        ],
        agree: [false, Validators.compose([Validators.required])],
        recaptcha: ['', Validators.required]
      },
      {
        validator: ConfirmPasswordValidator.MatchPassword,
      }
    );
   
  }

  // submit() {
  //   this.hasError = false;
  //   const result: {
  //     [key: string]: string;
  //   } = {};
  //   Object.keys(this.f).forEach((key) => {
  //     result[key] = this.f[key].value;
  //   });
  //   const newUser = new UserModel();
  //   newUser.setUser(result);
  //   const registrationSubscr = this.authService
  //     .registration(newUser)
  //     .pipe(first())
  //     .subscribe((user: UserModel) => {
  //       if (user) {
  //         this.router.navigate(['/']);
  //       } else {
  //         this.hasError = true;
  //       }
  //     });
  //   this.unsubscribe.push(registrationSubscr);
  // }

  // Firebase
  // submit() {
  //   this.hasError = false;
  //   const result: { [key: string]: string } = {};
  //   Object.keys(this.f).forEach((key) => {
  //     result[key] = this.f[key].value;
  //   });
  //   const newUser = new UserModel();
  //   newUser.setUser(result);
  
  //   const registrationSubscr = this.authService
  //     .registrationFirebase(newUser)
  //     .subscribe({
  //       next: (user) => {
  //         if (user) {
  //           // Registration successful
  //           alert('Registration successful!');
  //           this.router.navigate(['/']);
  //         } else {
  //           // This condition might not be necessary if a successful registration always returns a user.
  //           // Consider removing this else block if the API guarantees a user object on success.
  //           this.hasError = true;
  //           alert('Registration failed. Please try again.');
  //         }
  //       },
  //       error: (err) => {
  //         this.hasError = true;
  //         console.error(err);
  //         // Display an alert with the error message
  //         alert(`Registration failed: ${err.message}`);
  //       }
  //     });
  
  //   this.unsubscribe.push(registrationSubscr);
  // }

  submit() {
    if (this.registrationForm.valid) {
      const formData = this.registrationForm.value;
      this.validationService.validateRegistrationForm(formData).subscribe(
        (response) => {
          this.verifyCaptchaToken().then(valid => {
            if (valid) {
              this.hasError = false;
              const result: { [key: string]: string } = {};
              Object.keys(this.f).forEach((key) => {
                result[key] = this.f[key].value;
              });
              const newUser = new UserModel();
              newUser.setUser(result);
            
              const registrationSubscr = this.authService
                .registrationFirebase(newUser)
                .subscribe({
                  next: (firebaseUser) => { // Assuming firebaseUser now includes the full user object
                    if (firebaseUser) {
                      // Registration successful, now add user details to Firestore
                      const userData = {
                        email: newUser.email, // Assuming UserModel has an email field
                        name: newUser.fullname, // Assuming UserModel has a name field
                        joinDate: new Date(), // Use current date for joinDate
                        lastLogin: new Date(), // Consider updating this field upon each login
                        roles: [], // Default role
                      };
                      // Add user data to Firestore (assumes SharedService or similar is injected as sharedService)
                      this.service.addUser(firebaseUser.uid, userData).then(() => {
                        console.log("adding user")
                        this.authService.sendEmailVerification(firebaseUser)
                      }).catch((firestoreError: any) => {
                        console.error(firestoreError);
                        this.hasError = true;
                        // Handle Firestore error (e.g., display an error message)
                        alert('Registration was successful, but there was an error storing additional user details.');
                      });
                    } else {
                      // Handle the unlikely case that registration succeeded without a user object
                      this.hasError = true;
                      alert('Registration failed. Please try again.');
                    }
                  },
                  error: (err) => {
                    this.hasError = true;
                    console.error(err);
                    alert(`Registration failed: ${err.message}`);
                  }
                });
            
              this.unsubscribe.push(registrationSubscr);
            } else {
              // reCAPTCHA validation failed
              this.hasError = true;
              alert('reCAPTCHA validation failed. Please try again.');
            }
          }).catch(error => {
            // Handle reCAPTCHA service error
            this.hasError = true;
            console.error(error);
            alert(`reCAPTCHA verification failed: ${error.message}`);
          });
        },
        (error) => {
          console.error('Invalid Form', error);
          alert('Error registering user. Please try again.');
        }
      )
    } else {
      console.error('Invalid Form');
      alert('Error registering user. Please try again.');
    }
  }

  handleRecaptchaSuccess(token: any): void {
    this.recaptchaToken = token;
  }

  handleRecaptchaError(error: any): void {
    console.error('Handled', error);
    this.recaptchaError = error;
  }
  
  async verifyCaptchaToken(): Promise<boolean> {
    try {
      const valid = await this.authCloudService.verifyRecaptcha(this.recaptchaToken).toPromise();
      return !!valid;
    } catch (error) {
      console.error("reCAPTCHA verification error:", error);
      return false;
    }
  }
  
  

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
}
