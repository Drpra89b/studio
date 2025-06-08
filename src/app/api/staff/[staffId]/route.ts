
'use server';

import { type NextRequest, NextResponse } from 'next/server';
import * as z from 'zod';
import { supabase } from '@/lib/supabaseClient';
import type { StaffMemberSupabase } from '../route'; // Use the type from the main route

const updateStaffSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }).optional(),
  username: z.string().min(3, { message: "Username must be at least 3 characters." }).regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores.").optional(),
  email: z.string().email({ message: "Please enter a valid email address." }).optional(),
  status: z.enum(["Active", "Disabled"]).optional(),
  // updated_at will be handled by Supabase or a DB trigger
});

export async function GET(
  request: NextRequest,
  { params }: { params: { staffId: string } }
) {
  try {
    const staffId = params.staffId;
    const { data: staffMember, error } = await supabase
      .from('staff')
      .select('*')
      .eq('id', staffId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // Not found
        return NextResponse.json({ message: 'API (Supabase): Staff member not found' }, { status: 404 });
      }
      console.error(`Supabase GET /api/staff/${staffId} error:`, error);
      throw error;
    }

    if (!staffMember) {
      return NextResponse.json({ message: 'API (Supabase): Staff member not found' }, { status: 404 });
    }
    return NextResponse.json(staffMember);
  } catch (error: any) {
    console.error(`API Error (GET /api/staff/${params.staffId} - Supabase):`, error);
    return NextResponse.json({ 
      message: `API (Supabase): Error fetching staff member ${params.staffId}. Details: ${error.message || 'Unknown server error.'}`
    }, { status: 500 });
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
        return NextResponse.json({ message: 'API (Supabase): No update data provided' }, { status: 400 });
    }

    // Add updated_at timestamp
    const dataToUpdate = { ...validatedData, updated_at: new Date().toISOString() };

    const { data: updatedStaffMember, error } = await supabase
      .from('staff')
      .update(dataToUpdate)
      .eq('id', staffId)
      .select()
      .single();

    if (error) {
      console.error(`Supabase PUT /api/staff/${staffId} error:`, error);
       if (error.code === '23505') { // Unique violation
        if (error.message.includes('staff_username_key')) {
          return NextResponse.json({ message: 'Username already exists.' }, { status: 409 });
        }
        if (error.message.includes('staff_email_key')) {
          return NextResponse.json({ message: 'Email already exists.' }, { status: 409 });
        }
      }
      if (error.code === 'PGRST116') { // Not found if .single() is used and no row matches
        return NextResponse.json({ message: 'API (Supabase): Staff member not found for update' }, { status: 404 });
      }
      throw error;
    }
    
    if (!updatedStaffMember) { // Should be caught by PGRST116 but as a fallback
        return NextResponse.json({ message: 'API (Supabase): Staff member not found for update' }, { status: 404 });
    }
    
    console.log("API (Supabase): Updated staff member:", updatedStaffMember);
    return NextResponse.json(updatedStaffMember);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Validation failed', errors: error.errors }, { status: 400 });
    }
    console.error(`API Error (PUT /api/staff/${params.staffId} - Supabase):`, error);
    return NextResponse.json({ 
      message: `API (Supabase): Error updating staff member ${params.staffId}. Details: ${error.message || 'Unknown server error.'}`
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { staffId: string } }
) {
  try {
    const staffId = params.staffId;
    const { error, count } = await supabase
      .from('staff')
      .delete({ count: 'exact' }) // Get the count of deleted rows
      .eq('id', staffId);

    if (error) {
      console.error(`Supabase DELETE /api/staff/${staffId} error:`, error);
      throw error;
    }

    if (count === 0) {
      return NextResponse.json({ message: 'API (Supabase): Staff member not found for deletion' }, { status: 404 });
    }
    
    console.log("API (Supabase): Deleted staff member:", staffId);
    return NextResponse.json({ message: `API (Supabase): Staff member ${staffId} deleted successfully` });
  } catch (error: any) {
    console.error(`API Error (DELETE /api/staff/${params.staffId} - Supabase):`, error);
    return NextResponse.json({ 
      message: `API (Supabase): Error deleting staff member ${params.staffId}. Details: ${error.message || 'Unknown server error.'}`
    }, { status: 500 });
  }
}
