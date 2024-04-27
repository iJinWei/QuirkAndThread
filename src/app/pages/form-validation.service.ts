import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FormValidationService {

  constructor(private http: HttpClient) {}
  private readonly productFormUrl = environment.formValidation.product;
  private readonly editOrderFormUrl = environment.formValidation.editOrder;

  validateProductForm(formData: any): Observable<any> {
    const data = {
      data: formData
    };

    const jsonData = JSON.stringify(data);
    return this.http.post<any>(this.productFormUrl, jsonData, {
      headers: {
      'Content-Type': 'application/json'
      }
    });
  }

  validateEditOrderForm(formData: any): Observable<any> {
    const data = {
      data: formData
    };

    const jsonData = JSON.stringify(data);
    return this.http.post<any>(this.editOrderFormUrl, jsonData, {
      headers: {
      'Content-Type': 'application/json'
      }
    });
  }
}
