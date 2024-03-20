import {Component, OnInit} from '@angular/core';
import {environment} from '../../../../../../environments/environment';

@Component({
  selector: 'app-purchase-toolbar',
  templateUrl: './purchase-toolbar.component.html',
})
export class PurchaseToolbarComponent implements OnInit {
  appPurchaseUrl: string = environment.appPurchaseUrl;

  constructor() {
  }

  ngOnInit(): void {
  }
}
