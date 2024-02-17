import { QueryDocumentSnapshot } from '@angular/fire/firestore';

export interface NewsLetter {
  id: string;
  description: string;
  image: string;
  createdAt: string;
}

export const newsletterConverter = {
  toFirestore: (data: NewsLetter) => data,
  fromFirestore: (snap: QueryDocumentSnapshot) => snap.data() as NewsLetter,
};
