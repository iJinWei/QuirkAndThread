import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { IRoleModel } from './role.service';
import { Firestore, collection, addDoc, collectionData } from '@angular/fire/firestore';

export interface DataTablesResponse {
    draw?: number;
    recordsTotal: number;
    recordsFiltered: number;
    data: any[];
}

export interface IUserModel {
    avatar?: null | string;
    created_at?: string;
    email: string;
    email_verified_at?: string;
    id: number;
    last_login_at?: null | string;
    last_login_ip?: null | string;
    name?: string;
    profile_photo_path?: null | string;
    updated_at?: string;
    password?: string;
    roles?: IRoleModel[];
    role?: string;
}

@Injectable({
    providedIn: 'root'
})
export class UserService {

    userData: Observable<any>;

    private apiUrl = 'https://preview.keenthemes.com/starterkit/metronic/laravel/api/v1/users';
    // private apiUrl = 'http://127.0.0.1:8000/api/v1/users';

    constructor(
        private http: HttpClient,
        private firestore: Firestore
    ) {
        this.getUserData();
    }

    getUsers(dataTablesParameters: any): Observable<DataTablesResponse> {
        const url = `${this.apiUrl}-list`;
        return this.http.post<DataTablesResponse>(url, dataTablesParameters);
    }

    getUser(id: number): Observable<IUserModel> {
        const url = `${this.apiUrl}/${id}`;
        return this.http.get<IUserModel>(url);
    }

    createUser(user: IUserModel): Observable<IUserModel> {
        return this.http.post<IUserModel>(this.apiUrl, user);
    }

    updateUser(id: number, user: IUserModel): Observable<IUserModel> {
        const url = `${this.apiUrl}/${id}`;
        return this.http.put<IUserModel>(url, user);
    }

    deleteUser(id: number): Observable<void> {
        const url = `${this.apiUrl}/${id}`;
        return this.http.delete<void>(url);
    }

    addUser(f: any) {
        const collectionInstance = collection(this.firestore, 'users');
        addDoc(collectionInstance, f.value).then(() => {
          console.log('Data Saved Successfully');
        })
        .catch((err) => {
          console.log(err);
        })
    }
    
    getUserData(): Observable<any[]> {
        const collectionInstance = collection(this.firestore, 'users');

        console.log("LINE", collectionData(collectionInstance).pipe(
            map(users => users.map(user => user.data()))
          ))

        return collectionData(collectionInstance).pipe(
          map(users => users.map(user => user.data()))
        );
      }
}