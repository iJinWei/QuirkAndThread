// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  appVersion: 'v8.2.3',
  USERDATA_KEY: 'authf649fc9a5f55',
  isMockEnabled: true,
  apiUrl: 'api',
  appThemeName: 'Metronic',
  appPurchaseUrl: 'https://1.envato.market/EA4JP',
  appHTMLIntegration:
    'https://preview.keenthemes.com/metronic8/demo1/documentation/base/helpers/flex-layouts.html',
  appPreviewUrl: 'https://preview.keenthemes.com/metronic8/angular/demo1/',
  appPreviewAngularUrl:
    'https://preview.keenthemes.com/metronic8/angular/demo1',
  appPreviewDocsUrl: 'https://preview.keenthemes.com/metronic8/angular/docs',
  appPreviewChangelogUrl:
    'https://preview.keenthemes.com/metronic8/angular/docs/changelog',
  appDemos: {
    demo1: {
      title: 'Demo 1',
      description: 'Default Dashboard',
      published: true,
      thumbnail: './assets/media/demos/demo1.png',
    },

    demo2: {
      title: 'Demo 2',
      description: 'SaaS Application',
      published: true,
      thumbnail: './assets/media/demos/demo2.png',
    },

    demo3: {
      title: 'Demo 3',
      description: 'New Trend',
      published: true,
      thumbnail: './assets/media/demos/demo3.png',
    },

    demo4: {
      title: 'Demo 4',
      description: 'Intranet Application',
      published: true,
      thumbnail: './assets/media/demos/demo4.png',
    },

    demo5: {
      title: 'Demo 5',
      description: 'Support Forum',
      published: false,
      thumbnail: './assets/media/demos/demo5.png',
    },

    demo6: {
      title: 'Demo 6',
      description: 'Admin Backend',
      published: true,
      thumbnail: './assets/media/demos/demo6.png',
    },

    demo7: {
      title: 'Demo 7',
      description: 'CRM Dashboard',
      published: false,
      thumbnail: './assets/media/demos/demo7.png',
    },

    demo8: {
      title: 'Demo 8',
      description: 'Core Dashboard',
      published: false,
      thumbnail: './assets/media/demos/demo8.png',
    },

    demo9: {
      title: 'Demo 9',
      description: 'Fancy Dashboard',
      published: false,
      thumbnail: './assets/media/demos/demo9.png',
    },

    demo10: {
      title: 'Demo 10',
      description: 'Modern Dashboard',
      published: false,
      thumbnail: './assets/media/demos/demo10.png',
    },

    demo11: {
      title: 'Demo 11',
      description: 'Light Dashboard',
      published: false,
      thumbnail: './assets/media/demos/demo11.png',
    },

    demo12: {
      title: 'Demo 12',
      description: 'Reporting System',
      published: false,
      thumbnail: './assets/media/demos/demo12.png',
    },

    demo13: {
      title: 'Demo 13',
      description: 'Classic Dashboard',
      published: false,
      thumbnail: './assets/media/demos/demo13.png',
    },

    demo14: {
      title: 'Demo 14',
      description: 'Creative Dashboard',
      published: false,
      thumbnail: './assets/media/demos/demo14.png',
    },

    demo15: {
      title: 'Demo 15',
      description: 'Minimalistic Dashboard',
      published: false,
      thumbnail: './assets/media/demos/demo15.png',
    },

    demo16: {
      title: 'Demo 16',
      description: 'Modern Dashboard',
      published: false,
      thumbnail: './assets/media/demos/demo16.png',
    },

    demo17: {
      title: 'Demo 17',
      description: 'Backend System',
      published: false,
      thumbnail: './assets/media/demos/demo17.png',
    },

    demo18: {
      title: 'Demo 18',
      description: 'System Dashboard',
      published: false,
      thumbnail: './assets/media/demos/demo18.png',
    },

    demo19: {
      title: 'Demo 19',
      description: 'Light Dashboard',
      published: false,
      thumbnail: './assets/media/demos/demo19.png',
    },

    demo20: {
      title: 'Demo 20',
      description: 'Monochrome Dashboard',
      published: false,
      thumbnail: './assets/media/demos/demo20.png',
    },
  },
  firebase: {
    apiKey: "AIzaSyD7AloVSCSdcaZMIMFi7o3ZuJGu48oEYeM",
    authDomain: "quirkandthread-a151e.firebaseapp.com",
    projectId: "quirkandthread-a151e",
    storageBucket: "quirkandthread-a151e.appspot.com",
    messagingSenderId: "437738972765",
    appId: "1:437738972765:web:bddc95ac17587c33098fb4",
    measurementId: "G-GHPGH1HG1F",
  },
  captcha: {
    // localhost
    siteKey: "6LdQ68ApAAAAAAHFzJn0xAqO47qBEgT_AK0K8u1J",
    cloudFunctionUrl: "https://us-central1-quirkandthread-a151e.cloudfunctions.net/verifyRecaptcha"
  },
  formValidation: {
    product: "https://us-central1-quirkandthread-a151e.cloudfunctions.net/validateProductForm",
    editOrder: "https://us-central1-quirkandthread-a151e.cloudfunctions.net/validateEditOrderForm",
    registration: "https://us-central1-quirkandthread-a151e.cloudfunctions.net/validateRegistrationForm",
    login:"https://us-central1-quirkandthread-a151e.cloudfunctions.net/validateLoginForm"
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
