
'use server';

import { type NextRequest, NextResponse } from 'next/server';
import * as z from 'zod';
import { supabase } from '@/lib/supabaseClient';
import { getSocketServer } from '@/lib/socket-server'; 

// Schema for StaffMember from Supabase
// Includes fields typically returned by Supabase (id: uuid, created_at)
const staffSchemaSupabase = z.object({
  id: z.string().uuid(),
  name: z.string(),
  username: z.string(),
  email: z.string().email(),
  status: z.enum(["Active", "Disabled"]),
  created_at: z.string().datetime().optional(), // Supabase returns ISO string
  updated_at: z.string().datetime().optional(), // Supabase returns ISO string
});
export type StaffMemberSupabase = z.infer<typeof staffSchemaSupabase>;


const createStaffSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  username: z.string().min(3, { message: "Username must be at least 3 characters." }).regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores."),
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }), 
  status: z.enum(["Active", "Disabled"]).default("Active"),
});

export async function GET(request: NextRequest) {
  try {
    const { data: staffMembers, error } = await supabase
      .from('staff')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase GET error:', error);
      throw error;
    }
    
    return NextResponse.json(staffMembers);
  } catch (error: any) {
    console.error('API Error (GET /api/staff - Supabase):', error);
    return NextResponse.json({ 
      message: `API (Supabase): Error fetching staff. Details: ${error.message || 'Unknown server error.'}` 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createStaffSchema.parse(body);

    // Password is in validatedData but not directly saved to the staff table here.
    // Supabase Auth would handle user creation with passwords separately.
    // We are creating a staff *profile*.
    const { name, username, email, status } = validatedData;

    const { data: newStaffMember, error } = await supabase
      .from('staff')
      .insert([{ name, username, email, status }])
      .select()
      .single(); // Assuming you want the inserted record back

    if (error) {
      console.error('Supabase POST error:', error);
      if (error.code === '23505') { // Unique violation
        if (error.message.includes('staff_username_key')) {
          return NextResponse.json({ message: 'Username already exists.' }, { status: 409 });
        }
        if (error.message.includes('staff_email_key')) {
          return NextResponse.json({ message: 'Email already exists.' }, { status: 409 });
        }
      }
      throw error;
    }
    
    console.log("API (Supabase): Added staff member:", newStaffMember);

    // Emit event via Socket.IO
    const io = getSocketServer();
    if (io) {
      io.emit('staffAdded', newStaffMember);
      console.log('Socket.IO: Emitted staffAdded event (Supabase)', newStaffMember);
    } else {
      console.warn('Socket.IO server not available, could not emit staffAdded event. This may be expected in some serverless environments.');
    }
    
    return NextResponse.json(newStaffMember, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Validation failed', errors: error.errors }, { status: 400 });
    }
    console.error('API Error (POST /api/staff - Supabase):', error);
    return NextResponse.json({ 
      message: `API (Supabase): Error creating staff member. Details: ${error.message || 'Unknown server error.'}`
    }, { status: 500 });
  }
}
