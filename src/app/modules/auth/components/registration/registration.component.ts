import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subscription, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ConfirmPasswordValidator, strongPasswordValidator } from './confirm-password.validator';
import { UserModel } from '../../models/user.model';
import { first } from 'rxjs/operators';
import { SharedService } from 'src/app/shared.service';
import { ReCaptcha2Component } from 'ngx-captcha';
import { environment } from 'src/environments/environment';
import { RecaptchaService } from '../../services/recaptcha.service';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss'],
})
export class RegistrationComponent implements OnInit, OnDestroy {
  registrationForm: FormGroup;
  hasError: boolean;
  isLoading$: Observable<boolean>;

  siteKey: string;
  @ViewChild('captchaElem') captchaElem: ReCaptcha2Component;
  @ViewChild('langInput') langInput: ElementRef;

  public theme : 'light'|'dark' = 'light'
  public size : 'compact'|'normal' = 'normal'
  public lang = 'en'
  public type : 'image'|'audio' = 'image'


  // private fields
  private unsubscribe: Subscription[] = []; // Read more: => https://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/
  recaptchaError: string | null = null;
  isSubmitting: boolean = false;
  recaptchaResponse: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private service:SharedService,
    private recaptchaService: RecaptchaService,
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
          'qwe@qwe.qwe',
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
        recaptcha: ['']
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
    const token = this.registrationForm?.get('recaptcha')?.value;
    console.log("token:", typeof token)
    console.log("token:", token)
    this.verifyRecaptchaToken(token);
    /*
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
              roles: ["customer"], // Default role
            };
  
            // Add user data to Firestore (assumes SharedService or similar is injected as sharedService)
            this.service.addUser(firebaseUser.uid, userData).then(() => {
              //this.router.navigate(['/']);
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
    */
  }
  
  handleRecaptchaSuccess(token: any): void {
    console.log('handleRecaptchaSuccess', token);
    // this.recaptchaResponse = token;
  }

  handleRecaptchaError(error: any): void {
    console.log('handleRecaptchaError', error);
    this.recaptchaError = error;
  }

  private verifyRecaptchaToken(token: string): void {
    this.recaptchaService.verifyRecaptcha(token)
    .subscribe(valid => {
      if (valid) {
        // reCAPTCHA validation successful, proceed with form submission or other actions
        console.log('reCAPTCHA validation successful');
      } else {
        // reCAPTCHA validation failed, display error message or take appropriate action
        console.error('reCAPTCHA validation failed');
      }
    });
  }
  
  
  

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
}
