import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { ToastrService } from 'ngx-toastr';
import { Products } from 'src/app/models/products';
import { Variation } from 'src/app/models/variation';
import { LoadingService } from 'src/app/services/loading.service';
import { ProductService } from 'src/app/services/product.service';
import { v4 as uuidv4 } from 'uuid';
declare var window: any;
@Component({
  selector: 'app-add-product',
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.css'],
})
export class AddProductComponent implements OnInit {
  _imageURL: string[] = [];
  productID: string;
  _selectedFiles: File[] = [];
  variationList$: Variation[] = [];
  createVariationModal: any;
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
    weight: new FormControl(0, Validators.required),
    width: new FormControl(0),
    height: new FormControl(0),
    shipping: new FormControl(0, Validators.required),
  });
  constructor(
    private productService: ProductService,
    public loadingService: LoadingService,
    private toaster: ToastrService,
    public location: Location
  ) {
    this.productID = uuidv4();
  }
  ngOnInit(): void {
    this.createVariationModal = new window.bootstrap.Modal(
      document.getElementById('addvariation')
    );
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
  saveProduct(product: Products) {
    this.productService
      .addProduct(product)
      .then((data) =>
        this.toaster.success('new product added', 'Product added!')
      )
      .catch((err) => this.toaster.error(err.message, 'Error'))
      .finally(() => {
        this.loadingService.hideLoading('add-product');
        this.location.back();
      });
  }
  saveVariation(data: Variation) {
    this.variationList$.push(data);
    this.createVariationModal.hide();
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
        weight: this.productForm.controls['weight'].value ?? 0,
        width: this.productForm.controls['width'].value ?? 0,
        height: this.productForm.controls['height'].value ?? 0,
        shipping: this.productForm.controls['shipping'].value ?? 0,
      },
      createdAt: Timestamp.now(),
      updatedAt: null,
      featured: false,
    };
    return product;
  }
}
