
'use server';

import { type NextRequest, NextResponse } from 'next/server';
import * as z from 'zod';
import type { StaffMemberFirestore } from '../route'; // Use the type from the main route

// In-memory store for staff members (shared with the main route for consistency in a real app, but here it's standalone for simplicity)
// For a real mock that persists across requests to [staffId] and base /staff, this would need to be managed centrally.
// However, for now, let's assume the main route's mockStaffMembers is the source of truth.
// To properly mock, we'd need to import and modify mockStaffMembers from '../route.ts'
// For now, this will re-declare a limited version for simplicity of file change.
let mockStaffMembers: StaffMemberFirestore[] = [
  { id: 'mock-staff-1', name: 'Alice Wonderland', username: 'alice', email: 'alice@example.com', status: 'Active' },
  { id: 'mock-staff-2', name: 'Bob The Builder', username: 'bob', email: 'bob@example.com', status: 'Active' },
  { id: 'mock-staff-3', name: 'Carol Danvers', username: 'carol', email: 'carol@example.com', status: 'Disabled' }
];


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
    const staffId = params.staffId;
    const staffMember = mockStaffMembers.find(staff => staff.id === staffId);

    if (!staffMember) {
      return NextResponse.json({ message: 'Mock API: Staff member not found' }, { status: 404 });
    }
    return NextResponse.json(staffMember);
  } catch (error: any) {
    console.error(`Mock API Error (GET /api/staff/${params.staffId}): Error fetching staff member:`, error);
    return NextResponse.json({ message: `Mock API: Error fetching staff member ${params.staffId}. Details: ${error.message || 'Unknown server error.'}` }, { status: 500 });
  }
}


export async function PUT(
  request: NextRequest,
  { params }: { params: { staffId: string } }
) {
  try {
    const staffId = params.staffId;
    const body = await request.json();
    const validatedData = updateStaffSchema.parse(body);

    if (Object.keys(validatedData).length === 0) {
        return NextResponse.json({ message: 'Mock API: No update data provided' }, { status: 400 });
    }

    const staffIndex = mockStaffMembers.findIndex(staff => staff.id === staffId);
    if (staffIndex === -1) {
        return NextResponse.json({ message: 'Mock API: Staff member not found for update' }, { status: 404 });
    }

    // Update the mock staff member
    mockStaffMembers[staffIndex] = { ...mockStaffMembers[staffIndex], ...validatedData };
    
    console.log("Mock API: Updated staff member:", mockStaffMembers[staffIndex]);
    return NextResponse.json(mockStaffMembers[staffIndex]);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Validation failed', errors: error.errors }, { status: 400 });
    }
    console.error(`Mock API Error (PUT /api/staff/${params.staffId}): Error updating staff member:`, error);
    return NextResponse.json({ message: `Mock API: Error updating staff member ${params.staffId}. Details: ${error.message || 'Unknown server error.'}` }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { staffId: string } }
) {
  try {
    const staffId = params.staffId;
    const initialLength = mockStaffMembers.length;
    mockStaffMembers = mockStaffMembers.filter(staff => staff.id !== staffId);

    if (mockStaffMembers.length === initialLength) {
      return NextResponse.json({ message: 'Mock API: Staff member not found for deletion' }, { status: 404 });
    }
    
    console.log("Mock API: Deleted staff member:", staffId);
    return NextResponse.json({ message: `Mock API: Staff member ${staffId} deleted successfully` });
  } catch (error: any) {
    console.error(`Mock API Error (DELETE /api/staff/${params.staffId}): Error deleting staff member:`, error);
    return NextResponse.json({ message: `Mock API: Error deleting staff member ${params.staffId}. Details: ${error.message || 'Unknown server error.'}` }, { status: 500 });
  }
}
