import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  inject,
} from '@angular/core';
import { Auth, User, user } from '@angular/fire/auth';
import { Subscription } from 'rxjs';
import { Messages } from 'src/app/models/messages';
import { TransactionStatus } from 'src/app/models/transaction/transaction_status';
import { Transactions } from 'src/app/models/transaction/transactions';
import { Users } from 'src/app/models/users';
import { AuthService } from 'src/app/services/auth.service';
import { MessagesService } from 'src/app/services/messages.service';
import { TransactionsService } from 'src/app/services/transactions.service';
import { removeDuplicateMessages } from 'src/app/utils/constants';

@Component({
  selector: 'app-admin-main',
  templateUrl: './admin-main.component.html',
  styleUrls: ['./admin-main.component.css'],
})
export class AdminMainComponent implements OnInit {
  users$: Users | null = null;

  $messages: Messages[] = [];
  transactionSubscription: Subscription;

  $transactions: Transactions[] = [];
  constructor(
    private authService: AuthService,
    private messageService: MessagesService,
    private transactionService: TransactionsService,
    private cdr: ChangeDetectorRef
  ) {
    this.transactionSubscription = new Subscription();
    this.transactionSubscription = transactionService
      .getAllTransactions()
      .subscribe((data) => {
        this.$transactions = data.filter(
          (e) => e.status === TransactionStatus.PENDING
        );
        transactionService.setTransactions(data);
      });
    authService.users$.subscribe((data) => {
      this.users$ = data;
      this.listenToMessages(data?.id ?? '');
    });
  }

  ngOnInit(): void {}

  getUnSeenMessages() {
    return this.$messages.filter((e) => !e.seen).length;
  }

  logout() {
    this.authService.logout();
  }

  // getUserProfile(uid: string) {
  //   this.authService.getUserAccount(uid).then((data) => {
  //     if (data.exists()) {
  //       let current: Users = data.data();
  //       this.authService.setUsers(current);
  //       this.listenToMessages(current.id);
  //     }
  //   });
  // }
  listenToMessages(uid: string) {
    this.messageService.getAllMyMessages(uid).subscribe((data) => {
      console.log(data);
      this.$messages = removeDuplicateMessages(data);
      this.messageService.updateMessages(this.$messages);
      this.cdr.detectChanges();
    });
  }
}
