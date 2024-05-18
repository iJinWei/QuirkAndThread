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

const validateOrder = (orderData: any) => {
  // Implement your validation logic here
  // For example, check if required fields are present
  return (!orderData.name || !orderData.totalAmount || !orderData.product || !orderData.items);
};

exports.createOrder = functions.runWith({
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
          "User is not authorized to create a order");
      } else {
        const orderData = data; // Assuming the request body contains the order data
        if (!validateOrder(orderData)) { // Validate the order data
          throw new functions.https.HttpsError(
            "invalid-argument",
            "Invalid order form."
          );
        }

        try {
          // Create the order in Firestore
          const orderRef = await admin.firestore().collection("orders").add(orderData);

          return {message: "Order created successfully", orderId: orderRef.id};
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

const validateEditOrderForm = async (data: any) => {
  const formData = data;

  // Fetch orderStatuses from Firestore
  const orderStatusesSnapshot = await admin.firestore().collection("orderStatus").get();
  const orderStatuses = orderStatusesSnapshot.docs.map((doc) => doc.data().name);

  // Validate orderStatus
  if (!formData.orderStatus || !orderStatuses.includes(formData.orderStatus)) {
    return false;
  }

  // Fetch users with role "logistic" from Firestore
  const usersSnapshot = await admin.firestore().collection("users")
    .where("roles", "array-contains", "logistic")
    .where("name", "!=", "superuser")
    .get();
  const users = usersSnapshot.docs.map((doc) => doc.data().uid);

  // Validate deliveryPersonnel against available users
  if (!formData.deliveryPersonnel || !users.includes(formData.deliveryPersonnel)) {
    return false;
  }

  // Fetch deliveryStatuses from Firestore
  const deliveryStatusesSnapshot = await admin.firestore().collection("deliveryStatus").get();
  const deliveryStatuses = deliveryStatusesSnapshot.docs.map((doc) => doc.data().name);

  // Validate deliveryStatus
  if (!formData.deliveryStatus || !deliveryStatuses.includes(formData.deliveryStatus)) {
    return false;
  }

  // If all validations pass, return a success message
  return true;
};

exports.editOrder = functions.runWith({
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
      let isAssignedLogistic = false;
      // Fetch the order document
      const {orderId, newData} = data; // Data sent from the client
      const orderSnapshot = await admin.firestore().collection("orders").doc(orderId).get();
      if (!orderSnapshot.exists) {
        throw new functions.https.HttpsError("not-found", "Order not found");
      } else {
        isAssignedLogistic = roles.includes("logistic") &&
        (orderSnapshot?.data()?.deliveryPersonnelId === uid);
      }
      console.log("isAdmin: ", isAdmin);
      console.log("isAssignedLogistic: ", isAssignedLogistic);
      if (!isAdmin && !isAssignedLogistic) {
        console.log("not authorised to perform this function");
        throw new functions.https.HttpsError(
          "permission-denied",
          "User is not authorized to edit a order");
      } else {
        try {
          if (!validateEditOrderForm(newData)) { // Validate the order data
            throw new functions.https.HttpsError(
              "invalid-argument",
              "Invalid order form."
            );
          }

          // Extract current order data
          const currentData = orderSnapshot.data();

          // Merge current data with new data
          const updatedData = {...currentData, ...newData};

          // Create the order in Firestore
          await admin.firestore().collection("orders").doc(orderId).update(updatedData);

          return {message: "Order edited successfully", orderId: orderId};
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

exports.deleteOrder = functions.runWith({
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

      // Fetch the order document
      const orderId = data.data;

      if (!isAdmin) {
        throw new functions.https.HttpsError(
          "permission-denied",
          "User is not authorized to delete a order");
      } else {
        try {
          // Data sent from the client (order ID to be deleted)

          // Fetch the order document
          const orderRef = admin.firestore().collection("orders").doc(orderId);
          const orderSnapshot = await orderRef.get();

          // Check if the order exists
          if (!orderSnapshot.exists) {
            throw new functions.https.HttpsError("not-found", "Order not found");
          }

          // Delete the order from Firestore
          await orderRef.delete();

          // Return success message
          return {message: "Order deleted successfully"};
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

exports.viewOrders = functions.runWith({
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
          "User is not authorized to view all orders");
      } else {
        try {
          // Data sent from the client (order ID to be deleted)

          const ordersSnapshot = await admin.firestore().collection("orders").get();

          // Extract order data
          const orders: admin.firestore.DocumentData[] = [];
          ordersSnapshot.forEach((doc) => {
            orders.push(doc.data());
          });

          // Return success message
          return orders;
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

exports.viewAssignedOrders = functions.runWith({
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
      const isLogistic = roles.includes("logistic");

      if (!isAdmin && !isLogistic) {
        throw new functions.https.HttpsError(
          "permission-denied",
          "User is not authorized to view orders");
      } else {
        try {
          // Data sent from the client (order ID to be deleted)

          // Fetch the order document
          // Query Firestore for orders with the given userId
          const ordersSnapshot = await admin.firestore().collection("orders")
            .where("deliveryPersonnelId", "==", uid).get();

          // Extract order data
          const orders: { id: string; data: admin.firestore.DocumentData; }[] = [];
          ordersSnapshot.forEach((doc) => {
            orders.push({
              id: doc.id,
              data: doc.data(),
            });
          });

          // Return success message
          return orders;
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


exports.viewOrderForCustomer = functions.runWith({
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

      const orderId = data;
      let belongsToCustomer = false;
      const orderSnapshot = await admin.firestore().collection("orders").doc(orderId).get();
      if (!orderSnapshot.exists) {
        throw new functions.https.HttpsError("not-found", "Order not found");
      } else {
        belongsToCustomer = isCustomer &&
        (orderSnapshot?.data()?.userId === uid);
      }

      if (!belongsToCustomer) {
        throw new functions.https.HttpsError(
          "permission-denied",
          "User is not authorized to view this order");
      } else {
        try {
          // Return success message
          return orderSnapshot.data();
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


exports.viewOrderForStaff = functions.runWith({
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
      let isAssignedLogistic = false;
      const orderId = data; // Data sent from the client

      const orderSnapshot = await admin.firestore().collection("orders").doc(orderId).get();
      if (!orderSnapshot.exists) {
        throw new functions.https.HttpsError("not-found", "Order not found");
      } else {
        isAssignedLogistic = roles.includes("logistic") &&
        (orderSnapshot?.data()?.deliveryPersonnelId === uid);
      }
      console.log("isAdmin: ", isAdmin);
      console.log("isAssignedLogistic: ", isAssignedLogistic);
      if (!isAdmin && !isAssignedLogistic) {
        console.log("not authorised to perform this function");
        throw new functions.https.HttpsError(
          "permission-denied",
          "User is not authorized to view this order");
      } else {
        try {
          // Return success message
          return orderSnapshot.data();
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
