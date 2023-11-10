import { Injectable } from '@angular/core';
import {
  FieldValue,
  Firestore,
  arrayUnion,
  collection,
  collectionData,
  doc,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { Transactions } from '../models/transaction/transactions';
import { Observable } from 'rxjs';
import { TransactionStatus } from '../models/transaction/transaction_status';
import { TrasactionDetails } from '../models/transaction/transaction_details';
import { Payment, PaymentStatus } from '../models/transaction/payment';

@Injectable({
  providedIn: 'root',
})
export class TransactionsService {
  _collection_name = 'transactions';
  constructor(private firestore: Firestore) {}
  getAllTransactions(): Observable<Transactions[]> {
    const q = query(
      collection(this.firestore, this._collection_name),
      orderBy('createdAt', 'asc')
    );
    return collectionData(q) as Observable<Transactions[]>;
  }
  updateTransactionStatus(
    transactionID: string,
    status: TransactionStatus,
    details: TrasactionDetails,
    payment: Payment
  ) {
    const transactionRef = doc(
      this.firestore,
      this._collection_name,
      transactionID
    );

    const updatedData = {
      status: status,
      details: arrayUnion(details),
      payment: payment,
    };
    return updateDoc(transactionRef, updatedData);
  }
  createTransaction(transaction: Transactions) {
    transaction.id = doc(collection(this.firestore, this._collection_name)).id;
    return setDoc(
      doc(collection(this.firestore, this._collection_name), transaction.id),
      transaction
    );
  }
  getAllTransactionsByCashier(cashierID: string): Observable<Transactions[]> {
    const q = query(
      collection(this.firestore, this._collection_name),
      where('cashierID', '==', cashierID),
      orderBy('createdAt', 'desc')
    );
    return collectionData(q) as Observable<Transactions[]>;
  }
}
