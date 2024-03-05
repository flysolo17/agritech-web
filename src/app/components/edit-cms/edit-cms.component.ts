import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  inject,
} from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Contents, PestMap, Topic } from 'src/app/models/pest';
import { Products } from 'src/app/models/products';
import { LoadingService } from 'src/app/services/loading.service';
import { PestService } from 'src/app/services/pest.service';
import { ProductService } from 'src/app/services/product.service';
import { findProductById } from 'src/app/utils/constants';

@Component({
  selector: 'app-edit-cms',
  templateUrl: './edit-cms.component.html',
  styleUrls: ['./edit-cms.component.css'],
})
export class EditCmsComponent implements OnInit {
  @Input() pest!: PestMap;
  _contentList: Contents[] = [];
  _contentFile: File | null = null;
  _contentForm = new FormGroup({
    title: new FormControl('', Validators.required),
    description: new FormControl(''),
  });
  _recomendations: Products[] = [];
  _topicFile: File | null = null;

  _products: Products[] = [];
  _topicForm = new FormGroup({
    title: new FormControl('', Validators.required),
    description: new FormControl(''),
    category: new FormControl('INSECTS', Validators.required),
    image: new FormControl(''),
  });
  activeModal = inject(NgbActiveModal);
  constructor(
    private pestMapService: PestService,
    public loadingService: LoadingService,
    private toatr: ToastrService,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.productService.getAllProducts().subscribe((data) => {
      this._products = data;
      data.forEach((e) => {
        if (this.pest.recomendations.includes(e.id)) {
          this._recomendations.push(e);
        }
      });
    });
    this._contentList = this.pest.contents;

    this._topicForm.controls.title.setValue(this.pest.title);
    this._topicForm.controls.description.setValue(this.pest.desc);
    this._topicForm.controls.category.setValue(this.pest.category);
  }

  onSelectTopicFile(event: any) {
    const files = event.target.files[0];
    this._topicFile = files;
  }

  onSelectContentFile(event: any) {
    const files = event.target.files[0];
    this._contentFile = files;
  }
  async addContent() {
    this.loadingService.showLoading('add-content');
    let title: string = this._contentForm.controls.title.value ?? '';
    let desc: string = this._contentForm.controls.description.value ?? '';
    let contents: Contents = {
      title: title,
      description: desc,
      image: '',
    };
    if (this._contentFile !== null) {
      const result = await this.pestMapService.uploadPestImage(
        this._contentFile
      );
      contents.image = result;
    }
    this.loadingService.hideLoading('add-content');
    this._contentFile = null;
    this._contentForm.reset();
    this._contentList.push(contents);
  }

  addRecomendations(value: string) {
    let product: Products | null = findProductById(this._products, value);

    if (product !== null && !this._recomendations.includes(product)) {
      this._recomendations.push(product);
    }
  }

  async genearateTopic() {
    this.loadingService.showLoading('update-topic');
    (this.pest.title = this._topicForm.controls.title.value ?? ''),
      (this.pest.desc = this._topicForm.controls.description.value ?? ''),
      (this.pest.category = this._topicForm.controls.category.value ?? ''),
      this.updatePest(this.pest);
  }
  updatePest(pest: PestMap) {
    this.loadingService.showLoading('update-topic');
    this.pestMapService
      .updatePestMap(this._topicFile, pest)
      .then(() => this.toatr.success('Successfully Added!'))
      .catch((err: any) => this.toatr.error(err.message))
      .finally(() => {
        this.loadingService.hideLoading('update-topic');
        this._topicForm.reset();
      });
  }
  deleteTopic(pestID: string) {
    this.pestMapService
      .deleteTopic(pestID)
      .then(() => this.toatr.success('Successfully Deleted!'))
      .catch((err) => this.toatr.error(err.toString()))
      .finally(() => this.loadingService.hideLoading('delete-topic'));
  }
}
