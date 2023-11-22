import { Component, OnInit } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
import { NavigationExtras, Router } from '@angular/router';
import { Audit } from 'src/app/models/audit/audit';
import { AuditLogService } from 'src/app/services/audit-log.service';
import { formatTimestamp } from 'src/app/utils/constants';

@Component({
  selector: 'app-audit',
  templateUrl: './audit.component.html',
  styleUrls: ['./audit.component.css'],
})
export class AuditComponent implements OnInit {
  _auditLog: Audit[] = [];
  constructor(
    private auditLogService: AuditLogService,
    private router: Router
  ) {}
  ngOnInit(): void {
    this.auditLogService
      .getAllAudits()
      .subscribe((data) => (this._auditLog = data));
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
