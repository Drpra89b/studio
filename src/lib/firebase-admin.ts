
import admin from 'firebase-admin';
import type { App } from 'firebase-admin/app';
import type { Firestore } from 'firebase-admin/firestore';

// Ensure environment variables are only accessed on the server-side
let db: Firestore | null = null;
let firebaseAdminInstance: App | null = null;

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
// For FIREBASE_PRIVATE_KEY, ensure it's correctly formatted.
// If it's a single line in .env, newlines should be `\\n`.
// If your environment supports multi-line variables, it might be fine as is.
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

if (projectId && clientEmail && privateKey) {
  if (!admin.apps.length) {
    try {
      firebaseAdminInstance = admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
      db = admin.firestore();
      console.log('Firebase Admin SDK initialized successfully.');
    } catch (error) {
      console.error('Firebase Admin SDK initialization error:', error);
      // Set db to null if initialization fails to prevent further issues
      db = null;
    }
  } else {
    firebaseAdminInstance = admin.apps[0];
    if (firebaseAdminInstance) {
      db = admin.firestore(firebaseAdminInstance);
    } else {
      // This case should ideally not happen if admin.apps.length > 0
      // but good to handle to prevent db from being undefined.
      console.error('Firebase Admin SDK: admin.apps[0] is null, though apps array is not empty.');
      db = null;
    }
  }
} else {
  console.warn(
    'Firebase Admin SDK not initialized because FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, or FIREBASE_PRIVATE_KEY environment variables are missing.'
  );
  db = null; // Ensure db is null if not initialized
}

// Optional: Add a health check or a way to know if db is available
const isFirebaseAdminInitialized = () => admin.apps.length > 0 && db !== null;

export { db, isFirebaseAdminInitialized, admin as firebaseAdminInstance };
