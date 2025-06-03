// Firebase Admin SDK has been temporarily removed to address build/runtime issues.
// Staff management will use a mock API until this is reinstated.
//
// To re-enable Firebase Admin:
// 1. Add "firebase-admin" back to package.json dependencies.
// 2. Restore the original content of this file.
// 3. Ensure FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY
//    environment variables are correctly configured in your deployment environment.

export const db = null;
export const firebaseAdminInitializationError = "Firebase Admin SDK is currently disabled.";
