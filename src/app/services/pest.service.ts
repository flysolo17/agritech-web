import { Injectable } from '@angular/core';

import {
  Storage,
  getDownloadURL,
  ref,
  uploadBytes,
} from '@angular/fire/storage';

import { v4 as uuidv4 } from 'uuid';
import { PestMap, Topic } from '../models/pest';

import {
  Firestore,
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { collectionData } from 'rxfire/firestore';
@Injectable({
  providedIn: 'root',
})
export class PestService {
  _collection_name = 'pest_map';
  constructor(private firestore: Firestore, private storage: Storage) {}

  async uploadPestMapWithImage(file: File, pest: PestMap) {
    try {
      const fireRef = ref(this.storage, `${this._collection_name}/${uuidv4()}`);
      await uploadBytes(fireRef, file);
      const downloadURL = await getDownloadURL(fireRef);
      pest.image = downloadURL;
      pest.id = uuidv4();
      await setDoc(
        doc(collection(this.firestore, this._collection_name), pest.id),
        pest
      );
      return pest;
    } catch (error) {
      console.error('Error uploading file or adding pest map:', error);
      throw error;
    }
  }

  async updatePestMap(file: File | null, pest: PestMap) {
    try {
      if (file) {
        const fireRef = ref(
          this.storage,
          `${this._collection_name}/${uuidv4()}`
        );
        await uploadBytes(fireRef, file);
        const downloadURL = await getDownloadURL(fireRef);
        pest.image = downloadURL;
      }

      await updateDoc(
        doc(collection(this.firestore, this._collection_name), pest.id),
        { ...pest }
      );
      return pest;
    } catch (error) {
      console.error('Error uploading file or adding pest map:', error);
      throw error;
    }
  }

  getAllPestMap(topic: string): Observable<PestMap[]> {
    const q = query(
      collection(this.firestore, this._collection_name),
      where('topic', '==', topic),
      orderBy('createdAt', 'desc')
    );
    return collectionData(q) as Observable<PestMap[]>;
  }

  async uploadPestImage(file: File) {
    try {
      const fireRef = ref(this.storage, `${this._collection_name}/${uuidv4()}`);
      await uploadBytes(fireRef, file);
      const downloadURL = await getDownloadURL(fireRef);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  async uploadPestMapWithImageAndTopic(
    file: File | null,
    pest: PestMap,
    topic: Topic
  ) {
    try {
      if (file) {
        const fireRef = ref(
          this.storage,
          `${this._collection_name}/${uuidv4()}`
        );
        await uploadBytes(fireRef, file);
        const downloadURL = await getDownloadURL(fireRef);
        pest.image = downloadURL;
      }

      await updateDoc(doc(this.firestore, this._collection_name, pest.id), {
        topic: arrayUnion(topic),
      });

      return pest;
    } catch (error) {
      console.error(
        'Error uploading file, adding pest map, or adding topic:',
        error
      );
      throw error;
    }
  }

  deleteTopic(pestID: string) {
    return deleteDoc(doc(this.firestore, this._collection_name, pestID));
  }
}
