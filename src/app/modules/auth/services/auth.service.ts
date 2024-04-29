import { Injectable, OnDestroy } from '@angular/core';
import {
  Observable,
  BehaviorSubject,
  of,
  Subscription,
  from,
  firstValueFrom,
} from 'rxjs';
import { map, catchError, switchMap, finalize } from 'rxjs/operators';
import { UserModel } from '../models/user.model';
import { AuthModel } from '../models/auth.model';
import { AuthHTTPService } from './auth-http';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import {
  Firestore,
  addDoc,
  collection,
  collectionData,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from '@angular/fire/firestore';

export type UserType = UserModel | undefined;

@Injectable({
  providedIn: 'root',
})
export class AuthService implements OnDestroy {
  // private fields
  private unsubscribe: Subscription[] = []; // Read more: => https://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/
  private authLocalStorageToken = `${environment.appVersion}-${environment.USERDATA_KEY}`;

  // public fields
  currentUser$: Observable<UserType>;
  isLoading$: Observable<boolean>;
  currentUserSubject: BehaviorSubject<UserType>;
  isLoadingSubject: BehaviorSubject<boolean>;
  private user = new BehaviorSubject<any>(null);

  get currentUserValue(): UserType {
    return this.currentUserSubject.value;
  }

  set currentUserValue(user: UserType) {
    this.currentUserSubject.next(user);
  }

  constructor(
    private authHttpService: AuthHTTPService,
    private router: Router,
    private afAuth: AngularFireAuth,
    private fs: Firestore
  ) {
    this.isLoadingSubject = new BehaviorSubject<boolean>(false);
    this.currentUserSubject = new BehaviorSubject<UserType>(undefined);
    this.currentUser$ = this.currentUserSubject.asObservable();
    this.isLoading$ = this.isLoadingSubject.asObservable();
    const subscr = this.getUserByToken().subscribe();
    this.unsubscribe.push(subscr);
    this.afAuth.authState.subscribe((user) => {
      if (user) {
        // User is signed in.
        this.user.next(user);
      } else {
        // User is signed out.
        this.user.next(null);
      }
    });
  }

  // forgotPassword(email: string): Observable<boolean> {
  //   this.isLoadingSubject.next(true);
  //   return this.authHttpService
  //     .forgotPassword(email)
  //     .pipe(finalize(() => this.isLoadingSubject.next(false)));
  // }

  async forgotPassword(email: string): Promise<boolean> {
    try {
      await this.afAuth.sendPasswordResetEmail(email);
      return true;  // Indicates success
    } catch (error) {
      console.error('Error sending password reset email:', error);
      return false; // Indicates failure
    }
  }
  
  // private methods
  private setAuthFromLocalStorage(auth: AuthModel): boolean {
    // store auth authToken/refreshToken/epiresIn in local storage to keep user logged in between page refreshes
    if (auth && auth.authToken) {
      localStorage.setItem(this.authLocalStorageToken, JSON.stringify(auth));
      return true;
    }
    return false;
  }

  public getAuthFromLocalStorage(): AuthModel | undefined {
    try {
      const lsValue = localStorage.getItem(this.authLocalStorageToken);
      if (!lsValue) {
        return undefined;
      }

      const authData = JSON.parse(lsValue);
      return authData;
    } catch (error) {
      console.error(error);
      return undefined;
    }
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }

  getUserByToken(): Observable<UserType> {
    const auth = this.getAuthFromLocalStorage();
    if (!auth || !auth.authToken) {
      return of(undefined);
    }

    this.isLoadingSubject.next(true);
    return this.authHttpService.getUserByToken(auth.authToken).pipe(
      map((user: UserType) => {
        if (user) {
          this.currentUserSubject.next(user);
        } else {
          console.log("LOGOUT");
          // this.logout();
        }
        return user;
      }),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  // Firebase functions

  // Registration of User
  registrationFirebase(user: UserModel): Observable<any> {
    return from(
      this.afAuth.createUserWithEmailAndPassword(user.email, user.password)
    ).pipe(
      map((userCredential) => {
        // Handle additional registration logic here, like updating the profile
        return userCredential.user;
      }),
      catchError((error) => {
        // Handle errors
        console.error('Registration error', error);
        throw error;
      })
    );
  }

  sendEmailVerification(user: any) {
    user.sendEmailVerification().then(
      (res: any) => {
        this.router.navigate(['/auth/verify-email']);
      },
      (error: any) => {
        alert('Something went wrong, verification email not sent.');
      }
    );
  }
  
  login(email: string, password: string): Observable<UserType> {
    this.isLoadingSubject.next(true);
    return this.authHttpService.login(email, password).pipe(
      map((auth: AuthModel) => {
        const result = this.setAuthFromLocalStorage(auth);
        return result;
      }),
      switchMap(() => this.getUserByToken()),
      catchError((err) => {
        console.error('err', err);
        return of(undefined);
      }),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  loginFirebase(
    email: string,
    password: string
  ): Observable<UserType> {
    this.isLoadingSubject.next(true);
    return from(this.afAuth.signInWithEmailAndPassword(email, password)).pipe(
      map((userCredential) => {
        if (!userCredential.user || userCredential.user.email === null) {
          throw new Error('Authentication failed: User or email is missing');
        }

        // Simulate the UserModel based on Firebase User
        const userModel = new UserModel();
        userModel.setUser({
          id: userCredential.user.uid,
          email: userCredential.user.email,
          // Populate other UserModel fields as needed, or leave them with default/placeholder values
          username: '', // Username is not provided by Firebase Auth
          password: '', // Password should not be stored on the client-side
          fullname: '', // Fullname is not provided by Firebase Auth
          pic: './assets/media/avatars/blank.png',
          roles: [],
          occupation: '',
          companyName: '',
          phone: '',
          emailVerified: userCredential.user.emailVerified,
          address: undefined,
          socialNetworks: undefined,
          firstname: '',
          lastname: '',
          website: '',
          language: '',
          timeZone: '',
          communication: {
            email: false,
            sms: false,
            phone: false,
          },
        });

        // Update currentUserSubject with the new UserModel
        this.currentUserSubject.next(userModel);

        // Optionally, update local storage to keep the user logged in between page refreshes
        // This step requires careful consideration of what you're storing for security reasons
        // this.setAuthFromLocalStorage(...); // Adjust this according to your app's requirements

        // Assuming userCredential.user provides refreshToken and you want to simulate authToken
        const auth = new AuthModel();
        auth.authToken = userCredential.user.refreshToken; // Simulate authToken with refreshToken
        auth.refreshToken = userCredential.user.refreshToken;
        // Assuming expiresIn as a fixed future date for simplicity
        auth.expiresIn = new Date(Date.now() + 100 * 24 * 60 * 60 * 1000);

        // Store the auth details in local storage for session persistence
        const stored = this.setAuthFromLocalStorage(auth);
        if (!stored) {
          throw new Error('Failed to store auth details in local storage');
        }

        // Persist auth model to localStorage or your chosen storage solution
        this.setAuthFromLocalStorage(auth);

        return userModel;
      }),
      catchError((error) => {
        console.error('Login error', error);
        return of(undefined); // Or handle the error appropriately
      }),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  logout() {
    localStorage.removeItem(this.authLocalStorageToken);
    this.router.navigate(['/auth/login'], {
      queryParams: {},
    });
  }

  logoutFirebase() {
    // Sign out from Firebase
    this.afAuth
      .signOut()
      .then(() => {
        // Remove user data from local storage or any other cleanup
        localStorage.removeItem(this.authLocalStorageToken);

        // Reset the current user subject to reflect no user is logged in
        this.currentUserSubject.next(undefined);

        // Navigate to the login page
        this.router.navigate(['/auth/login'], {
          queryParams: {},
        });
      })
      .catch((error) => {
        console.error('Logout error', error);
        // Handle any errors that occur during the logout process
      });
  }

  // Add a method to expose auth state
  getAuthState(): Observable<any> {
    return this.afAuth.authState;
  }

  // Method to check if the currently logged-in user can perform an action based on their role
  async canPerformAction(roleRequired: string): Promise<boolean> {
    try {
      // Convert the user Observable to a Promise to await its value
      const user = await firstValueFrom(this.getUser());

      if (!user || !user.uid) {
        console.log('No user is currently logged in.');
        return false;
      }

      // Now use the userHasRole method
      return await this.userHasRole(user.uid, roleRequired);
    } catch (error) {
      console.error('Error checking if user can perform action:', error);
      return false;
    }
  }

  // Method to check if a user has a specific role
  async userHasRole(userId: string, roleToCheck: string): Promise<boolean> {

    console.log(userId, roleToCheck);
    
    try {
      // Reference to the 'users' collection
      const usersCollectionRef = collection(this.fs, 'users');
      // Create a query against the collection to find the user document where the uid field matches the provided userId
      const q = query(usersCollectionRef, where('uid', '==', userId));

      // Execute the query
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // Assuming a unique uid for each user, there should be only one matching document
        const userData = querySnapshot.docs[0].data();

        // Check if the 'roles' array contains the roleToCheck
        if (userData.roles && userData.roles.includes(roleToCheck)) {
          return true; // User has the role
        }
      }

      return false; // User does not have the role or document does not exist
    } catch (error) {
      console.error("Error fetching user's roles:", error);
      throw error; // Rethrow or handle as needed
    }
  }

  getUser() {
    return this.user.asObservable();
  }
}
