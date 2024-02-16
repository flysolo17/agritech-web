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
  $messages: Messages[] = [];
  constructor(
    public authService: AuthService,
    private messageService: MessagesService,
    private transactionService: TransactionsService
  ) {
    authService.users$.subscribe((data) => {
      this.listenToMessages(data?.id ?? '');
    });

    this.transactionSubscription = this.transactionService
      .getAllTransactions()
      .subscribe((data) => {
        this.transactionService.setTransactions(data);
        this.$transactions = data.filter((e) => e.status === 'PENDING');
      });
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.transactionSubscription.unsubscribe();
  }
  listenToMessages(uid: string) {
    this.messageService.getAllMyMessages(uid).subscribe((data) => {
      console.log(data);
      this.$messages = removeDuplicateMessages(data);
      this.messageService.updateMessages(data);
    });
  }
  getUnSeenMessages() {
    return this.$messages.filter((e) => !e.seen).length;
  }
}
