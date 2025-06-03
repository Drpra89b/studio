
'use server';

import { type NextRequest, NextResponse } from 'next/server';
import * as z from 'zod';
import fs from 'fs';
import path from 'path';
import type { StaffMemberFirestore } from '../route'; // Use the type from the main route

// Path to the JSON file
const dataFilePath = path.join(process.cwd(), 'src', 'data', 'staff.json');

// Helper function to read data from the JSON file
const readStaffData = (): StaffMemberFirestore[] => {
  try {
    if (!fs.existsSync(dataFilePath)) {
      fs.writeFileSync(dataFilePath, JSON.stringify([]));
      return [];
    }
    const jsonData = fs.readFileSync(dataFilePath, 'utf-8');
    return JSON.parse(jsonData) as StaffMemberFirestore[];
  } catch (error) {
    console.error('Error reading staff data file:', error);
    return [];
  }
};

// Helper function to write data to the JSON file
const writeStaffData = (data: StaffMemberFirestore[]): void => {
  try {
    const jsonData = JSON.stringify(data, null, 2);
    fs.writeFileSync(dataFilePath, jsonData, 'utf-8');
  } catch (error) {
    console.error('Error writing staff data file:', error);
  }
};

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
  // IMPORTANT WARNING (Same as main route)
  try {
    const staffId = params.staffId;
    const staffMembers = readStaffData();
    const staffMember = staffMembers.find(staff => staff.id === staffId);

    if (!staffMember) {
      return NextResponse.json({ message: 'API (File): Staff member not found' }, { status: 404 });
    }
    return NextResponse.json(staffMember);
  } catch (error: any) {
    console.error(`API Error (GET /api/staff/${params.staffId}): Error fetching staff member:`, error);
    return NextResponse.json({ 
      message: `API: Error fetching staff member ${params.staffId}. Details: ${error.message || 'Unknown server error.'}. Reminder: File-based storage limitations.`
    }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { staffId: string } }
) {
  // IMPORTANT WARNING (Same as main route)
  try {
    const staffId = params.staffId;
    const body = await request.json();
    const validatedData = updateStaffSchema.parse(body);

    if (Object.keys(validatedData).length === 0) {
        return NextResponse.json({ message: 'API (File): No update data provided' }, { status: 400 });
    }

    let staffMembers = readStaffData();
    const staffIndex = staffMembers.findIndex(staff => staff.id === staffId);
    if (staffIndex === -1) {
        return NextResponse.json({ message: 'API (File): Staff member not found for update' }, { status: 404 });
    }

    staffMembers[staffIndex] = { ...staffMembers[staffIndex], ...validatedData };
    writeStaffData(staffMembers);
    
    console.log("API (File): Updated staff member:", staffMembers[staffIndex]);
    return NextResponse.json(staffMembers[staffIndex]);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Validation failed', errors: error.errors }, { status: 400 });
    }
    console.error(`API Error (PUT /api/staff/${params.staffId}): Error updating staff member:`, error);
    return NextResponse.json({ 
      message: `API: Error updating staff member ${params.staffId}. Details: ${error.message || 'Unknown server error.'}. Reminder: File-based storage limitations.`
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { staffId: string } }
) {
  // IMPORTANT WARNING (Same as main route)
  try {
    const staffId = params.staffId;
    let staffMembers = readStaffData();
    const initialLength = staffMembers.length;
    staffMembers = staffMembers.filter(staff => staff.id !== staffId);

    if (staffMembers.length === initialLength) {
      return NextResponse.json({ message: 'API (File): Staff member not found for deletion' }, { status: 404 });
    }
    
    writeStaffData(staffMembers);
    console.log("API (File): Deleted staff member:", staffId);
    return NextResponse.json({ message: `API (File): Staff member ${staffId} deleted successfully` });
  } catch (error: any) {
    console.error(`API Error (DELETE /api/staff/${params.staffId}): Error deleting staff member:`, error);
    return NextResponse.json({ 
      message: `API: Error deleting staff member ${params.staffId}. Details: ${error.message || 'Unknown server error.'}. Reminder: File-based storage limitations.`
    }, { status: 500 });
  }
}
