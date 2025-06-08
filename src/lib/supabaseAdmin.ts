// src/lib/supabaseAdmin.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// This client is for server-side use ONLY, using the Service Role Key.
// DO NOT expose this client or its configuration to the frontend.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL; // Can also use process.env.SUPABASE_URL if set separately
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error("Supabase URL not found for admin client. Please set NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL) in your environment variables.");
}
if (!serviceRoleKey) {
  throw new Error("Supabase Service Role Key not found. Please set SUPABASE_SERVICE_ROLE_KEY in your environment variables.");
}

export const supabaseAdmin: SupabaseClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    // autoRefreshToken and persistSession are typically false for server-side operations
    // as service role key doesn't rely on user sessions.
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
});
