import { Injectable } from '@angular/core';
import { NewsLetter, newsletterConverter } from '../models/newsletter';

import { updateDoc } from '@firebase/firestore';
import {
  Firestore,
  collection,
  deleteDoc,
  doc,
  orderBy,
  query,
  setDoc,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { collectionData } from 'rxfire/firestore';

const NEWSLETTER_COLLECTION = 'newsletters';
@Injectable({
  providedIn: 'root',
})
export class NewsletterService {
  constructor(private firestore: Firestore) {}
  addNewsletter(newsLetter: NewsLetter) {
    return setDoc(
      doc(this.firestore, NEWSLETTER_COLLECTION, newsLetter.id).withConverter(
        newsletterConverter
      ),
      newsLetter
    );
  }

  getAllNewsLetter(): Observable<NewsLetter[]> {
    const q = query(
      collection(this.firestore, NEWSLETTER_COLLECTION),
      orderBy('createdAt', 'desc')
    ).withConverter(newsletterConverter);

    return collectionData(q) as Observable<NewsLetter[]>;
  }
  deleteNewsletter(newsLetterID: string) {
    return deleteDoc(doc(this.firestore, NEWSLETTER_COLLECTION, newsLetterID));
  }
}
