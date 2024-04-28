import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LayoutType } from '../../../core/configs/config';
import { LayoutInitService } from '../../../core/layout-init.service';
import { LayoutService } from '../../../core/layout.service';
import { AuthService } from 'src/app/modules/auth';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { SharedService } from 'src/app/shared.service';

@Component({
  selector: 'app-header-menu',
  templateUrl: './header-menu.component.html',
  styleUrls: ['./header-menu.component.scss'],
})
export class HeaderMenuComponent implements OnInit {
  constructor(
    private router: Router,
    private layout: LayoutService,
    private layoutInit: LayoutInitService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private sharedService: SharedService,
    private angularFireAuth: AngularFireAuth
  ) { }

  isAdmin: boolean;
  isLogistic: boolean;

  adminRole = "admin";
  logisticRole = "logistic";

  userId: string;
  userRoles: string[] = [];

  async ngOnInit(): Promise<void> {
    this.angularFireAuth.authState.subscribe((user) => {
      if (user) {
        this.userId = user.uid;
      }
      this.sharedService.getUserDetails(this.userId).then((results) => {
        if (results[0] != undefined) {
          this.userRoles = results[0].roles;
          console.log(this.userRoles);

          this.isAdmin = this.userRoles.includes(this.adminRole);
          this.isLogistic = this.userRoles.includes(this.logisticRole);
          this.cdr.detectChanges();
        }
      }
      )
    })
  }

  calculateMenuItemCssClass(url: string): string {
    return checkIsActive(this.router.url, url) ? 'active' : '';
  }

  setBaseLayoutType(layoutType: LayoutType) {
    this.layoutInit.setBaseLayoutType(layoutType);
  }

  setToolbar(
    toolbarLayout: 'classic' | 'accounting' | 'extended' | 'reports' | 'saas'
  ) {
    const currentConfig = { ...this.layout.layoutConfigSubject.value };
    if (currentConfig && currentConfig.app && currentConfig.app.toolbar) {
      currentConfig.app.toolbar.layout = toolbarLayout;
      this.layout.saveBaseConfig(currentConfig);
    }
  }
}

const getCurrentUrl = (pathname: string): string => {
  return pathname.split(/[?#]/)[0];
};

const checkIsActive = (pathname: string, url: string) => {
  const current = getCurrentUrl(pathname);
  if (!current || !url) {
    return false;
  }

  if (current === url) {
    return true;
  }

  if (current.indexOf(url) > -1) {
    return true;
  }

  return false;
};
