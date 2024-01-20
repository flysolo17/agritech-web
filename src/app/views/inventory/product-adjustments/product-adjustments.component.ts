import {
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
import { NavigationExtras, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Audit } from 'src/app/models/audit/audit';
import { Products } from 'src/app/models/products';
import { AuditLogService } from 'src/app/services/audit-log.service';
import { formatTimestamp } from 'src/app/utils/constants';

@Component({
  selector: 'app-product-adjustments',
  templateUrl: './product-adjustments.component.html',
  styleUrls: ['./product-adjustments.component.css'],
})
export class ProductAdjustmentsComponent implements OnInit, OnDestroy {
  @Input() product!: Products;
  subscription: Subscription;
  _audits: Audit[] = [];
  constructor(
    private auditService: AuditLogService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {
    this.subscription = new Subscription();
  }
  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
  ngOnInit(): void {
    this.subscription = this.auditService
      .getProductAdjustMents(this.product.id)
      .subscribe((data) => {
        this._audits = data;
        this.cdr.detectChanges();
      });
  }

  formatTimeStamp(timestamp: Timestamp) {
    return formatTimestamp(timestamp);
  }

  viewAudit(audit: Audit) {
    const navigationExtras: NavigationExtras = {
      queryParams: {
        audit: JSON.stringify(audit),
      },
    };

    this.router.navigate(['admin/view-audit'], navigationExtras);
  }
}
