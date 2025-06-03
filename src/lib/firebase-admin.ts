
'use server'; // This must be the very first line
import * as admin from 'firebase-admin';

interface ServiceAccount {
  projectId?: string;
  clientEmail?: string;
  privateKey?: string;
}

let db: admin.firestore.Firestore | null = null;
let firebaseAdminInitializationError: string | null = null;

console.log("Attempting to initialize Firebase Admin SDK...");

try {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKeyEnv = process.env.FIREBASE_PRIVATE_KEY;

  console.log(`FIREBASE_PROJECT_ID present: ${!!projectId}`);
  console.log(`FIREBASE_CLIENT_EMAIL present: ${!!clientEmail}`);
  console.log(`FIREBASE_PRIVATE_KEY present: ${!!privateKeyEnv}`);


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
      // console.log('Firebase Admin SDK already initialized. Using existing instance.'); // Optional: less verbose
    }
  }
} catch (error: any) {
  firebaseAdminInitializationError = `Firebase Admin SDK catastrophic initialization error: ${error.message || String(error)}`;
  console.error(firebaseAdminInitializationError, error);
  // db remains null
}

export { db, firebaseAdminInitializationError };
