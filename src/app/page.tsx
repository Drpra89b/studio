
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { FilePlus2, User, BriefcaseMedical, Trash2, PlusCircle, Search as SearchIcon, XCircle, Hash, Phone } from "lucide-react";

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
// Note: BillItem from view-bills/page.tsx might need adjustment for tax fields
// For now, NewBill page will use its own item structure internally and map for TodaysBill

const DOCTORS_STORAGE_KEY = "managedDoctorsList";
const MANUAL_ENTRY_DOCTOR = "Dr. Other (Manual Entry)";
const DEFAULT_DOCTORS_FALLBACK = [MANUAL_ENTRY_DOCTOR];
const IS_TAX_ENABLED_KEY = "isTaxEnabled";
const DEFAULT_GST_RATE_KEY = "defaultGstRate";


interface CurrentBillItem {
  id: string;
  medicationName: string;
  quantity: number;
  pricePerUnit: number; // This will be PRE-TAX if taxes are enabled
  taxRate: number; // Percentage
  gstAmount: number;
  totalPrice: number; // This will be POST-TAX if taxes are enabled
}

const billItemSchemaForForm = z.object({ // Schema for items array in form
  medicationName: z.string().min(1, "Medication name is required."),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1."),
  pricePerUnit: z.coerce.number().min(0.01, "Price must be positive."),
  // taxRate and gstAmount are calculated, not directly input into this specific schema part of the form
});


const billFormSchema = z.object({
  patientName: z.string().min(2, { message: "Patient name must be at least 2 characters." }),
  patientMobileNumber: z.string().optional().refine(val => !val || val.length === 0 || (val.length >= 10 && /^\d+$/.test(val)), {
    message: "Mobile number must be at least 10 digits and contain only numbers.",
  }),
  doctorName: z.string().min(2, { message: "Doctor name must be at least 2 characters." }),
  billDate: z.date({ required_error: "Bill date is required." }).optional().or(z.null()),
  items: z.array(billItemSchemaForForm).min(1, "At least one medication item is required."),
});

type BillFormValues = z.infer<typeof billFormSchema>;

export interface TodaysBill {
  id: string;
  billNumber: string;
  patientName: string;
  patientMobileNumber?: string;
  doctorName: string;
  date: string;
  items: CurrentBillItem[]; // Use the detailed item structure
  subTotal: number;
  totalGstAmount: number;
  totalAmount: number; // Final grand total
  isTaxApplied: boolean;
  gstRateApplied?: number; // The global rate used for this bill
}

interface SampleMedication {
  id: string;
  name: string;
  pricePerUnit: number; // Assumed to be pre-tax
}

const sampleMedications: SampleMedication[] = [
  { id: 'med1', name: 'Paracetamol 500mg Tablet', pricePerUnit: 20.00 },
  { id: 'med2', name: 'Amoxicillin 250mg Capsule', pricePerUnit: 45.00 },
  { id: 'med3', name: 'Ibuprofen 200mg Syrup', pricePerUnit: 25.00 },
  { id: 'med4', name: 'Vitamin C Tablets (Chewable)', pricePerUnit: 10.00 },
  { id: 'med5', name: 'Cough Syrup (Herbal)', pricePerUnit: 70.00 },
  { id: 'med6', name: 'Aspirin 75mg', pricePerUnit: 12.00 },
  { id: 'med7', name: 'Omeprazole 20mg', pricePerUnit: 35.00 },
];


