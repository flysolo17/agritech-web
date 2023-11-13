import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
import { ToastrService } from 'ngx-toastr';
import { Payment, PaymentStatus } from 'src/app/models/transaction/payment';
import { TrasactionDetails } from 'src/app/models/transaction/transaction_details';

import { TransactionStatus } from 'src/app/models/transaction/transaction_status';
import { TransactionType } from 'src/app/models/transaction/transaction_type';
import { Transactions } from 'src/app/models/transaction/transactions';
import { LoadingService } from 'src/app/services/loading.service';
import { ProductService } from 'src/app/services/product.service';
import { TransactionsService } from 'src/app/services/transactions.service';
import {
  formatTimestamp,
  generateTransactionDetails,
  getTransactionStatus,
  getTransactionType,
} from 'src/app/utils/constants';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css'],
})
export class OrdersComponent implements OnInit {
  _transactionList: Transactions[] = [];
  constructor(
    private transactionService: TransactionsService,
    public loadingService: LoadingService,
    private toastrService: ToastrService,
    private productService: ProductService,
    private cdr: ChangeDetectorRef
  ) {}
  ngOnInit(): void {
    this.transactionService.getAllOnlineTransactions().subscribe((value) => {
      this._transactionList = value;
      console.log(this._transactionList);
      this.cdr.detectChanges();
    });
  }
  convertTimestamp(timestamp: Timestamp) {
    return formatTimestamp(timestamp);
  }
  acceptOrder(transactionID: string, payment: Payment) {
    this.loadingService.showLoading(transactionID);
    this.transactionService
      .updateTransactionStatus(
        transactionID,
        TransactionStatus.ACCEPTED,
        generateTransactionDetails(TransactionStatus.ACCEPTED),
        payment
      )
      .then((value) => this.toastrService.success('Order is accepted!'))
      .catch((err) => this.toastrService.error(err.message))
      .finally(() => this.loadingService.hideLoading(transactionID));
  }

  declineOrder(transactionID: string, payment: Payment) {
    this.loadingService.showLoading(transactionID);
    this.transactionService
      .updateTransactionStatus(
        transactionID,
        TransactionStatus.FAILED,
        generateTransactionDetails(TransactionStatus.FAILED),
        payment
      )
      .then((value) => this.toastrService.success('Order is has been decline!'))
      .catch((err) => this.toastrService.error(err.message))
      .finally(() => this.loadingService.hideLoading(transactionID));
  }
  readyToDeliver(transactionID: string, payment: Payment) {
    this.transactionService
      .updateTransactionStatus(
        transactionID,
        TransactionStatus.READY_TO_DELIVER,
        generateTransactionDetails(TransactionStatus.READY_TO_DELIVER),
        payment
      )
      .then((value) => this.toastrService.success('Order is ready to deliver!'))
      .catch((err) => this.toastrService.error(err.message));
  }

  readyToPickUp(transactionID: string, payment: Payment) {
    this.transactionService
      .updateTransactionStatus(
        transactionID,
        TransactionStatus.READY_TO_PICK_UP,
        generateTransactionDetails(TransactionStatus.READY_TO_PICK_UP),
        payment
      )
      .then((value) => this.toastrService.success('Order is ready to pick up!'))
      .catch((err) => this.toastrService.error(err.message));
  }

  markAsComplete(transaction: Transactions, payment: Payment) {
    payment.status = PaymentStatus.PAID;

    this.transactionService
      .updateTransactionStatus(
        transaction.id,
        TransactionStatus.COMPLETED,
        generateTransactionDetails(TransactionStatus.COMPLETED),
        payment
      )
      .then(async (value) => {
        await this.productService.batchUpdateProductQuantity(
          transaction.orderList
        );
        this.toastrService.success('Order completed!');
      })
      .catch((err) => this.toastrService.error(err.message));
  }

  getTrasactionByStatus(type: number) {
    return this._transactionList.filter(
      (e) => e.status == getTransactionStatus(type)
    );
  }

  ongoingDeliver(transactionID: string, payment: Payment) {
    this.transactionService
      .updateTransactionStatus(
        transactionID,
        TransactionStatus.OUT_OF_DELIVERY,
        generateTransactionDetails(TransactionStatus.OUT_OF_DELIVERY),
        payment
      )
      .then((value) => this.toastrService.success('Order is out of delivery!'))
      .catch((err) => this.toastrService.error(err.message));
  }
}
