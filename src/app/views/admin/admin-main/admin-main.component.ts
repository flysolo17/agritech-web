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
export class AdminMainComponent implements OnInit, OnDestroy {
  private subscription: Subscription;
  auth: Auth = inject(Auth);

  user$ = user(this.auth);
  users$: Users | null;
  $messages: Messages[] = [];
  userSubscription: Subscription;
  transactionSubscription: Subscription;
  $transactions: Transactions[] = [];
  constructor(
    private authService: AuthService,
    private messageService: MessagesService,
    private transactionService: TransactionsService,
    private cdr: ChangeDetectorRef
  ) {
    this.transactionSubscription = new Subscription();
    this.users$ = authService.users;
    this.subscription = new Subscription();
    this.userSubscription = new Subscription();
  }

  ngOnInit(): void {
    this.transactionSubscription = this.transactionService
      .getPendingOrders()
      .subscribe((data) => {
        this.$transactions = data;
      });
    this.userSubscription = this.user$.subscribe((user: User | null) => {
      if (user != null) {
        this.subscription = this.messageService
          .getAllMyMessages(user.uid)
          .subscribe((data) => {
            console.log(data);
            this.$messages = removeDuplicateMessages(data);
            this.messageService.updateMessages(this.$messages);
            this.cdr.detectChanges();
          });
      }
    });
  }

  getUnSeenMessages() {
    return this.$messages.filter((e) => !e.seen).length;
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.userSubscription.unsubscribe();
  }
  logout() {
    this.authService.logout();
  }
}
