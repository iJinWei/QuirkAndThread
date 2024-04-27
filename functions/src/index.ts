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

export const validateProductForm = functions.https.onCall(async (data, context) => {
  const formData = data;

  // Fetch categories from Firestore
  const categoriesSnapshot = await admin.firestore().collection("categories").get();
  const categories = categoriesSnapshot.docs.map((doc) => ({
    id: doc.id,
    name: doc.data().name,
  }));

  // Validate category
  if (!formData.category || !formData.categoryId) {
    throw new functions.https.HttpsError("invalid-argument",
      "Category is required");
  }

  // Validate category
  const matchingCategory = categories.find((category) =>
    category.id === formData.categoryId && category.name === formData.category);
  if (!matchingCategory) {
    throw new functions.https.HttpsError("invalid-argument",
      "Invalid Category");
  }

  // Validate description
  if (!formData.description || formData.description.length > 100) {
    throw new functions.https.HttpsError("invalid-argument",
      "Description is required and must be at most 100 characters long");
  }

  // Validate imageUrl
  if (!formData.imageUrl || !isValidImageUrl(formData.imageUrl)) {
    throw new functions.https.HttpsError("invalid-argument", "Invalid imageUrl");
  }

  // Validate name
  if (!formData.name || formData.name.length > 30) {
    throw new functions.https.HttpsError("invalid-argument",
      "Name is required and must be at most 30 characters long");
  }

  // Validate price
  if (!formData.price || !isValidPrice(formData.price)) {
    throw new functions.https.HttpsError("invalid-argument",
      "Invalid price. Price must be a number with up to 2 decimal points");
  }

  // Validate stockQuantity
  if (!formData.stockQuantity || isNaN(formData.stockQuantity) || formData.stockQuantity <= 0) {
    throw new functions.https.HttpsError("invalid-argument",
      "Stock quantity is required and must be a positive number");
  }

  // If all validations pass, return a success message
  return {message: "Validation successful"};
});

/**
 * Validate url
 * @param {string} url
 * @return {boolean}
 */
function isValidImageUrl(url: string): boolean {
  // Implement your imageUrl validation logic here
  // Example: check if the URL ends with ".jpg", ".jpeg", ".png", or ".gif"
  return /(\.jpg|\.jpeg|\.png|\.gif)$/i.test(url);
}

/**
 * Validate price
 * @param {string} price
 * @return {boolean}
 */
function isValidPrice(price: any): boolean {
  // Implement your price validation logic here
  // Example: check if price is a number with up to 2 decimal points
  return /^\d+(\.\d{1,2})?$/.test(price);
}

export const validateEditOrderForm = functions.https.onCall(async (data, context) => {
  const formData = data;

  // Fetch orderStatuses from Firestore
  const orderStatusesSnapshot = await admin.firestore().collection("orderStatus").get();
  const orderStatuses = orderStatusesSnapshot.docs.map((doc) => doc.data().name);

  // Validate orderStatus
  if (!formData.orderStatus || !orderStatuses.includes(formData.orderStatus)) {
    throw new functions.https.HttpsError("invalid-argument",
      "Order Status is required and must be valid");
  }

  // Fetch users with role "logistic" from Firestore
  const usersSnapshot = await admin.firestore().collection("users")
    .where("roles", "array-contains", "logistic")
    .where("name", "!=", "superuser")
    .get();
  const users = usersSnapshot.docs.map((doc) => doc.data().uid);

  // Validate deliveryPersonnel against available users
  if (!formData.deliveryPersonnel || !users.includes(formData.deliveryPersonnel)) {
    throw new functions.https.HttpsError("invalid-argument",
      "Invalid delivery personnel");
  }

  // Fetch deliveryStatuses from Firestore
  const deliveryStatusesSnapshot = await admin.firestore().collection("deliveryStatus").get();
  const deliveryStatuses = deliveryStatusesSnapshot.docs.map((doc) => doc.data().name);

  // Validate deliveryStatus
  if (!formData.deliveryStatus || !deliveryStatuses.includes(formData.deliveryStatus)) {
    throw new functions.https.HttpsError("invalid-argument",
      "Delivery Status is required and must be valid");
  }

  // If all validations pass, return a success message
  return {message: "Validation successful"};
});


exports.validateLoginForm = functions.https.onCall((data, context) => {
  const {email, password, recaptcha} = data;

  // Perform server-side validation
  if (!email || typeof email !== "string" || email.length < 3 || email.length > 320 ||
    !isValidEmail(email)) {
    throw new functions.https.HttpsError("invalid-argument", "Invalid email");
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

exports.validateRegistrationForm = functions.https.onCall(async (data, context) => {
  const {fullname, email, password, cPassword, agree, recaptcha} = data;

  // Perform server-side validation
  if (!fullname || typeof fullname !== "string" || fullname.length < 3 || fullname.length > 100) {
    throw new functions.https.HttpsError("invalid-argument", "Invalid fullname");
  }

  if (!email || typeof email !== "string" || email.length < 3 || email.length > 320 ||
    !isValidEmail(email)) {
    throw new functions.https.HttpsError("invalid-argument", "Invalid email");
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
