import { Location } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as bootstrap from 'bootstrap';

import { ToastrService } from 'ngx-toastr';
import { PestMap, Topic } from 'src/app/models/pest';
import { Transactions } from 'src/app/models/transaction/transactions';

import { LoadingService } from 'src/app/services/loading.service';
import { PestService } from 'src/app/services/pest.service';
import { ProductService } from 'src/app/services/product.service';
import { AddTopicComponent } from '../add-topic/add-topic.component';
import { Observable } from 'rxjs';
import { EditCmsComponent } from 'src/app/components/edit-cms/edit-cms.component';

@Component({
  selector: 'app-add-pest',
  templateUrl: './add-pest.component.html',
  styleUrls: ['./add-pest.component.css'],
})
export class AddPestComponent {
  TABS = [
    { tab: 'CORN', title: 'Corn' },
    { tab: 'VEGETABLE', title: 'Vegetable' },
    { tab: 'RICE', title: 'Rice' },
  ];
  searchText = '';
  search() {
    if (this.searchText === '') {
      this.maps$ = this.ALL_PEST;
    } else {
      this.maps$ = this.ALL_PEST.filter(
        (e) => e.title.toLowerCase() === this.searchText.toLowerCase()
      );
    }
  }
  ALL_PEST: PestMap[] = [];
  active = 'CORN';
  maps$: PestMap[] = [];
  private modalService = inject(NgbModal);
  addPest(active: string) {
    const modal = this.modalService.open(AddTopicComponent, {
      size: 'xl',
    });
    modal.componentInstance.topic = active;
  }
  constructor(
    public pestMapService: PestService,
    private cdr: ChangeDetectorRef,
    private toastr: ToastrService
  ) {
    this.updatePestMap(this.active);
  }

  updatePestMap(topic: string) {
    this.pestMapService.getAllPestMap(topic).subscribe((data) => {
      this.maps$ = data;
      this.ALL_PEST = data;
      this.cdr.detectChanges();
    });
  }

  deletePest(pestID: string) {
    this.pestMapService
      .deleteTopic(pestID)
      .then((data) => {
        this.toastr.success('Deleted Successful');
      })
      .catch((err) => this.toastr.error(err.toString()));
  }
  showUpdate(pest: PestMap) {
    const modal = this.modalService.open(EditCmsComponent, {
      size: 'xl',
    });
    modal.componentInstance.pest = pest;
  }
}
