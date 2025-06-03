
'use server';

import { type NextRequest, NextResponse } from 'next/server';
import * as z from 'zod';
import fs from 'fs';
import path from 'path';

// Path to the JSON file
const dataFilePath = path.join(process.cwd(), 'src', 'data', 'staff.json');

// Helper function to read data from the JSON file
const readStaffData = (): StaffMemberFirestore[] => {
  try {
    if (!fs.existsSync(dataFilePath)) {
      fs.writeFileSync(dataFilePath, JSON.stringify([])); // Create an empty file if it doesn't exist
      return [];
    }
    const jsonData = fs.readFileSync(dataFilePath, 'utf-8');
    return JSON.parse(jsonData) as StaffMemberFirestore[];
  } catch (error) {
    console.error('Error reading staff data file:', error);
    return []; // Return empty array on error to prevent crash
  }
};

// Helper function to write data to the JSON file
const writeStaffData = (data: StaffMemberFirestore[]): void => {
  try {
    const jsonData = JSON.stringify(data, null, 2); // Pretty print JSON
    fs.writeFileSync(dataFilePath, jsonData, 'utf-8');
  } catch (error) {
    console.error('Error writing staff data file:', error);
  }
};

// Schema for StaffMember (matches client-side expectation)
export const staffSchemaFirestore = z.object({
  id: z.string().optional(), // ID will be generated
  name: z.string(),
  username: z.string(),
  email: z.string().email(),
  status: z.enum(["Active", "Disabled"]),
});
export type StaffMemberFirestore = z.infer<typeof staffSchemaFirestore>;

const createStaffSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  username: z.string().min(3, { message: "Username must be at least 3 characters." }).regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores."),
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }), // Password not used directly in storage
  status: z.enum(["Active", "Disabled"]).default("Active"),
});

export async function GET(request: NextRequest) {
  // IMPORTANT WARNING FOR DEPLOYMENT:
  // File-based storage is NOT reliably persistent on serverless platforms like Firebase App Hosting.
  // Data may be lost on redeployments or instance restarts. This is for local/demo purposes.
  try {
    const staffMembers = readStaffData();
    return NextResponse.json(staffMembers);
  } catch (error: any) {
    console.error('API Error (GET /api/staff): Unhandled exception:', error);
    return NextResponse.json({ 
      message: `API: Error fetching staff. Details: ${error.message || 'Unknown server error.'}. Reminder: File-based storage has limitations on serverless platforms.` 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  // IMPORTANT WARNING FOR DEPLOYMENT (Same as GET)
  try {
    const body = await request.json();
    const validatedData = createStaffSchema.parse(body);

    const staffMembers = readStaffData();
    const newStaffMember: StaffMemberFirestore = {
      id: `staff-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`, // Generate a unique ID
      name: validatedData.name,
      username: validatedData.username,
      email: validatedData.email,
      status: validatedData.status,
    };

    staffMembers.push(newStaffMember);
    writeStaffData(staffMembers);
    
    console.log("API: Added staff member (file-based):", newStaffMember);
    return NextResponse.json(newStaffMember, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Validation failed', errors: error.errors }, { status: 400 });
    }
    console.error('API Error (POST /api/staff): Error creating staff member:', error);
    return NextResponse.json({ 
      message: `API: Error creating staff member. Details: ${error.message || 'Unknown server error.'}. Reminder: File-based storage has limitations on serverless platforms.`
    }, { status: 500 });
  }
}
