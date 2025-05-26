
import * as admin from 'firebase-admin';

// Define the expected structure of service account credentials
interface ServiceAccount {
  projectId?: string;
  clientEmail?: string;
  privateKey?: string;
}

// Attempt to load credentials from environment variables
const serviceAccount: ServiceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  // For private key, replace \\n with \n if stored as a single line in env var
  privateKey: process.env.FIREBASE_PRIVATE_KEY
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    : undefined,
};

let db: admin.firestore.Firestore | null = null;

// Check if all necessary environment variables are set
if (
  serviceAccount.projectId &&
  serviceAccount.clientEmail &&
  serviceAccount.privateKey
) {
  if (admin.apps.length === 0) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      });
      db = admin.firestore();
      console.log('Firebase Admin SDK initialized successfully.');
    } catch (error) {
      console.error('Firebase Admin SDK initialization error:', error);
      // db will remain null, and API routes should handle this (e.g., return an error)
    }
  } else {
    // If already initialized, get the default app's firestore instance
    db = admin.app().firestore();
    // console.log('Firebase Admin SDK already initialized. Using existing instance.'); // Optional: less verbose
  }
} else {
  console.warn(
    'Firebase Admin SDK not initialized because one or more environment variables (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY) are missing.'
  );
  // db remains null
}

// Optional: A helper function to check if the Admin SDK (and thus db) is initialized
const isFirebaseAdminInitialized = () => admin.apps.length > 0 && db !== null;

export { db, isFirebaseAdminInitialized, admin as firebaseAdminInstance };
