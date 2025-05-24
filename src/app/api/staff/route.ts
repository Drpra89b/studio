
import { type NextRequest, NextResponse } from 'next/server';
import * as z from 'zod';
import { db } from '@/lib/firebase-admin'; // Assuming firebase-admin is initialized

// Firestore collection reference
const STAFF_COLLECTION = 'staff_members';

// Zod schema for creating staff (matches frontend, password handled but not stored)
const createStaffSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  username: z.string().min(3, { message: "Username must be at least 3 characters." }).regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores."),
  email: z.string().email({ message: "Please enter a valid email address." }),
  // Password is received but not stored in Firestore for this iteration
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  status: z.enum(["Active", "Disabled"]).default("Active"),
});

// Zod schema for staff data stored in Firestore (excluding password)
export const staffSchemaFirestore = z.object({
  id: z.string().optional(), // ID will be Firestore document ID
  name: z.string(),
  username: z.string(),
  email: z.string().email(),
  status: z.enum(["Active", "Disabled"]),
});
export type StaffMemberFirestore = z.infer<typeof staffSchemaFirestore>;


export async function GET(request: NextRequest) {
  try {
    if (!db) {
      console.error("Firestore admin instance (db) is not available in /api/staff GET.");
      return NextResponse.json({ message: 'Firestore not initialized on server' }, { status: 500 });
    }
    const staffSnapshot = await db.collection(STAFF_COLLECTION).get();
    const staffList: StaffMemberFirestore[] = [];
    staffSnapshot.forEach(doc => {
      staffList.push({ id: doc.id, ...doc.data() } as StaffMemberFirestore);
    });
    return NextResponse.json(staffList);
  } catch (error) {
    console.error('Error fetching staff list:', error);
    return NextResponse.json({ message: 'Error fetching staff list' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!db) {
      console.error("Firestore admin instance (db) is not available in /api/staff POST.");
      return NextResponse.json({ message: 'Firestore not initialized on server' }, { status: 500 });
    }
    const body = await request.json();
    const validatedData = createStaffSchema.parse(body);

    // Exclude password from the data to be stored in Firestore
    const { password, ...staffDataToStore } = validatedData;

    const docRef = await db.collection(STAFF_COLLECTION).add(staffDataToStore);
    return NextResponse.json({ id: docRef.id, ...staffDataToStore }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Validation failed', errors: error.errors }, { status: 400 });
    }
    console.error('Error creating staff member:', error);
    return NextResponse.json({ message: 'Error creating staff member' }, { status: 500 });
  }
}
