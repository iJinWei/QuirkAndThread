import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import {
  DrawerComponent,
  MenuComponent,
  ScrollComponent,
  ScrollTopComponent,
  StickyComponent,
  ToggleComponent,
} from '../../../_metronic/kt/components';
import { ThemeModeService } from '../../../_metronic/partials/layout/theme-mode-switcher/theme-mode.service';

@Component({
  selector: 'app-error500',
  templateUrl: './error500.component.html',
  styleUrls: ['./error500.component.scss'],
})
export class Error500Component implements OnInit, OnDestroy {
  private unsubscribe: Subscription[] = [];

  constructor(private router: Router, private modeService: ThemeModeService) {}

  ngOnInit(): void {
    const subscr = this.modeService.mode.asObservable().subscribe((mode) => {
      document.body.style.backgroundImage =
        mode === 'dark'
          ? 'url(./assets/media/auth/bg7-dark.jpg)'
          : 'url(./assets/media/auth/bg7.jpg)';
    });
    this.unsubscribe.push(subscr);
  }

  routeToDashboard() {
    this.router.navigate(['dashboard']);
    setTimeout(() => {
      ToggleComponent.reinitialization();
      ScrollTopComponent.reinitialization();
      DrawerComponent.reinitialization();
      StickyComponent.bootstrap();
      MenuComponent.reinitialization();
      ScrollComponent.reinitialization();
    }, 200);
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
    document.body.style.backgroundImage = 'none';
  }
}
