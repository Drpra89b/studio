"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import PageHeader from "@/components/shared/page-header";
import { PackagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/shared/date-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

const stockFormSchema = z.object({
  name: z.string().min(2, "Medication name is required."),
  companyName: z.string().min(2, "Company name is required."),
  type: z.enum(["Tablet", "Capsule", "Injection", "Syrup", "Drops", "Ointment", "Other"], { required_error: "Medication type is required." }),
  batch: z.string().min(1, "Batch number is required."),
  manufacturingDate: z.date({ required_error: "Manufacturing date is required." }),
  expiryDate: z.date({ required_error: "Expiry date is required." }),
  pricePerPacking: z.coerce.number().positive("Price must be positive."),
  itemsInPack: z.coerce.number().int().positive("Items in pack must be a positive integer."),
  quantityOfStrips: z.coerce.number().int().positive("Quantity of strips/packs must be a positive integer."),
  localQuantity: z.coerce.number().int().optional(), // This could be individual units if itemsInPack is > 1
  shelfName: z.string().optional(),
  gstHsnCode: z.string().min(3, "HSN code is required.").max(8, "HSN code too long."),
});

type StockFormValues = z.infer<typeof stockFormSchema>;

const medicationTypes = ["Tablet", "Capsule", "Injection", "Syrup", "Drops", "Ointment", "Other"];

export default function AddStockPage() {
  const { toast } = useToast();
  const form = useForm<StockFormValues>({
    resolver: zodResolver(stockFormSchema),
    defaultValues: {
      name: "",
      companyName: "",
      batch: "",
      pricePerPacking: 0,
      itemsInPack: 1,
      quantityOfStrips: 1,
      gstHsnCode: "",
    },
  });

  function onSubmit(data: StockFormValues) {
    console.log(data);
    toast({
      title: "Stock Added",
      description: `${data.name} (Batch: ${data.batch}) has been added to stock.`,
    });
    form.reset();
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Add New Stock" description="Enter details to add new medication to your inventory." icon={PackagePlus} />

      <Card>
        <CardHeader>
          <CardTitle>Medication Details</CardTitle>
          <CardDescription>All fields marked with * are required.</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Medication Name *</FormLabel>
                    <FormControl><Input placeholder="e.g., Paracetamol 500mg" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="companyName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name *</FormLabel>
                    <FormControl><Input placeholder="e.g., Pharma Inc." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="type" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select medication type" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {medicationTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="batch" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Batch Number *</FormLabel>
                    <FormControl><Input placeholder="e.g., BATCH123X" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="manufacturingDate" render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="mb-1.5">Manufacturing Date *</FormLabel>
                    <DatePicker date={field.value} setDate={field.onChange} />
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="expiryDate" render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="mb-1.5">Expiry Date *</FormLabel>
                    <DatePicker date={field.value} setDate={field.onChange} disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() -1 )) } />
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="pricePerPacking" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price Per Packing (e.g., Strip/Bottle) *</FormLabel>
                    <FormControl><Input type="number" step="0.01" placeholder="e.g., 25.50" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="itemsInPack" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Items in Pack (e.g., 10 for a strip of 10 tablets) *</FormLabel>
                    <FormControl><Input type="number" placeholder="e.g., 10" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="quantityOfStrips" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity (Strips/Packs) *</FormLabel>
                    <FormControl><Input type="number" placeholder="e.g., 100" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="localQuantity" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Local Quantity (Individual Units)</FormLabel>
                    <FormControl><Input type="number" placeholder="e.g., for specific tracking" {...field} /></FormControl>
                    <FormDescription>Optional, e.g., number of loose tablets.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="shelfName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Shelf Name/Location</FormLabel>
                    <FormControl><Input placeholder="e.g., Rack A1, Fridge" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="gstHsnCode" render={({ field }) => (
                  <FormItem>
                    <FormLabel>GST HSN Code *</FormLabel>
                    <FormControl><Input placeholder="e.g., 300490" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="ml-auto">
                <PackagePlus className="mr-2 h-4 w-4" /> Add to Stock
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
