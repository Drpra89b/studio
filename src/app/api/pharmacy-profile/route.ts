
import { type NextRequest, NextResponse } from 'next/server';
import * as z from 'zod';
import { supabase } from '@/lib/supabaseClient';

// Zod schema for validation
const pharmacyProfileFormSchema = z.object({
  // Using a fixed ID for the single profile record for easier upsert/query
  id: z.string().uuid().default('00000000-0000-0000-0000-000000000001'), 
  pharmacyName: z.string().min(2, "Pharmacy name must be at least 2 characters."),
  invoiceTitle: z.string().min(1, "Invoice title is required."),
  addressStreet: z.string().min(5, "Street address is required."),
  addressCity: z.string().min(2, "City is required."),
  addressState: z.string().min(2, "State is required."),
  addressZipCode: z.string().min(6, "PIN code must be 6 digits.").max(6, "PIN code must be 6 digits.").regex(/^\d{6}$/, "Invalid PIN code format."),
  contactNumber: z.string().min(10, "Contact number is required.").regex(/^\+?[\d\s-()]{10,}$/, "Invalid phone number format."),
  emailAddress: z.string().email("Invalid email address."),
  licenseNumber: z.string().min(1, "License number is required."),
  pharmacistInCharge: z.string().min(2, "Pharmacist in charge name is required."),
  gstin: z.string().optional().refine(val => !val || val.length === 15, {
    message: "GSTIN must be 15 characters long if provided.",
  }),
  // Supabase automatically handles created_at and updated_at
});
type PharmacyProfileFormValues = z.infer<typeof pharmacyProfileFormSchema>;

const DEFAULT_PROFILE_ID = '00000000-0000-0000-0000-000000000001';

// Placeholder for Supabase table creation SQL and RLS policies.
// User needs to execute this in their Supabase SQL Editor.
/*
-- Create the pharmacy_profile table in Supabase
CREATE TABLE IF NOT EXISTS public.pharmacy_profile (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pharmacy_name TEXT NOT NULL,
  invoice_title TEXT NOT NULL,
  address_street TEXT NOT NULL,
  address_city TEXT NOT NULL,
  address_state TEXT NOT NULL,
  address_zip_code TEXT NOT NULL,
  contact_number TEXT NOT NULL,
  email_address TEXT NOT NULL,
  license_number TEXT NOT NULL,
  pharmacist_in_charge TEXT NOT NULL,
  gstin TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Optional: Create a trigger to automatically update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_pharmacy_profile_updated
  BEFORE UPDATE ON public.pharmacy_profile
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at();

-- Enable Row Level Security (RLS) on the table
ALTER TABLE public.pharmacy_profile ENABLE ROW LEVEL SECURITY;

-- RLS Policies (EXAMPLES - User MUST tailor these for security)
-- For server-side API routes using the ANON key, these allow operations.
-- For production, using the SERVICE_ROLE_KEY (bypasses RLS) from backend is safer for admin operations,
-- or implement proper user role-based RLS.

-- Allow public read access (adjust if profile should be protected)
CREATE POLICY "Allow public read access to pharmacy profile"
  ON public.pharmacy_profile FOR SELECT
  USING (true);

-- Allow authenticated users (or anon for server-side) to insert/update
-- For a single profile, you might restrict insert to one record or use upsert logic.
CREATE POLICY "Allow insert for authorized users or server"
  ON public.pharmacy_profile FOR INSERT
  WITH CHECK (true); -- Consider more restrictive checks

CREATE POLICY "Allow update for authorized users or server"
  ON public.pharmacy_profile FOR UPDATE
  USING (true) -- User must own the record or have specific role
  WITH CHECK (true);

-- Ensure only one profile record can exist (using the fixed ID)
-- This can also be enforced by application logic or a unique constraint on a non-PK field if ID wasn't fixed.

-- Example: If using the fixed ID '00000000-0000-0000-0000-000000000001'
-- The insert policy could check this id.
*/

export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabase
      .from('pharmacy_profile')
      .select('*')
      .eq('id', DEFAULT_PROFILE_ID) // Assuming a single profile record with a fixed ID
      .maybeSingle(); // Use maybeSingle() if the record might not exist yet

    if (error) {
      console.error('Supabase GET /api/pharmacy-profile error:', error);
      throw error;
    }

    if (data) {
      return NextResponse.json(data);
    } else {
      // Return a default or empty structure if nothing is stored yet
      // This matches the previous behavior for a non-existent profile
      return NextResponse.json({
        id: DEFAULT_PROFILE_ID,
        pharmacyName: "MediStore (Default DB)",
        invoiceTitle: "Invoice",
        addressStreet: "",
        addressCity: "",
        addressState: "",
        addressZipCode: "",
        contactNumber: "",
        emailAddress: "",
        licenseNumber: "",
        pharmacistInCharge: "",
        gstin: "",
      });
    }
  } catch (error: any) {
    console.error('API Error (GET /api/pharmacy-profile - Supabase):', error);
    return NextResponse.json({ 
      message: `API (Supabase): Error fetching pharmacy profile. Details: ${error.message || 'Unknown server error.'}` 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Ensure the fixed ID is part of the data for upsert
    const dataToUpsert = { ...body, id: DEFAULT_PROFILE_ID };
    const validatedData = pharmacyProfileFormSchema.parse(dataToUpsert);

    const { data: upsertedProfile, error } = await supabase
      .from('pharmacy_profile')
      .upsert(validatedData, { onConflict: 'id' }) // Upsert based on the fixed ID
      .select()
      .single();

    if (error) {
      console.error('Supabase POST (upsert) /api/pharmacy-profile error:', error);
      throw error;
    }

    return NextResponse.json({ message: 'Profile updated successfully (Supabase)', data: upsertedProfile });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Validation failed', errors: error.errors }, { status: 400 });
    }
    console.error('API Error (POST /api/pharmacy-profile - Supabase):', error);
    return NextResponse.json({ 
      message: `API (Supabase): Error saving pharmacy profile. Details: ${error.message || 'Unknown server error.'}`
    }, { status: 500 });
  }
}
    