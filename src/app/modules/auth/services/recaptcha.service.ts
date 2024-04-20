import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RecaptchaService {
  // private readonly functionUrl = 'https://us-central1-quirkandthread-a151e.cloudfunctions.net/verifyRecaptcha';
  private readonly functionUrl = environment.captcha.cloudFunctionUrl;

  constructor(private http: HttpClient) {}

  verifyRecaptcha(token: string) {
    const data = {
      data: {
        token: token
      }
    };

    const jsonData = JSON.stringify(data);

    return this.http.post<boolean>(this.functionUrl, jsonData, {
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
}
