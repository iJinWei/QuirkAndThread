import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IPermissionModel } from './permission.service';
import { IUserModel } from './user-service';

export interface DataTablesResponse {
  draw?: number;
  recordsTotal: number;
  recordsFiltered: number;
  data: any[];
}

export interface IRoleModel {
  id: number;
  name: string;
  created_at?: string;
  updated_at?: string;
  permissions: IPermissionModel[];
  users: IUserModel[];
}

@Injectable({
  providedIn: 'root'
})
export class RoleService {

  private apiUrl = 'https://preview.keenthemes.com/starterkit/metronic/laravel/api/v1/roles';
  // private apiUrl = 'http://127.0.0.1:8000/api/v1/roles';

  constructor(private http: HttpClient) { }

  getUsers(id: number, dataTablesParameters: any): Observable<DataTablesResponse> {
    const url = `${this.apiUrl}/${id}/users`;
    return this.http.post<DataTablesResponse>(url, dataTablesParameters);
  }

  getRoles(dataTablesParameters?: any): Observable<DataTablesResponse> {
    const url = `${this.apiUrl}-list`;
    return this.http.post<DataTablesResponse>(url, dataTablesParameters);
  }

  getRole(id: number): Observable<IRoleModel> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<IRoleModel>(url);
  }

  createRole(user: IRoleModel): Observable<IRoleModel> {
    return this.http.post<IRoleModel>(this.apiUrl, user);
  }

  updateRole(id: number, user: IRoleModel): Observable<IRoleModel> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.put<IRoleModel>(url, user);
  }

  deleteRole(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url);
  }

  deleteUser(role_id: number, user_id: number): Observable<void> {
    const url = `${this.apiUrl}/${role_id}/users/${user_id}`;
    return this.http.delete<void>(url);
  }
}
