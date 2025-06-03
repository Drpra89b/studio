
'use server';

import { type NextRequest, NextResponse } from 'next/server';
import * as z from 'zod';
import { db, firebaseAdminInitializationError } from '@/lib/firebase-admin';

const STAFF_COLLECTION = 'staff_members';

const updateStaffSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }).optional(),
  username: z.string().min(3, { message: "Username must be at least 3 characters." }).regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores.").optional(),
  email: z.string().email({ message: "Please enter a valid email address." }).optional(),
  status: z.enum(["Active", "Disabled"]).optional(),
});


export async function GET(
  request: NextRequest,
  { params }: { params: { staffId: string } }
) {
  if (firebaseAdminInitializationError) {
    const detailedErrorMessage = `Firebase Admin SDK failed to initialize. This is a server configuration issue. Please check server logs for details. Initialization error: ${firebaseAdminInitializationError}`;
    console.error(`API Error (GET /api/staff/${params.staffId}): ${detailedErrorMessage}`);
    return NextResponse.json({ message: detailedErrorMessage, errorSource: "FirebaseAdminSDKInitialization" }, { status: 500 });
  }
  if (!db) {
    const detailedErrorMessage = `Server error: Firestore database instance (db) is not available. This usually indicates a Firebase Admin SDK initialization failure. Please check server logs. staffId: ${params.staffId}`;
    console.error(`API Error (GET /api/staff/${params.staffId}): ${detailedErrorMessage}`);
    return NextResponse.json({ message: detailedErrorMessage, errorSource: "FirestoreInstanceNull" }, { status: 500 });
  }

  try {
    const staffId = params.staffId;
    const docRef = db.collection(STAFF_COLLECTION).doc(staffId);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json({ message: 'Staff member not found' }, { status: 404 });
    }
    return NextResponse.json({ id: docSnap.id, ...docSnap.data() });
  } catch (error: any) {
    console.error(`API Error (GET /api/staff/${params.staffId}): Error fetching staff member:`, error);
    return NextResponse.json({ message: `Error fetching staff member ${params.staffId}. Details: ${error.message || 'Unknown server error.'}` }, { status: 500 });
  }
}


export async function PUT(
  request: NextRequest,
  { params }: { params: { staffId: string } }
) {
  if (firebaseAdminInitializationError) {
    const detailedErrorMessage = `Firebase Admin SDK failed to initialize. This is a server configuration issue. Please check server logs for details. Initialization error: ${firebaseAdminInitializationError}`;
    console.error(`API Error (PUT /api/staff/${params.staffId}): ${detailedErrorMessage}`);
    return NextResponse.json({ message: detailedErrorMessage, errorSource: "FirebaseAdminSDKInitialization" }, { status: 500 });
  }
  if (!db) {
    const detailedErrorMessage = `Server error: Firestore database instance (db) is not available. This usually indicates a Firebase Admin SDK initialization failure. Please check server logs. staffId: ${params.staffId}`;
    console.error(`API Error (PUT /api/staff/${params.staffId}): ${detailedErrorMessage}`);
    return NextResponse.json({ message: detailedErrorMessage, errorSource: "FirestoreInstanceNull" }, { status: 500 });
  }
  
  try {
    const staffId = params.staffId;
    const body = await request.json();
    const validatedData = updateStaffSchema.parse(body);

    if (Object.keys(validatedData).length === 0) {
        return NextResponse.json({ message: 'No update data provided' }, { status: 400 });
    }

    const docRef = db.collection(STAFF_COLLECTION).doc(staffId);
    await docRef.update(validatedData);
    
    const updatedDocSnap = await docRef.get();
    if (!updatedDocSnap.exists) {
        return NextResponse.json({ message: 'Staff member not found after update' }, { status: 404 });
    }

    return NextResponse.json({ id: updatedDocSnap.id, ...updatedDocSnap.data() });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Validation failed', errors: error.errors }, { status: 400 });
    }
    console.error(`API Error (PUT /api/staff/${params.staffId}): Error updating staff member:`, error);
    return NextResponse.json({ message: `Error updating staff member ${params.staffId}. Details: ${error.message || 'Unknown server error.'}` }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { staffId: string } }
) {
  if (firebaseAdminInitializationError) {
    const detailedErrorMessage = `Firebase Admin SDK failed to initialize. This is a server configuration issue. Please check server logs for details. Initialization error: ${firebaseAdminInitializationError}`;
    console.error(`API Error (DELETE /api/staff/${params.staffId}): ${detailedErrorMessage}`);
    return NextResponse.json({ message: detailedErrorMessage, errorSource: "FirebaseAdminSDKInitialization" }, { status: 500 });
  }
  if (!db) {
    const detailedErrorMessage = `Server error: Firestore database instance (db) is not available. This usually indicates a Firebase Admin SDK initialization failure. Please check server logs. staffId: ${params.staffId}`;
    console.error(`API Error (DELETE /api/staff/${params.staffId}): ${detailedErrorMessage}`);
    return NextResponse.json({ message: detailedErrorMessage, errorSource: "FirestoreInstanceNull" }, { status: 500 });
  }

  try {
    const staffId = params.staffId;
    await db.collection(STAFF_COLLECTION).doc(staffId).delete();
    return NextResponse.json({ message: `Staff member ${staffId} deleted successfully` });
  } catch (error: any) {
    console.error(`API Error (DELETE /api/staff/${params.staffId}): Error deleting staff member:`, error);
    return NextResponse.json({ message: `Error deleting staff member ${params.staffId}. Details: ${error.message || 'Unknown server error.'}` }, { status: 500 });
  }
}
