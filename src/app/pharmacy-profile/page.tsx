
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import PageHeader from "@/components/shared/page-header";
import { Store, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

const pharmacyProfileFormSchema = z.object({
  pharmacyName: z.string().min(2, "Pharmacy name must be at least 2 characters."),
  addressStreet: z.string().min(5, "Street address is required."),
  addressCity: z.string().min(2, "City is required."),
  addressState: z.string().min(2, "State is required."),
  addressZipCode: z.string().min(5, "Zip code is required.").regex(/^\d{5}(-\d{4})?$/, "Invalid zip code format."),
  contactNumber: z.string().min(10, "Contact number is required.").regex(/^\+?[\d\s-()]{10,}$/, "Invalid phone number format."),
  emailAddress: z.string().email("Invalid email address."),
  licenseNumber: z.string().min(1, "License number is required."),
  pharmacistInCharge: z.string().min(2, "Pharmacist in charge name is required."),
});

type PharmacyProfileFormValues = z.infer<typeof pharmacyProfileFormSchema>;

// Placeholder for actual data fetching/saving
const getPharmacyProfile = (): Partial<PharmacyProfileFormValues> => {
  // In a real app, fetch this from a database or persistent storage
  return {
    pharmacyName: "MediStore Central Pharmacy",
    addressStreet: "123 Health St, Suite 100",
    addressCity: "Wellnessville",
    addressState: "CA",
    addressZipCode: "90210",
    contactNumber: "(555) 123-4567",
    emailAddress: "contact@medistorecentral.com",
    licenseNumber: "PHARM12345X",
    pharmacistInCharge: "Dr. Emily Carter",
  };
};

export default function PharmacyProfilePage() {
  const { toast } = useToast();
  const form = useForm<PharmacyProfileFormValues>({
    resolver: zodResolver(pharmacyProfileFormSchema),
    defaultValues: getPharmacyProfile(), // Pre-fill with existing data or defaults
  });

  function onSubmit(data: PharmacyProfileFormValues) {
    console.log("Pharmacy Profile Data Submitted:", data);
    // In a real app, you would save this data to your backend/database
    toast({
      title: "Profile Updated",
      description: "Pharmacy profile details have been successfully saved.",
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Pharmacy Profile" description="Manage your pharmacy's information and details." icon={Store} />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>Pharmacy Information</CardTitle>
              <CardDescription>Keep your pharmacy details up to date. All fields are required.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <FormField control={form.control} name="pharmacyName" render={({ field }) => (
                <FormItem>
                  <FormLabel>Pharmacy Name</FormLabel>
                  <FormControl><Input placeholder="e.g., Main Street Pharmacy" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <Separator />
              <div>
                <h3 className="text-lg font-medium mb-2">Address Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="addressStreet" render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Street Address</FormLabel>
                      <FormControl><Input placeholder="e.g., 123 Main St" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="addressCity" render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl><Input placeholder="e.g., Anytown" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="addressState" render={({ field }) => (
                    <FormItem>
                      <FormLabel>State / Province</FormLabel>
                      <FormControl><Input placeholder="e.g., CA" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="addressZipCode" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Zip / Postal Code</FormLabel>
                      <FormControl><Input placeholder="e.g., 90210" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>

              <Separator />
              <div>
                <h3 className="text-lg font-medium mb-2">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="contactNumber" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Number</FormLabel>
                      <FormControl><Input type="tel" placeholder="e.g., (555) 123-4567" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="emailAddress" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl><Input type="email" placeholder="e.g., contact@pharmacy.com" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>

              <Separator />
              <div>
                <h3 className="text-lg font-medium mb-2">Professional Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="licenseNumber" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pharmacy License Number</FormLabel>
                      <FormControl><Input placeholder="e.g., PH12345678" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="pharmacistInCharge" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pharmacist-in-Charge</FormLabel>
                      <FormControl><Input placeholder="e.g., Dr. Jane Doe" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>

            </CardContent>
            <CardFooter>
              <Button type="submit" className="ml-auto">
                <Save className="mr-2 h-4 w-4" /> Save Profile
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
