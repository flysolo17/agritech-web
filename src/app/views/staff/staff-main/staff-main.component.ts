import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Messages } from 'src/app/models/messages';
import { Transactions } from 'src/app/models/transaction/transactions';
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
  $messages: Messages[] = [];
  messageSubscription: Subscription;

  transactionSubscription: Subscription;
  $transactions: Transactions[] = [];
  constructor(
    public authService: AuthService,
    private messageService: MessagesService,
    private transactionService: TransactionsService
  ) {
    this.messageSubscription = new Subscription();
    this.transactionSubscription = new Subscription();
  }

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe((data) => {
      if (data != null) {
        this.messageSubscription = this.messageService
          .getAllMyMessages(data.uid)
          .subscribe((data) => {
            console.log(data);
            this.$messages = removeDuplicateMessages(data);
            this.messageService.updateMessages(this.$messages);
          });
      }
    });

    this.transactionSubscription = this.transactionService
      .getPendingOrders()
      .subscribe((data) => {
        this.$transactions = data;
      });
  }
  getUnSeenMessages() {
    return this.$messages.filter((e) => !e.seen).length;
  }

  ngOnDestroy(): void {
    this.transactionSubscription.unsubscribe();
    this.messageSubscription.unsubscribe();
  }
}
