import { Injectable } from '@angular/core';
import {
  Firestore,
  addDoc,
  collection,
  collectionData,
  deleteDoc,
  doc,
  docData,
  getDoc,
  query,
  updateDoc,
  where,
  DocumentReference,
  getDocs,
} from '@angular/fire/firestore';
import { combineLatest, map, Observable, switchMap, tap } from 'rxjs';
import { IOrder } from './modules/models/order.model';
import { IOrderItem } from './modules/models/order-item.model';
import { IUser, User } from './modules/models/user.model';
import { IRole } from './modules/models/role.model';
import { DataTablesResponse } from './modules/models/user.model';
import moment from 'moment';

@Injectable({
  providedIn: 'root',
})
export class SharedService {
  constructor(private fs: Firestore) {}

  // Product Firestore Methods
  getCategories() {
    let categoriesCollection = collection(this.fs, 'categories');
    return collectionData(categoriesCollection, { idField: 'id' });
  }

  getProducts() {
    let productsCollection = collection(this.fs, 'products');
    return collectionData(productsCollection, { idField: 'id' });
  }

  addProduct(product: any) {
    let productsCollection = collection(this.fs, 'products');
    return addDoc(productsCollection, product);
  }

  deleteProduct(id: string) {
    let docRef = doc(this.fs, 'products/' + id);
    return deleteDoc(docRef);
  }

  getProductsByCategory(category: string) {
    let productsCollection = collection(this.fs, 'products');
    const q = query(productsCollection, where('category', '==', category));
    return collectionData(q, { idField: 'id' });
  }

  updateProduct(id: string, product: any) {
    let docRef = doc(this.fs, 'products', id);
    return updateDoc(docRef, product);
  }

  // Orders Firestore Methods
  getOrders() {
    let ordersCollection = collection(this.fs, 'orders');
    return collectionData(ordersCollection, { idField: 'id' });
  }

  getOrderById(id: string) {
    const docRef = doc(this.fs, 'orders', id);
    return docData(docRef, { idField: 'id' }) as Observable<IOrder>;
  }

  getOrderItemsByOrderId(orderId: string) {
    let ordersCollection = collection(this.fs, 'orderItems');
    const q = query(ordersCollection, where('orderId', '==', orderId));
    return collectionData(q, { idField: 'id' });
  }

  addOrder(order: any) {
    let ordersCollection = collection(this.fs, 'orders');
    return addDoc(ordersCollection, order);
  }

  async deleteOrder(id: string) {
    let docRef = doc(this.fs, 'orders/' + id);

    let orderItemsCollection = collection(this.fs, 'orderItems');
    const q = query(orderItemsCollection, where('orderId', '==', id));
    console.log(q);
    // Get documents based on the query
    const querySnapshot = await getDocs(q);

    // Delete each document
    querySnapshot.forEach(async (doc) => {
      try {
        await deleteDoc(doc.ref);
      } catch (error) {}
    });

    return deleteDoc(docRef);
  }

  getProductsByName(name: string) {
    let productsCollection = collection(this.fs, 'orders');
    const q = query(productsCollection, where('name', '==', name));
    return collectionData(q, { idField: 'id' });
  }

  updateOrder(id: string, order: any) {
    let docRef = doc(this.fs, 'orders', id);
    return updateDoc(docRef, order);
  }

  addOrderItem(orderItem: any) {
    let orderItemsCollection = collection(this.fs, 'orderItems');
    return addDoc(orderItemsCollection, orderItem);
  }

  updateOrderItem(id: string, orderItem: any) {
    let docRef = doc(this.fs, 'orderItems', id);
    return updateDoc(docRef, orderItem);
  }

  deleteOrderItem(id: string) {
    let docRef = doc(this.fs, 'orderItems', id);
    return deleteDoc(docRef);
  }

  getOrderItemById(id: string) {
    const docRef = doc(this.fs, 'orderItems', id);
    return docData(docRef, { idField: 'id' }) as Observable<IOrderItem>;
  }

