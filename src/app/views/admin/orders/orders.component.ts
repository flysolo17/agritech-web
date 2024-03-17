import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
import { NavigationExtras, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import {
  Payment,
  PaymentDetails,
  PaymentStatus,
} from 'src/app/models/transaction/payment';
import { TrasactionDetails } from 'src/app/models/transaction/transaction_details';
import * as bootstrap from 'bootstrap';
import { TransactionStatus } from 'src/app/models/transaction/transaction_status';
import { TransactionType } from 'src/app/models/transaction/transaction_type';
import { Transactions } from 'src/app/models/transaction/transactions';
import { Users } from 'src/app/models/users';
import { AuthService } from 'src/app/services/auth.service';
import { LoadingService } from 'src/app/services/loading.service';
import { ProductService } from 'src/app/services/product.service';
import { TransactionsService } from 'src/app/services/transactions.service';
import {
  formatPrice,
  formatTimestamp,
  generateTransactionDetails,
  getTransactionStatus,
  getTransactionType,
} from 'src/app/utils/constants';
import { AuditLogService } from 'src/app/services/audit-log.service';
import { UserType } from 'src/app/models/user-type';
import { ActionType, ComponentType } from 'src/app/models/audit/audit_type';
import { TransactionCalculator } from 'src/app/utils/transaction_calc';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AddDriverComponent } from 'src/app/components/add-driver/add-driver.component';
import { AddPaymentComponent } from 'src/app/components/add-payment/add-payment.component';
declare var window: any;
declare var window2: any;
@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css'],
})
export class OrdersComponent implements OnInit {
  _transactionList: Transactions[] = [];
  private _users: Users | null = null;

  transactionCalculator: TransactionCalculator;

  constructor(
    private transactionService: TransactionsService,
    public loadingService: LoadingService,
    private toastrService: ToastrService,
    private authService: AuthService,
    private productService: ProductService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private auditService: AuditLogService
  ) {
    this.transactionCalculator = new TransactionCalculator([]);
    authService.users$.subscribe((data) => {
      this._users = data;
    });
  }
  private modalService = inject(NgbModal);
  selectTransactionToAddPayment(transaction: Transactions) {
    const modal = this.modalService.open(AddPaymentComponent);
    modal.componentInstance.transaction = transaction;
    modal.result
      .then((data: any) => {
        let transaction = data as Transactions;
        this.addPayment(transaction.payment, transaction.id);
      })
      .catch((err) => {
        this.toastrService.error(err.toString());
      });
  }
  addDriver(transaction: Transactions) {
    const modal = this.modalService.open(AddDriverComponent);
    modal.result
      .then((data: Users) => {
        this.isDriverSelected(data, transaction.id);
      })
      .catch((err) => this.toastrService.error(err.toString()));
  }
  ngOnInit(): void {
    this.transactionService.transactions$.subscribe((value) => {
      this._transactionList = value.filter(
        (e) =>
          e.type === TransactionType.DELIVERY ||
          e.type === TransactionType.PICK_UP
      );
      this.transactionCalculator = new TransactionCalculator(
        this._transactionList
      );

      this.cdr.detectChanges();
    });
  }
  convertTimestamp(timestamp: Timestamp) {
    return formatTimestamp(timestamp);
  }

  acceptOrder(transactionID: string, payment: Payment) {
    this.loadingService.showLoading(transactionID);
    this.transactionService
      .acceptTransaction(
        this._users?.id ?? '',
        transactionID,
        TransactionStatus.ACCEPTED,
        generateTransactionDetails(TransactionStatus.ACCEPTED),
        payment
      )
      .then(async (value) => {
        await this.auditService.saveAudit({
          id: '',
          email: this._users?.email ?? '',
          role: this._users?.type ?? UserType.ADMIN,
          action: ActionType.UPDATE,
          component: ComponentType.TRANSACTION,
          payload: {
            transactionID: transactionID,
            transactionStatus: TransactionStatus.ACCEPTED,
            details: generateTransactionDetails(TransactionStatus.ACCEPTED),
          },
          details: 'accepting order',
          timestamp: Timestamp.now(),
        });
        this.toastrService.success('Order is accepted!');
      })
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
      .then(async (value) => {
        this.toastrService.success('Order is has been decline!');
        await this.auditService.saveAudit({
          id: '',
          email: this._users?.email ?? '',
          role: this._users?.type ?? UserType.ADMIN,
          action: ActionType.UPDATE,
          component: ComponentType.TRANSACTION,
          payload: {
            transactionID: transactionID,
            transactionStatus: TransactionStatus.FAILED,
            details: generateTransactionDetails(TransactionStatus.FAILED),
          },
          details: 'declining order',
          timestamp: Timestamp.now(),
        });
      })
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
      .then(async (value) => {
        await this.auditService.saveAudit({
          id: '',
          email: this._users?.email ?? '',
          role: this._users?.type ?? UserType.ADMIN,
          action: ActionType.UPDATE,
          component: ComponentType.TRANSACTION,
          payload: {
            transactionID: transactionID,
            transactionStatus: TransactionStatus.READY_TO_DELIVER,
            details: generateTransactionDetails(
              TransactionStatus.READY_TO_DELIVER
            ),
          },
          details: 'updating order to be deliver',
          timestamp: Timestamp.now(),
        });
        this.toastrService.success('Order is ready to deliver!');
      })
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
      .then(async (value) => {
        await this.auditService.saveAudit({
          id: '',
          email: this._users?.email ?? '',
          role: this._users?.type ?? UserType.ADMIN,
          action: ActionType.UPDATE,
          component: ComponentType.TRANSACTION,
          payload: {
            transactionID: transactionID,
            transactionStatus: TransactionStatus.READY_TO_PICK_UP,
            details: generateTransactionDetails(
              TransactionStatus.READY_TO_PICK_UP
            ),
          },
          details: 'updating order to be pick up',
          timestamp: Timestamp.now(),
        });
        this.toastrService.success('Order is ready to pick up!');
      })
      .catch((err) => this.toastrService.error(err.message));
  }

