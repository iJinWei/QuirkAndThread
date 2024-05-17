import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
admin.initializeApp();

const checkUserRoles = async (uid: any) => {
  try {
    // Query the Firestore collection for the user's role
    const userSnapshot = await admin.firestore().collection("users").where("uid", "==", uid).get();

    if (userSnapshot.empty) {
      throw new functions.https.HttpsError("not-found", "Role not found for user");
    }

    // Extract the role from the document
    const data : string[] = userSnapshot.docs.map((doc) => doc.data().roles);
    const roles = data[0];
    // console.log("roles in checkUserRoles: ", roles);
    // Return the role to the client
    return {roles};
  } catch (error: any) {
    // Handle errors
    throw new functions.https.HttpsError("internal", error.message);
  }
};

const isEmpty = (val: any): boolean => {
  return val === undefined || val === null || val === "";
};


const validateProduct = async (data: any) => {
  const formData = data;

  // Fetch categories from Firestore
  const categoriesSnapshot = await admin.firestore().collection("categories").get();
  const categories = categoriesSnapshot.docs.map((doc) => ({
    id: doc.id,
    name: doc.data().name,
  }));

  // Validate category
  if (isEmpty(formData.category) || isEmpty(formData.categoryId) ||
      !formData.category || !formData.categoryId) {
    return false;
  }

  // Validate category
  const matchingCategory = categories.find((category) =>
    category.id === formData.categoryId && category.name === formData.category);
  if (!matchingCategory) {
    return false;
  }

  // Validate description
  if (isEmpty(formData.description) || !formData.description ||
    formData.description.length > 100) {
    return false;
  }

  // Validate imageUrl
  if (isEmpty(formData.imageUrl) ||!formData.imageUrl || !isValidImageUrl(formData.imageUrl)) {
    return false;
  }

  // Validate name
  if (isEmpty(formData.name) || !formData.name || formData.name.length > 30) {
    return false;
  }

  // Validate price
  if (isEmpty(formData.price) ||!formData.price || !isValidPrice(formData.price)) {
    return false;
  }

  // Validate stockQuantity
  if (isEmpty(formData.stockQuantity) ||!formData.stockQuantity ||
    isNaN(formData.stockQuantity) || formData.stockQuantity <= 0) {
    return false;
  }

  // If all validations pass, return a success message
  return true;
};

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

exports.createproduct = functions.runWith({
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
  console.log("verified app check token");
  // Check if the request is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Authentication required.");
  } else {
    if (context.auth.uid == undefined) {
      throw new functions.https.HttpsError("unauthenticated", "Authentication required.");
    } else {
      console.log("request authenticated");
      const uid = context.auth.uid;
      const {roles} = await checkUserRoles(uid);
      const isAdmin = roles.includes("admin");
      if (!isAdmin) {
        throw new functions.https.HttpsError(
          "permission-denied",
          "User is not authorized to create a product");
      } else {
        console.log("request from admin");
        const productData = data.data; // Assuming the request body contains the product data
        const validProduct: boolean = await validateProduct(productData);
        console.log("validProduct: ", validProduct);
        if (!validProduct) { // Validate the product data
          throw new functions.https.HttpsError(
            "invalid-argument",
            "Invalid product form."
          );
        }
        console.log("form validated");
        // Create the product in Firestore
        try {
          const productRef = await admin.firestore().collection("products").add(productData);
          console.log("product added");
          return {message: "Product created successfully", productId: productRef.id};
        } catch (error: any) {
          throw new functions.https.HttpsError(
            "internal",
            "Internal error."
          );
        }
      }
    }
  }
});

exports.editProduct = functions.runWith({
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

  // Check if the request is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Authentication required.");
  } else {
    if (context.auth.uid == undefined) {
      throw new functions.https.HttpsError("unauthenticated", "Authentication required.");
    } else {
      const uid = context.auth.uid;
      const {roles} = await checkUserRoles(uid);
      const isAdmin = roles.includes("admin");
      if (!isAdmin) {
        throw new functions.https.HttpsError(
          "permission-denied",
          "User is not authorized to edit a product");
      } else {
        try {
          const newData = data.data; // Assuming the request body contains the product data
          if (!validateProduct(newData)) { // Validate the product data
            throw new functions.https.HttpsError(
              "invalid-argument",
              "Invalid product form."
            );
          }

          const productId = data.productId;

          // Fetch the product document
          const productSnapshot = await admin.firestore().collection("products")
            .doc(productId).get();
          if (!productSnapshot.exists) {
            throw new functions.https.HttpsError("not-found", "Product not found");
          }

          // Extract current product data
          const currentData = productSnapshot.data();

          // Merge current data with new data
          const updatedData = {...currentData, ...newData};

          // Create the product in Firestore
          await admin.firestore().collection("products").doc(productId).update(updatedData);

          return {message: "Product edited successfully", productId: productId};
        } catch (error: any) {
          throw new functions.https.HttpsError(
            "internal",
            "Internal error."
          );
        }
      }
    }
  }
});

exports.deleteproduct = functions.runWith({
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
  // Check if the request is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Authentication required.");
  } else {
    if (context.auth.uid == undefined) {
      throw new functions.https.HttpsError("unauthenticated", "Authentication required.");
    } else {
      const uid = context.auth.uid;
      const {roles} = await checkUserRoles(uid);
      const isAdmin = roles.includes("admin");
      if (!isAdmin) {
        throw new functions.https.HttpsError(
          "permission-denied",
          "User is not authorized to delete a product");
      } else {
        try {
          const productId = data.data; // Data sent from the client (product ID to be deleted)

          // Fetch the product document
          const productRef = admin.firestore().collection("products").doc(productId);
          const productSnapshot = await productRef.get();

          // Check if the product exists
          if (!productSnapshot.exists) {
            throw new functions.https.HttpsError("not-found", "product not found");
          }

          // Delete the product from Firestore
          await productRef.delete();

          // Return success message
          return {message: "product deleted successfully"};
        } catch (error: any) {
          throw new functions.https.HttpsError(
            "internal",
            "Internal error."
          );
        }
      }
    }
  }
});

exports.viewProductsForCustomer = functions.runWith({
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
  // Check if the request is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Authentication required.");
  } else {
    if (context.auth.uid == undefined) {
      throw new functions.https.HttpsError("unauthenticated", "Authentication required.");
    } else {
      const uid = context.auth.uid;
      const {roles} = await checkUserRoles(uid);
      const isCustomer = roles.includes("customer");
      if (!isCustomer) {
        throw new functions.https.HttpsError(
          "permission-denied",
          "User is not authorized to view all products");
      } else {
        try {
          const productSnapshot = await admin.firestore().collection("products").get();

          // Extract order data
          const products: { id: string; data: admin.firestore.DocumentData; }[] = [];
          productSnapshot.forEach((doc) => {
            const {name, price, category, description, imageUrl} = doc.data();
            products.push({
              id: doc.id,
              data: {name, price, category, description, imageUrl},
            });
          });

          // Return success message
          return products;
        } catch (error: any) {
          throw new functions.https.HttpsError(
            "internal",
            "Internal error."
          );
        }
      }
    }
  }
});