  // Users Collection
  addUser(user: any) {
    let usersCollection = collection(this.fs, 'users');
    return addDoc(usersCollection, user);
  }

  getUsers(): Observable<DataTablesResponse> {
    let usersCollection = collection(this.fs, 'users');

    // Get the roles data
    let usersData = collectionData(usersCollection, { idField: 'id' });

    return usersData.pipe(
      map((data) => {
        const rows: User[] = data.map((user) => {
          const formattedJoinDate = this.getFormattedDate(
            user.joinDate.seconds,
            user.joinDate.nanoseconds
          );

          const formatttedLastLogin = this.getFormattedDate(
            user.lastLogin.seconds,
            user.lastLogin.nanoseconds
          );

          return {
            email: user.email,
            joinDate: formattedJoinDate,
            lastLogin: formatttedLastLogin,
            name: user.name,
            uid: user.uid,
          };
        });

        const response: DataTablesResponse = {
          draw: 1,
          recordsTotal: data.length,
          recordsFiltered: data.length,
          data: rows,
        };

        return response;
      })
    );
  }

  getUsersByRole(role: string): Observable<DataTablesResponse> {
    let usersCollection = collection(this.fs, 'users');

    const q = query(usersCollection, where('roles', 'array-contains', role));
    let filteredCollection = collectionData(q, { idField: 'id' });

    return filteredCollection.pipe(
      map((data) => {
        const rows: User[] = data.map((user) => {
          const formattedJoinDate = this.getFormattedDate(
            user.joinDate.seconds,
            user.joinDate.nanoseconds
          );

          const formatttedLastLogin = this.getFormattedDate(
            user.lastLogin.seconds,
            user.lastLogin.nanoseconds
          );

          return {
            email: user.email,
            joinDate: formattedJoinDate,
            lastLogin: formatttedLastLogin,
            name: user.name,
            uid: user.uid,
          };
        });

        const response: DataTablesResponse = {
          draw: 1,
          recordsTotal: data.length,
          recordsFiltered: data.length,
          data: rows,
        };

        return response;
      })
    );
  }

  getFormattedDate(seconds: number, nanoseconds: number): string {
    const milliseconds = seconds * 1000 + nanoseconds / 1000000;
    const formattedDate = moment(milliseconds).format(
      'YYYY-MM-DDTHH:mm:ss.SSSZ'
    );
    return formattedDate;
  }

  // Roles Collection
  getRoles(): Observable<IRole[]> {
    let rolesCollection = collection(this.fs, 'roles');

    // Get the roles data
    let rolesData$ = collectionData(rolesCollection, { idField: 'id' });

    // For each role, fetch or calculate totalCount individually
    return rolesData$.pipe(
      switchMap((roles) => {
        // Create an array of Observables to fetch or calculate totalCount for each role
        let totalCountObservables: Observable<number>[] = roles.map((role) => {
          return this.getRolesCount(role.name); // Assuming this method fetches or calculates totalCount for each role
        });

        // Combine the Observables for totalCount into a single Observable emitting an array of totalCounts
        return combineLatest(totalCountObservables).pipe(
          map((totalCounts) => {
            // Assign the totalCounts to their respective roles
            roles.forEach((role, index) => {
              role.totalCount = totalCounts[index];
            });
            return roles;
          })
        );
      })
    );
  }

  getRolesCount(name: string): Observable<number> {
    let usersCollection = collection(this.fs, 'users');

    const q = query(usersCollection, where('roles', 'array-contains', name));
    let filteredCollection = collectionData(q, { idField: 'id' });

    return filteredCollection.pipe(map((data) => data.length));
  }

  getRole(id: string) {
    const docRef = doc(this.fs, 'roles', id);
    return docData(docRef, { idField: 'id' }) as Observable<IRole>;
  }

  addRole(role: IRole) {
    let rolesCollection = collection(this.fs, 'roles');
    return addDoc(rolesCollection, role);
  }

  updateRole(id: string, role: any) {
    let docRef = doc(this.fs, 'roles', id);
    return updateDoc(docRef, role);
  }
}
