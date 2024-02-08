import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import * as dayjs from 'dayjs';

import { AuthService } from 'src/app/services/auth.service';
import { LoadingService } from 'src/app/services/loading.service';
import { TransactionsService } from 'src/app/services/transactions.service';
import { Transactions } from 'src/app/models/transaction/transactions';
import { TransactionCalculator } from 'src/app/utils/transaction_calc';
import { formatPrice, months } from 'src/app/utils/constants';
import { TopSellingStock } from 'src/app/models/top_selling_stock';
import { ProductService } from 'src/app/services/product.service';
import { Order, Products, productToOrder } from 'src/app/models/products';
import { OrderItems } from 'src/app/models/transaction/order_items';
import { ProductCalculator } from 'src/app/utils/product_calc';
import { TransactionStatus } from 'src/app/models/transaction/transaction_status';
import { TargetSalesService } from 'src/app/services/target-sales.service';
import { TargetSales } from 'src/app/models/sales/target-sales';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  _products: Products[] = [];
  _productItems: Order[] = [];
  _lowStocks: Order[] = [];
  public barChartOptions = {
    responsive: true,
  };
  public barChartLabels: string[] = [];
  public barChartType: string = 'bar';
  public barChartLegend: boolean = true;

  public barChartData = [
    {
      data: [10000, 20000, 30000, 40000, 50000, 60000],
      label: ' Active Sales',
    },
    {
      data: [10000, 20000, 30000, 40000, 50000, 60000],
      label: ' Target Sales',
    },
  ];

  _transactionCalculator: TransactionCalculator = new TransactionCalculator([]);
  _productCalculator: ProductCalculator = new ProductCalculator([]);
  public lineChartOptions = {
    responsive: true,
  };
  public lineChartLabels: string[] = [];
  public lineChartLegend: boolean = true;
  public lineChartData: { data: number[]; label: string }[] = [
    { data: [], label: 'Walk-In Sales' },
    { data: [], label: 'Online Orders Sales' },
  ];
  ongoing$: Transactions[] = [];
  completed$: Transactions[] = [];

  targetSales$: TargetSales[] = [];

  constructor(
    private toastr: ToastrService,
    private authService: AuthService,
    private transactionService: TransactionsService,
    private loadingService: LoadingService,
    private cdr: ChangeDetectorRef,
    private productService: ProductService,
    private targetSalesService: TargetSalesService
  ) {
    targetSalesService.getAllTargetSales('2024').subscribe((data) => {
      this.targetSales$ = data;
      this.updateBarChartData();
      console.log(this.targetSales$);
    });
  }

  updateBarChartData(): void {
    const targetSalesData = Array(12).fill(0); // Initialize an array of zeros for target sales data
    this.targetSales$.forEach((sale) => {
      if (months.includes(sale.month.substring(0, 3))) {
        console.log(
          `${sale.month} = ${months.includes(sale.month.substring(0, 3))}`
        );
        const monthIndex = months.indexOf(sale.month.substring(0, 3));
        if (monthIndex !== -1) {
          targetSalesData[monthIndex] += sale.sale;
        }
      }
    });
    this.barChartData[1].data = targetSalesData;
  }
  ngOnInit(): void {
    this.productService.getAllProducts().subscribe((data: Products[]) => {
      this._products = data;
      this._productCalculator = new ProductCalculator(data);
      this._products.map((product) => {
        this._productItems.push(...productToOrder(product));
        this._productItems.sort((a, b) => a.stocks - b.stocks);
        this._lowStocks = this._productItems.slice(0, 3);
      });

      this.cdr.detectChanges();
    });
    this.transactionService
      .getTransactionsForCurrentYear()
      .subscribe((data) => {
        this.ongoing$ = data.filter(
          (e) =>
            e.status !== TransactionStatus.COMPLETED &&
            e.status !== TransactionStatus.CANCELLED &&
            e.status !== TransactionStatus.FAILED
        );
        this.completed$ = data.filter(
          (e) => e.status == TransactionStatus.COMPLETED
        );
        this._transactionCalculator = new TransactionCalculator(data);
        this.barChartLabels = months;
        this.barChartData[0].data =
          this._transactionCalculator.generateTotalSalesPerMoth(months);

        this.lineChartLabels = Array.from(
          this._transactionCalculator.calculateTotalSalesByWalkIn().keys()
        ) as string[];
        this.lineChartData[0].data = Array.from(
          this._transactionCalculator.calculateTotalSalesByWalkIn().values()
        ) as number[];
        this.lineChartData[1].data = Array.from(
          this._transactionCalculator.calculateTotalOnlineOrders().values()
        ) as number[];

        this.cdr.detectChanges();
      });
  }

  formatPrice(num: number) {
    return formatPrice(num);
  }

  getStocks(num: number) {
    if ((num = 0)) {
      return 'No Stocks : ';
    } else {
      return 'Remaining Stocks : ';
    }
  }

  countRemaining(name: string, items: Order[]): number {
    let count = 0;
    items.map((data) => {
      if (name == data.name) {
        count += data.stocks;
      }
    });
    return count;
  }

  getQuantityOnHand(items: Order[]) {
    let count = 0;
    items.forEach((e) => {
      count += e.stocks;
    });
    return count;
  }
}
