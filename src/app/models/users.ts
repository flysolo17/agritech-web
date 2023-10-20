import { QueryDocumentSnapshot } from '@angular/fire/firestore';
import { UserType } from './user-type';
import { User } from '@angular/fire/auth';

export interface Users {
  id: string;
  name: string;
  profile: string;
  phone: string;
  email: string;
  address: string;
  type: UserType;
}
export const userConverter = {
  toFirestore: (data: Users) => data,
  fromFirestore: (snap: QueryDocumentSnapshot) => snap.data() as Users,
};
