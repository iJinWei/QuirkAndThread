import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable, catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthCloudService {
  // private readonly functionUrl = 'https://us-central1-quirkandthread-a151e.cloudfunctions.net/verifyRecaptcha';
  private readonly recaptchaUrl = environment.captcha.cloudFunctionUrl;
  private readonly userRoleUrl = environment.auth.checkUserRole;

  constructor(private http: HttpClient) {}


  verifyRecaptcha(token: string) {
    const data = {
      data: {
        token: token
      }
    };

    const jsonData = JSON.stringify(data);

    return this.http.post<boolean>(this.recaptchaUrl, jsonData, {
      headers: {
        'Content-Type': 'application/json'
      }
    }).pipe(
      catchError(error => {
        console.error('Error verifying reCAPTCHA:', error);
        return of(false); // Return false in case of error
      })
    );
  }

  checkUserRoleFromCloud(user: any): Observable<any> {
    const data = {
      data: user
    };

    const jsonData = JSON.stringify(data);
    return this.http.post<boolean>(this.userRoleUrl, jsonData, {
      headers: {
        'Content-Type': 'application/json'
      }});
  }
}
