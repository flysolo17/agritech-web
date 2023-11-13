import { QueryDocumentSnapshot, Timestamp } from '@angular/fire/firestore';

import { v4 as uuidv4 } from 'uuid';
import { Variation } from './variation';
import { ShippingInfo } from './shipping';
import { OrderItems } from './transaction/order_items';

export interface Products {
  id: string;
  images: string[];
  name: string;
  description: string;
  category: string;
  cost: number;
  price: number;
  stocks: number;
  variations: Variation[];
  expiryDate: Date;
  reviews: [];
  shippingInformation: ShippingInfo;
  featured: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp | null;
}

export const productConverter = {
  toFirestore: (data: Products) => data,
  fromFirestore: (snap: QueryDocumentSnapshot) => snap.data() as Products,
};

// export interface Variation {
//   id: string;
//   name: string;
//   image: string;
//   cost: number;
//   price: number;
//   stocks: number;
// }

export function productToOrder(product: Products): Order[] {
  let orderList: Order[] = [];
  if (product.variations.length == 0) {
    orderList.push({
      productID: product.id,
      name: product.name,
      category: product.category,
      isVariation: false,
      variatioID: '',
      image: product.images[0],
      cost: product.cost,
      price: product.price,
      quantity: 1,
      stocks: product.stocks,
      shippingInfo: product.shippingInformation,
    });
  } else {
    product.variations.forEach((variation) => {
      orderList.push({
        productID: product.id,
        name: variation.name,
        category: product.category,
        isVariation: true,
        variatioID: variation.id,
        image: variation.image,
        cost: variation.cost,
        price: variation.price,
        quantity: 1,
        stocks: variation.stocks,
        shippingInfo: product.shippingInformation,
      });
    });
  }
  return orderList;
}

export interface Order {
  productID: string;
  name: string;
  category: string;
  isVariation: boolean;
  variatioID: string;
  image: string;
  cost: number;
  price: number;
  quantity: number;
  stocks: number;
  shippingInfo: ShippingInfo;
}
