
import { type NextRequest, NextResponse } from 'next/server';
import * as z from 'zod';
import { db } from '@/lib/firebase-admin';

const STAFF_COLLECTION = 'staff_members';

// Zod schema for updating staff (password is not updatable here)
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
  try {
    if (!db) {
      console.error("Firestore admin instance (db) is not available in /api/staff/[staffId] GET.");
      return NextResponse.json({ message: 'Firestore not initialized on server' }, { status: 500 });
    }
    const staffId = params.staffId;
    const docRef = db.collection(STAFF_COLLECTION).doc(staffId);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json({ message: 'Staff member not found' }, { status: 404 });
    }
    return NextResponse.json({ id: docSnap.id, ...docSnap.data() });
  } catch (error) {
    console.error(`Error fetching staff member ${params.staffId}:`, error);
    return NextResponse.json({ message: `Error fetching staff member ${params.staffId}` }, { status: 500 });
  }
}


export async function PUT(
  request: NextRequest,
  { params }: { params: { staffId: string } }
) {
  try {
    if (!db) {
      console.error("Firestore admin instance (db) is not available in /api/staff/[staffId] PUT.");
      return NextResponse.json({ message: 'Firestore not initialized on server' }, { status: 500 });
    }
    const staffId = params.staffId;
    const body = await request.json();
    const validatedData = updateStaffSchema.parse(body);

    // Ensure there's something to update
    if (Object.keys(validatedData).length === 0) {
        return NextResponse.json({ message: 'No update data provided' }, { status: 400 });
    }

    const docRef = db.collection(STAFF_COLLECTION).doc(staffId);
    await docRef.update(validatedData);
    
    // Fetch the updated document to return it
    const updatedDocSnap = await docRef.get();
    if (!updatedDocSnap.exists) {
        // This should ideally not happen if update was successful
        return NextResponse.json({ message: 'Staff member not found after update' }, { status: 404 });
    }

    return NextResponse.json({ id: updatedDocSnap.id, ...updatedDocSnap.data() });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Validation failed', errors: error.errors }, { status: 400 });
    }
    console.error(`Error updating staff member ${params.staffId}:`, error);
    return NextResponse.json({ message: `Error updating staff member ${params.staffId}` }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { staffId: string } }
) {
  try {
    if (!db) {
      console.error("Firestore admin instance (db) is not available in /api/staff/[staffId] DELETE.");
      return NextResponse.json({ message: 'Firestore not initialized on server' }, { status: 500 });
    }
    const staffId = params.staffId;
    await db.collection(STAFF_COLLECTION).doc(staffId).delete();
    return NextResponse.json({ message: `Staff member ${staffId} deleted successfully` });
  } catch (error) {
    console.error(`Error deleting staff member ${params.staffId}:`, error);
    return NextResponse.json({ message: `Error deleting staff member ${params.staffId}` }, { status: 500 });
  }
}
