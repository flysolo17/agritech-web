import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Contents, Topic } from 'src/app/models/pest';
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
export class EditCmsComponent {
  @Input() pestID: string = '';
  @Input() topic: Topic | null = null;
  @Output() pestEvent = new EventEmitter<any>();

  
  _contentList: Contents[] = this.topic?.contents ?? [];
  _contentFile: File | null = null;
  _contentForm = new FormGroup({
    title: new FormControl('', Validators.required),
    description: new FormControl(''),
  });
  _recomendations: Products[] = [];
  _topicFile: File | null = null;

  _products: Products[] = [];
  _topicForm = new FormGroup({
    title: new FormControl(this.topic?.title ?? '', Validators.required),
    description: new FormControl(this.topic?.desc ?? ''),
    category: new FormControl(
      this.topic?.category ?? 'INSECTS',
      Validators.required
    ),
    image: new FormControl(this.topic?.image ?? '', Validators.required),
  });
  constructor(
    private pestMapService: PestService,
    public loadingService: LoadingService,
    private toatr: ToastrService,
    private productService: ProductService
  ) {}
  ngOnInit(): void {
    this.productService.getAllProducts().subscribe((data) => {
      this._products = data;
    });
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
    if (product !== null && !this._recomendations.includes(product))
      this._recomendations.push(product);
  }

  async genearateTopic() {
    this.loadingService.showLoading('update-topic');
    let topic: Topic = {
      title: this._topicForm.controls.title.value ?? '',
      desc: this._topicForm.controls.description.value ?? '',
      image: '',
      category: this._topicForm.controls.category.value ?? '',
      contents: this._contentList,
      comments: [],
      recomendations: this._recomendations.map((e) => e.id),
    };
    if (this._topicFile !== null) {
      const result = await this.pestMapService.uploadPestImage(this._topicFile);
      topic.image = result;
    }
    this.saveTopic(topic);
  }
  saveTopic(topic: Topic) {
    this.loadingService.showLoading('update-topic');
    this.pestMapService
      .addPestMapTopic(this.pestID, topic)
      .then(() => this.toatr.success('Successfully Added!'))
      .catch((err: any) => this.toatr.error(err.message))
      .finally(() => {
        this.loadingService.hideLoading('update-topic');
        this._topicForm.reset();
        this._topicFile = null;
        this.pestEvent.emit();
      });
  }
  deleteTopic(pestID: string, topic: Topic) {
    this.pestMapService
      .deleteTopic(pestID, topic)
      .then(() => this.toatr.success('Successfully Deleted!'))
      .catch((err) => this.toatr.error(err.toString()))
      .finally(() => this.loadingService.hideLoading('delete-topic'));
  }
}
