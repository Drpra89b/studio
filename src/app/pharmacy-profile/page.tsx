
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import PageHeader from "@/components/shared/page-header";
import { Store, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

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
  gstin: z.string().optional().refine(val => !val || val.length === 15, { // GSTIN is usually 15 characters
    message: "GSTIN must be 15 characters long if provided.",
  }),
});

type PharmacyProfileFormValues = z.infer<typeof pharmacyProfileFormSchema>;

const defaultProfileValues: PharmacyProfileFormValues = {
  pharmacyName: "MediStore Central Pharmacy",
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

export default function PharmacyProfilePage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<PharmacyProfileFormValues>({
    resolver: zodResolver(pharmacyProfileFormSchema),
    defaultValues: defaultProfileValues, // Start with defaults, then load from API
  });

  React.useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/pharmacy-profile');
        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }
        const data = await response.json();
        form.reset(data); // Populate form with fetched data
      } catch (error) {
        console.error("Failed to fetch pharmacy profile:", error);
        toast({
          title: "Error Loading Profile",
          description: "Could not load pharmacy profile. Using default values.",
          variant: "destructive",
        });
        form.reset(defaultProfileValues); // Fallback to defaults on error
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [form, toast]);

  const onSubmit = async (data: PharmacyProfileFormValues) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/pharmacy-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      const result = await response.json();
      console.log("Pharmacy Profile Data Submitted via API:", result.data);
      
      toast({
        title: "Profile Updated",
        description: "Pharmacy profile details have been successfully saved.",
      });
      // Note: Updating the global pharmacy name display (e.g., in the layout)
      // will require further changes to fetch this from the API or use a global state management.
      // The 'pharmacyNameUpdated' event and direct localStorage update for 'pharmacyName'
      // have been removed from here as part of the transition to API-based data management.
    } catch (error) {
      console.error("Error saving pharmacy profile:", error);
      toast({
        title: "Error Saving Profile",
        description: (error as Error).message || "Could not save pharmacy profile.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading Profile...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Pharmacy Profile" description="Manage your pharmacy's information and details." icon={Store} />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>Pharmacy Information</CardTitle>
              <CardDescription>Keep your pharmacy details up to date. Most fields are required.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="pharmacyName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pharmacy Name *</FormLabel>
                    <FormControl><Input placeholder="e.g., Main Street Pharmacy" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="invoiceTitle" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Invoice Title *</FormLabel>
                    <FormControl><Input placeholder="e.g., Tax Invoice, Pharmacy Bill" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <Separator />
              <div>
                <h3 className="text-lg font-medium mb-2">Address Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="addressStreet" render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Street Address *</FormLabel>
                      <FormControl><Input placeholder="e.g., 123 Main St" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="addressCity" render={({ field }) => (
                    <FormItem>
                      <FormLabel>City *</FormLabel>
                      <FormControl><Input placeholder="e.g., Anytown" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="addressState" render={({ field }) => (
                    <FormItem>
                      <FormLabel>State / Province *</FormLabel>
                      <FormControl><Input placeholder="e.g., CA" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="addressZipCode" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Zip / Postal Code *</FormLabel>
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
                      <FormLabel>Contact Number *</FormLabel>
                      <FormControl><Input type="tel" placeholder="e.g., (555) 123-4567" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="emailAddress" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address *</FormLabel>
                      <FormControl><Input type="email" placeholder="e.g., contact@pharmacy.com" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>

              <Separator />
              <div>
                <h3 className="text-lg font-medium mb-2">Professional & Tax Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="licenseNumber" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pharmacy License Number *</FormLabel>
                      <FormControl><Input placeholder="e.g., PH12345678" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="pharmacistInCharge" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pharmacist-in-Charge *</FormLabel>
                      <FormControl><Input placeholder="e.g., Dr. Jane Doe" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                   <FormField control={form.control} name="gstin" render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>GSTIN (Optional)</FormLabel>
                      <FormControl><Input placeholder="e.g., 22AAAAA0000A1Z5" {...field} /></FormControl>
                      <FormDescription>Your 15-digit Goods and Services Tax Identification Number.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>

            </CardContent>
            <CardFooter>
              <Button type="submit" className="ml-auto" disabled={isSubmitting || isLoading}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                {isSubmitting ? "Saving..." : "Save Profile"}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
}
