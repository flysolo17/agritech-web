import {
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Transaction, or } from '@angular/fire/firestore';
import { Subscription } from 'rxjs';
import { Audit } from 'src/app/models/audit/audit';
import { Products } from 'src/app/models/products';
import { Transactions } from 'src/app/models/transaction/transactions';
import { AuditLogService } from 'src/app/services/audit-log.service';
import { TransactionsService } from 'src/app/services/transactions.service';

@Component({
  selector: 'app-product-purchases',
  templateUrl: './product-purchases.component.html',
  styleUrls: ['./product-purchases.component.css'],
})
export class ProductPurchasesComponent implements OnInit, OnDestroy {
  @Input() product!: Products;
  subscription: Subscription;

  _transactionList: Transactions[] = [];
  _audits: Audit[] = [];
  constructor(
    private transactionService: TransactionsService,
    private cdr: ChangeDetectorRef,
    private auditService: AuditLogService
  ) {
    this.subscription = new Subscription();
  }
  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
  ngOnInit(): void {
    this.subscription = this.transactionService
      .getAllTransactions()
      .subscribe((data) => {
        console.log('DATA', data);

        this._transactionList = this.filterTransactionsByProductId(
          data,
          this.product.id
        );
        this.cdr.detectChanges();
      });
  }
  filterTransactionsByProductId(
    data: Transactions[],
    productId: string
  ): Transactions[] {
    const uniqueTransactionIds = new Set<string>();
    const filteredTransactions: Transactions[] = [];

    data.forEach((transaction) => {
      const hasDesiredProduct = transaction.orderList.some(
        (order) => order.productID === productId
      );

      if (hasDesiredProduct && !uniqueTransactionIds.has(transaction.id)) {
        filteredTransactions.push(transaction);
        uniqueTransactionIds.add(transaction.id);
      }
    });

    return filteredTransactions;
  }
}