export default function NewBillPage() {
  const { toast } = useToast();
  const [billNumber, setBillNumber] = React.useState<string | null>(null);
  const [todaysBills, setTodaysBills] = React.useState<TodaysBill[]>([]);
  
  const [medicationSearchTerm, setMedicationSearchTerm] = React.useState("");
  const [medicationSearchResults, setMedicationSearchResults] = React.useState<SampleMedication[]>([]);
  const [selectedMedication, setSelectedMedication] = React.useState<SampleMedication | null>(null);
  const [currentQuantity, setCurrentQuantity] = React.useState<number | string>(1);
  const [currentBillItems, setCurrentBillItems] = React.useState<CurrentBillItem[]>([]);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  const [doctorsForDropdown, setDoctorsForDropdown] = React.useState<string[]>(DEFAULT_DOCTORS_FALLBACK);
  const [selectedDoctor, setSelectedDoctor] = React.useState<string>("");
  const [manualDoctorName, setManualDoctorName] = React.useState<string>("");

  const [isTaxEnabled, setIsTaxEnabled] = React.useState(false);
  const [defaultGstRate, setDefaultGstRate] = React.useState(0);


  const form = useForm<BillFormValues>({
    resolver: zodResolver(billFormSchema),
    defaultValues: {
      patientName: "",
      patientMobileNumber: "",
      doctorName: "",
      billDate: undefined, 
      items: [], 
    },
  });

  React.useEffect(() => {
    form.setValue('billDate', new Date());
    setBillNumber(`BILL-${Date.now().toString().slice(-6)}`);

    if (typeof window !== 'undefined') {
      const storedTaxEnabled = localStorage.getItem(IS_TAX_ENABLED_KEY);
      setIsTaxEnabled(storedTaxEnabled === 'true');
      const storedGstRate = localStorage.getItem(DEFAULT_GST_RATE_KEY);
      setDefaultGstRate(storedGstRate ? parseFloat(storedGstRate) : 0);
      
      const storedDoctors = localStorage.getItem(DOCTORS_STORAGE_KEY);
      let finalDoctorList: string[] = []; 
      if (storedDoctors) {
        try {
          const parsedDoctorsFromStorage: string[] = JSON.parse(storedDoctors);
          if (Array.isArray(parsedDoctorsFromStorage)) {
            finalDoctorList = parsedDoctorsFromStorage;
          }
        } catch (e) {
          console.error("Failed to parse doctors list from localStorage for New Bill page", e);
        }
      }
      const combinedDoctors = Array.from(new Set([MANUAL_ENTRY_DOCTOR, ...finalDoctorList, ...DEFAULT_DOCTORS_FALLBACK]));
      setDoctorsForDropdown(combinedDoctors);
    }
  }, [form]);

  const handleDoctorSelect = (value: string) => {
    setSelectedDoctor(value);
    if (value !== MANUAL_ENTRY_DOCTOR) {
      form.setValue("doctorName", value, { shouldValidate: true });
      setManualDoctorName("");
    } else {
      form.setValue("doctorName", manualDoctorName, { shouldValidate: true }); 
    }
  };

  const handleManualDoctorNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setManualDoctorName(e.target.value);
    if (selectedDoctor === MANUAL_ENTRY_DOCTOR) {
      form.setValue("doctorName", e.target.value, { shouldValidate: true });
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

    const pricePerUnit = selectedMedication.pricePerUnit;
    let itemGstAmount = 0;
    let itemTotalPrice = quantityNum * pricePerUnit;
    const itemTaxRate = isTaxEnabled ? defaultGstRate : 0;

    if (isTaxEnabled && defaultGstRate > 0) {
      itemGstAmount = (itemTotalPrice * defaultGstRate) / 100;
      itemTotalPrice += itemGstAmount;
    }

    const newItem: CurrentBillItem = {
      id: `item-${Date.now()}`, 
      medicationName: selectedMedication.name,
      quantity: quantityNum,
      pricePerUnit: pricePerUnit, // pre-tax
      taxRate: itemTaxRate,
      gstAmount: itemGstAmount,
      totalPrice: itemTotalPrice, // post-tax
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

  const { subTotal, totalGstAmount, grandTotal } = React.useMemo(() => {
    const sub = currentBillItems.reduce((acc, item) => acc + (item.quantity * item.pricePerUnit), 0);
    const gst = currentBillItems.reduce((acc, item) => acc + item.gstAmount, 0);
    return {
      subTotal: sub,
      totalGstAmount: gst,
      grandTotal: sub + gst,
    };
  }, [currentBillItems]);

  React.useEffect(() => {
    const itemsForFormValidation = currentBillItems.map(item => ({
      medicationName: item.medicationName,
      quantity: item.quantity,
      pricePerUnit: item.pricePerUnit, // This is pre-tax price
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
      patientMobileNumber: data.patientMobileNumber,
      doctorName: data.doctorName,
      date: finalBillDate.toLocaleDateString('en-CA'), 
      items: currentBillItems,
      subTotal: subTotal,
      totalGstAmount: totalGstAmount,
      totalAmount: grandTotal,
      isTaxApplied: isTaxEnabled,
      gstRateApplied: isTaxEnabled ? defaultGstRate : undefined,
    };
    setTodaysBills(prevBills => [newBill, ...prevBills]);
    toast({
      title: "Bill Created",
      description: `Bill ${billNumber} for ${data.patientName} has been generated. Amount: ₹${grandTotal.toFixed(2)}`,
    });
    
    form.reset({ 
      billDate: new Date(), 
      patientName: "", 
      patientMobileNumber: "",
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
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="billNumber">Bill Number</Label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="billNumber" value={billNumber ?? "Generating..."} readOnly className="bg-muted cursor-not-allowed pl-10" />
                  </div>
                </div>
                 <FormField control={form.control} name="billDate" render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="mb-1.5">Bill Date *</FormLabel>
                    <DatePicker date={field.value || undefined} setDate={field.onChange} className="h-10" />
                    <FormMessage />
                  </FormItem>
                )} />
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
                <FormField control={form.control} name="patientMobileNumber" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Patient Mobile Number</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input type="tel" placeholder="Enter mobile number" {...field} className="pl-10" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              
                <FormField control={form.control} name="doctorName" render={({ field }) => ( <FormItem className="hidden"><FormControl><Input {...field} /></FormControl><FormMessage/></FormItem> )} />
                <FormItem className="md:col-span-2"> {/* Doctor name spans both columns on md screens */}
                  <FormLabel>Doctor Name (Select or Enter) *</FormLabel>
                  <Select onValueChange={handleDoctorSelect} value={selectedDoctor}>
                    <FormControl>
                      <SelectTrigger className="h-10">
                        <BriefcaseMedical className="mr-2 h-4 w-4 text-muted-foreground" />
                        <SelectValue placeholder="Select a doctor or choose manual entry" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {doctorsForDropdown.map(doc => (<SelectItem key={doc} value={doc}>{doc}</SelectItem>))}
                    </SelectContent>
                  </Select>
                  {selectedDoctor === MANUAL_ENTRY_DOCTOR && (
                    <FormControl className="mt-2">
                      <div className="relative">
                        <BriefcaseMedical className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Enter doctor's name manually" value={manualDoctorName} onChange={handleManualDoctorNameChange} className="pl-10" />
                      </div>
                    </FormControl>
                  )}
                  <FormMessage>{form.formState.errors.doctorName?.message}</FormMessage>
                </FormItem>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Medication Items *</CardTitle>
              <CardDescription>
                Search, add, and manage medication items for this bill. 
                {isTaxEnabled && ` Current GST Rate: ${defaultGstRate}%`}
              </CardDescription>
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
                          {med.name} (₹{med.pricePerUnit.toFixed(2)}{isTaxEnabled ? " pre-tax" : ""})
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
                    {/* This FormMessage will show "At least one medication item is required." if form.items is empty on submit */}
                    <FormMessage /> 
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
                          <TableHead>Medication</TableHead>
                          <TableHead className="text-center">Qty</TableHead>
                          <TableHead className="text-right">Price/Unit{isTaxEnabled ? " (Pre-Tax)" : ""}</TableHead>
                          {isTaxEnabled && (
                            <>
                              <TableHead className="text-right">GST ({defaultGstRate}%)</TableHead>
                              <TableHead className="text-right">GST Amt.</TableHead>
                            </>
                          )}
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
                            {isTaxEnabled && (
                              <>
                                <TableCell className="text-right">{item.taxRate.toFixed(2)}%</TableCell>
                                <TableCell className="text-right">₹{item.gstAmount.toFixed(2)}</TableCell>
                              </>
                            )}
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
                    <div className="w-full max-w-sm space-y-1 text-right">
                      {isTaxEnabled && (
                        <>
                          <div className="flex justify-between text-md">
                            <span>Subtotal (Pre-Tax):</span>
                            <span>₹{subTotal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-md">
                            <span>Total GST ({defaultGstRate}%):</span>
                            <span>₹{totalGstAmount.toFixed(2)}</span>
                          </div>
                        </>
                      )}
                      <div className="flex justify-between text-lg font-semibold">
                        <span>Grand Total:</span>
                        <span>₹{grandTotal.toFixed(2)}</span>
                      </div>
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
                    <TableHead>Mobile</TableHead>
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
                      <TableCell>{bill.patientMobileNumber || '-'}</TableCell>
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
    
