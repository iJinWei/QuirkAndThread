import { Injectable } from '@angular/core';
import {
  Firestore,
  Timestamp,
  addDoc,
  collection,
  collectionData,
  deleteDoc,
  doc,
  docData,
  getDocs,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { Observable, catchError, combineLatest, map, switchMap } from 'rxjs';
import { IOrder } from './modules/models/order.model';
import { DataTablesResponse, IUser, IUserRole, User } from './modules/models/user.model';
import { IRole } from './modules/models/role.model';
import moment from 'moment';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Injectable({
  providedIn: 'root',
})
export class SharedService {
  constructor(private fs: Firestore,
    private firestore: AngularFirestore
  ) { }

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
    const q = query(ordersCollection, orderBy('date'));
    return collectionData(q, { idField: 'id' });
  }

  getOrdersByDeliveryPersonId(deliveryPersonId: string) {
    let ordersCollection = collection(this.fs, 'orders');
    const q = query(
      ordersCollection,
      where('deliveryPersonnelId', '==', deliveryPersonId),
      orderBy('date')
    );
    return collectionData(q, { idField: 'id' });
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

  deleteOrder(id: string) {
    let docRef = doc(this.fs, 'orders/' + id);
    return deleteDoc(docRef);
  }

  updateOrder(id: string, order: any) {
    let docRef = doc(this.fs, 'orders', id);
    return updateDoc(docRef, order);
  }

  // get all delivery personnel that is not superuser and has 'logistic' role
  getAllDeliveryPersonnel() {
    let usersCollection = collection(this.fs, 'users');
    const queryConstraints = [];
    queryConstraints.push(where('roles', 'array-contains', 'logistic'));
    queryConstraints.push(where('name', '!=', 'superuser'));
    const q = query(usersCollection, ...queryConstraints);
    // let q = query(usersCollection, where('roles', 'array-contains', 'logistic'))
    return collectionData(q, { idField: 'id' });
  }

  getOrderStatuses() {
    let orderStatusCollection = collection(this.fs, 'orderStatus');
    return collectionData(orderStatusCollection, { idField: 'id' });
  }

  getDeliveryStatuses() {
    let deliveryStatusCollection = collection(this.fs, 'deliveryStatus');
    return collectionData(deliveryStatusCollection, { idField: 'id' });
  }

  // method to get single field from observable
  getField(data$: Observable<any>, fieldName: string): Observable<any> {
    return data$.pipe(
      map((data) => data[fieldName]),
      catchError((error) => {
        // console.error('Error: ', error);
        return '';
      })
    );
  }

  // Users Collection
  addUser(uid: string, userData: any) {
    let usersCollection = collection(this.fs, 'users');
    let userDocRef = doc(usersCollection, uid); // Create a document reference with the UID
    return setDoc(userDocRef, { ...userData, uid }); // Include the uid in the userData
  }

  getUserById(id: string) {
    const docRef = doc(this.fs, 'users', id);
    return docData(docRef) as Observable<IUser>;
  }

  getUsers(): Observable<IUserRole[]> {
    return this.firestore.collection<IUserRole>('users').valueChanges();
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

  async getUserDetails(uid: string) {
    const q = query(collection(this.fs, 'users'), where('uid', '==', uid));
    const snapshot = await getDocs(q);
    const userResult = snapshot.docs[0].data();

    return [userResult];
  }

  updateUserRoles(uid: string, roles: string[]): Promise<void> {
    const userDoc = this.firestore.collection('users').doc(uid);

    // Update the roles field in Firestore
    return userDoc.update({ roles })
      .then(() => console.log('User roles updated successfully.'))
      .catch((error) => console.error('Error updating user roles:', error));
  }

  async updateLastLogin(uid: string) {
    const q = query(collection(this.fs, 'users'), where('uid', '==', uid));
    const snapshot = await getDocs(q);
    const snapshotDocId = snapshot.docs[0].id;
    const docRef = doc(this.fs, 'users', snapshotDocId);
    setDoc(docRef, { lastLogin: Timestamp.now() }, { merge: true });
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
