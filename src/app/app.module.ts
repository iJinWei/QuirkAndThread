import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { HttpClientInMemoryWebApiModule } from 'angular-in-memory-web-api';
import { ClipboardModule } from 'ngx-clipboard';
import { TranslateModule } from '@ngx-translate/core';
import { InlineSVGModule } from 'ng-inline-svg-2';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthService } from './modules/auth/services/auth.service';
import { environment } from 'src/environments/environment';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';

import { FakeAPIService } from './_fake/fake-api.service';
import { initializeApp, provideFirebaseApp, getApp  } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { SharedService } from './shared.service';
import { ReactiveFormsModule } from '@angular/forms';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { NgxCaptchaModule } from 'ngx-captcha';
import { provideAppCheck, initializeAppCheck, ReCaptchaEnterpriseProvider } from '@angular/fire/app-check';


// function appInitializer(authService: AuthService) {
//   return () => {
//     return new Promise((resolve) => {
//       //@ts-ignore
//       authService.getUserByToken().subscribe().add(resolve);
//     });
//   };
// }

// Attempting to fix getting logged out when refreshing page
function appInitializer(authService: AuthService) {
  return () => new Promise((resolve) => {
    authService.getAuthState().subscribe(resolve, resolve);
  });
}


@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    TranslateModule.forRoot(),
    HttpClientModule,
    ClipboardModule,
    ReactiveFormsModule,
    // #fake-start#
    environment.isMockEnabled
      ? HttpClientInMemoryWebApiModule.forRoot(FakeAPIService, {
        passThruUnknownUrl: true,
        dataEncapsulation: false,
      })
      : [],
    // #fake-end#
    AppRoutingModule,
    InlineSVGModule.forRoot(),
    NgbModule,
    SweetAlert2Module.forRoot(),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideFirestore(() => getFirestore()),
    AngularFireModule.initializeApp(environment.firebase), // Make sure you're passing the correct environment variable
    AngularFireAuthModule,
    NgxCaptchaModule,
    provideAppCheck(() => initializeAppCheck(initializeApp(environment.firebase), {
      provider: new ReCaptchaEnterpriseProvider(environment.captcha.appCheck),
      isTokenAutoRefreshEnabled: true
    }))
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: appInitializer,
      multi: true,
      deps: [AuthService],
    },
    SharedService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule { 
  // constructor() {
  //   const app = getApp(); // Get the initialized Firebase app
  //   initializeAppCheck(app, {
  //     provider: new ReCaptchaEnterpriseProvider(environment.captcha.siteKey),
  //     isTokenAutoRefreshEnabled: true
  //   });
  // }
}
