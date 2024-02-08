import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { PaymentQr } from 'src/app/models/payments-qr';
import { TargetSales } from 'src/app/models/sales/target-sales';
import { PaymentService } from 'src/app/services/payment.service';
import { TargetSalesService } from 'src/app/services/target-sales.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
})
export class SettingsComponent {
  selectedDate$ = new Date().getFullYear().toString();
  targetSales$: TargetSales[] = [];
  paymentQrs$: PaymentQr[] = [];
  constructor(
    private targetSalesService: TargetSalesService,
    private toastr: ToastrService,
    private paymentQrService: PaymentService
  ) {
    paymentQrService.getAllPaymentQr().subscribe((data) => {
      this.paymentQrs$ = data;
      console.log(this.paymentQrs$);
    });
    this.getTargetSalesByYear(this.selectedDate$);
  }

  getTargetSalesByYear(year: string) {
    console.log(year);
    this.targetSalesService.getAllTargetSales(year).subscribe((data) => {
      this.targetSales$ = data;
    });
  }
  deleteTargetSales(id: string) {
    this.targetSalesService
      .deleteTargetSales(id)
      .then(() => this.toastr.success('Successfully Deleted'))
      .catch((err) => this.toastr.error(err.toString()));
  }
  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.uploadPayment(file);
    }
  }
  uploadPayment(file: File) {
    this.paymentQrService
      .uploadPaymentQr(file)
      .then(() => this.toastr.success('Successfuly uploaded!'))
      .catch((err) => this.toastr.error(err.toString()));
  }
  navigateToPaymentQR(downloadUrl: string) {
    window.open(downloadUrl, '_blank');
  }
}
