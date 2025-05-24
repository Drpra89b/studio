
"use client";

import * as React from "react";
import Link from "next/link";
import PageHeader from "@/components/shared/page-header";
import { ListOrdered, Search, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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
  notes?: string;
  isTaxApplied?: boolean; // Flag to indicate if tax was applied
  gstRateApplied?: number; // The global rate used for this bill, if tax applied
}

// Sample bills removed. Data should come from dynamic sources (e.g., New Bill page's TodaysBills or a backend).
const sampleBills: Bill[] = [];

export const getSampleBills = (): Bill[] => {
  // This function would ideally fetch bills from a backend or a more persistent client-side store.
  // For now, it returns an empty array as sampleBills is cleared.
  return sampleBills;
};

export const getBillById = (id: string): Bill | undefined => {
    // This function needs to be adapted if bills are no longer in a simple `sampleBills` array.
    // For now, it will search the empty `sampleBills`.
    // In a real app, this would fetch from a backend or a more persistent client-side store.
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
    // In a real app, fetch bills here, e.g., from TodaysBills generated on NewBillPage,
    // or from a backend. For now, sampleBills is empty.
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
