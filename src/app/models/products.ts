import { QueryDocumentSnapshot } from '@angular/fire/firestore';

import { v4 as uuidv4 } from 'uuid';
import { Variation } from './variation';
import { ShippingInfo } from './shipping';

export interface Products {
  id: string;
  images: string[];
  name: string;
  description: string;
  category: string;
  cost: string;
  price: number;
  stocks: number;
  variations: Variation[];
  expiryDate: Date;
  reviews: [];
  shippingInformation: ShippingInfo;
  featured: boolean;
  createdAt: Date;
}

export const productConverter = {
  toFirestore: (data: Products) => data,
  fromFirestore: (snap: QueryDocumentSnapshot) => snap.data() as Products,
};
