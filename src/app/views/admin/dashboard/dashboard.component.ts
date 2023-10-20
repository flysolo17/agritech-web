import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/services/auth.service';
import { LoadingService } from 'src/app/services/loading.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  constructor(
    private toastr: ToastrService,
    private authService: AuthService,
    private loadingService: LoadingService
  ) {}
  show() {
    this.toastr.success('Hello world!', 'Toastr fun!');
    // this.loadingService.showLoading('login');
    // console.log('test');
    // setTimeout(() => {
    //   this.toastr.success('Hello world!', 'Toastr fun!', { timeOut: 1000 });
    //   this.loadingService.hideLoading('login');
    // }, 2000);
  }
  ngOnInit(): void {}
}
