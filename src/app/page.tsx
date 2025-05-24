
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";
import { FilePlus2, User, BriefcaseMedical, Trash2, PlusCircle } from "lucide-react";

import PageHeader from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/shared/date-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import type { BillItem } from "@/app/view-bills/page"; // Import BillItem type

const billItemSchema = z.object({
  id: z.string().optional(), // For react-hook-form key
  medicationName: z.string().min(1, "Medication name is required."),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1."),
  pricePerUnit: z.coerce.number().min(0.01, "Price must be positive."),
});

const billFormSchema = z.object({
  patientName: z.string().min(2, { message: "Patient name must be at least 2 characters." }),
  doctorName: z.string().min(2, { message: "Doctor name must be at least 2 characters." }),
  billDate: z.date({ required_error: "Bill date is required." }),
  items: z.array(billItemSchema).min(1, "At least one medication item is required."),
});

type BillFormValues = z.infer<typeof billFormSchema>;

const doctors = ["Dr. Smith", "Dr. Jones", "Dr. Brown", "Dr. Other (Manual Entry)"];

export interface TodaysBill {
  id: string;
  billNumber: string;
  patientName: string;
  doctorName: string;
  date: string;
  totalAmount: number;
  items: BillItem[];
}

export default function NewBillPage() {
  const { toast } = useToast();
  const [billNumber, setBillNumber] = React.useState<string | null>(null);
  const [todaysBills, setTodaysBills] = React.useState<TodaysBill[]>([]);
  
  React.useEffect(() => {
    // Generate a unique bill number client-side
    setBillNumber(`BILL-${Date.now().toString().slice(-6)}`);
  }, [todaysBills]); // Re-generate if a bill is submitted

  const form = useForm<BillFormValues>({
    resolver: zodResolver(billFormSchema),
    defaultValues: {
      patientName: "",
      doctorName: "",
      billDate: new Date(),
      items: [{ medicationName: "", quantity: 1, pricePerUnit: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const [selectedDoctor, setSelectedDoctor] = React.useState<string>("");
  const [manualDoctorName, setManualDoctorName] = React.useState<string>("");

  const handleDoctorSelect = (value: string) => {
    setSelectedDoctor(value);
    if (value !== "Dr. Other (Manual Entry)") {
      form.setValue("doctorName", value);
      setManualDoctorName("");
    } else {
      form.setValue("doctorName", ""); 
    }
  };

  const handleManualDoctorNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setManualDoctorName(e.target.value);
    if (selectedDoctor === "Dr. Other (Manual Entry)") {
      form.setValue("doctorName", e.target.value);
    }
  };

  const watchedItems = form.watch("items");
  const grandTotal = React.useMemo(() => {
    return watchedItems.reduce((total, item) => {
      const itemTotal = (item.quantity || 0) * (item.pricePerUnit || 0);
      return total + itemTotal;
    }, 0);
  }, [watchedItems]);

  function onSubmit(data: BillFormValues) {
    if (!billNumber) {
      toast({
        title: "Error",
        description: "Bill number not generated yet. Please wait a moment.",
        variant: "destructive",
      });
      return;
    }

    const formattedItems: BillItem[] = data.items.map((item, index) => ({
      id: `item-${Date.now()}-${index}`,
      medicationName: item.medicationName,
      quantity: item.quantity,
      pricePerUnit: item.pricePerUnit,
      totalPrice: item.quantity * item.pricePerUnit,
    }));

    const calculatedTotalAmount = formattedItems.reduce((sum, item) => sum + item.totalPrice, 0);

    const newBill: TodaysBill = {
      id: Date.now().toString(),
      billNumber: billNumber,
      patientName: data.patientName,
      doctorName: data.doctorName,
      date: data.billDate.toLocaleDateString('en-CA'), // Using 'en-CA' for YYYY-MM-DD format for consistency
      totalAmount: calculatedTotalAmount,
      items: formattedItems,
    };
    setTodaysBills(prevBills => [newBill, ...prevBills]);
    toast({
      title: "Bill Created",
      description: `Bill ${billNumber} for ${data.patientName} has been generated. Amount: $${calculatedTotalAmount.toFixed(2)}`,
    });
    
    form.reset({ 
      billDate: new Date(), 
      patientName: "", 
      doctorName: "",
      items: [{ medicationName: "", quantity: 1, pricePerUnit: 0 }],
    });
    setSelectedDoctor("");
    setManualDoctorName("");
    // setBillNumber(null); // useEffect will generate new one based on todaysBills change
  }

  return (
    <div className="space-y-6">
      <PageHeader title="New Bill" description="Create a new bill for a patient." icon={FilePlus2} />

      <Card>
        <CardHeader>
          <CardTitle>Bill Details</CardTitle>
          <CardDescription>Fill in the patient and doctor information to generate a new bill.</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="billNumber">Bill Number</Label>
                  <Input 
                    id="billNumber" 
                    value={billNumber ?? "Generating..."} 
                    readOnly 
                    className="bg-muted cursor-not-allowed" 
                  />
                </div>

                <FormField
                  control={form.control}
                  name="patientName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Patient Name *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input placeholder="Enter patient name" {...field} className="pl-10" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="billDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="mb-1.5">Bill Date *</FormLabel>
                       <DatePicker 
                          date={field.value} 
                          setDate={field.onChange}
                          className="h-10"
                        />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <FormField
                  control={form.control}
                  name="doctorName" 
                  render={({ field }) => ( 
                    <FormItem className="hidden"> 
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormItem>
                  <FormLabel>Doctor Name (Select or Enter) *</FormLabel>
                   <Select onValueChange={handleDoctorSelect} value={selectedDoctor}>
                    <FormControl>
                      <SelectTrigger className="h-10">
                         <BriefcaseMedical className="mr-2 h-4 w-4 text-muted-foreground" />
                        <SelectValue placeholder="Select a doctor or choose manual entry" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {doctors.map(doc => (
                        <SelectItem key={doc} value={doc}>{doc}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedDoctor === "Dr. Other (Manual Entry)" && (
                    <FormControl className="mt-2">
                       <div className="relative">
                          <BriefcaseMedical className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input 
                            placeholder="Enter doctor's name manually" 
                            value={manualDoctorName}
                            onChange={handleManualDoctorNameChange}
                            className="pl-10"
                          />
                        </div>
                    </FormControl>
                  )}
                   <FormMessage>{form.formState.errors.doctorName?.message}</FormMessage>
                </FormItem>
              </div>

              <div className="border-t pt-6 space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-foreground">Medication Items *</h3>
                    <Button type="button" variant="outline" size="sm" onClick={() => append({ medicationName: "", quantity: 1, pricePerUnit: 0 })}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Item
                    </Button>
                </div>
                {form.formState.errors.items && !form.formState.errors.items.root && form.formState.errors.items.message && (
                    <p className="text-sm font-medium text-destructive">{form.formState.errors.items.message}</p>
                )}

                {fields.map((field, index) => {
                  const quantity = form.watch(`items.${index}.quantity`) || 0;
                  const pricePerUnit = form.watch(`items.${index}.pricePerUnit`) || 0;
                  const itemTotal = quantity * pricePerUnit;

                  return (
                    <Card key={field.id} className="p-4 space-y-3 bg-muted/30 relative">
                       <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => remove(index)}
                        disabled={fields.length <= 1}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Remove item</span>
                      </Button>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-start">
                        <FormField
                          control={form.control}
                          name={`items.${index}.medicationName`}
                          render={({ field: formField }) => (
                            <FormItem className="md:col-span-1">
                              <FormLabel>Medication Name</FormLabel>
                              <FormControl><Input placeholder="e.g., Paracetamol 500mg" {...formField} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`items.${index}.quantity`}
                          render={({ field: formField }) => (
                            <FormItem>
                              <FormLabel>Quantity</FormLabel>
                              <FormControl><Input type="number" placeholder="e.g., 10" {...formField} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`items.${index}.pricePerUnit`}
                          render={({ field: formField }) => (
                            <FormItem>
                              <FormLabel>Price/Unit</FormLabel>
                              <FormControl><Input type="number" step="0.01" placeholder="e.g., 2.50" {...formField} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                       <div className="text-right font-medium text-sm">
                          Item Total: ${itemTotal.toFixed(2)}
                       </div>
                        {form.formState.errors.items?.[index] && (
                            <p className="text-xs font-medium text-destructive pt-1">Please fill all fields for this item or remove it.</p>
                        )}
                    </Card>
                  );
                })}
                {fields.length > 0 && (
                    <div className="mt-4 pt-4 border-t flex justify-end">
                        <div className="text-lg font-semibold">
                        Grand Total: ${grandTotal.toFixed(2)}
                        </div>
                    </div>
                )}
              </div>

            </CardContent>
            <CardFooter>
              <Button type="submit" className="ml-auto" disabled={!billNumber || form.formState.isSubmitting}>
                <FilePlus2 className="mr-2 h-4 w-4" /> 
                {form.formState.isSubmitting ? "Generating..." : "Generate Bill"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Today's Bills Generated</CardTitle>
          <CardDescription>A list of bills generated today.</CardDescription>
        </CardHeader>
        <CardContent>
          {todaysBills.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No bills generated today yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bill No.</TableHead>
                    <TableHead>Patient Name</TableHead>
                    <TableHead>Doctor Name</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {todaysBills.map((bill) => (
                    <TableRow key={bill.id}>
                      <TableCell className="font-medium">{bill.billNumber}</TableCell>
                      <TableCell>{bill.patientName}</TableCell>
                      <TableCell>{bill.doctorName}</TableCell>
                      <TableCell>{bill.date}</TableCell>
                      <TableCell className="text-right">${bill.totalAmount.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
    

    