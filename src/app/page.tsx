"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { FilePlus2, User, BriefcaseMedical, CalendarDays } from "lucide-react";

import PageHeader from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/shared/date-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

const billFormSchema = z.object({
  patientName: z.string().min(2, { message: "Patient name must be at least 2 characters." }),
  doctorName: z.string().min(2, { message: "Doctor name must be at least 2 characters." }),
  billDate: z.date({ required_error: "Bill date is required." }),
  // Add more fields for items in the bill later
});

type BillFormValues = z.infer<typeof billFormSchema>;

const doctors = ["Dr. Smith", "Dr. Jones", "Dr. Brown", "Dr. Other (Manual Entry)"];

interface BillItem {
  id: string;
  medication: string;
  quantity: number;
  price: number;
  total: number;
}

interface TodaysBill {
  id: string;
  billNumber: string;
  patientName: string;
  doctorName: string;
  date: string;
  totalAmount: number;
}

export default function NewBillPage() {
  const { toast } = useToast();
  const [billNumber, setBillNumber] = React.useState("");
  const [todaysBills, setTodaysBills] = React.useState<TodaysBill[]>([]);
  
  React.useEffect(() => {
    // Generate a unique bill number (example)
    setBillNumber(`BILL-${Date.now().toString().slice(-6)}`);
  }, []);

  const form = useForm<BillFormValues>({
    resolver: zodResolver(billFormSchema),
    defaultValues: {
      patientName: "",
      doctorName: "",
      billDate: new Date(),
    },
  });

  const [selectedDoctor, setSelectedDoctor] = React.useState<string>("");
  const [manualDoctorName, setManualDoctorName] = React.useState<string>("");

  const handleDoctorSelect = (value: string) => {
    setSelectedDoctor(value);
    if (value !== "Dr. Other (Manual Entry)") {
      form.setValue("doctorName", value);
      setManualDoctorName("");
    } else {
      form.setValue("doctorName", ""); // Clear if switching to manual
    }
  };

  const handleManualDoctorNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setManualDoctorName(e.target.value);
    if (selectedDoctor === "Dr. Other (Manual Entry)") {
      form.setValue("doctorName", e.target.value);
    }
  };

  function onSubmit(data: BillFormValues) {
    const newBill: TodaysBill = {
      id: Date.now().toString(),
      billNumber: billNumber,
      patientName: data.patientName,
      doctorName: data.doctorName,
      date: data.billDate.toLocaleDateString(),
      totalAmount: Math.floor(Math.random() * 500) + 50, // Placeholder amount
    };
    setTodaysBills(prevBills => [newBill, ...prevBills]);
    toast({
      title: "Bill Created",
      description: `Bill ${billNumber} for ${data.patientName} has been generated.`,
    });
    // Reset form and generate new bill number
    form.reset({ billDate: new Date(), patientName: "", doctorName: "" });
    setSelectedDoctor("");
    setManualDoctorName("");
    setBillNumber(`BILL-${Date.now().toString().slice(-6)}`);
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
                  <Input id="billNumber" value={billNumber} readOnly className="bg-muted cursor-not-allowed" />
                </div>

                <FormField
                  control={form.control}
                  name="patientName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Patient Name</FormLabel>
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
                      <FormLabel className="mb-1.5">Bill Date</FormLabel>
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
                  name="doctorName" // This field will be populated by either select or manual input
                  render={({ field }) => ( // Keep this field for react-hook-form to track the final doctor name
                    <FormItem className="hidden"> 
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormItem>
                  <FormLabel>Doctor Name (Select or Enter)</FormLabel>
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

              {/* Placeholder for medication items - to be implemented later */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-foreground mb-2">Medication Items</h3>
                <p className="text-sm text-muted-foreground">
                  (Functionality to add medication items to the bill will be implemented here.)
                </p>
              </div>

            </CardContent>
            <CardFooter>
              <Button type="submit" className="ml-auto">
                <FilePlus2 className="mr-2 h-4 w-4" /> Generate Bill
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
