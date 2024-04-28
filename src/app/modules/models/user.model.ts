import { Timestamp } from 'firebase/firestore';

export interface DataTablesResponse {
  draw?: number;
  recordsTotal: number;
  recordsFiltered: number;
  data: IUser[];
}

export interface IUser {
  email?: string;
  joinDate?: string;
  lastLogin?: string;
  name?: string;
  roles?: string[];
  uid?: string;
}

export class User implements IUser {
  email?: string;
  joinDate?: string;
  lastLogin?: string;
  name?: string;
  roles?: string[];
  uid?: string;

  constructor(
    email?: string,
    joinDate?: string,
    lastLogin?: string,
    name?: string,
    roles?: string[],
    uid?: string
  ) {
    this.email = email;
    this.joinDate = joinDate;
    this.lastLogin = lastLogin;
    this.name = name;
    this.roles = roles;
    this.uid = uid;
  }
}

export interface IUserRole {
  email?: string;
  joinDate?: Timestamp;
  lastLogin?: Timestamp;
  name?: string;
  roles?: string[];
  uid?: string;
}

export class UserRole implements IUserRole {
  email?: string;
  joinDate?: Timestamp;
  lastLogin?: Timestamp;
  name?: string;
  roles?: string[];
  uid?: string;

  constructor(
    email?: string,
    joinDate?: Timestamp,
    lastLogin?: Timestamp,
    name?: string,
    roles?: string[],
    uid?: string
  ) {
    this.email = email;
    this.joinDate = joinDate;
    this.lastLogin = lastLogin;
    this.name = name;
    this.roles = roles;
    this.uid = uid;
  }
}
