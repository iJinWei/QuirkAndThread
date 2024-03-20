export type LayoutType =
  | 'dark-sidebar'
  | 'light-sidebar'
  | 'dark-header'
  | 'light-header';

export type CSSClassesType = {
  [key: string]: string[];
};

export type HTMLAttributesType = {
  [key: string]: {
    [attrName: string]: string | boolean;
  };
};

export interface ILayoutComponent {
  componentName: string;
}

export interface IPageLoader extends ILayoutComponent {
  componentName: 'page-loader';
  type?: 'none' | 'default' | 'spinner-message' | 'spinner-logo';
  logoImage?: string;
  logoClass?: string;
}

export interface IScrollTop extends ILayoutComponent {
  display?: boolean;
}

export interface IHeader extends ILayoutComponent {
  componentName: 'header';
  display?: boolean;
  default?: {
    container?: 'fluid' | 'fixed';
    containerClass?: string;
    fixed?: {
      desktop?: boolean;
      mobile?: boolean;
    };
    content?: string;
    menu?: {
      display?: boolean;
      iconType?: 'svg' | 'font';
    };
  };
}

export interface ISidebar extends ILayoutComponent {
  componentName: 'sidebar';
  display?: boolean;
  default?: {
    class?: string;
    push?: {
      header?: boolean;
      toolbar?: boolean;
      footer?: boolean;
    };
    drawer?: {
      enabled?: boolean;
      attributes?: { [attrName: string]: string };
    };
    sticky?: {
      enabled?: boolean;
      attributes?: { [attrName: string]: string };
    };
    fixed?: {
      desktop?: boolean;
    };
    minimize?: {
      desktop?: {
        enabled?: boolean;
        default?: boolean;
        hoverable?: boolean;
      };
    };
    menu?: {
      iconType?: 'svg' | 'font';
    };
  };
  toggle?: boolean;
}

export interface IToolbar extends ILayoutComponent {
  componentName: 'toolbar';
  display?: boolean;
  layout?: 'classic' | 'accounting' | 'extended' | 'reports' | 'saas';
  class?: string;
  container?: 'fixed' | 'fluid';
  containerClass?: string;
  fixed?: {
    desktop?: boolean;
    mobile?: boolean;
  };

  // Custom settings
  filterButton?: boolean;
  daterangepickerButton?: boolean;
  primaryButton?: boolean;
  primaryButtonLabel?: string;
  primaryButtonModal?: string;
}

export interface IMain extends ILayoutComponent {
  type?: 'blank' | 'default' | 'none'; // Set layout type: default|blank|none
  pageBgWhite?: boolean; // Set true if page background color is white
}

export interface IIllustrations extends ILayoutComponent {
  componentName: 'illustrations';
  set?: 'sketchy-1';
}

export interface IGeneral extends ILayoutComponent {
  componentName: 'general';
  evolution?: boolean;
  layoutType?: 'default' | 'blank';
  mode?: 'light' | 'dark' | 'system';
  rtl?: boolean;
  primaryColor?: string; // Used in email templates
  pageBgWhite?: boolean; // Set true if page background color is white
  pageWidth?: 'default' | 'fluid' | 'fixed';
}

export interface IMegaMenu extends ILayoutComponent {
  display: boolean;
}

export interface ISidebarPanel extends ILayoutComponent {
  componentName: 'sidebar-panel';
  display: boolean;
}

export interface IContent extends ILayoutComponent {
  componentName: 'content';
  container?: 'fixed' | 'fluid';
}

export interface IFooter extends ILayoutComponent {
  componentName: 'footer';
  display?: boolean;
  container?: 'fluid' | 'fixed';
  containerClass?: string;
  placement?: string;
  fixed?: {
    desktop?: boolean;
    mobile?: boolean;
  };
}

export interface IPageTitle extends ILayoutComponent {
  componentName: 'page-title';
  display?: boolean;
  breadCrumb?: boolean;
  description?: boolean;
  direction?: 'row' | 'column';
  class?: string;
}

export interface IEngage extends ILayoutComponent {
  componentName: 'engage';
  demos?: {
    enabled?: boolean;
  };
  purchase?: {
    enabled?: boolean;
  };
}

export interface IApp {
  general?: IGeneral;
  header?: IHeader;
  sidebar?: ISidebar;
  sidebarPanel?: ISidebarPanel;
  toolbar?: IToolbar;
  pageTitle?: IPageTitle;
  content?: IContent;
  footer?: IFooter;
  pageLoader?: IPageLoader;
}

export interface ILayout {
  main?: IMain;
  app?: IApp;
  illustrations?: IIllustrations;
  scrolltop?: IScrollTop;
  engage?: IEngage;
}

export interface ILayoutCSSClasses {
  header: Array<string>;
  headerContainer: Array<string>;
  headerMobile: Array<string>;
  headerMenu: Array<string>;
  aside: Array<string>;
  asideMenu: Array<string>;
  asideToggle: Array<string>;
  sidebar: Array<string>;
  toolbar: Array<string>;
  toolbarContainer: Array<string>;
  content: Array<string>;
  contentContainer: Array<string>;
  footerContainer: Array<string>;
  pageTitle: Array<string>;
  pageContainer: Array<string>;
}

export interface ILayoutHTMLAttributes {
  asideMenu: Map<string, string | number | boolean>;
  headerMobile: Map<string, string | number | boolean>;
  headerMenu: Map<string, string | number | boolean>;
  headerContainer: Map<string, string | number | boolean>;
  pageTitle: Map<string, string | number | boolean>;
}
