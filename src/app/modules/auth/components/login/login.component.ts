import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription, Observable } from 'rxjs';
import { catchError, first, tap } from 'rxjs/operators';
import { UserModel } from '../../models/user.model';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ReCaptcha2Component } from 'ngx-captcha';
import { environment } from 'src/environments/environment';
import { AuthCloudService } from '../../services/auth-cloud.service';
import { FormValidationService } from 'src/app/pages/form-validation.service';
import { CloudFunctionService } from 'src/app/cloud-function.service';
import { HttpClient } from '@angular/common/http';

declare var grecaptcha: any;

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
    private authCloudService: AuthCloudService,
    private validationService: FormValidationService,
    private cloudFunctionService : CloudFunctionService,
    private http: HttpClient
  ) {
    this.siteKey = environment.captcha.siteKey;
    this.isLoading$ = this.authService.isLoading$;
    // redirect to home if already logged in
    if (this.authService.currentUserValue) {
      this.router.navigate(['/']);
    }
  }

  ngOnInit(): void {
    // this.initRecaptcha();
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
                      this.authCloudService.checkUserRoleFromCloud(user).subscribe(
                        (response) => {
                          this.router.navigate([this.returnUrl]);
                        },
                        (error) => {
                          this.hasError = true;
                          this.loginErrorMessage = 'Access denied.';
                          console.error("Access Denied", error);
                          alert(`Access Denied`);
                        }
                      )
                      
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
          alert('Error logging in user. Please try again.');
        }
      )
    } else{
      console.error('Invalid Form');
      alert('Error logging in user. Please try again.');
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

  // onSubmitToken(token: string): void {
  //   console.log("token: ", token);
  //   // You might want to perform additional logic here before submitting the form
  //   const form = document.getElementById("demo-form") as HTMLFormElement;
  //   form.submit()
  // }
  
  initRecaptcha(): void {
    console.log("here")
    grecaptcha.ready(() => {
      grecaptcha.enterprise.execute(environment.captcha.appCheck, {action: 'LOGIN'}).then(
        async (token: string) => {
          console.log("Token generated:", token);
          // Your code to handle the token
          // this.invokeCreateAssessment(token);
          const req = 
            {
              "event": {
                "token": token,
                "expectedAction": "LOGIN",
                "siteKey": "6LfmtdApAAAAACOMeD7TISfbpAVLFpPBVvuEtfwp"
              }
            }
          const url = "https://recaptchaenterprise.googleapis.com/v1/projects/quirkandthread-a151e/assessments?key=AIzaSyAPSOEZqQ1GJ7x5X2N7Jk8ejgjcMK0TRkg"
          this.http.post<any>(url, req).subscribe(
            (response) => console.log("Response: ", response),
            (error) => console.log("Error: ", error)
          )
        }
      );
    });
  }

  invokeFunction() {
    console.log("invokeFunction")
    this.cloudFunctionService.callSecureFunction({ param: 'value' })
      .then(result => {
        console.log('Function result:', result);
      })
      .catch(error => {
        console.error('Error calling function:', error);
      });
  }

  invokeFunction1() {
    console.log("invokeFunction1")
    this.cloudFunctionService.callSecureFunction1({ param: 'value' })
      .then(result => {
        console.log('Function1 result:', result);
      })
      .catch(error => {
        console.error('Error calling function1:', error);
      });
  }
  
  invokeFunction2() {
    console.log("invokeFunction2")
    this.cloudFunctionService.callSecureFunction2({ param: 'value' })
      .then(result => {
        console.log('Function1 result:', result);
      })
      .catch(error => {
        console.error('Error calling function1:', error);
      });
  }

/**
  * Create an assessment to analyze the risk of a UI action.
  *
  * projectID: Your Google Cloud Project ID.
  * recaptchaSiteKey: The reCAPTCHA key associated with the site/app
  * token: The generated token obtained from the client.
  * recaptchaAction: Action name corresponding to the token.
  */
// async createAssessment({
//   // TODO: Replace the token and reCAPTCHA action variables before running the sample.
//   projectID = "quirkandthread-a151e",
//   recaptchaKey = "6LfmtdApAAAAACOMeD7TISfbpAVLFpPBVvuEtfwp",
//   token = "action-token",
//   recaptchaAction = "action-name",
// }): Promise<number | null> {
//   // Create the reCAPTCHA client.
//   // TODO: Cache the client generation code (recommended) or call client.close() before exiting the method.
//   const client = new RecaptchaEnterpriseServiceClient();
//   const projectPath = client.projectPath(projectID);

//   // Build the assessment request.
//   const request = {
//     assessment: {
//       event: {
//         token: token,
//         siteKey: recaptchaKey,
//       },
//     },
//     parent: projectPath,
//   };

//   const [ response ] = await client.createAssessment(request);

//   // Check if the token is valid.
//   if (!response.tokenProperties?.valid) {
//     console.log(`The CreateAssessment call failed because the token was: ${response.tokenProperties?.invalidReason}`);
//     return null;
//   }

//   // Check if the expected action was executed.
//   // The `action` property is set by user client in the grecaptcha.enterprise.execute() method.
//   if (response.tokenProperties?.action === recaptchaAction) {
//     // Get the risk score and the reason(s).
//     // For more information on interpreting the assessment, see:
//     // https://cloud.google.com/recaptcha-enterprise/docs/interpret-assessment
//     console.log(`The reCAPTCHA score is: ${response.riskAnalysis?.score}`);
//     response.riskAnalysis?.reasons?.forEach((reason: any) => {
//       console.log(reason);
//     });

//     return response.riskAnalysis?.score || null;
//   } else {
//     console.log("The action attribute in your reCAPTCHA tag does not match the action you are expecting to score");
//     return null;
//   }
// }
// async invokeCreateAssessment(token: string) {
//   try {
//     const score = await this.createAssessment({
//       projectID: "quirkandthread-a151e",
//       recaptchaKey: "6LfmtdApAAAAACOMeD7TISfbpAVLFpPBVvuEtfwp",
//       token: "token",
//       recaptchaAction: "USER-ACTION",
//     });

//     if (score !== null) {
//       console.log(`The reCAPTCHA score is: ${score}`);
//     } else {
//       console.log("Failed to obtain reCAPTCHA score.");
//     }
//   } catch (error) {
//     console.error("An error occurred while invoking createAssessment:", error);
//   }
// }
}
