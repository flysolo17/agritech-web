import { Component, OnInit } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore/firebase';
import { ActivatedRoute } from '@angular/router';
import { Customers } from 'src/app/models/customers';
import { TransactionStatus } from 'src/app/models/transaction/transaction_status';
import { Transactions } from 'src/app/models/transaction/transactions';
import { TransactionsService } from 'src/app/services/transactions.service';
import { formatTimestamp } from 'src/app/utils/constants';

@Component({
  selector: 'app-view-customer-profile',
  templateUrl: './view-customer-profile.component.html',
  styleUrls: ['./view-customer-profile.component.css'],
})
export class ViewCustomerProfileComponent implements OnInit {
  customer$: Customers | null = null;
  transactions$: Transactions[] = [];
  constructor(
    private activatedRoute: ActivatedRoute,
    private transactionService: TransactionsService
  ) {
    this.activatedRoute.queryParams.subscribe((params) => {
      const encodedObject: Customers = (params as Customers) ?? null;
      this.customer$ = encodedObject;
    });
  }
  ngOnInit(): void {
    if (this.customer$ !== null) {
      this.transactionService
        .getTransactionByCustomerID(this.customer$.id)
        .subscribe((data) => {
          this.transactions$ = data;
          console.log(data);
        });
    }
  }
  convertTimestamp(timestamp: Timestamp) {
    return formatTimestamp(timestamp);
  }
  countPending() {
    return this.transactions$.filter(
      (data) => data.status === TransactionStatus.PENDING
    ).length;
  }
  countCompleted() {
    return this.transactions$.filter(
      (data) => data.status === TransactionStatus.COMPLETED
    ).length;
  }
  countOngoing() {
    return this.transactions$.filter(
      (data) =>
        data.status === TransactionStatus.ACCEPTED ||
        data.status === TransactionStatus.OUT_OF_DELIVERY ||
        data.status === TransactionStatus.READY_TO_DELIVER ||
        data.status === TransactionStatus.READY_TO_PICK_UP
    ).length;
  }
}
