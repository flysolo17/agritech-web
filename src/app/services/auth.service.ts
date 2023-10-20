import { Injectable } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  user,
} from '@angular/fire/auth';
import {
  Firestore,
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from '@angular/fire/firestore';
import { Users, userConverter } from '../models/users';
import { collectionData } from 'rxfire/firestore';
import { Observable } from 'rxjs';
import {
  Storage,
  getDownloadURL,
  ref,
  uploadBytes,
} from '@angular/fire/storage';

import { v4 as uuidv4 } from 'uuid';
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  _collection_name = 'users';
  user: Users | null = null;
  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private storage: Storage
  ) {}

  getCurrentUser() {
    return user(this.auth);
  }
  login(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }
  createAccount(email: string, password: string) {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  saveUserAccount(users: Users) {
    return setDoc(
      doc(collection(this.firestore, this._collection_name), users.id),
      users
    );
  }
  getAllUsers(): Observable<Users[]> {
    return collectionData(
      collection(this.firestore, this._collection_name)
    ) as Observable<Users[]>;
  }
  getUserAccount(id: string) {
    return getDoc(
      doc(collection(this.firestore, this._collection_name), id).withConverter(
        userConverter
      )
    );
  }

  updateUserAccount(users: Users) {
    return setDoc(
      doc(collection(this.firestore, this._collection_name), users.id),
      users
    );
  }

  forgotPassword(email: string) {
    return sendPasswordResetEmail(this.auth, email);
  }

  async uploadProfile(file: File) {
    try {
      const user = this.auth.currentUser;
      if (user) {
        const fireRef = ref(
          this.storage,
          `${user.uid}/${this._collection_name}/${uuidv4()}`
        );

        await uploadBytes(fireRef, file);
        const downloadURL = await getDownloadURL(fireRef);
        return downloadURL;
      } else {
        throw new Error('No user signed in.');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  editProfile(id: string, url: string) {
    return updateDoc(
      doc(collection(this.firestore, this._collection_name), id),
      { profile: url }
    );
  }
  logout() {
    this.user = null;
    this.auth.signOut();
  }
}
