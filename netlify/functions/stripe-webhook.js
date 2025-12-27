import admin from "firebase-admin";

export async function handler(event) {
  try {
    console.log("=== STRIPE WEBHOOK INIT TEST START ===");

    // ENVIRONMENT SANITY CHECK
    console.log("ENV CHECK", {
      hasProjectId: !!process.env.FIREBASE_PROJECT_ID,
      hasClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
      hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
      privateKeyLength: process.env.FIREBASE_PRIVATE_KEY?.length,
    });

    if (
      !process.env.FIREBASE_PROJECT_ID ||
      !process.env.FIREBASE_CLIENT_EMAIL ||
      !process.env.FIREBASE_PRIVATE_KEY
    ) {
      throw new Error("Missing required Firebase environment variables");
    }

    // FIREBASE ADMIN INITIALIZATION (NETLIFY SAFE)
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
        }),
      });
    }

    console.log("Firebase Admin initialized successfully");

    // INTENTIONAL STOP — NO STRIPE / FIRESTORE LOGIC YET
    return {
      statusCode: 200,
      body: JSON.stringify({
        status: "ok",
        message: "Firebase Admin init successful. Execution stopped intentionally.",
      }),
    };
  } catch (error) {
    console.error("Firebase Admin initialization failed", error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        status: "error",
        message: error.message,
      }),
    };
  }
}
