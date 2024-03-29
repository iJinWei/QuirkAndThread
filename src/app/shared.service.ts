import { Injectable } from '@angular/core';
import { Firestore, addDoc, collection, collectionData, deleteDoc, doc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  constructor(private fs:Firestore) { }

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
}
