import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription, Observable } from 'rxjs';
import { first } from 'rxjs/operators';
import { UserModel } from '../../models/user.model';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ReCaptcha2Component } from 'ngx-captcha';
import { environment } from 'src/environments/environment';
import { RecaptchaService } from '../../services/recaptcha.service';
import { FormValidationService } from 'src/app/pages/form-validation.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {
  // KeenThemes mock, change it to:
  defaultAuth: any = {
    email: 'admin@demo.com',
    password: 'demo',
  };
  loginForm: FormGroup;
  hasError: boolean;
  returnUrl: string;
  isLoading$: Observable<boolean>;
  loginErrorMessage: string;

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
    private route: ActivatedRoute,
    private router: Router,
    private recaptchaService: RecaptchaService,
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
    // get return url from route parameters or default to '/'
    this.returnUrl =
      this.route.snapshot.queryParams['returnUrl'.toString()] || '/';
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.loginForm.controls;
  }

  initForm() {
    this.loginForm = this.fb.group({
      email: [
        this.defaultAuth.email,
        Validators.compose([
          Validators.required,
          Validators.email,
          Validators.minLength(3),
          Validators.maxLength(320), // https://stackoverflow.com/questions/386294/what-is-the-maximum-length-of-a-valid-email-address
        ]),
      ],
      password: [
        this.defaultAuth.password,
        Validators.compose([
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(100),
        ]),
      ],
      recaptcha: ['', Validators.required]
    });
  }

  // submit() {
  //   this.hasError = false;
  //   const loginSubscr = this.authService
  //     .login(this.f.email.value, this.f.password.value)
  //     .pipe(first())
  //     .subscribe((user: UserModel | undefined) => {
  //       if (user) {
  //         this.router.navigate([this.returnUrl]);
  //       } else {
  //         this.hasError = true;
  //       }
  //     });
  //   this.unsubscribe.push(loginSubscr);
  // }

  // Firebase
  submit() {
    if (this.loginForm.valid) {
      const formData = this.loginForm.value;
      this.validationService.validateLoginForm(formData).subscribe(
        (response) => {
          this.verifyCaptchaToken().then(valid => {
            if (valid) {
              this.hasError = false;
              this.loginErrorMessage = '';
              const loginSubscr = this.authService
                .loginFirebase(this.f.email.value, this.f.password.value)
                .pipe(first())
                .subscribe({
                  next: (user) => {
                    if (user && user.emailVerified) {
                      this.router.navigate([this.returnUrl]);
                    } else if (user && !user.emailVerified) {
                      this.hasError = true;
                      this.loginErrorMessage =
                        'Please verify your email before logging in.';
                    } else {
                      this.hasError = true;
                      this.loginErrorMessage =
                        'Login failed. Please check your email and password.';
                    }
                  },
                  error: (err) => {
                    this.hasError = true;
                    console.error(err);
                    alert(`Login failed: ${err.message}`);
                  },
                });
      
              this.unsubscribe.push(loginSubscr);
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
    } else{
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
      const valid = await this.recaptchaService.verifyRecaptcha(this.recaptchaToken).toPromise();
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
