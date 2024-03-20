import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ILayout, LayoutType } from './configs/config';
import { LayoutService } from './layout.service';

@Injectable({
  providedIn: 'root',
})
export class LayoutInitService {
  private config = new BehaviorSubject<ILayout | null>(null);
  constructor(private layout: LayoutService) {}

  reInitProps(layoutType?: LayoutType) {
    this.layout.reInitProps();
    const currentLayoutType = layoutType
      ? layoutType
      : this.layout.getBaseLayoutTypeFromRouteOrLocalStorage();
    const config = this.layout.getLayoutConfig(currentLayoutType);
    this.layout.currentLayoutTypeSubject.next(currentLayoutType)
    this.config.next({ ...config });

    // init base layout
    this.initLayoutSettings(currentLayoutType, config);
    this.initToolbarSettings(config);
    this.initWidthSettings(config);
    this.layout.layoutConfigSubject.next({ ...this.config.value });
  }

  setBaseLayoutType(layoutType: LayoutType) {
    this.layout.setBaseLayoutType(layoutType);
    this.reInitProps(layoutType);
  }

  private initLayoutSettings(layoutType: LayoutType, config: ILayout) {
    // clear body classes
    const bodyClasses = document.body.classList.value.split(' ');
    bodyClasses.forEach((cssClass) => document.body.classList.remove(cssClass));
    // clear body attributes
    const bodyAttributes = document.body
      .getAttributeNames()
      .filter((t) => t.indexOf('data-') > -1);
    bodyAttributes.forEach((attr) => document.body.removeAttribute(attr));
    document.body.setAttribute('style', '');
    document.body.setAttribute('id', 'kt_app_body');
    document.body.setAttribute('data-kt-app-layout', layoutType);
    document.body.setAttribute('data-kt-name', 'metronic');
    document.body.classList.add('app-default');

    const pageWidth = config.app?.general?.pageWidth;
    if (layoutType === 'light-header' || layoutType === 'dark-header') {
      if (pageWidth === 'default') {
        const header = config.app?.header;
        if (header && header.default && header.default.container) {
          header.default.container = 'fixed';
        }
        const toolbar = config.app?.toolbar;
        if (toolbar) {
          toolbar.container = 'fixed';
        }
        const content = config.app?.content;
        if (content) {
          content.container = 'fixed';
        }
        const footer = config.app?.footer;
        if (footer) {
          footer.container = 'fixed';
        }

        const updatedApp = {
          ...config.app,
          ...header,
          ...toolbar,
          ...content,
          ...footer,
        };
        this.config.next({ ...config, ...updatedApp });
      }
    }
  }

  private initToolbarSettings(config: ILayout) {
    const appHeaderDefaultContent = config.app?.header?.default?.content;
    if (appHeaderDefaultContent === 'page-title') {
      const toolbar = config.app?.toolbar;
      if (toolbar) {
        toolbar.display = false;
        const updatedApp = { ...config.app, ...toolbar };
        this.config.next({ ...config, ...updatedApp });
      }
      return;
    }

    const pageTitle = this.config.value?.app?.pageTitle;
    if (pageTitle) {
      pageTitle.description = false;
      pageTitle.breadCrumb = true;
      const updatedApp = { ...config.app, ...pageTitle };
      this.config.next({ ...config, ...updatedApp });
    }
  }

  private initWidthSettings(config: ILayout) {
    const pageWidth = config.app?.general?.pageWidth;
    if (!pageWidth || pageWidth === 'default') {
      return;
    }

    const header = config.app?.header;
    if (header && header.default) {
      header.default.container = pageWidth;
    }
    const toolbar = config.app?.toolbar;
    if (toolbar) {
      toolbar.container = pageWidth;
    }
    const content = config.app?.content;
    if (content) {
      content.container = pageWidth;
    }
    const footer = config.app?.footer;
    if (footer) {
      footer.container = pageWidth;
    }
    const updatedApp = {
      ...config.app,
      ...header,
      ...toolbar,
      ...content,
      ...footer,
    };
    this.config.next({ ...this.config.value, ...updatedApp });
  }
}
