import { QueryDocumentSnapshot } from '@angular/fire/firestore';

export enum Topic {
  CORN = 'CORN',
  VEGETABLE = 'VEGETABLE',
  RICE = 'RICE',
}

export interface PestMap {
  id: string;
  topic: Topic;
  title: string;
  desc: string;
  image: string;
  category: string;
  contents: Contents[];
  recomendations: string[];
  createdAt: Date;
}

export const pestMapConverter = {
  toFirestore: (data: PestMap) => data,
  fromFirestore: (snap: QueryDocumentSnapshot) => {
    const data = snap.data();
    return {
      ...data,
      createdAt: data['createdAt'].toDate(),
    } as PestMap;
  },
};

export interface Contents {
  title: string;
  description: string;
  image: string;
}
