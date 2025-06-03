
'use server'; // This must be the very first line
import * as admin from 'firebase-admin';

// Define the expected structure of service account credentials
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

  if (privateKeyEnv === "YOUR_ACTUAL_PRIVATE_KEY_HERE") {
    const criticalErrorMsg = "CRITICAL ERROR: FIREBASE_PRIVATE_KEY is still set to the placeholder value 'YOUR_ACTUAL_PRIVATE_KEY_HERE'. Please replace it with your actual private key in the environment configuration.";
    console.error(criticalErrorMsg);
    firebaseAdminInitializationError = criticalErrorMsg;
    // Intentionally throw to stop further execution if placeholder is found
    throw new Error(criticalErrorMsg); 
  }

  if (!projectId || !clientEmail || !privateKeyEnv) {
    const missingVars: string[] = [];
    if (!projectId) missingVars.push("FIREBASE_PROJECT_ID");
    if (!clientEmail) missingVars.push("FIREBASE_CLIENT_EMAIL");
    if (!privateKeyEnv) missingVars.push("FIREBASE_PRIVATE_KEY"); // Should be caught by placeholder check if that's the issue
    firebaseAdminInitializationError = `Firebase Admin SDK not initialized. Missing env vars: ${missingVars.join(', ')}`;
    console.warn(firebaseAdminInitializationError);
  } else {
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
  // If the error is from the placeholder check, it's already logged.
  // Otherwise, log the new catastrophic error.
  if (error.message !== "CRITICAL ERROR: FIREBASE_PRIVATE_KEY is still set to the placeholder value 'YOUR_ACTUAL_PRIVATE_KEY_HERE'. Please replace it with your actual private key in the environment configuration.") {
    firebaseAdminInitializationError = `Firebase Admin SDK catastrophic initialization error: ${error.message || String(error)}`;
    console.error(firebaseAdminInitializationError, error);
  } else if (!firebaseAdminInitializationError) { 
    // Ensure firebaseAdminInitializationError is set if the catch is for the placeholder
    firebaseAdminInitializationError = error.message;
  }
  // db remains null
}

export { db, firebaseAdminInitializationError };
