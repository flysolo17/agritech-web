import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  getDoc,
} from '@angular/fire/firestore';

import { Customers, customerConverter } from '../models/customers';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  customer_table = 'customers';
  constructor(private firestore: Firestore) {}

  getCustomerInfo(customerID: string) {
    return getDoc(
      doc(
        collection(this.firestore, this.customer_table),
        customerID
      ).withConverter(customerConverter)
    );
  }
  getAllCustomer(): Observable<Customers[]> {
    return collectionData(
      collection(this.firestore, 'customers')
    ) as Observable<Customers[]>;
  }
}