  markAsComplete(transaction: Transactions, payment: Payment) {
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
        await this.auditService.saveAudit({
          id: '',
          email: this._users?.email ?? '',
          role: this._users?.type ?? UserType.ADMIN,
          action: ActionType.UPDATE,
          component: ComponentType.TRANSACTION,
          payload: {
            transactionID: transaction.id,
            transactionStatus: TransactionStatus.COMPLETED,
            details: generateTransactionDetails(TransactionStatus.COMPLETED),
          },
          details: 'updating order complete',
          timestamp: Timestamp.now(),
        });
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
      .then(async (value) => {
        await this.auditService.saveAudit({
          id: '',
          email: this._users?.email ?? '',
          role: this._users?.type ?? UserType.ADMIN,
          action: ActionType.UPDATE,
          component: ComponentType.TRANSACTION,
          payload: {
            transactionID: transactionID,
            transactionStatus: TransactionStatus.OUT_OF_DELIVERY,
            details: generateTransactionDetails(
              TransactionStatus.OUT_OF_DELIVERY
            ),
          },
          details: 'updating order out  of delivery',
          timestamp: Timestamp.now(),
        });
        this.toastrService.success('Order is out of delivery!');
      })
      .catch((err) => this.toastrService.error(err.message));
  }
  reviewTransaction(transaction: Transactions) {
    const navigationExtras: NavigationExtras = {
      queryParams: {
        transaction: JSON.stringify(transaction),
      },
    };
    let user = this._users?.type == 'staff' ? 'staff' : 'admin';
    this.router.navigate([user + '/review-transactions'], navigationExtras);
  }

  getUserInfo(uid: string) {
    this.authService.getUserAccount(uid).then((value) => {
      console.log(value);
      if (value.exists()) {
        const users: Users = value.data();
        this._users = users;
      }
    });
  }
  isPaid(payment: Payment): boolean {
    if (payment.status == PaymentStatus.PAID) {
      return true;
    }
    return false;
  }
  isDriverSelected(user: Users, transactionID: string) {
    this.transactionService
      .addDriver(transactionID, user.id)
      .then(async () => {
        await this.auditService.saveAudit({
          id: '',
          email: this._users?.email ?? '',
          role: this._users?.type ?? UserType.ADMIN,
          action: ActionType.UPDATE,
          component: ComponentType.TRANSACTION,
          payload: {
            transactionID,
            user: user.name,
            email: user.email,
            phone: user.phone,
          },
          details: 'adding driver',
          timestamp: Timestamp.now(),
        });
        this.toastrService.success(`${user.name} is selected`);
      })
      .catch((err) => this.toastrService.success(err.toString()));
  }

  addPayment(payment: Payment, transactionID: string) {
    this.transactionService
      .addPayment(transactionID, payment)
      .then(async () => {
        await this.auditService.saveAudit({
          id: '',
          email: this._users?.email ?? '',
          role: this._users?.type ?? UserType.ADMIN,
          action: ActionType.UPDATE,
          component: ComponentType.TRANSACTION,
          payload: {
            transactionID: transactionID,
            payment: payment,
          },
          details: 'adding payment to transaction',
          timestamp: Timestamp.now(),
        });
        this.toastrService.success('payment success');
      })
      .catch((err) => this.toastrService.error(err.message));
  }

  formatPHP(num: number) {
    return formatPrice(num);
  }

  //added
  private isWithinLastSevenDays(timestamp: Timestamp): boolean {
    const oneWeekAgo = Timestamp.now().toMillis() - 7 * 24 * 60 * 60 * 1000;
    return timestamp.toMillis() >= oneWeekAgo;
  }

  //pending orders
  calculatePendingOrders(): number {
    const pendingTransactions = this._transactionList.filter(
      (transaction) =>
        transaction.status === TransactionStatus.PENDING &&
        this.isWithinLastSevenDays(transaction.createdAt)
    );
    return pendingTransactions.length;
  }

  //accepted orders
  calculateAcceptedOrders(): number {
    const acceptedTransactions = this._transactionList.filter(
      (transaction) =>
        transaction.status === TransactionStatus.ACCEPTED &&
        this.isWithinLastSevenDays(transaction.createdAt)
    );
    return acceptedTransactions.length;
  }

  //failed orders
  calculateFailedOrders(): number {
    const failedTransactions = this._transactionList.filter(
      (transaction) =>
        transaction.status === TransactionStatus.FAILED &&
        this.isWithinLastSevenDays(transaction.createdAt)
    );
    return failedTransactions.length;
  }

  //pickup orders
  calculatePickupOrders(): number {
    const pickupTransactions = this._transactionList.filter(
      (transaction) =>
        transaction.type === TransactionType.PICK_UP &&
        this.isWithinLastSevenDays(transaction.createdAt)
    );
    return pickupTransactions.length;
  }

  //delivery orders
  calculateDeliveryOrders(): number {
    const deliveryTransactions = this._transactionList.filter(
      (transaction) =>
        transaction.type === TransactionType.DELIVERY &&
        this.isWithinLastSevenDays(transaction.createdAt)
    );
    return deliveryTransactions.length;
  }
}
