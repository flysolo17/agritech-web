import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  inject,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Contents, PestMap, Topic } from 'src/app/models/pest';
import { Products } from 'src/app/models/products';
import { LoadingService } from 'src/app/services/loading.service';
import { PestService } from 'src/app/services/pest.service';
import { ProductService } from 'src/app/services/product.service';
import { findProductById } from 'src/app/utils/constants';

@Component({
  selector: 'app-add-topic',
  templateUrl: './add-topic.component.html',
  styleUrls: ['./add-topic.component.css'],
})
export class AddTopicComponent implements OnInit {
  @Input() topic!: string;
  activeModal = inject(NgbActiveModal);
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
    image: new FormControl('', Validators.required),
  });
  _contentList: Contents[] = [];
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
    this.loadingService.showLoading('add-topic');
    let topic: PestMap = {
      id: '',
      title: this._topicForm.controls.title.value ?? '',
      desc: this._topicForm.controls.description.value ?? '',
      image: '',
      category: this._topicForm.controls.category.value ?? '',
      contents: this._contentList,
      recomendations: this._recomendations.map((e) => e.id),
      createdAt: new Date(),
      topic: this.topic as Topic,
    };
    if (this._topicFile === null) {
      this.toatr.error('Please add image');
      return;
    }
    this.saveTopic(this._topicFile, topic);
  }
  async saveTopic(file: File, pestMap: PestMap) {
    this.pestMapService
      .uploadPestMapWithImage(file, pestMap)
      .then((data) => {
        this.toatr.success('Successfully updated');
      })
      .catch((err) => {
        this.toatr.error(err.toString());
      })
      .finally(() => {
        this._topicForm.reset();
        this.activeModal.close();
        this._topicFile = null;
        this.loadingService.hideLoading('add-topic');
      });
  }
}
