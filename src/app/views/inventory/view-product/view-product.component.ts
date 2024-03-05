import { Location } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  inject,
} from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { DeleteProductDialogComponent } from 'src/app/components/delete-product-dialog/delete-product-dialog.component';
import { ActionType, ComponentType } from 'src/app/models/audit/audit_type';
import { Products } from 'src/app/models/products';
import { UserType } from 'src/app/models/user-type';
import { Users } from 'src/app/models/users';
import { AuditLogService } from 'src/app/services/audit-log.service';
import { AuthService } from 'src/app/services/auth.service';
import { LoadingService } from 'src/app/services/loading.service';
import { ProductService } from 'src/app/services/product.service';
declare var window: any;
@Component({
  selector: 'app-view-product',
  templateUrl: './view-product.component.html',
  styleUrls: ['./view-product.component.css'],
})
export class ViewProductComponent implements OnInit {
  _product: Products | null = null;
  users$: Users | null = null;
  constructor(
    private activatedRoute: ActivatedRoute,
    private productService: ProductService,
    public loadingService: LoadingService,
    private authService: AuthService,
    private toastr: ToastrService,
    private location: Location,
    private router: Router,
    private auditLogService: AuditLogService,
    private cdr: ChangeDetectorRef
  ) {
    authService.users$.subscribe((data) => {
      this.users$ = data;
    });
  }
  private modalService = inject(NgbModal);
  showDeleteProduct(product: Products) {
    const modalRef = this.modalService.open(DeleteProductDialogComponent);
    modalRef.componentInstance.product = product;
    modalRef.result.then((data: string) => {
      if (data !== 'confirm') {
        this.toastr.error('Failed deletion');
      } else {
        this.deleteProduct(product);
      }
    });
  }

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe((params) => {
      const products = params['product'];
      this._product = JSON.parse(products);
      this.cdr.detectChanges();
    });
  }

  deleteProduct(data: Products) {
    this.loadingService.showLoading('deleting');
    this.productService.deleteProductByID(data.id).subscribe({
      next: async (v) => {
        await this.auditLogService.saveAudit({
          id: '',
          email: this.users$?.email ?? 'no email',
          role: this.users$?.type ?? UserType.ADMIN,
          action: ActionType.DELETE,
          component: ComponentType.INVENTORY,
          payload: data,
          details: 'deleting product from inventory',
          timestamp: Timestamp.now(),
        });
        this.loadingService.hideLoading('deleting');
        this.toastr.success(
          `${data.name} deleted successfully!`,
          'Deletion Successful'
        );
      },

      error: (v) => {
        this.toastr.error(v.message, 'Error Deleting product');
      },
      complete: () => {
        this.location.back();
      },
    });
  }
  editProduct(product: Products) {
    const navigationExtras: NavigationExtras = {
      queryParams: {
        product: JSON.stringify(product),
      },
    };
    this.router.navigate(
      [this.users$?.type + '/edit-product'],
      navigationExtras
    );
  }

  addToFeaturedProduct(productID: string) {
    this.productService
      .addToFeaturedProduct(productID)
      .then(() => {
        this.toastr.success('Successfully Added!');
      })
      .catch((err) => {
        this.toastr.error(err.toString());
      })
      .finally(() => {
        this._product!.featured = true;
      });
  }

  removeFromFeaturedProduct(productID: string) {
    this.productService
      .removeFromFeaturedProduct(productID)
      .then(() => {
        this.toastr.success('Successfully removed!');
      })
      .catch((err) => {
        this.toastr.error(err.toString());
      })
      .finally(() => {
        this._product!.featured = false;
      });
  }
}
