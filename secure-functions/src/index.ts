import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
admin.initializeApp();

exports.secureFunction = functions.https.onCall((data: any, context: any) => {
  console.log("context.app:", context.app);
  // Check if the request contains a valid App Check token
  if (context.app == undefined) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "The function must be called from an App Check verified app client."
    );
  }

  // The request is verified, proceed with the function logic
  // Your function logic here
  return {message: "Verified App Check"};
});

exports.secureFunction1 = functions.runWith({
  enforceAppCheck: true,
}).https.onCall((data: any, context: any) => {
  console.log("context.app:", context.app);
  // Check if the request contains a valid App Check token
  if (context.app == undefined || context.app.already_consumed) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "The function must be called from an App Check verified app client."
    );
  }

  // The request is verified, proceed with the function logic
  // Your function logic here
  return {message: "Verified App Check"};
});

exports.secureFunction2 = functions.runWith({
  enforceAppCheck: true,
  consumeAppCheckToken: true,
}).https.onCall((data: any, context: any) => {
  console.log("context.app:", context.app);
  // Check if the request contains a valid App Check token
  if (context.app == undefined || context.app.already_consumed) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "The function must be called from an App Check verified app client."
    );
  }

  // The request is verified, proceed with the function logic
  // Your function logic here
  return {message: "Verified App Check"};
});
