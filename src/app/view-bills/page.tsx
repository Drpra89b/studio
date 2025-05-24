
"use client";

import * as React from "react";
import Link from "next/link";
import PageHeader from "@/components/shared/page-header";
import { ListOrdered, Search, FileText } from "lucide-react"; // Removed Phone as it's part of bill details
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface BillItem {
  id: string;
  medicationName: string;
  quantity: number;
  pricePerUnit: number; // Pre-tax if tax applied
  taxRate?: number; // Optional: GST rate applied to this item
  gstAmount?: number; // Optional: GST amount for this item
  totalPrice: number; // Post-tax if tax applied
}

export interface Bill {
  id: string;
  billNumber: string;
  patientName: string;
  patientMobileNumber?: string;
  doctorName: string;
  date: string; 
  items: BillItem[];
  subTotal?: number; // Optional: Total before tax
  totalGstAmount?: number; // Optional: Total GST amount for the bill
  totalAmount: number; // Final amount (post-tax if tax applied)
  status: "Paid" | "Pending" | "Cancelled";
  paymentMethod?: string;
  notes?: string;
  isTaxApplied?: boolean; // Flag to indicate if tax was applied
  gstRateApplied?: number; // The global rate used for this bill, if tax applied
}

// Sample bills updated to reflect potential tax structure
const sampleBills: Bill[] = [
  {
    id: "1",
    billNumber: "BILL-789012",
    patientName: "Alice Wonderland",
    patientMobileNumber: "9876543210",
    doctorName: "Dr. Smith",
    date: new Date("2024-07-20").toISOString(),
    items: [
      { id: "item1", medicationName: "Paracetamol 500mg", quantity: 2, pricePerUnit: 223.44, taxRate: 12, gstAmount: 53.62, totalPrice: 500.50 },
      { id: "item2", medicationName: "Amoxicillin 250mg", quantity: 1, pricePerUnit: 674.11, taxRate: 12, gstAmount: 80.89, totalPrice: 755.00 },
    ],
    subTotal: 897.55, // (2*223.44) + 674.11
    totalGstAmount: 134.63, // 53.62 + 80.89 - slight rounding might occur if calculated from item totals
    totalAmount: 1255.50, // Sum of item totalPrices OR subTotal + totalGstAmount
    status: "Paid",
    paymentMethod: "Credit Card",
    notes: "Patient requested a digital copy.",
    isTaxApplied: true,
    gstRateApplied: 12,
  },
  {
    id: "2",
    billNumber: "BILL-789013",
    patientName: "Bob The Builder",
    patientMobileNumber: "8765432109",
    doctorName: "Dr. Jones",
    date: new Date("2024-07-20").toISOString(),
    items: [
      { id: "item3", medicationName: "Ibuprofen 200mg", quantity: 3, pricePerUnit: 250.00, totalPrice: 750.00 }, // Assuming no tax
    ],
    totalAmount: 750.00, // No tax, so subTotal and totalAmount are same if tax fields are absent
    status: "Pending",
    paymentMethod: "Cash",
    isTaxApplied: false,
  },
  {
    id: "3",
    billNumber: "BILL-789014",
    patientName: "Charlie Brown",
    doctorName: "Dr. Smith",
    date: new Date("2024-07-19").toISOString(),
    items: [
      { id: "item4", medicationName: "Vitamin C Tablets", quantity: 5, pricePerUnit: 90.31, taxRate: 10, gstAmount: 45.16, totalPrice: 500.75 }, // Example with different rate
      { id: "item5", medicationName: "Cough Syrup", quantity: 2, pricePerUnit: 730.45, taxRate: 10, gstAmount: 146.09, totalPrice: 1607.00 },
    ],
    subTotal: 1911.95, // (5*90.31) + (2*730.45)
    totalGstAmount: 191.25,
    totalAmount: 2107.75,
    status: "Paid",
    notes: "Follow up in a week.",
    isTaxApplied: true,
    gstRateApplied: 10,
  },
  {
    id: "4",
    billNumber: "BILL-789015",
    patientName: "Diana Prince",
    patientMobileNumber: "7654321098",
    doctorName: "Dr. Brown",
    date: new Date("2024-07-19").toISOString(),
    items: [
      { id: "item6", medicationName: "Band-Aids (Box)", quantity: 1, pricePerUnit: 552.00, totalPrice: 552.00 },
    ],
    totalAmount: 552.00,
    status: "Cancelled",
    isTaxApplied: false,
  },
  {
    id: "5",
    billNumber: "BILL-789016",
    patientName: "Edward Scissorhands",
    doctorName: "Dr. Jones",
    date: new Date("2024-07-18").toISOString(),
    items: [
      { id: "item7", medicationName: "Aspirin 75mg", quantity: 10, pricePerUnit: 133.93, taxRate: 12, gstAmount: 16.07*10, totalPrice: 1500.00 }, // Price per unit adjusted for 12% GST example
    ],
    subTotal: 1339.30,
    totalGstAmount: 160.70,
    totalAmount: 1500.00,
    status: "Paid",
    paymentMethod: "Insurance",
    isTaxApplied: true,
    gstRateApplied: 12
  },
];

