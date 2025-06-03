
'use server';

import { type NextRequest, NextResponse } from 'next/server';
import * as z from 'zod';

// Mocked StaffMember type (matches Firestore schema for client compatibility)
export const staffSchemaFirestore = z.object({
  id: z.string().optional(),
  name: z.string(),
  username: z.string(),
  email: z.string().email(),
  status: z.enum(["Active", "Disabled"]),
});
export type StaffMemberFirestore = z.infer<typeof staffSchemaFirestore>;

// In-memory store for staff members (mock database)
let mockStaffMembers: StaffMemberFirestore[] = [
  { id: 'mock-staff-1', name: 'Alice Wonderland', username: 'alice', email: 'alice@example.com', status: 'Active' },
  { id: 'mock-staff-2', name: 'Bob The Builder', username: 'bob', email: 'bob@example.com', status: 'Active' },
  { id: 'mock-staff-3', name: 'Carol Danvers', username: 'carol', email: 'carol@example.com', status: 'Disabled' }
];

const createStaffSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  username: z.string().min(3, { message: "Username must be at least 3 characters." }).regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores."),
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }), // Password not used in mock
  status: z.enum(["Active", "Disabled"]).default("Active"),
});

export async function GET(request: NextRequest) {
  try {
    // Ensure mockStaffMembers is actually an array before sending
    if (!Array.isArray(mockStaffMembers)) {
        // This case should ideally not happen if the variable is initialized correctly.
        console.error('Mock API Critical Error (GET /api/staff): mockStaffMembers is not an array. Resetting to empty.');
        mockStaffMembers = []; 
        return NextResponse.json({ message: 'Mock API: Internal data error. Staff list corrupted.' }, { status: 500 });
    }
    return NextResponse.json(mockStaffMembers);
  } catch (error: any) {
    console.error('Mock API Error (GET /api/staff): Unhandled exception in GET handler:', error);
    return NextResponse.json({ message: `Mock API: Unexpected server error. Details: ${error.message || 'Unknown server error.'}` }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createStaffSchema.parse(body);

    // Create a new staff member for the mock list
    const newStaffMember: StaffMemberFirestore = {
      id: `mock-staff-${Date.now()}`, // Generate a unique ID
      name: validatedData.name,
      username: validatedData.username,
      email: validatedData.email,
      status: validatedData.status,
    };

    mockStaffMembers.push(newStaffMember);
    console.log("Mock API: Added staff member:", newStaffMember);
    return NextResponse.json(newStaffMember, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Validation failed', errors: error.errors }, { status: 400 });
    }
    console.error('Mock API Error (POST /api/staff): Error creating staff member:', error);
    return NextResponse.json({ message: `Mock API: Error creating staff member. Details: ${error.message || 'Unknown server error.'}` }, { status: 500 });
  }
}

