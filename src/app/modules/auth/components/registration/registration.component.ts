import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subscription, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ConfirmPasswordValidator } from './confirm-password.validator';
import { UserModel } from '../../models/user.model';
import { first } from 'rxjs/operators';
import { SharedService } from 'src/app/shared.service';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss'],
})
export class RegistrationComponent implements OnInit, OnDestroy {
  registrationForm: FormGroup;
  hasError: boolean;
  isLoading$: Observable<boolean>;

  // private fields
  private unsubscribe: Subscription[] = []; // Read more: => https://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private service:SharedService
  ) {
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
            Validators.minLength(3),
            Validators.maxLength(100),
          ]),
        ],
        cPassword: [
          '',
          Validators.compose([
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(100),
          ]),
        ],
        agree: [false, Validators.compose([Validators.required])],
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
              role: "customer", // Default role
            };
  
            // Add user data to Firestore (assumes SharedService or similar is injected as sharedService)
            this.service.addUser({ ...userData, uid: firebaseUser.uid }).then(() => {
              alert('Registration successful!');
              this.router.navigate(['/']);
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
  }
  
  
  

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
}
