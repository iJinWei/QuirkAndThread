import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { BehaviorSubject } from 'rxjs';
import * as objectPath from 'object-path';
import {
  LayoutType,
  ILayout,
  CSSClassesType,
  HTMLAttributesType,
} from './configs/config';
import { DarkHeaderConfig } from './configs/dark-header.config';
import { DarkSidebarConfig } from './configs/dark-sidebar.config';
import { LightHeaderConfig } from './configs/light-header.config';
import { LightSidebarConfig } from './configs/light-sidebar.config';
import { ActivatedRoute } from '@angular/router';

const LAYOUT_CONFIG_LOCAL_STORAGE_KEY = `${environment.appVersion}-layoutConfig`;
const BASE_LAYOUT_TYPE_LOCAL_STORAGE_KEY = `${environment.appVersion}-baseLayoutType`;
const defaultBaseLayoutType: LayoutType = 'dark-sidebar';
const defaultLayoutConfig: ILayout = DarkSidebarConfig;

export function getEmptyHTMLAttributes(): HTMLAttributesType {
  return {
    asideMenu: {},
    headerMobile: {},
    headerMenu: {},
    headerContainer: {},
    pageTitle: {},
  };
}

export function getEmptyCssClasses(): CSSClassesType {
  return {
    header: [],
    headerContainer: [],
    headerMobile: [],
    headerMenu: [],
    aside: [],
    asideMenu: [],
    asideToggle: [],
    toolbar: [],
    toolbarContainer: [],
    content: [],
    contentContainer: [],
    footerContainer: [],
    sidebar: [],
    pageTitle: [],
    wrapper: [],
  };
}

@Injectable({
  providedIn: 'root',
})
export class LayoutService {
  public currentLayoutTypeSubject = new BehaviorSubject<LayoutType | null>(
    null
  );

  public layoutConfigSubject: BehaviorSubject<ILayout> =
    new BehaviorSubject<ILayout>(
      this.getLayoutConfig(this.getBaseLayoutTypeFromRouteOrLocalStorage())
    );

  // scope list of css classes
  private classes: BehaviorSubject<CSSClassesType> =
    new BehaviorSubject<CSSClassesType>(getEmptyCssClasses());

  // scope list of html attributes
  private attrs: BehaviorSubject<HTMLAttributesType> =
    new BehaviorSubject<HTMLAttributesType>(getEmptyHTMLAttributes());

  constructor(private activatedRoute: ActivatedRoute) {}

  getProp(path: string, config?: ILayout): string | boolean | undefined | Object {
    if (config) {
      return objectPath.get(config, path);
    }

    return objectPath.get(this.layoutConfigSubject.value, path);
  }

  setCSSClass(path: string, classesInStr: string) {
    const updatedCssClasses = { ...this.classes.value };
    const cssClasses = updatedCssClasses[path];
    if (!cssClasses) {
      updatedCssClasses[path] = [];
    }

    classesInStr
      .split(' ')
      .forEach((cssClass: string) => updatedCssClasses[path].push(cssClass));

    this.classes.next(updatedCssClasses);
  }

  getCSSClasses(path: string): string[] {
    const cssClasses = this.classes.value[path];
    if (!cssClasses) {
      return [];
    }

    return cssClasses;
  }

  getStringCSSClasses(path: string) {
    return this.getCSSClasses(path).join(' ');
  }

  getHTMLAttributes(path: string): {
    [attrName: string]: string | boolean;
  } {
    const attributesObj = this.attrs.value[path];
    if (!attributesObj) {
      return {};
    }
    return attributesObj;
  }

  setHTMLAttribute(path: string, attrKey: string, attrValue: string | boolean) {
    const updatedAttributes = { ...this.attrs.value };
    const attributesObj = updatedAttributes[path];
    if (!attributesObj) {
      updatedAttributes[path] = {};
    }
    updatedAttributes[path][attrKey] = attrValue;
    this.attrs.next(updatedAttributes);
  }

  getBaseLayoutTypeFromRouteOrLocalStorage(): LayoutType {
    const routeData = this.activatedRoute?.firstChild?.snapshot?.data;
    if (routeData && routeData.layout) {
      return routeData.layout as LayoutType;
    }

    return this.getBaseLayoutTypeFromLocalStorage();
  }

  getBaseLayoutTypeFromLocalStorage(): LayoutType {
    if (localStorage) {
      const layoutType = localStorage.getItem(
        BASE_LAYOUT_TYPE_LOCAL_STORAGE_KEY
      );
      if (layoutType) {
        return layoutType as LayoutType;
      }

      this.setBaseLayoutType(defaultBaseLayoutType);
    }
    return defaultBaseLayoutType;
  }

  getLayoutByType(layoutType: LayoutType | undefined): ILayout {
    switch (layoutType) {
      case 'dark-sidebar':
        return DarkSidebarConfig;
      case 'light-sidebar':
        return LightSidebarConfig;
      case 'dark-header':
        return DarkHeaderConfig;
      case 'light-header':
        return LightHeaderConfig;
      default:
        return defaultLayoutConfig;
    }
  }

  getLayoutConfig(layoutType: LayoutType): ILayout {
    const storedLayoutType = this.getBaseLayoutTypeFromLocalStorage();
    if (layoutType && storedLayoutType) {
      const configInString = localStorage.getItem(
        `${layoutType}-${LAYOUT_CONFIG_LOCAL_STORAGE_KEY}`
      );

      if (configInString) {
        try {
          return JSON.parse(configInString) as ILayout;
        } catch (ex) {
          console.log('reading config exception', ex);
        }
      }
    }

    return this.getLayoutByType(layoutType);
  }

  setBaseLayoutType(layoutType: LayoutType) {
    const config = this.getLayoutByType(layoutType);
    if (localStorage) {
      localStorage.setItem(BASE_LAYOUT_TYPE_LOCAL_STORAGE_KEY, layoutType);
      localStorage.setItem(
        `${layoutType}-${LAYOUT_CONFIG_LOCAL_STORAGE_KEY}`,
        JSON.stringify(config)
      );
    }
    // document.location.reload();
  }

  saveBaseConfig(config: ILayout) {
    const baseLayoutType = this.getBaseLayoutTypeFromLocalStorage();
    if (localStorage) {
      localStorage.setItem(
        `${baseLayoutType}-${LAYOUT_CONFIG_LOCAL_STORAGE_KEY}`,
        JSON.stringify(config)
      );
    }

    document.location.reload();
  }

  resetBaseConfig() {
    const layoutType = this.getBaseLayoutTypeFromLocalStorage;

    if (localStorage) {
      localStorage.removeItem(
        `${layoutType}-${LAYOUT_CONFIG_LOCAL_STORAGE_KEY}`
      );
    }

    document.location.reload();
  }

  reInitProps() {
    this.classes.next(getEmptyCssClasses());
    this.attrs.next(getEmptyHTMLAttributes());
  }
}
