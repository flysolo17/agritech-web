import { Component, Input } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
import { Products } from 'src/app/models/products';
import {
  formatPrice,
  formatTimestamp,
  getEffectivePrice,
} from 'src/app/utils/constants';

@Component({
  selector: 'app-product-overview',
  templateUrl: './product-overview.component.html',
  styleUrls: ['./product-overview.component.css'],
})
export class ProductOverviewComponent {
  @Input() product!: Products;

  formatTimestamp(timestamp: Date) {
    return new Date(timestamp).toLocaleDateString();
  }

  formatPrice(product: Products) {
    return getEffectivePrice(product);
  }
  formatnumber(num: number) {
    return formatPrice(num);
  }
}
