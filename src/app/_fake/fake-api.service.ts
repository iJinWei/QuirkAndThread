import { Injectable } from '@angular/core';
import { InMemoryDbService } from 'angular-in-memory-web-api';
import { Observable, map, of, throwError } from 'rxjs';
import { UsersTable } from './users.table';

@Injectable({
  providedIn: 'root',
})
export class FakeAPIService implements InMemoryDbService {
  private users: any[] = UsersTable.users;

  constructor() { }

  /**
   * Create Fake DB and API
   */
  createDb(): {} | Observable<{}> {
    const db = {
      // auth module
      users: this.users,
    };
    return db;
  }
}