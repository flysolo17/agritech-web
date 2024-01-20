import { Location } from '@angular/common';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import * as bootstrap from 'bootstrap';

import { ToastrService } from 'ngx-toastr';
import { PestMap, Topic } from 'src/app/models/pest';

import { LoadingService } from 'src/app/services/loading.service';
import { PestService } from 'src/app/services/pest.service';
import { ProductService } from 'src/app/services/product.service';

declare var window: any;
declare var window2: any;
@Component({
  selector: 'app-add-pest',
  templateUrl: './add-pest.component.html',
  styleUrls: ['./add-pest.component.css'],
})
export class AddPestComponent implements OnInit, AfterViewInit {
  _selectedPestFile: File | null = null;
  _data: string[] = [];
  _pestMapList: PestMap[] = [];
  _pestForm = new FormGroup({
    title: new FormControl('', Validators.required),
  });
  selectedTopic: Topic | null = null;

  _selectedPest: string | null = null;
  topicModal: any;
  updateTopicModal: any;
  constructor(
    public location: Location,
    private pestMapService: PestService,
    public loadingService: LoadingService,
    private toastrService: ToastrService,
    private productService: ProductService
  ) {}
  ngAfterViewInit(): void {
    this.topicModal = new bootstrap.Modal(
      document.getElementById('topicModal')!
    );

    this.updateTopicModal = new bootstrap.Modal(
      document.getElementById('updateTopicModal')!
    );
  }
  ngOnInit(): void {
    this.pestMapService.getAllPestMap().subscribe((data) => {
      this._pestMapList = data;
    });
  }
  selectedPest(index: number) {
    if (this._pestMapList && index >= 0 && index < this._pestMapList.length) {
      this._selectedPest = this._pestMapList[index].id;
      this.topicModal.show();
    } else {
      this._selectedPest = null;
    }
  }
  onSelectPestMapFile(event: any) {
    const files = event.target.files[0];
    this._selectedPestFile = files;
  }

  isCardClicked: boolean = false;
  cardTitle: string = 'Card Title';
  cardContent: string = 'Card Content';

  onClick() {
    this.isCardClicked = true;
  }
  resetCard() {
    this.isCardClicked = false;
  }
  async addPest() {
    if (this._pestForm.valid && this._selectedPestFile != null) {
      this.loadingService.showLoading('new-pest');
      try {
        const result = await this.pestMapService.uploadPestImage(
          this._selectedPestFile
        );
        let title = this._pestForm.controls.title.value;
        const pest: PestMap = {
          id: '',
          title: title ?? '',
          image: result,
          topic: [],
          createdAt: Timestamp.now(),
        };
        this.saveNewPestMap(pest);
      } catch (err: any) {
        this.toastrService.error(err.toString());
        this.loadingService.hideLoading('new-pest');
      }
    }
  }

  saveNewPestMap(pest: PestMap) {
    this.pestMapService
      .addPestmap(pest)
      .then(() => this.toastrService.success('Successfully added!'))
      .catch((err: any) => this.toastrService.error(err.toString()))
      .finally(() => {
        this.loadingService.hideLoading('new-pest');
        this.resetCard();
      });
  }
  updateTopic(topicID: string, topic: Topic) {
    this._selectedPest = topicID;
    this.selectedTopic = topic;
    if (this._selectedPest !== null && this.selectedTopic !== null) {
      this.updateTopicModal.show();
    }
  }
}
