
'use server';

import { type NextRequest, NextResponse } from 'next/server';
import * as z from 'zod';
import { supabaseAdmin } from '@/lib/supabaseAdmin'; // Use Admin client
import type { StaffMemberSupabase } from '../route'; 

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
    const { data: staffMember, error } = await supabaseAdmin // Use Admin client
      .from('staff')
      .select('*')
      .eq('id', staffId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { 
        return NextResponse.json({ message: 'API (Supabase Admin): Staff member not found' }, { status: 404 });
      }
      console.error(`Supabase GET /api/staff/${staffId} error:`, error);
      throw error;
    }

    if (!staffMember) {
      return NextResponse.json({ message: 'API (Supabase Admin): Staff member not found' }, { status: 404 });
    }
    return NextResponse.json(staffMember);
  } catch (error: any) {
    console.error(`API Error (GET /api/staff/${params.staffId} - Supabase Admin):`, error);
    return NextResponse.json({ 
      message: `API (Supabase Admin): Error fetching staff member ${params.staffId}. Details: ${error.message || 'Unknown server error.'}`
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
        return NextResponse.json({ message: 'API (Supabase Admin): No update data provided' }, { status: 400 });
    }

    const dataToUpdate = { ...validatedData, updated_at: new Date().toISOString() };

    const { data: updatedStaffMember, error } = await supabaseAdmin // Use Admin client
      .from('staff')
      .update(dataToUpdate)
      .eq('id', staffId)
      .select()
      .single();

    if (error) {
      console.error(`Supabase PUT /api/staff/${staffId} error:`, error);
       if (error.code === '23505') { 
        if (error.message.includes('staff_username_key')) {
          return NextResponse.json({ message: 'Username already exists.' }, { status: 409 });
        }
        if (error.message.includes('staff_email_key')) {
          return NextResponse.json({ message: 'Email already exists.' }, { status: 409 });
        }
      }
      if (error.code === 'PGRST116') { 
        return NextResponse.json({ message: 'API (Supabase Admin): Staff member not found for update' }, { status: 404 });
      }
      throw error;
    }
    
    if (!updatedStaffMember) { 
        return NextResponse.json({ message: 'API (Supabase Admin): Staff member not found for update (unexpected)' }, { status: 404 });
    }
    
    console.log("API (Supabase Admin): Updated staff member:", updatedStaffMember);
    return NextResponse.json(updatedStaffMember);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Validation failed', errors: error.errors }, { status: 400 });
    }
    console.error(`API Error (PUT /api/staff/${params.staffId} - Supabase Admin):`, error);
    return NextResponse.json({ 
      message: `API (Supabase Admin): Error updating staff member ${params.staffId}. Details: ${error.message || 'Unknown server error.'}`
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { staffId: string } }
) {
  try {
    const staffId = params.staffId;
    const { error, count } = await supabaseAdmin // Use Admin client
      .from('staff')
      .delete({ count: 'exact' }) 
      .eq('id', staffId);

    if (error) {
      console.error(`Supabase DELETE /api/staff/${staffId} error:`, error);
      throw error;
    }

    if (count === 0) {
      return NextResponse.json({ message: 'API (Supabase Admin): Staff member not found for deletion' }, { status: 404 });
    }
    
    console.log("API (Supabase Admin): Deleted staff member:", staffId);
    return NextResponse.json({ message: `API (Supabase Admin): Staff member ${staffId} deleted successfully` });
  } catch (error: any) {
    console.error(`API Error (DELETE /api/staff/${params.staffId} - Supabase Admin):`, error);
    return NextResponse.json({ 
      message: `API (Supabase Admin): Error deleting staff member ${params.staffId}. Details: ${error.message || 'Unknown server error.'}`
    }, { status: 500 });
  }
}
