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

exports.verifyRecaptcha = functions.runWith({
  enforceAppCheck: true,
  consumeAppCheckToken: true,
}).https.onCall(async (data: any, context: any) => {
  // Check if the request contains a valid App Check token
  if (context.app == undefined) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "Function must be called from verified client."
    );
  }
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

export const verifyRecaptchaOnProd = functions.runWith({
  enforceAppCheck: true,
  consumeAppCheckToken: true,
}).https.onCall(async (data: any, context: any) => {
  // Check if the request contains a valid App Check token
  if (context.app == undefined) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "Function must be called from verified client."
    );
  }
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


exports.validateLoginForm = functions.runWith({
  enforceAppCheck: true,
  consumeAppCheckToken: true,
}).https.onCall(async (data: any, context: any) => {
  // Check if the request contains a valid App Check token
  if (context.app == undefined) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "Function must be called from verified client."
    );
  }
  const {email, password, recaptcha} = data;

  // Perform server-side validation
  if (!email || typeof email !== "string" || email.length < 3 || email.length > 320 ||
    !isValidEmail(email)) {
    throw new functions.https.HttpsError("invalid-argument", "Invalid email");
  }

  try {
    const snapshot = await admin.firestore().collection("users").where("email", "==", email).get();
    if (snapshot.empty) {
      throw new functions.https.HttpsError("not-found", "Email does not exist.");
    }
  } catch (error) {
    console.error("Error checking email:", error);
    throw new functions.https.HttpsError("internal", "Error checking email");
  }

  if (!password || typeof password !== "string" || password.length < 3 || password.length > 100) {
    throw new functions.https.HttpsError("invalid-argument", "Invalid password");
  }

  if (!recaptcha) {
    throw new functions.https.HttpsError("invalid-argument", "Invalid recaptcha");
  }

  // If all validations pass, return a success message
  return {message: "Validation successful"};
});

exports.validateRegistrationForm = functions.runWith({
  enforceAppCheck: true,
  consumeAppCheckToken: true,
}).https.onCall(async (data: any, context: any) => {
  // Check if the request contains a valid App Check token
  if (context.app == undefined) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "Function must be called from verified client."
    );
  }
  const {fullname, email, password, cPassword, agree, recaptcha} = data;

  // Perform server-side validation
  if (!fullname || typeof fullname !== "string" || fullname.length < 3 || fullname.length > 100) {
    throw new functions.https.HttpsError("invalid-argument", "Invalid fullname");
  }

  if (!email || typeof email !== "string" || email.length < 3 || email.length > 320 ||
    !isValidEmail(email)) {
    throw new functions.https.HttpsError("invalid-argument", "Invalid email");
  }

  try {
    const snapshot = await admin.firestore().collection("users").where("email", "==", email).get();
    if (!snapshot.empty) {
      throw new functions.https.HttpsError("invalid-argument", "Email already exist.");
    }
  } catch (error) {
    console.error("Error checking email:", error);
    throw new functions.https.HttpsError("internal", "Error checking email");
  }

  if (!password || typeof password !== "string" || password.length < 8 ||
    !strongPasswordValidator(password)) {
    throw new functions.https.HttpsError("invalid-argument", "Weak password");
  }

  if (password !== cPassword) {
    throw new functions.https.HttpsError("invalid-argument", "Passwords do not match");
  }

  if (!agree) {
    throw new functions.https.HttpsError("invalid-argument", "Required");
  }

  if (!recaptcha) {
    throw new functions.https.HttpsError("invalid-argument", "Invalid recaptcha");
  }

  // If validation passes, return success
  return {message: "Validation successful"};
});

/**
 * Validate email
 * @param {string} email
 * @return {boolean}
 */
function isValidEmail(email: string) : boolean {
  // Regular expression for basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}


/**
 * Validate password
 * @param {string} password
 * @return {boolean}
 */
function strongPasswordValidator(password: string) : boolean {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@!#$%])[A-Za-z\d@!#$%]{8,}$/;
  return regex.test(password);
}


exports.checkUserRole = functions.runWith({
  enforceAppCheck: true,
  consumeAppCheckToken: true,
}).https.onCall(async (data: any, context: any) => {
  // Check if the request contains a valid App Check token
  if (context.app == undefined) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "Function must be called from verified client."
    );
  }
  const uid = data.id;

  try {
    // Get the user document from Firestore
    const userDoc = await admin.firestore().collection("users").doc(uid).get();

    // Check if the user document exists
    if (!userDoc.exists) {
      throw new functions.https.HttpsError("not-found", "User document not found.");
    }

    // Get the user data
    const userData = userDoc.data();

    // Check if the user has admin or logistic role
    if (!userData) {
      throw new functions.https.HttpsError("not-found", "User details not found.");
    } else {
      if (!userData.roles || (!userData.roles.includes("admin") &&
        !userData.roles.includes("logistic"))) {
        throw new functions.https.HttpsError("permission-denied",
          "Access denied for this user.");
      }
    }


    // User has admin or logistic role
    return {message: "User has admin or logistic role."};
  } catch (error) {
    console.error("Error checking user role:", error);
    throw new functions.https.HttpsError("internal", "Error checking user role.");
  }
});
