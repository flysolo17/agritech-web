import { Injectable } from '@angular/core';
import {
  FieldValue,
  Firestore,
  Timestamp,
  and,
  arrayUnion,
  collection,
  collectionData,
  doc,
  getDocs,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { Transactions } from '../models/transaction/transactions';
import { BehaviorSubject, Observable } from 'rxjs';
import { TransactionStatus } from '../models/transaction/transaction_status';
import { TrasactionDetails } from '../models/transaction/transaction_details';
import { Payment, PaymentStatus } from '../models/transaction/payment';
import * as dayjs from 'dayjs';
import { TransactionType } from '../models/transaction/transaction_type';
import { v4 as uuidv4 } from 'uuid';
import { generateInvoiceID } from '../utils/constants';
import { docData } from 'rxfire/firestore';
import { OrderItems } from '../models/transaction/order_items';
@Injectable({
  providedIn: 'root',
})
export class TransactionsService {
  _collection_name = 'transactions';
  private transactionSubject: BehaviorSubject<Transactions[]> =
    new BehaviorSubject<Transactions[]>([]);
  public transactions$: Observable<Transactions[]> =
    this.transactionSubject.asObservable();
  constructor(private firestore: Firestore) {}
  getAllTransactions(): Observable<Transactions[]> {
    const q = query(
      collection(this.firestore, this._collection_name),
      orderBy('createdAt', 'asc')
    );
    return collectionData(q) as Observable<Transactions[]>;
  }
  setTransactions(transaction: Transactions[]) {
    this.transactionSubject.next(transaction);
  }
  getAllOnlineTransactions(): Observable<Transactions[]> {
    const q = query(
      collection(this.firestore, this._collection_name),
      where('type', 'in', [TransactionType.DELIVERY, TransactionType.PICK_UP]),
      orderBy('createdAt', 'asc')
    );
    return collectionData(q) as Observable<Transactions[]>;
  }
  getPendingOrders(): Observable<Transactions[]> {
    const q = query(
      collection(this.firestore, this._collection_name),
      where('status', '==', TransactionStatus.PENDING),
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

  getTransactionByCustomerID(customerID: string): Observable<Transactions[]> {
    const q = query(
      collection(this.firestore, this._collection_name),
      where('customerID', '==', customerID),
      orderBy('createdAt', 'desc')
    );
    return collectionData(q) as Observable<Transactions[]>;
  }
  createTransaction(transaction: Transactions) {
    transaction.id = generateInvoiceID();
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

  addDriver(transactionID: string, uid: string) {
    return updateDoc(
      doc(this.firestore, this._collection_name, transactionID),
      {
        cashierID: uid,
      }
    );
  }

  addPayment(transactionID: string, payment: Payment) {
    return updateDoc(
      doc(this.firestore, this._collection_name, transactionID),
      {
        payment: payment,
      }
    );
  }

  getTransactionsByProductID(productID: string): Observable<Transactions[]> {
    let obj = {
      productID: productID,
    };
    const q = query(
      collection(this.firestore, this._collection_name),
      where('orderList', 'array-contains', obj),
      orderBy('createdAt', 'desc'),
      orderBy('updatedAt', 'desc')
    );
    return collectionData(q) as Observable<Transactions[]>;
  }

  // getTransactionByDate(
  //   startDate: Date,
  //   endDate: Date
  // ): Observable<Transactions[]> {
  //   const startTimestamp = Timestamp.fromDate(dayjs(startDate).toDate());
  //   const endTimestamp = Timestamp.fromDate(dayjs(endDate).toDate());
  //   const q = query(
  //     collection(this.firestore, this._collection_name),
  //     where('status', '==', TransactionStatus.COMPLETED),
  //     where('createdAt', '>=', startTimestamp),
  //     where('createdAt', '<=', endTimestamp),
  //     orderBy('createdAt', 'desc')
  //   );
  //   return collectionData(q) as Observable<Transactions[]>;
  // // }
  // async getTransactionByDate(
  //   startDate: Date,
  //   endDate: Date
  // ): Promise<Transactions[]> {
  //   const startTimestamp = Timestamp.fromDate(
  //     dayjs(startDate).startOf('day').toDate()
  //   );
  //   const endTimestamp = Timestamp.fromDate(
  //     dayjs(endDate).endOf('day').toDate()
  //   );
  //   const q = query(
  //     collection(this.firestore, this._collection_name),
  //     where('status', '==', TransactionStatus.COMPLETED),
  //     where('createdAt', '>=', startTimestamp),
  //     where('createdAt', '<=', endTimestamp),
  //     orderBy('createdAt', 'desc')
  //   );

  //   const querySnapshot = await getDocs(q);
  //   const transactions: Transactions[] = [];
  //   querySnapshot.forEach((doc) => {
  //     transactions.push(doc.data() as Transactions);
  //   });

  //   return transactions;
  // }

  getTransactionsForCurrentYear(): Observable<Transactions[]> {
    const currentYear = dayjs().year();

    const startDate = dayjs(`${currentYear}-01-01`).startOf('day').toDate();

    const endDate = dayjs(`${currentYear}-12-31`).endOf('day').toDate();

    const startTimestamp = Timestamp.fromDate(startDate);
    const endTimestamp = Timestamp.fromDate(endDate);

    const q = query(
      collection(this.firestore, this._collection_name),

      where('createdAt', '>=', startTimestamp),
      where('createdAt', '<=', endTimestamp),
      orderBy('createdAt', 'desc')
    );

    return collectionData(q) as Observable<Transactions[]>;
  }
}
