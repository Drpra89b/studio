
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { FilePlus2, User, BriefcaseMedical, Trash2, PlusCircle, Search as SearchIcon, XCircle, Hash } from "lucide-react";

import PageHeader from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/shared/date-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import type { BillItem } from "@/app/view-bills/page"; // Import BillItem type

// Schema for individual item validation when adding to the form (not for the temporary list)
const billItemSchema = z.object({
  medicationName: z.string().min(1, "Medication name is required."),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1."),
  pricePerUnit: z.coerce.number().min(0.01, "Price must be positive."),
});

const billFormSchema = z.object({
  patientName: z.string().min(2, { message: "Patient name must be at least 2 characters." }),
  doctorName: z.string().min(2, { message: "Doctor name must be at least 2 characters." }),
  billDate: z.date({ required_error: "Bill date is required." }).optional().or(z.null()),
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
  items: BillItem[]; // This BillItem is from view-bills/page.tsx
}

interface SampleMedication {
  id: string;
  name: string;
  pricePerUnit: number;
  // stock?: number; // Optional: for future stock checking
}

const sampleMedications: SampleMedication[] = [
  { id: 'med1', name: 'Paracetamol 500mg Tablet', pricePerUnit: 25.50 },
  { id: 'med2', name: 'Amoxicillin 250mg Capsule', pricePerUnit: 50.75 },
  { id: 'med3', name: 'Ibuprofen 200mg Syrup', pricePerUnit: 30.00 },
  { id: 'med4', name: 'Vitamin C Tablets (Chewable)', pricePerUnit: 12.00 },
  { id: 'med5', name: 'Cough Syrup (Herbal)', pricePerUnit: 80.00 },
  { id: 'med6', name: 'Aspirin 75mg', pricePerUnit: 15.00 },
  { id: 'med7', name: 'Omeprazole 20mg', pricePerUnit: 40.00 },
];


export default function NewBillPage() {
  const { toast } = useToast();
  const [billNumber, setBillNumber] = React.useState<string | null>(null);
  const [todaysBills, setTodaysBills] = React.useState<TodaysBill[]>([]);
  
  const [medicationSearchTerm, setMedicationSearchTerm] = React.useState("");
  const [medicationSearchResults, setMedicationSearchResults] = React.useState<SampleMedication[]>([]);
  const [selectedMedication, setSelectedMedication] = React.useState<SampleMedication | null>(null);
  const [currentQuantity, setCurrentQuantity] = React.useState<number | string>(1);
  const [currentBillItems, setCurrentBillItems] = React.useState<BillItem[]>([]);
  const searchInputRef = React.useRef<HTMLInputElement>(null);


  const form = useForm<BillFormValues>({
    resolver: zodResolver(billFormSchema),
    defaultValues: {
      patientName: "",
      doctorName: "",
      billDate: undefined, // Initialize as undefined to prevent hydration mismatch
      items: [], 
    },
  });

  React.useEffect(() => {
    // Set initial values on client mount to avoid hydration mismatch
    form.setValue('billDate', new Date());
    setBillNumber(`BILL-${Date.now().toString().slice(-6)}`);
  }, [form]);


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

  React.useEffect(() => {
    if (medicationSearchTerm.trim() === "") {
      setMedicationSearchResults([]);
      return;
    }
    const results = sampleMedications.filter(med =>
      med.name.toLowerCase().includes(medicationSearchTerm.toLowerCase())
    );
    setMedicationSearchResults(results);
  }, [medicationSearchTerm]);

  const handleMedicationSelect = (medication: SampleMedication) => {
    setSelectedMedication(medication);
    setMedicationSearchTerm(medication.name); 
    setMedicationSearchResults([]); 
    setCurrentQuantity(1); 
    // document.getElementById('itemQuantityInput')?.focus();
  };
  
  const handleAddItemToBill = () => {
    if (!selectedMedication) {
      toast({ title: "Error", description: "Please select a medication.", variant: "destructive" });
      return;
    }
    const quantityNum = Number(currentQuantity);
    if (isNaN(quantityNum) || quantityNum <= 0) {
      toast({ title: "Error", description: "Please enter a valid quantity.", variant: "destructive" });
      return;
    }

    const newItem: BillItem = {
      id: `item-${Date.now()}`, 
      medicationName: selectedMedication.name,
      quantity: quantityNum,
      pricePerUnit: selectedMedication.pricePerUnit,
      totalPrice: quantityNum * selectedMedication.pricePerUnit,
    };
    setCurrentBillItems(prevItems => [...prevItems, newItem]);

    setSelectedMedication(null);
    setMedicationSearchTerm("");
    setCurrentQuantity(1);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handleRemoveItemFromBill = (itemId: string) => {
    setCurrentBillItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };

  const grandTotal = React.useMemo(() => {
    return currentBillItems.reduce((total, item) => total + item.totalPrice, 0);
  }, [currentBillItems]);

  // Synchronize currentBillItems with the form's "items" field for validation
  React.useEffect(() => {
    const itemsForFormValidation = currentBillItems.map(item => ({
      medicationName: item.medicationName,
      quantity: item.quantity,
      pricePerUnit: item.pricePerUnit,
    }));
    form.setValue("items", itemsForFormValidation, { shouldValidate: true });
  }, [currentBillItems, form]);

  function onSubmit(data: BillFormValues) {
    if (!billNumber) {
      toast({ title: "Error", description: "Bill number not generated yet.", variant: "destructive" });
      return;
    }
    
    const finalBillDate = data.billDate || new Date();

    const newBill: TodaysBill = {
      id: Date.now().toString(),
      billNumber: billNumber,
      patientName: data.patientName,
      doctorName: data.doctorName,
      date: finalBillDate.toLocaleDateString('en-CA'), 
      totalAmount: grandTotal,
      items: currentBillItems, 
    };
    setTodaysBills(prevBills => [newBill, ...prevBills]);
    toast({
      title: "Bill Created",
      description: `Bill ${billNumber} for ${data.patientName} has been generated. Amount: ₹${grandTotal.toFixed(2)}`,
    });
    
    form.reset({ 
      billDate: new Date(), 
      patientName: "", 
      doctorName: "",
      items: [], 
    });
    setCurrentBillItems([]); 
    setSelectedDoctor("");
    setManualDoctorName("");
    setMedicationSearchTerm("");
    setSelectedMedication(null);
    setCurrentQuantity(1);
    setBillNumber(`BILL-${Date.now().toString().slice(-6)}`);
  }

  return (
    <div className="space-y-6">
      <PageHeader title="New Bill" description="Create a new bill for a patient." icon={FilePlus2} />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>Bill Details</CardTitle>
              <CardDescription>Fill in the patient and doctor information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="billNumber">Bill Number</Label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="billNumber" value={billNumber ?? "Generating..."} readOnly className="bg-muted cursor-not-allowed pl-10" />
                  </div>
                </div>
                <FormField control={form.control} name="patientName" render={({ field }) => (
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
                )} />
                <FormField control={form.control} name="billDate" render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="mb-1.5">Bill Date *</FormLabel>
                    <DatePicker date={field.value || undefined} setDate={field.onChange} className="h-10" />
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              
              <div> {/* Wrapper for Doctor Name section to allow full width */}
                <FormField control={form.control} name="doctorName" render={({ field }) => ( <FormItem className="hidden"><FormControl><Input {...field} /></FormControl><FormMessage/></FormItem> )} />
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
                      {doctors.map(doc => (<SelectItem key={doc} value={doc}>{doc}</SelectItem>))}
                    </SelectContent>
                  </Select>
                  {selectedDoctor === "Dr. Other (Manual Entry)" && (
                    <FormControl className="mt-2">
                      <div className="relative">
                        <BriefcaseMedical className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Enter doctor's name manually" value={manualDoctorName} onChange={handleManualDoctorNameChange} className="pl-10" />
                      </div>
                    </FormControl>
                  )}
                  <FormMessage>{form.formState.errors.doctorName?.message}</FormMessage>
                </FormItem>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Medication Items *</CardTitle>
              <CardDescription>Search, add, and manage medication items for this bill.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_auto] gap-4 items-end p-4 border rounded-lg bg-muted/30">
                <FormItem className="relative">
                  <FormLabel htmlFor="medicationSearch">Search Medication</FormLabel>
                  <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="medicationSearch"
                      ref={searchInputRef}
                      placeholder="Type to search medication..."
                      value={medicationSearchTerm}
                      onChange={(e) => {
                        setMedicationSearchTerm(e.target.value);
                        setSelectedMedication(null); 
                      }}
                      className="pl-10"
                    />
                    {selectedMedication && medicationSearchTerm === selectedMedication.name && (
                       <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => { setSelectedMedication(null); setMedicationSearchTerm(""); searchInputRef.current?.focus(); }}>
                         <XCircle className="h-4 w-4 text-muted-foreground"/>
                       </Button>
                    )}
                  </div>
                  {medicationSearchResults.length > 0 && !selectedMedication && (
                    <div className="absolute z-10 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {medicationSearchResults.map(med => (
                        <div
                          key={med.id}
                          className="p-2 hover:bg-accent cursor-pointer"
                          onClick={() => handleMedicationSelect(med)}
                        >
                          {med.name} (₹{med.pricePerUnit.toFixed(2)})
                        </div>
                      ))}
                    </div>
                  )}
                </FormItem>

                <FormItem>
                  <FormLabel htmlFor="itemQuantityInput">Quantity</FormLabel>
                  <Input
                    id="itemQuantityInput"
                    type="number"
                    placeholder="e.g., 1"
                    value={currentQuantity}
                    onChange={(e) => setCurrentQuantity(e.target.value === "" ? "" : Number(e.target.value))}
                    min="1"
                    disabled={!selectedMedication}
                  />
                </FormItem>
                <Button type="button" onClick={handleAddItemToBill} disabled={!selectedMedication || !currentQuantity || Number(currentQuantity) <= 0}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Item
                </Button>
              </div>
              
              <FormField
                control={form.control}
                name="items"
                render={() => (
                  <FormItem>
                    <FormMessage /> {/* Displays "At least one item required" from Zod */}
                  </FormItem>
                )}
              />

              {currentBillItems.length > 0 && (
                <div className="border-t pt-4">
                  <h3 className="text-md font-medium mb-2">Items Added to Bill:</h3>
                  <div className="overflow-x-auto rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Medication Name</TableHead>
                          <TableHead className="text-center">Quantity</TableHead>
                          <TableHead className="text-right">Price/Unit</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                          <TableHead className="text-center">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentBillItems.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.medicationName}</TableCell>
                            <TableCell className="text-center">{item.quantity}</TableCell>
                            <TableCell className="text-right">₹{item.pricePerUnit.toFixed(2)}</TableCell>
                            <TableCell className="text-right">₹{item.totalPrice.toFixed(2)}</TableCell>
                            <TableCell className="text-center">
                              <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveItemFromBill(item.id)} className="h-8 w-8">
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="mt-4 pt-4 border-t flex justify-end">
                    <div className="text-lg font-semibold">
                      Grand Total: ₹{grandTotal.toFixed(2)}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button type="submit" className="ml-auto" disabled={!billNumber || form.formState.isSubmitting || currentBillItems.length === 0}>
                <FilePlus2 className="mr-2 h-4 w-4" /> 
                {form.formState.isSubmitting ? "Generating..." : "Generate Bill"}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>

      <Card className="mt-6">
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
                      <TableCell className="text-right">₹{bill.totalAmount.toFixed(2)}</TableCell>
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
    

    