// Function to get all bills (could be from API in future)
export const getSampleBills = (): Bill[] => {
  // In a real app, this might fetch from localStorage or an API and map data
  return sampleBills.map(bill => ({
    ...bill,
    // Ensure essential fields for display, even if not fully populated in sample data
    subTotal: bill.isTaxApplied ? bill.subTotal : bill.totalAmount, 
    totalGstAmount: bill.isTaxApplied ? bill.totalGstAmount : 0,
  }));
};

export const getBillById = (id: string): Bill | undefined => {
    const bill = sampleBills.find(b => b.id === id);
    if (bill) {
        return {
            ...bill,
            subTotal: bill.isTaxApplied ? bill.subTotal : bill.totalAmount,
            totalGstAmount: bill.isTaxApplied ? bill.totalGstAmount : 0,
        };
    }
    return undefined;
};


export default function ViewBillsPage() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [allBills, setAllBills] = React.useState<Bill[]>([]);

  React.useEffect(() => {
    setAllBills(getSampleBills());
  }, []);

  const filteredBills = React.useMemo(() => {
    if (!searchTerm) return allBills;
    return allBills.filter(bill =>
      bill.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.billNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (bill.patientMobileNumber && bill.patientMobileNumber.includes(searchTerm))
    );
  }, [searchTerm, allBills]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-6">
      <PageHeader title="View Bills" description="Check all previous bills and search for specific patients or bill numbers." icon={ListOrdered} />

      <Card>
        <CardHeader>
          <CardTitle>Bill Records</CardTitle>
          <CardDescription>Browse through all generated bills.</CardDescription>
          <div className="pt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by patient name, mobile, or bill number..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full max-w-md pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredBills.length === 0 ? (
             <p className="text-sm text-muted-foreground text-center py-4">
              {searchTerm ? "No bills found matching your search." : "No bills available."}
            </p>
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
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBills.map((bill) => (
                    <TableRow key={bill.id}>
                      <TableCell className="font-medium">{bill.billNumber}</TableCell>
                      <TableCell>{bill.patientName}</TableCell>
                      <TableCell>{bill.patientMobileNumber || '-'}</TableCell>
                      <TableCell>{bill.doctorName}</TableCell>
                      <TableCell>{formatDate(bill.date)}</TableCell>
                      <TableCell>
                        <Badge variant={
                          bill.status === "Paid" ? "default" :
                          bill.status === "Pending" ? "secondary" : 
                          "destructive"
                        }
                        className={cn(
                          bill.status === "Paid" && "bg-green-500 hover:bg-green-600 text-white",
                          bill.status === "Pending" && "bg-yellow-500 hover:bg-yellow-600 text-black",
                          bill.status === "Cancelled" && "bg-red-500 hover:bg-red-600 text-white"
                        )}
                        >
                          {bill.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">₹{bill.totalAmount.toFixed(2)}</TableCell>
                      <TableCell className="text-center">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/view-bills/${bill.id}`}>
                             <FileText className="mr-2 h-4 w-4" /> View
                          </Link>
                        </Button>
                      </TableCell>
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

    
