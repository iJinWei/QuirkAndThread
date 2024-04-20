/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// import {onRequest} from "firebase-functions/v2/https";
// import * as logger from "firebase-functions/logger";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as request from "request";

admin.initializeApp();


// To get firebase function configurations:
// In terminal, cd to functions and run: firebase functions:config:get

export const verifyRecaptcha = functions.https.onCall((data, context) => {
  const localKey = functions.config().recaptcha.local_secret_key;
  const token = data.token;

  return new Promise((resolve, reject) => {
    request.post("https://www.google.com/recaptcha/api/siteverify", {
      form: {
        secret: localKey,
        response: token,
      },
    }, (error, response, body) => {
      if (error) {
        reject(error);
      } else {
        const result = JSON.parse(body);
        resolve(result.success);
      }
    });
  });
});

export const verifyRecaptchaOnProd = functions.https.onCall((data, context) => {
  const localKey = functions.config().recaptcha.prod_secret_key;
  const token = data.token;

  return new Promise((resolve, reject) => {
    request.post("https://www.google.com/recaptcha/api/siteverify", {
      form: {
        secret: localKey,
        response: token,
      },
    }, (error, response, body) => {
      if (error) {
        reject(error);
      } else {
        const result = JSON.parse(body);
        resolve(result.success);
      }
    });
  });
});
