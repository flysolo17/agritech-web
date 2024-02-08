import { Component, OnDestroy, OnInit } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
import { NavigationExtras, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subscription } from 'rxjs';

import { Products } from 'src/app/models/products';
import { Users } from 'src/app/models/users';
import { Variation } from 'src/app/models/variation';
import { AuthService } from 'src/app/services/auth.service';
import { DateConverterService } from 'src/app/services/date-converter.service';
import { LoadingService } from 'src/app/services/loading.service';

import { ProductService } from 'src/app/services/product.service';
import { CompanyInfoService } from 'src/app/services/reportgen/company-info/company-info.service';
import { ExcelExportService } from 'src/app/services/reportgen/product/excel-export.service';
import { PdfExportService } from 'src/app/services/reportgen/product/pdf-export.service';

import { formatPrice } from 'src/app/utils/constants';
import { ProductCalculator } from 'src/app/utils/product_calc';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css'],
})
export class ProductComponent implements OnInit {
  _products!: Observable<Products[]>;

  _selectedProduct: Products | null = null;
  _PRODUCTS: Products[] = [];
  productCalculator: ProductCalculator;
  users$: Users | null = null;

  filteredProducts: Products[] = [];
  filter: string = '';
  constructor(
    private productService: ProductService,
    public dateService: DateConverterService,
    private toastr: ToastrService,
    private router: Router,
    public loadingService: LoadingService,
    public authService: AuthService,
    private pdfExportService: PdfExportService,
    private excelExportService: ExcelExportService
  ) {
    this.productService.getAllProducts().subscribe((data: Products[]) => {
      this._PRODUCTS = data;
      this.filteredProducts = data;
      this.productCalculator = new ProductCalculator(this._PRODUCTS);
    });
    this.productCalculator = new ProductCalculator([]);
    authService.users$.subscribe((data) => {
      this.users$ = data;
    });
  }

  ngOnInit(): void {}

  // Function to handle filter change
  applyFilter(selectedFilter: string) {
    this.filter = selectedFilter;
    this.filterProducts();
  }

  // Function to filter products based on the selected filter
  filterProducts() {
    this.filteredProducts = [...this._PRODUCTS];

    switch (this.filter) {
      case 'alphabetical':
        this.filteredProducts.sort((a, b) =>
          a.name.localeCompare(b.name, 'en', { sensitivity: 'base' })
        );
        break;

      case 'lowQuantity':
        this.filteredProducts.sort(
          (a, b) => this.countStocks(a) - this.countStocks(b)
        );
        this.filteredProducts = this.filteredProducts.filter(
          (product) =>
            this.countStocks(product) >= 0 && this.countStocks(product) < 20
        );
        break;

      case 'dateModified':
        this.filteredProducts.sort(
          (a, b) =>
            (b.updatedAt || b.createdAt).getTime() -
            (a.updatedAt || a.createdAt).getTime()
        );
        break;

      case 'expirationDate':
        const currentDate = new Date();
        this.filteredProducts = this.filteredProducts.filter(
          (product) =>
            product.expiryDate.getTime() <=
            currentDate.getTime() + 30 * 24 * 60 * 60 * 1000
        );
        this.filteredProducts.sort(
          (a, b) => a.expiryDate.getTime() - b.expiryDate.getTime()
        );
        break;

      default:
        // Handle default case or do nothing
        break;
    }
  }

  exportToPdf(): void {
    this.pdfExportService.exportProductsToPdf(this.filteredProducts);
  }
  exportToExcel(): void {
    const excelService = new ExcelExportService(); // Create an instance
    const filename = 'YourFilename'; // Provide a filename here
    const companyInfo = new CompanyInfoService(); // Create an instance of CompanyInfoService

    excelService.exportToExcel(this.filteredProducts, filename, companyInfo);
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

  viewProduct(product: Products) {
    const navigationExtras: NavigationExtras = {
      queryParams: {
        product: JSON.stringify(product),
      },
    };

    this.router.navigate(
      [this.users$?.type + '/view-product'],
      navigationExtras
    );
  }

  formatPHP(num: number) {
    return formatPrice(num);
  }
  getUserType() {
    if (this.users$?.type === 'staff') {
      return 'staff';
    }
    return 'admin';
  }
}
