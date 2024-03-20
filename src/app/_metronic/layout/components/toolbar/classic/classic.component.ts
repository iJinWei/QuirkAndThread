import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { LayoutService } from '../../../core/layout.service';

@Component({
  selector: 'app-classic',
  templateUrl: './classic.component.html',
  styleUrls: ['./classic.component.scss'],
})
export class ClassicComponent implements OnInit, OnDestroy {
  private unsubscribe: Subscription[] = [];
  appToolbarPrimaryButton: boolean;
  appToolbarPrimaryButtonLabel: string = '';
  appToolbarPrimaryButtonUrl: string = '';
  appToolbarPrimaryButtonModal: string = '';
  appToolbarSecondaryButton: boolean;
  appToolbarFixedDesktop: boolean;
  appToolbarSecondaryButtonLabel: string = '';
  appToolbarSecondaryButtonUrl: string = '';
  appToolbarSecondaryButtonModal: string = '';
  appToolbarFilterButton: boolean;
  appToolbarDaterangepickerButton: boolean;
  secondaryButtonClass: string = '';
  filterButtonClass: string = '';
  daterangepickerButtonClass: string = '';

  constructor(private layout: LayoutService) {}

  ngOnInit(): void {
    this.updateProps();
    const subscr = this.layout.layoutConfigSubject
      .asObservable()
      .subscribe(() => {
        this.updateProps();
      });
    this.unsubscribe.push(subscr);
  }

  updateProps() {
    this.appToolbarPrimaryButton = this.layout.getProp(
      'app.toolbar.primaryButton'
    ) as boolean;
    this.appToolbarPrimaryButtonLabel = this.layout.getProp(
      'app.toolbar.primaryButtonLabel'
    ) as string;
    this.appToolbarPrimaryButtonUrl = this.layout.getProp(
      'app.toolbar.primaryButtonUrl'
    ) as string;
    this.appToolbarPrimaryButtonModal = this.layout.getProp(
      'app.toolbar.primaryButtonModal'
    ) as string;
    this.appToolbarSecondaryButton = this.layout.getProp(
      'app.toolbar.secondaryButton'
    ) as boolean;
    this.secondaryButtonClass = this.appToolbarFixedDesktop
      ? 'btn-light'
      : 'bg-body btn-color-gray-700 btn-active-color-primary';
    this.appToolbarFixedDesktop = this.layout.getProp(
      'appToolbarFixedDesktop'
    ) as boolean;
    this.appToolbarSecondaryButtonLabel = this.layout.getProp(
      'appToolbarSecondaryButtonLabel'
    ) as string;
    this.appToolbarSecondaryButtonUrl = this.layout.getProp(
      'appToolbarSecondaryButtonUrl'
    ) as string;
    this.appToolbarSecondaryButtonModal = this.layout.getProp(
      'appToolbarSecondaryButtonModal'
    ) as string;
    this.appToolbarFilterButton = this.layout.getProp(
      'appToolbarFilterButton'
    ) as boolean;
    this.appToolbarDaterangepickerButton = this.layout.getProp(
      'appToolbarDaterangepickerButton'
    ) as boolean;

    this.filterButtonClass = this.appToolbarFixedDesktop
      ? 'btn-light'
      : 'bg-body btn-color-gray-600 btn-active-color-primary';
    this.daterangepickerButtonClass = this.appToolbarFixedDesktop
      ? 'btn-light'
      : 'bg-body btn-color-gray-700 btn-active-color-primary';
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
}
