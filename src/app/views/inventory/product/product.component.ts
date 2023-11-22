import { Component, OnDestroy, OnInit } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
import { NavigationExtras, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subscription } from 'rxjs';

import { Products } from 'src/app/models/products';
import { Variation } from 'src/app/models/variation';
import { DateConverterService } from 'src/app/services/date-converter.service';
import { LoadingService } from 'src/app/services/loading.service';

import { ProductService } from 'src/app/services/product.service';
declare var window: any;
@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css'],
})
export class ProductComponent implements OnInit {
  _products!: Observable<Products[]>;

  _selectedProduct: Products | null = null;
  _PRODUCTS: Products[] = [];

  deleteProductModal: any;
  constructor(
    private productService: ProductService,
    public dateService: DateConverterService,
    private toastr: ToastrService,
    private router: Router,
    public loadingService: LoadingService
  ) {}

  ngOnInit(): void {
    this.deleteProductModal = new window.bootstrap.Modal(
      document.getElementById('deleteProductModal')
    );
    this.productService.getAllProducts().subscribe((data: Products[]) => {
      this._PRODUCTS = data;
    });
  }

  convertTimestamp(timestamp: any) {
    const date = new Date(
      timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000
    );
    return date.toLocaleDateString();
  }
  selectedProduct(index: number) {
    console.log(index);
    if (this._PRODUCTS && index >= 0 && index < this._PRODUCTS.length) {
      this._selectedProduct = this._PRODUCTS[index];
    } else {
      this._selectedProduct = null;
    }
  }

  findHighestLowestPrice(variations: Variation[]): string {
    let arr = variations.map((data) => data.price);
    if (arr.length === 0) {
      throw new Error('Array is empty.');
    }
    const highest = Math.max(...arr);
    const lowest = Math.min(...arr);

    const highestFormatted = highest.toLocaleString('en-US', {
      style: 'currency',
      currency: 'PHP',
    });
    const lowestFormatted = lowest.toLocaleString('en-US', {
      style: 'currency',
      currency: 'PHP',
    });

    return ` ${lowestFormatted} - ${highestFormatted}`;
  }
  countStocks(product: Products): number {
    let count = 0;
    if (product.variations.length === 0) {
      return product.stocks;
    }
    product.variations.map((data) => (count += data.stocks));
    return count;
  }
  deleteProduct(data: Products) {
    this.loadingService.showLoading(data.id);
    this.productService.deleteProductByID(data.id).subscribe({
      next: (v) =>
        this.toastr.error(
          `${data.name} delete succssfully!`,
          'Deletion Successful'
        ),
      error: (v) => {
        this.toastr.error(v.message, 'Error Deleting product ');
      },
      complete: () => {
        this.deleteProductModal.hide();
        this.loadingService.hideLoading(data.id);
      },
    });
  }

  viewProduct(product: Products) {
    const navigationExtras: NavigationExtras = {
      queryParams: {
        product: JSON.stringify(product),
      },
    };
    this.router.navigate(['admin/view-product'], navigationExtras);
  }
}
