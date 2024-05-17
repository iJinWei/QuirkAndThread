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
}
