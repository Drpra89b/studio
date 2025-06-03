
'use server';

import { type NextRequest, NextResponse } from 'next/server';
import * as z from 'zod';
import { db, firebaseAdminInitializationError } from '@/lib/firebase-admin';

const STAFF_COLLECTION = 'staff_members';

const createStaffSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  username: z.string().min(3, { message: "Username must be at least 3 characters." }).regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores."),
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  status: z.enum(["Active", "Disabled"]).default("Active"),
});

export const staffSchemaFirestore = z.object({
  id: z.string().optional(),
  name: z.string(),
  username: z.string(),
  email: z.string().email(),
  status: z.enum(["Active", "Disabled"]),
});
export type StaffMemberFirestore = z.infer<typeof staffSchemaFirestore>;


export async function GET(request: NextRequest) {
  if (firebaseAdminInitializationError) {
    const detailedErrorMessage = `Firebase Admin SDK failed to initialize. This is a server configuration issue. Please check server logs for details. Initialization error: ${firebaseAdminInitializationError}`;
    console.error(`API Error (GET /api/staff): ${detailedErrorMessage}`);
    return NextResponse.json({ message: detailedErrorMessage, errorSource: "FirebaseAdminSDKInitialization" }, { status: 500 });
  }
  if (!db) {
    const detailedErrorMessage = 'Server error: Firestore database instance (db) is not available. This usually indicates a Firebase Admin SDK initialization failure. Please check server logs.';
    console.error(`API Error (GET /api/staff): ${detailedErrorMessage}`);
    return NextResponse.json({ message: detailedErrorMessage, errorSource: "FirestoreInstanceNull" }, { status: 500 });
  }

  try {
    const staffSnapshot = await db.collection(STAFF_COLLECTION).get();
    const staffList: StaffMemberFirestore[] = [];
    staffSnapshot.forEach(doc => {
      staffList.push({ id: doc.id, ...doc.data() } as StaffMemberFirestore);
    });
    return NextResponse.json(staffList);
  } catch (error: any) {
    console.error('API Error (GET /api/staff): Error fetching staff list from Firestore:', error);
    return NextResponse.json({ message: `Failed to fetch staff list. Details: ${error.message || 'An unknown error occurred on the server.'}` }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (firebaseAdminInitializationError) {
    const detailedErrorMessage = `Firebase Admin SDK failed to initialize. This is a server configuration issue. Please check server logs for details. Initialization error: ${firebaseAdminInitializationError}`;
    console.error(`API Error (POST /api/staff): ${detailedErrorMessage}`);
    return NextResponse.json({ message: detailedErrorMessage, errorSource: "FirebaseAdminSDKInitialization" }, { status: 500 });
  }
  if (!db) {
    const detailedErrorMessage = 'Server error: Firestore database instance (db) is not available. This usually indicates a Firebase Admin SDK initialization failure. Please check server logs.';
    console.error(`API Error (POST /api/staff): ${detailedErrorMessage}`);
    return NextResponse.json({ message: detailedErrorMessage, errorSource: "FirestoreInstanceNull" }, { status: 500 });
  }

  try {
    const body = await request.json();
    const validatedData = createStaffSchema.parse(body);

    const { password, ...staffDataToStore } = validatedData;

    const docRef = await db.collection(STAFF_COLLECTION).add(staffDataToStore);
    return NextResponse.json({ id: docRef.id, ...staffDataToStore }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Validation failed', errors: error.errors }, { status: 400 });
    }
    console.error('API Error (POST /api/staff): Error creating staff member:', error);
    return NextResponse.json({ message: `Error creating staff member. Details: ${error.message || 'Unknown server error.'}` }, { status: 500 });
  }
}
