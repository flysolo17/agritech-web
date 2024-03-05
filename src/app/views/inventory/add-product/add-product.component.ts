import { Location } from '@angular/common';
import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { ToastrService } from 'ngx-toastr';
import { ActionType, ComponentType } from 'src/app/models/audit/audit_type';
import { Products } from 'src/app/models/products';
import { UserType } from 'src/app/models/user-type';
import { Users } from 'src/app/models/users';
import { Variation } from 'src/app/models/variation';
import { AuditLogService } from 'src/app/services/audit-log.service';
import { AuthService } from 'src/app/services/auth.service';
import { LoadingService } from 'src/app/services/loading.service';
import { ProductService } from 'src/app/services/product.service';
import { generateInvoiceID } from 'src/app/utils/constants';
import { v4 as uuidv4 } from 'uuid';
import { NgbModal, NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import {
  Observable,
  OperatorFunction,
  Subject,
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  merge,
} from 'rxjs';
import { AddVariationComponent } from '../add-variation/add-variation.component';
declare var window: any;
@Component({
  selector: 'app-add-product',
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.css'],
})
export class AddProductComponent implements OnInit {
  options: string[] = [];

  _imageURL: string[] = [];
  productID: string;
  _selectedFiles: File[] = [];
  variationList$: Variation[] = [];
  productForm: FormGroup = new FormGroup({
    name: new FormControl('', Validators.required),
    description: new FormControl('', [
      Validators.required,
      Validators.maxLength(300),
    ]),
    category: new FormControl('', Validators.required),
    expire: new FormControl(new Date(), Validators.required),
    cost: new FormControl(0, Validators.required),
    price: new FormControl(0, Validators.required),
    stocks: new FormControl(0, Validators.required),
    minimum: new FormControl(0, Validators.required),
    shipping: new FormControl(0, Validators.required),
  });
  products$: Products[] = [];
  users: Users | null = null;
  constructor(
    private productService: ProductService,
    public loadingService: LoadingService,
    private toaster: ToastrService,
    public location: Location,
    private authService: AuthService,
    private auditService: AuditLogService
  ) {
    this.productID = generateInvoiceID();
    authService.users$.subscribe((data) => {
      this.users = data;
    });
  }
  private modalService = inject(NgbModal);
  addVariation() {
    const modalRef = this.modalService.open(AddVariationComponent);
    modalRef.componentInstance.productID = this.productID;
    modalRef.componentInstance.variations = this.variationList$;
    modalRef.result
      .then((data: Variation) => {
        this.saveVariation(data);
      })
      .catch((err) => this.toaster.error(err.toString()));
  }
  ngOnInit(): void {
    this.productService.products$.subscribe((data) => {
      this.products$ = data;
      this.options = Array.from(new Set(data.map((e) => e.category)));
    });
  }
  onSubmitProduct() {
    if (this._imageURL.length == 0) {
      this.toaster.warning(
        'Please add an image to your product!',
        'Image required'
      );
    } else if (this.productForm.invalid) {
      this.toaster.warning('Complete product information', '');
    } else {
      this.onUploadImages(this.generateProduct());
    }
  }
  onImagePicked(event: any) {
    const files = event.target.files;
    this._selectedFiles.push(files[0]);
    this.convertFileToDataURL(files[0], (dataURL) => {
      this._imageURL.push(dataURL);
    });
  }

  convertFileToDataURL(file: File, callback: (dataURL: string) => void) {
    const reader = new FileReader();
    reader.onload = () => {
      callback(reader.result as string);
    };
    reader.readAsDataURL(file);
  }
  deleteImage(index: number) {
    if (index >= 0 && index < this._imageURL.length) {
      this._imageURL.splice(index, 1);
      this._selectedFiles.splice(index, 1);
    }
  }

  deleteVariation(index: number) {
    if (index < 0 || index >= this.variationList$.length) {
      return;
    }
    const path = this.variationList$[index].image;
    if (path !== '') {
      this.productService
        .deleteImage(path)
        .then(() => console.log(`Image deleted from ${path}`))
        .catch((err) => this.toaster.error(err, 'Variation image failed!'));
    }
    this.variationList$.splice(index, 1);
  }

  onUploadImages(product: Products) {
    if (this._imageURL) {
      this.loadingService.showLoading('add-product');
      this.productService
        .uploadProductImages(this._selectedFiles, this.productID)
        .then((downloadURLs) => {
          product.images = downloadURLs;
          this.saveProduct(product);
        })
        .catch((error) => {
          console.error('Image upload failed:', error);
          this.loadingService.hideLoading('add-product');
        });
    }
  }
  async saveProduct(product: Products) {
    const productExists = this.products$.some(
      (data) =>
        product.name.toLocaleLowerCase() === data.name.toLocaleLowerCase()
    );
    if (productExists) {
      this.toaster.warning(`${product.name} already exists`);
      this.loadingService.hideLoading('add-product');
      return;
    }

    try {
      await this.productService.addProduct(product);
      await this.auditService.saveAudit({
        id: '',
        email: this.users?.email || '',
        role: this.users?.type || UserType.ADMIN,
        action: ActionType.CREATE,
        component: ComponentType.INVENTORY,
        payload: product,
        details: 'adding product',
        timestamp: Timestamp.now(),
      });
      this.toaster.success('New product added', 'Product added!');
    } catch (error) {
      this.toaster.error(error?.toString(), 'Error');
    } finally {
      this.loadingService.hideLoading('add-product');
      this.location.back();
    }
  }

  saveVariation(data: Variation) {
    this.variationList$.push(data);
    let cost = this.productForm.controls['cost'].value ?? 0;
    let price = this.productForm.controls['price'].value ?? 0;
    let stocks = this.productForm.controls['stocks'].value ?? 0;
    if (
      (cost !== 0 || price !== 0 || stocks !== 0) &&
      this.variationList$.length !== 0
    ) {
      this.productForm.controls['cost'].setValue(0);
      this.productForm.controls['price'].setValue(0);
      this.productForm.controls['stocks'].setValue(0);
      console.log('cost, price ,stocks in the main product set to 0');
    }
  }

  generateProduct(): Products {
    let product: Products = {
      id: this.productID,
      images: [],
      name: this.productForm.controls['name'].value ?? '',
      description: this.productForm.controls['description'].value ?? '',
      category: this.productForm.controls['category'].value ?? '',
      cost: this.productForm.controls['cost'].value ?? 0,
      price: this.productForm.controls['price'].value ?? 0,
      stocks: this.productForm.controls['stocks'].value ?? 0,
      variations: this.variationList$,
      expiryDate: new Date(this.productForm.controls['expire'].value),
      reviews: [],
      shippingInformation: {
        minimum: this.productForm.controls['minimum'].value ?? 0,
        shipping: this.productForm.controls['shipping'].value ?? 0,
      },
      createdAt: new Date(),
      updatedAt: null,
      featured: false,
    };
    return product;
  }

  model: any;

  @ViewChild('instance', { static: true }) instance!: NgbTypeahead;

  focus$ = new Subject<string>();
  click$ = new Subject<string>();

  search: OperatorFunction<string, readonly string[]> = (
    text$: Observable<string>
  ) => {
    const debouncedText$ = text$.pipe(
      debounceTime(200),
      distinctUntilChanged()
    );
    const clicksWithClosedPopup$ = this.click$.pipe(
      filter(() => !this.instance.isPopupOpen())
    );
    const inputFocus$ = this.focus$;

    return merge(debouncedText$, inputFocus$, clicksWithClosedPopup$).pipe(
      map((term) =>
        (term === ''
          ? this.options
          : this.options.filter(
              (v) => v.toLowerCase().indexOf(term.toLowerCase()) > -1
            )
        ).slice(0, 10)
      )
    );
  };
}
