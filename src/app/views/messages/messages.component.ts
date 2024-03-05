import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
import { ToastrService } from 'ngx-toastr';
import {
  Observable,
  Subscription,
  combineLatest,
  forkJoin,
  map,
  switchMap,
} from 'rxjs';
import { UserWithMessages } from 'src/app/models/UserWithMessages';
import { Customers } from 'src/app/models/customers';
import { Messages, Role } from 'src/app/models/messages';
import { Users } from 'src/app/models/users';
import { AuthService } from 'src/app/services/auth.service';
import { MessagesService } from 'src/app/services/messages.service';
import { formatTimeDifference } from 'src/app/utils/constants';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css'],
})
export class MessagesComponent implements OnInit, OnDestroy {
  selectedCustomer: Customers | null = null;
  selectedUser: Users | null = null;
  searchText: string = '';
  $customers: Customers[] = [];
  $messages: Messages[] = [];
  userWithMessages$: UserWithMessages[] = [];
  ALL$: UserWithMessages[] = [];
  users$: Users | null = null;
  messageSubscription$: Subscription;
  selectedConvo: number = -1;
  selectConvo(index: number) {
    this.selectedConvo = index;
    console.log(this.userWithMessages$[index].messages);
    this.cdr.detectChanges();
  }
  constructor(
    private authService: AuthService,
    private messagesService: MessagesService,
    private cdr: ChangeDetectorRef,
    private toatr: ToastrService
  ) {
    authService.users$.subscribe((data) => {
      this.users$ = data;
    });
    this.messageSubscription$ = new Subscription();
  }
  ngOnDestroy(): void {
    this.messageSubscription$.unsubscribe();
  }

  ngOnInit(): void {
    this.messageSubscription$ = combineLatest([
      this.messagesService.getAllCustomer(),
      this.messagesService.messages$,
    ])
      .pipe(
        map(([customers, messages]) => {
          const userWithMessages = customers.map((customer) => {
            const filteredMessages = messages.filter(
              (message) =>
                message.senderID === customer.id ||
                message.receiverID === customer.id
            );

            return {
              customers: customer,
              messages: filteredMessages.reverse(),
            };
          });

          // Sort userWithMessages by the timestamp of the latest message in descending order
          userWithMessages.sort((a, b) => {
            const timestampA =
              a.messages.length > 0
                ? a.messages[0].createdAt.toDate().getTime()
                : 0;
            const timestampB =
              b.messages.length > 0
                ? b.messages[0].createdAt.toDate().getTime()
                : 0;
            return timestampB - timestampA;
          });

          return userWithMessages;
        })
      )
      .subscribe((data) => {
        this.userWithMessages$ = data;
        this.ALL$ = data;
        this.cdr.detectChanges();
      });
  }

  search() {
    if (this.searchText === '') {
      this.userWithMessages$ = this.ALL$;
    } else {
      this.userWithMessages$ = this.ALL$.filter((e) => {
        return e.customers.name
          .toLowerCase()
          .includes(this.searchText.toLowerCase());
      });
    }
  }

  formatDate(timestamp: Timestamp) {
    return formatTimeDifference(timestamp);
  }

  sendMessage(data: string, to: string | null, current: number) {
    let message: Messages = {
      id: '',
      senderID: this.users$?.id ?? '',
      receiverID: to ?? '',
      role: Role.STAFF,
      message: data,
      seen: false,
      createdAt: Timestamp.now(),
    };

    this.messagesService
      .sendMessage(message)
      .then(() => {
        this.toatr.success('message sent!');
        this.selectConvo(0);
      })
      .catch((err) => {
        this.toatr.error(err);
      });
  }

  getLastMessages(message: Messages[]): Messages | null {
    if (message.length === 0) {
      return null;
    }
    return message[message.length - 1];
  }

  formatTimestamp(timestamp: Timestamp | null) {
    return formatTimeDifference(timestamp);
  }
}
