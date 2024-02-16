import { Component, OnDestroy, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { PaymentQr } from 'src/app/models/payments-qr';
import { TargetSales } from 'src/app/models/sales/target-sales';
import { PaymentService } from 'src/app/services/payment.service';
import { TargetSalesService } from 'src/app/services/target-sales.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
})
export class SettingsComponent implements OnDestroy {
  selectedDate: string = new Date().getFullYear().toString();
  targetSales: TargetSales[] = [];
  paymentQrs: PaymentQr[] = [];
  private paymentQrsSubscription: Subscription;

  constructor(
    private targetSalesService: TargetSalesService,
    private toastr: ToastrService,
    private paymentService: PaymentService
  ) {
    this.getTargetSalesByYear(this.selectedDate);
    this.paymentQrsSubscription = paymentService
      .getAllPaymentQr()
      .subscribe((data) => {
        this.paymentQrs = data;
      });
  }

  ngOnDestroy(): void {
    if (this.paymentQrsSubscription) {
      this.paymentQrsSubscription.unsubscribe();
    }
  }

  // loginUser() {
  //   this.loadPaymentQrs();
  //   this.getTargetSalesByYear(this.selectedDate);
  // }

  getTargetSalesByYear(year: string) {
    this.targetSalesService.getAllTargetSales(year).subscribe(
      (data) => {
        this.targetSales = data;
      },
      (error) => {
        this.toastr.error('Failed to retrieve target sales.');
      }
    );
  }

  deleteTargetSales(id: string) {
    this.targetSalesService.deleteTargetSales(id).then(
      () => {
        this.toastr.success('Successfully Deleted');
      },
      (error) => {
        this.toastr.error('Failed to delete target sales.');
      }
    );
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.uploadPayment(file);
    }
  }

  uploadPayment(file: File) {
    this.paymentService.uploadPaymentQr(file).then(
      () => {
        this.toastr.success('Successfully uploaded!');
      },
      (error) => {
        this.toastr.error('Failed to upload payment QR code.');
      }
    );
  }

  navigateToPaymentQR(downloadUrl: string) {
    window.open(downloadUrl, '_blank');
  }

  deletePaymentQr(paymentQrId: string, qrUrl: string, index: number) {
    const currentQrUrl = this.paymentQrs[0]?.qr;
    if (qrUrl === currentQrUrl) {
      this.toastr.warning("You can't delete the current QR code.");
    } else {
      this.paymentService.deletePaymentQr(paymentQrId).then(
        () => {
          this.toastr.success('Payment QR code deleted successfully.');
          this.paymentQrs = this.paymentQrs.filter(
            (qr) => qr.id !== paymentQrId
          );
        },
        (error) => {
          this.toastr.error('Failed to delete payment QR code.');
        }
      );
    }
  }
}
