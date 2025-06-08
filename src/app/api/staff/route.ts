
'use server';

import { type NextRequest, NextResponse } from 'next/server';
import * as z from 'zod';
import fs from 'fs';
import path from 'path';
import { getSocketServer } from '@/lib/socket-server'; // Import the getter

// Path to the JSON file
const dataFilePath = path.join(process.cwd(), 'src', 'data', 'staff.json');

// Schema for StaffMember (matches client-side expectation)
// This schema is now internal to this file and not exported directly.
const staffSchemaFirestore = z.object({
  id: z.string(), // ID will be generated
  name: z.string(),
  username: z.string(),
  email: z.string().email(),
  status: z.enum(["Active", "Disabled"]),
});
export type StaffMemberFirestore = z.infer<typeof staffSchemaFirestore>;


// Helper function to read data from the JSON file
const readStaffData = (): StaffMemberFirestore[] => {
  try {
    if (!fs.existsSync(dataFilePath)) {
      console.warn(`Staff data file not found at ${dataFilePath}. Returning empty list. Ensure 'src/data/staff.json' exists.`);
      // Attempt to create the directory if it doesn't exist
      const dataDir = path.dirname(dataFilePath);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
        console.log(`Created directory: ${dataDir}`);
      }
      // Attempt to create the file with an empty array if it doesn't exist
      fs.writeFileSync(dataFilePath, JSON.stringify([], null, 2), 'utf-8');
      console.log(`Created staff data file with empty array: ${dataFilePath}`);
      return [];
    }

    const jsonData = fs.readFileSync(dataFilePath, 'utf-8');
    if (jsonData.trim() === "") {
      // If the file is empty, treat it as an empty list.
      return [];
    }
    // Attempt to parse, ensure it's an array
    const parsedData = JSON.parse(jsonData);
    if (!Array.isArray(parsedData)) {
        console.error(`Staff data file at ${dataFilePath} does not contain a valid JSON array. Returning empty list.`);
        return [];
    }
    return parsedData as StaffMemberFirestore[];
  } catch (error) {
    console.error(`Error reading or parsing staff data file (${dataFilePath}):`, error);
    // In case of error, try to return an empty list instead of throwing,
    // to prevent build failures if the file is temporarily malformed or inaccessible.
    return []; 
  }
};

// Helper function to write data to the JSON file
const writeStaffData = (data: StaffMemberFirestore[]): void => {
  try {
    const dataDir = path.dirname(dataFilePath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true }); // Ensure directory exists
    }
    const jsonData = JSON.stringify(data, null, 2); // Pretty print JSON
    fs.writeFileSync(dataFilePath, jsonData, 'utf-8');
  } catch (error) {
    console.error('Error writing staff data file:', error);
    // Consider re-throwing or more specific error handling if needed for runtime
  }
};

const createStaffSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  username: z.string().min(3, { message: "Username must be at least 3 characters." }).regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores."),
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }), // Password not used directly in storage
  status: z.enum(["Active", "Disabled"]).default("Active"),
});

export async function GET(request: NextRequest) {
  try {
    const staffMembers = readStaffData();
    return NextResponse.json(staffMembers);
  } catch (error: any) {
    console.error('API Error (GET /api/staff - File): Unhandled exception during read:', error);
    return NextResponse.json({ 
      message: `API (File): Error fetching staff. Details: ${error.message || 'Unknown server error.'}. File-based storage limitations reminder.` 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createStaffSchema.parse(body);

    let staffMembers = readStaffData();
    
    if (staffMembers.some(staff => staff.username === validatedData.username)) {
        return NextResponse.json({ message: 'Username already exists.' }, { status: 409 });
    }
    if (staffMembers.some(staff => staff.email === validatedData.email)) {
        return NextResponse.json({ message: 'Email already exists.' }, { status: 409 });
    }

    const newStaffMember: StaffMemberFirestore = {
      id: `staff-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: validatedData.name,
      username: validatedData.username,
      email: validatedData.email,
      status: validatedData.status,
    };

    staffMembers.push(newStaffMember);
    writeStaffData(staffMembers);
    
    console.log("API (File): Added staff member:", newStaffMember);

    // Emit event via Socket.IO
    const io = getSocketServer();
    if (io) {
      io.emit('staffAdded', newStaffMember);
      console.log('Socket.IO: Emitted staffAdded event', newStaffMember);
    } else {
      console.warn('Socket.IO server not available, could not emit staffAdded event.');
    }
    
    return NextResponse.json(newStaffMember, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Validation failed', errors: error.errors }, { status: 400 });
    }
    console.error('API Error (POST /api/staff - File): Error creating staff member:', error);
    return NextResponse.json({ 
      message: `API (File): Error creating staff member. Details: ${error.message || 'Unknown server error.'}.`
    }, { status: 500 });
  }
}
