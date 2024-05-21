import { Injectable } from '@angular/core';
import { AngularFireFunctions } from '@angular/fire/compat/functions';
import { getFunctions, httpsCallable } from "firebase/functions";


@Injectable({
  providedIn: 'root'
})
export class CloudFunctionService {

  constructor(private fns: AngularFireFunctions) {}

  callSecureFunction(data: any) {
    const callable = this.fns.httpsCallable('secureFunction');
    return callable(data).toPromise();
  }

  callSecureFunction1(data: any) {
    const callable = this.fns.httpsCallable('secureFunction1');
    return callable(data).toPromise();
  }

  async callSecureFunction2(data: any) {
    const yourCallableFunction = httpsCallable(
      getFunctions(),
      "secureFunction2",
      { limitedUseAppCheckTokens: true },
    );
    return yourCallableFunction(data);
    // const callable = this.fns.httpsCallable('secureFunction2');
    // return callable(data).toPromise
  }

  callCreateProductFunction(data: any) {
    const callable = this.fns.httpsCallable('createproduct');
    return callable(data).toPromise();
  }

  callEditProductFunction(data: any) {
    const callable = this.fns.httpsCallable('editProduct');
    return callable(data).toPromise();
  }

  callDeleteProductFunction(data: any) {
    const callable = this.fns.httpsCallable('deleteproduct');
    return callable(data).toPromise();
  }

  callEditOrderFunction(data: any) {
    const callable = this.fns.httpsCallable('editOrder');
    return callable(data).toPromise();
  }

  callDeleteOrderFunction(data: any) {
    const callable = this.fns.httpsCallable('deleteOrder');
    return callable(data).toPromise();
  }

  callViewOrdersFunction(data: any) {
    const callable = this.fns.httpsCallable('viewOrders');
    return callable(data);
  }

  callViewAssignedOrdersFunction(data: any) {
    const callable = this.fns.httpsCallable('viewAssignedOrders');
    return callable(data);
  }

  callValidateLoginForm(data: any) {
    const callable = this.fns.httpsCallable('validateLoginForm');
    return callable(data);
  }

  callValidateRegistrationForm(data: any) {
    const callable = this.fns.httpsCallable('validateRegistrationForm');
    return callable(data);
  }

  callVerifyRecaptchaToken(data: any) {
    const callable = this.fns.httpsCallable('verifyRecaptchaToken');
    return callable(data);
  }

  callViewOrderForStaffFunction(data: any) {
    const callable = this.fns.httpsCallable('viewOrderForStaff');
    return callable(data);
  }

}
