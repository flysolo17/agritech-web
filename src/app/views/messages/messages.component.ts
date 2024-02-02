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
export class MessagesComponent implements OnInit {
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
    this.messagesService.getAllCustomer().subscribe({
      next: (data) => {
        this.$customers = data;
      },
    });
    authService.users$.subscribe((data) => {
      if (data !== null) {
        this.getMyMessages();
      } else {
        console.log('No users!');
      }
    });
  }

  getMyMessages() {
    this.messagesService.messages$.subscribe((data) => {
      this.$messages = data;
    });
  }
  ngOnInit(): void {}

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
  getAllCustomers() {}
}
