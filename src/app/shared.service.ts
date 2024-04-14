import { Injectable } from '@angular/core';
import { Firestore, addDoc, collection, collectionData, deleteDoc, doc, docData, getDocs, orderBy, query, setDoc, updateDoc, where } from '@angular/fire/firestore';
import { Observable, catchError, map } from 'rxjs';
import { IOrder } from './modules/models/order.model';
import { IOrderItem } from './modules/models/order-item.model';
import { IUser, User } from './modules/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  constructor(private fs:Firestore) { }


  // Product Firestore Methods
  getCategories() {
    let categoriesCollection = collection(this.fs, 'categories');
    return collectionData(categoriesCollection, {idField:'id'})
  }

  getProducts() {
    let productsCollection = collection(this.fs, 'products');
    return collectionData(productsCollection, {idField:'id'});
  }

  addProduct(product: any) {
    let productsCollection = collection(this.fs, 'products');
    return addDoc(productsCollection, product);
  }

  deleteProduct(id:string) {
    let docRef = doc(this.fs, 'products/'+id);
    return deleteDoc(docRef);
  }

  getProductsByCategory(category: string) {
    let productsCollection = collection(this.fs, 'products');
    const q = query(productsCollection, where("category", "==", category));
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
    return collectionData(q, {idField:'id'});
  }

  
  getOrdersByDeliveryPersonId(deliveryPersonId: string) {
    let ordersCollection = collection(this.fs, 'orders');
    const q = query(ordersCollection, where("deliveryPersonnelId", "==", deliveryPersonId), orderBy("date"))
    return collectionData(q, { idField: 'id' });
  }

  getOrderById(id: string) {
    const docRef = doc(this.fs, 'orders', id);
    return docData(docRef, {idField: 'id'}) as Observable<IOrder>;
  }

  getOrderItemsByOrderId(orderId: string) {
    let ordersCollection = collection(this.fs, 'orderItems');
    const q = query(ordersCollection, where("orderId", "==", orderId));
    return collectionData(q, { idField: 'id' });
  }

  addOrder(order: any) {
    let ordersCollection = collection(this.fs, 'orders');
    return addDoc(ordersCollection, order);
  }

  async deleteOrder(id:string) {
    let docRef = doc(this.fs, 'orders/'+id);
    let orderItemsCollection = collection(this.fs, 'orderItems');
    const q = query(orderItemsCollection, where("orderId", "==", id));

    // Get documents based on the query
    const querySnapshot = await getDocs(q);
    
    // Delete each document
    querySnapshot.forEach(async (doc) => {
      try {
        await deleteDoc(doc.ref);
      } catch (error) {
      }
    });
    return deleteDoc(docRef);
  }

  updateOrder(id: string, order: any) {
    let docRef = doc(this.fs, 'orders', id);
    return updateDoc(docRef, order);
  }

  addOrderItem(orderItem: any) {
    let orderItemsCollection = collection(this.fs, 'orderItems')
    return addDoc(orderItemsCollection, orderItem)
  }

  updateOrderItem(id: string, orderItem: any) {
    let docRef = doc(this.fs, 'orderItems', id);
    return updateDoc(docRef, orderItem);
  }

  deleteOrderItem(id:string) {
    let docRef = doc(this.fs, 'orderItems', id);
    return deleteDoc(docRef);
  }

  getOrderItemById(id: string) {
    const docRef = doc(this.fs, 'orderItems', id);
    return docData(docRef, {idField: 'id'}) as Observable<IOrderItem>;
  }

  // get all delivery personnel that is not superuser and has 'logistic' role
  getAllDeliveryPersonnel() {
    let usersCollection = collection(this.fs, 'users');
    const queryConstraints = []
    queryConstraints.push(where('roles', 'array-contains', 'logistic'))
    queryConstraints.push(where('name', '!=', 'superuser'))
    const q = query(usersCollection, ...queryConstraints)
    // let q = query(usersCollection, where('roles', 'array-contains', 'logistic'))
    return collectionData(q, { idField: 'id' });
  }

  getOrderStatuses() {
    let orderStatusCollection = collection(this.fs, 'orderStatus');
    return collectionData(orderStatusCollection, {idField:'id'});
  }

  getDeliveryStatuses() {
    let deliveryStatusCollection = collection(this.fs, 'deliveryStatus');
    return collectionData(deliveryStatusCollection, {idField:'id'});
  }

  // method to get single field from observable
  getField(data$: Observable<any>, fieldName: string): Observable<any> {
    return data$.pipe(
      map(data => data[fieldName]),
      catchError(error => {
        // console.error('Error: ', error);
        return '';
      })
    );
  }

  // Users Firestore Methods
  addUser(uid: string, userData: any) {
    let usersCollection = collection(this.fs, 'users');
    let userDocRef = doc(usersCollection, uid); // Create a document reference with the UID
    return setDoc(userDocRef, { ...userData, uid }); // Include the uid in the userData
  }

  getUserById(id: string) {
    const docRef = doc(this.fs, 'users', id);
    return docData(docRef) as Observable<IUser>;
  }

}
