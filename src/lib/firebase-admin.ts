'use server'; // This must be the very first line
import * as admin from 'firebase-admin';

interface ServiceAccount {
  projectId?: string;
  clientEmail?: string;
  privateKey?: string;
}

let db: admin.firestore.Firestore | null = null;
let firebaseAdminInitializationError: string | null = null;

try {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKeyEnv = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKeyEnv) {
    const missingVars: string[] = [];
    if (!projectId) missingVars.push("FIREBASE_PROJECT_ID");
    if (!clientEmail) missingVars.push("FIREBASE_CLIENT_EMAIL");
    if (!privateKeyEnv) missingVars.push("FIREBASE_PRIVATE_KEY");
    firebaseAdminInitializationError = `Firebase Admin SDK not initialized. Missing env vars: ${missingVars.join(', ')}`;
    console.warn(firebaseAdminInitializationError);
  } else {
    // Ensure privateKeyEnv is treated as a string before calling .replace
    const privateKey = String(privateKeyEnv).replace(/\\n/g, '\n');
    
    const serviceAccount: admin.ServiceAccount = {
      projectId: projectId,
      clientEmail: clientEmail,
      privateKey: privateKey,
    };

    if (admin.apps.length === 0) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      db = admin.firestore();
      console.log('Firebase Admin SDK initialized successfully.');
    } else {
      db = admin.app().firestore();
      // console.log('Firebase Admin SDK already initialized. Using existing instance.');
    }
  }
} catch (error: any) {
  // This catch block will now handle errors from .replace() if privateKeyEnv was problematic,
  // or errors from admin.credential.cert() or admin.initializeApp().
  firebaseAdminInitializationError = `Firebase Admin SDK catastrophic initialization error: ${error.message || String(error)}`;
  console.error(firebaseAdminInitializationError, error);
  // db remains null
}

// Remove firebaseAdminInstance and isFirebaseAdminInitialized from exports as they are not directly used by the API needing db.
export { db, firebaseAdminInitializationError };
