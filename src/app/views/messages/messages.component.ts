import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { Customers } from 'src/app/models/customers';
import { Messages } from 'src/app/models/messages';
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
  $subscription: Subscription;
  $messages: Messages[] = [];
  selectedConvo: string | null = null;
  selectedCustomer: Customers | null = null;
  selectedUser: Users | null = null;
  conversations: Messages[] = [];
  $customers: Customers[] = [];

  constructor(
    private authService: AuthService,
    private messagesService: MessagesService,
    private cdr: ChangeDetectorRef,
    private toatr: ToastrService
  ) {
    this.$subscription = new Subscription();
    const user = authService.users;
    if (user !== null) {
      this.getMyMessages();
      // this.getAllCustomers()
    } else {
      console.log('No users!');
    }
  }

  getMyMessages() {
    this.$subscription = this.messagesService.messages$.subscribe((data) => {
      this.$messages = data;
      this.messagesService.updateMessages(this.$messages);
    });
  }
  ngOnInit(): void {}
  ngOnDestroy(): void {
    this.$subscription.unsubscribe();
  }

  formatDate(timestamp: Timestamp) {
    return formatTimeDifference(timestamp);
  }

  sendMessage(message: Messages) {
    this.messagesService
      .sendMessage(message)
      .then(() => {
        this.toatr.success('message sent!');
      })
      .catch((err) => {
        this.toatr.error(err);
      });
  }
  getAllCustomers() {
    this.messagesService.getAllCustomer().subscribe({
      next: (data) => {
        this.$customers = data;
      },
    });
  }
}
