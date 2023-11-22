import { Component, OnInit } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';
import { ThemeService } from 'ng2-charts';
import { user } from 'rxfire/auth';
import { Reports } from 'src/app/models/report';
import { Transactions } from 'src/app/models/transaction/transactions';
import { Users } from 'src/app/models/users';
import { AuthService } from 'src/app/services/auth.service';
import { TransactionsService } from 'src/app/services/transactions.service';
import { formatTimestamp, getTransactionStatus } from 'src/app/utils/constants';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.css'],
})
export class TransactionsComponent implements OnInit {
  _users: Users | null = null;
  _transactionList: Transactions[] = [];


  
  _reports: Reports[] = [];



  constructor(
    private transactionService: TransactionsService,
    private authService: AuthService,
    private activatedRoute: ActivatedRoute
  ) {}
  ngOnInit(): void {
    const userId = this.activatedRoute.snapshot.paramMap.get('users');
    let users: Users | null = JSON.parse(userId ?? '') ?? null;
    this.transactionService
      .getAllTransactionsByCashier(users?.id ?? '')
      .subscribe((data) => {
        this._transactionList = data;

        this._transactionList.map((transaction) => {
          transaction.orderList.map((orders) => {
            this._reports.push({
              invoiceId: transaction.id,
              cashierName: user.name,
              customerName: 'no name',
              productName: orders.productName,
              quantity: orders.quantity,
              orderValue: orders.quantity * orders.price,
            });
          });
        });
      });
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
  convertTimestamp(timestamp: Timestamp) {
    return formatTimestamp(timestamp);
  }
  getTrasactionByStatus(type: number) {
    return this._transactionList.filter(
      (e) => e.status == getTransactionStatus(type)
    );
  }
}
