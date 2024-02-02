import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Messages } from 'src/app/models/messages';
import { Transactions } from 'src/app/models/transaction/transactions';
import { Users } from 'src/app/models/users';
import { AuthService } from 'src/app/services/auth.service';
import { MessagesService } from 'src/app/services/messages.service';
import { TransactionsService } from 'src/app/services/transactions.service';
import { removeDuplicateMessages } from 'src/app/utils/constants';

@Component({
  selector: 'app-staff-main',
  templateUrl: './staff-main.component.html',
  styleUrls: ['./staff-main.component.css'],
})
export class StaffMainComponent implements OnInit, OnDestroy {
  transactionSubscription: Subscription;
  $transactions: Transactions[] = [];

  constructor(
    public authService: AuthService,
    private messageService: MessagesService,
    private transactionService: TransactionsService
  ) {
    this.transactionSubscription = new Subscription();
    this.transactionSubscription = this.transactionService
      .getPendingOrders()
      .subscribe((data) => {
        this.$transactions = data;
      });
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.transactionSubscription.unsubscribe();
  }
}
