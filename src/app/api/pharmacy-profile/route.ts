
import { type NextRequest, NextResponse } from 'next/server';
import * as z from 'zod';

// Zod schema for validation, should match the one in the frontend
const pharmacyProfileFormSchema = z.object({
  pharmacyName: z.string().min(2, "Pharmacy name must be at least 2 characters."),
  invoiceTitle: z.string().min(1, "Invoice title is required."),
  addressStreet: z.string().min(5, "Street address is required."),
  addressCity: z.string().min(2, "City is required."),
  addressState: z.string().min(2, "State is required."),
  addressZipCode: z.string().min(5, "Zip code is required.").regex(/^\d{5}(-\d{4})?$/, "Invalid zip code format."),
  contactNumber: z.string().min(10, "Contact number is required.").regex(/^\+?[\d\s-()]{10,}$/, "Invalid phone number format."),
  emailAddress: z.string().email("Invalid email address."),
  licenseNumber: z.string().min(1, "License number is required."),
  pharmacistInCharge: z.string().min(2, "Pharmacist in charge name is required."),
  gstin: z.string().optional().refine(val => !val || val.length === 15, {
    message: "GSTIN must be 15 characters long if provided.",
  }),
});
type PharmacyProfileFormValues = z.infer<typeof pharmacyProfileFormSchema>;

// In-memory store for demonstration. In a real app, this would be a database.
let storedProfileData: PharmacyProfileFormValues | null = {
    pharmacyName: "MediStore Central Pharmacy (API)", // Default initial from API
    invoiceTitle: "MediStore Pharmacy Invoice",
    addressStreet: "123 Health St, Suite 100",
    addressCity: "Wellnessville",
    addressState: "CA",
    addressZipCode: "90210",
    contactNumber: "(555) 123-4567",
    emailAddress: "contact@medistorecentral.com",
    licenseNumber: "PHARM12345X",
    pharmacistInCharge: "Dr. Emily Carter",
    gstin: "",
};

export async function GET(request: NextRequest) {
  // In a real app, you'd fetch this from your database (e.g., Firestore)
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
    addressZipCode: "",
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

    // In a real app, you'd save this to your database (e.g., Firestore)
    storedProfileData = validatedData;

    return NextResponse.json({ message: 'Profile updated successfully', data: storedProfileData });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Validation failed', errors: error.errors }, { status: 400 });
    }
    console.error('Error saving pharmacy profile:', error);
    return NextResponse.json({ message: 'Error saving profile' }, { status: 500 });
  }
}
