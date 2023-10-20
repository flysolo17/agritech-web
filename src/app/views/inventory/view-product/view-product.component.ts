import { Component, Input } from '@angular/core';
import { Products } from 'src/app/models/products';

@Component({
  selector: 'app-view-product',
  templateUrl: './view-product.component.html',
  styleUrls: ['./view-product.component.css'],
})
export class ViewProductComponent {
  @Input() product: Products | null = null;
}
