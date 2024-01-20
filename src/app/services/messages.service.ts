import { Injectable } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import {
  Firestore,
  orderBy,
  query,
  where,
  collection,
  or,
  getDoc,
  doc,
  addDoc,
} from '@angular/fire/firestore';
import { collectionData } from 'rxfire/firestore';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { Messages } from '../models/messages';
import { Customers, customerConverter } from '../models/customers';

@Injectable({
  providedIn: 'root',
})
export class MessagesService {
  private messagesSubject = new BehaviorSubject<Messages[]>([]);
  messages$ = this.messagesSubject.asObservable();
  constructor(private auth: Auth, private firestore: Firestore) {}

  getAllMyMessages(uid: string): Observable<Messages[]> {
    const q = query(
      collection(this.firestore, 'messages'),
      or(where('senderID', '==', uid), where('receiverID', '==', uid)),
      orderBy('createdAt', 'desc')
    );
    return collectionData(q) as Observable<Messages[]>;
  }

  updateMessages(messages: Messages[]) {
    this.messagesSubject.next(messages);
  }

  getAllCustomer(): Observable<Customers[]> {
    return collectionData(
      collection(this.firestore, 'customers')
    ) as Observable<Customers[]>;
  }

  getCustomerByID(customerID: string) {
    return getDoc(
      doc(collection(this.firestore, 'customers'), customerID).withConverter(
        customerConverter
      )
    );
  }

  getAllConversationByID(convoID: string): Observable<Messages[]> {
    const q = query(
      collection(this.firestore, 'messages'),
      where('id', '==', convoID),
      orderBy('createdAt', 'desc')
    );
    return collectionData(q) as Observable<Messages[]>;
  }

  sendMessage(message: Messages): Promise<any> {
    return addDoc(collection(this.firestore, 'messages'), message);
  }
}
