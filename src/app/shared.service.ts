import { Injectable } from '@angular/core';
import { Firestore, addDoc, collection, collectionData, deleteDoc, doc, docData, getDoc, query, updateDoc, where } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { IOrder } from './models/order.model';
import { IOrderItem } from './models/order-item.model';

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
    return collectionData(ordersCollection, {idField:'id'});
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

  deleteOrder(id:string) {
    let docRef = doc(this.fs, 'orders/'+id);
    return deleteDoc(docRef);
  }

  getProductsByName(name: string) {
    let productsCollection = collection(this.fs, 'orders');
    const q = query(productsCollection, where("name", "==", name));
    return collectionData(q, { idField: 'id' });
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

}
