
import { type NextRequest, NextResponse } from 'next/server';
import * as z from 'zod';

// Zod schema for validation, should match the one in the frontend
const pharmacyProfileFormSchema = z.object({
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

// In-memory store for demonstration. 
// Data persists as long as the server process is running.
let storedProfileData: PharmacyProfileFormValues | null = {
    pharmacyName: "MediStore Central Pharmacy (API)",
    invoiceTitle: "MediStore Pharmacy Invoice",
    addressStreet: "123 Health St, Suite 100",
    addressCity: "Wellnessville",
    addressState: "MH",
    addressZipCode: "400001", // Updated to 6-digit PIN
    contactNumber: "(+91) 9876543210",
    emailAddress: "contact@medistorecentral.com",
    licenseNumber: "PHARM12345X",
    pharmacistInCharge: "Dr. Emily Carter",
    gstin: "27ABCDE1234F1Z5",
};

export async function GET(request: NextRequest) {
  if (storedProfileData) {
    return NextResponse.json(storedProfileData);
  }
  // Return a default or empty structure if nothing is stored yet
  return NextResponse.json({
    pharmacyName: "MediStore (Default API)",
    invoiceTitle: "Invoice",
    addressStreet: "",
    addressCity: "",
    addressState: "",
    addressZipCode: "", // Kept empty for default, validation on submit
    contactNumber: "",
    emailAddress: "",
    licenseNumber: "",
    pharmacistInCharge: "",
    gstin: "",
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = pharmacyProfileFormSchema.parse(body);

    storedProfileData = validatedData;

    return NextResponse.json({ message: 'Profile updated successfully (in-memory)', data: storedProfileData });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Validation failed', errors: error.errors }, { status: 400 });
    }
    console.error('Error saving pharmacy profile (in-memory):', error);
    return NextResponse.json({ message: 'Error saving profile (in-memory)' }, { status: 500 });
  }
}
