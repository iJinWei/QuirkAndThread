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
  uid?: string;
}

export class User implements IUser {
  email?: string;
  joinDate?: string;
  lastLogin?: string;
  name?: string;
  uid?: string;

  constructor(
    email?: string,
    joinDate?: string,
    lastLogin?: string,
    name?: string,
    uid?: string
  ) {
    this.email = email;
    this.joinDate = joinDate;
    this.lastLogin = lastLogin;
    this.name = name;
    this.uid = uid;
  }
}
