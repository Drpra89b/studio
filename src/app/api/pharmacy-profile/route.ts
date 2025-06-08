
import { type NextRequest, NextResponse } from 'next/server';
import * as z from 'zod';
import { supabaseAdmin } from '@/lib/supabaseAdmin'; // Use Admin client

const pharmacyProfileFormSchema = z.object({
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
});
type PharmacyProfileFormValues = z.infer<typeof pharmacyProfileFormSchema>;

const DEFAULT_PROFILE_ID = '00000000-0000-0000-0000-000000000001';

// SQL DDL for pharmacy_profile table (Execute in Supabase SQL Editor)
/*
-- Ensure the table uses uuid-ossp extension if not already enabled
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the pharmacy_profile table
CREATE TABLE IF NOT EXISTS public.pharmacy_profile (
  id uuid PRIMARY KEY DEFAULT '00000000-0000-0000-0000-000000000001', -- Fixed ID for single profile
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

-- Optional: Trigger to automatically update updated_at on row modification
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'on_pharmacy_profile_updated'
  ) THEN
    CREATE TRIGGER on_pharmacy_profile_updated
      BEFORE UPDATE ON public.pharmacy_profile
      FOR EACH ROW
      EXECUTE PROCEDURE public.handle_updated_at();
  END IF;
END $$;


-- Enable Row Level Security (RLS)
ALTER TABLE public.pharmacy_profile ENABLE ROW LEVEL SECURITY;

-- RLS Policies:
-- IMPORTANT: Since the backend API will use the SERVICE_ROLE_KEY (via supabaseAdmin client),
-- these policies are mainly for potential direct client access (e.g., if you used the anon key or user auth).
-- The service role key BYPASSES RLS. If your API is the *only* way data is written,
-- these policies can be simpler or even just "public read".

-- Example: Allow public read access (adjust if profile should be protected from direct client reads)
DROP POLICY IF EXISTS "Allow public read access to pharmacy profile" ON public.pharmacy_profile;
CREATE POLICY "Allow public read access to pharmacy profile"
  ON public.pharmacy_profile FOR SELECT
  USING (true);

-- Example: If API uses service role, it bypasses these. If it used anon key, this would be needed.
-- For a single profile record, we use upsert logic in the API.
-- Direct insert/update policies for anon/authed users would need care due to the single-record nature.
-- For simplicity with service_role_key on backend, explicit insert/update policies for anon/authed can be restrictive or omitted
-- if all writes go through your trusted backend API.

-- Example: Restrict direct modification by anon users if you want to be safe,
-- relying on your backend API (using service role) to handle changes.
DROP POLICY IF EXISTS "Disallow direct insert for anon users" ON public.pharmacy_profile;
CREATE POLICY "Disallow direct insert for anon users"
  ON public.pharmacy_profile FOR INSERT
  WITH CHECK (false);

DROP POLICY IF EXISTS "Disallow direct update for anon users" ON public.pharmacy_profile;
CREATE POLICY "Disallow direct update for anon users"
  ON public.pharmacy_profile FOR UPDATE
  USING (false)
  WITH CHECK (false);

-- If you did want to allow anon key (used server-side by supabaseClient) to modify:
-- DROP POLICY IF EXISTS "Allow server (anon key) to upsert pharmacy profile" ON public.pharmacy_profile;
-- CREATE POLICY "Allow server (anon key) to upsert pharmacy profile"
--   ON public.pharmacy_profile FOR ALL -- Covers INSERT, UPDATE
--   USING (true)
--   WITH CHECK (true);
*/


export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabaseAdmin // Use Admin client
      .from('pharmacy_profile')
      .select('*')
      .eq('id', DEFAULT_PROFILE_ID)
      .maybeSingle();

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
    console.error('API Error (GET /api/pharmacy-profile - Supabase Admin):', error);
    return NextResponse.json({ 
      message: `API (Supabase Admin): Error fetching pharmacy profile. Details: ${error.message || 'Unknown server error.'}` 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Ensure the fixed ID is part of the data for upsert
    const dataToUpsert = { ...body, id: DEFAULT_PROFILE_ID, updated_at: new Date().toISOString() };
    const validatedData = pharmacyProfileFormSchema.parse(dataToUpsert);

    const { data: upsertedProfile, error } = await supabaseAdmin // Use Admin client
      .from('pharmacy_profile')
      .upsert(validatedData, { onConflict: 'id' }) 
      .select()
      .single();

    if (error) {
      console.error('Supabase POST (upsert) /api/pharmacy-profile error:', error);
      throw error;
    }

    return NextResponse.json({ message: 'Profile updated successfully (Supabase Admin)', data: upsertedProfile });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Validation failed', errors: error.errors }, { status: 400 });
    }
    console.error('API Error (POST /api/pharmacy-profile - Supabase Admin):', error);
    return NextResponse.json({ 
      message: `API (Supabase Admin): Error saving pharmacy profile. Details: ${error.message || 'Unknown server error.'}`
    }, { status: 500 });
  }
}
