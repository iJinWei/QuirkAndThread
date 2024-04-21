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

import {SecretManagerServiceClient} from "@google-cloud/secret-manager";
// const projectId = "quirkandthread-a151e";
const projectId = "437738972765";
admin.initializeApp();

/**
 * Get secret value
 * @param {string} keyName - name of key
 */
async function getSecret(keyName: string) {
  // Create a Secret Manager client
  const client = new SecretManagerServiceClient();
  const name = `projects/${projectId}/secrets/${keyName}/versions/latest`;

  try {
    // Fetch the secret
    const [version] = await client.accessSecretVersion({name});

    // Get the payload data
    const payload = version.payload?.data?.toString();

    return payload;
  } catch (error) {
    console.error("Error accessing secret:", error);
    throw error;
  }
}

exports.verifyRecaptcha = functions.https.onCall(async (data, context) => {
  // const key = functions.config().recaptcha.local_secret_key;
  // Retrieve the secret key from Google Cloud Secret Manager
  const key = await getSecret("RECAPTCHA_LOCAL_KEY");
  const token = data.token;
  return new Promise((resolve, reject) => {
    request.post("https://www.google.com/recaptcha/api/siteverify", {
      form: {
        secret: key,
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

export const verifyRecaptchaOnProd = functions.https.onCall(async (data, context) => {
  // const key = functions.config().recaptcha.prod_secret_key;
  // Retrieve the secret key from Google Cloud Secret Manager
  const key = await getSecret("RECAPTCHA_PROD_KEY");
  const token = data.token;

  return new Promise((resolve, reject) => {
    request.post("https://www.google.com/recaptcha/api/siteverify", {
      form: {
        secret: key,
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
