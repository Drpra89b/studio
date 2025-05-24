
"use client";

import * as React from "react";
import Link from "next/link";
import PageHeader from "@/components/shared/page-header";
import { ListOrdered, Search, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface BillItem {
  id: string;
  medicationName: string;
  batchNo: string;
  expiryDate: string;
  quantity: number;
  pricePerUnit: number;
  totalPrice: number;
}

export interface Bill {
  id: string;
  billNumber: string;
  patientName: string;
  doctorName: string;
  date: string; // ISO string for consistency, format for display
  totalAmount: number;
  status: "Paid" | "Pending" | "Cancelled";
  items: BillItem[];
  paymentMethod?: string;
  notes?: string;
}

const sampleBills: Bill[] = [
  {
    id: "1",
    billNumber: "BILL-789012",
    patientName: "Alice Wonderland",
    doctorName: "Dr. Smith",
    date: new Date("2024-07-20").toISOString(),
    totalAmount: 125.50,
    status: "Paid",
    items: [
      { id: "item1", medicationName: "Paracetamol 500mg", batchNo: "P123", expiryDate: "2025-12-31", quantity: 20, pricePerUnit: 2.50, totalPrice: 50.00 },
      { id: "item2", medicationName: "Amoxicillin 250mg", batchNo: "A098", expiryDate: "2024-11-30", quantity: 15, pricePerUnit: 5.03, totalPrice: 75.50 },
    ],
    paymentMethod: "Credit Card",
    notes: "Patient requested a digital copy."
  },
  {
    id: "2",
    billNumber: "BILL-789013",
    patientName: "Bob The Builder",
    doctorName: "Dr. Jones",
    date: new Date("2024-07-20").toISOString(),
    totalAmount: 75.00,
    status: "Pending",
    items: [
      { id: "item3", medicationName: "Ibuprofen 200mg", batchNo: "I765", expiryDate: "2025-06-30", quantity: 30, pricePerUnit: 2.50, totalPrice: 75.00 },
    ],
    paymentMethod: "Cash",
  },
  {
    id: "3",
    billNumber: "BILL-789014",
    patientName: "Charlie Brown",
    doctorName: "Dr. Smith",
    date: new Date("2024-07-19").toISOString(),
    totalAmount: 210.75,
    status: "Paid",
    items: [
      { id: "item4", medicationName: "Vitamin C Tablets", batchNo: "VC001", expiryDate: "2026-01-01", quantity: 50, pricePerUnit: 1.00, totalPrice: 50.00 },
      { id: "item5", medicationName: "Cough Syrup", batchNo: "CS002", expiryDate: "2025-08-15", quantity: 2, pricePerUnit: 80.375, totalPrice: 160.75 },
    ],
    notes: "Follow up in a week."
  },
  {
    id: "4",
    billNumber: "BILL-789015",
    patientName: "Diana Prince",
    doctorName: "Dr. Brown",
    date: new Date("2024-07-19").toISOString(),
    totalAmount: 55.20,
    status: "Cancelled",
    items: [
      { id: "item6", medicationName: "Band-Aids (Box)", batchNo: "BA003", expiryDate: "2027-01-01", quantity: 1, pricePerUnit: 55.20, totalPrice: 55.20 },
    ],
  },
  {
    id: "5",
    billNumber: "BILL-789016",
    patientName: "Edward Scissorhands",
    doctorName: "Dr. Jones",
    date: new Date("2024-07-18").toISOString(),
    totalAmount: 150.00,
    status: "Paid",
    items: [
      { id: "item7", medicationName: "Aspirin 75mg", batchNo: "ASP002", expiryDate: "2025-02-28", quantity: 100, pricePerUnit: 1.50, totalPrice: 150.00 },
    ],
    paymentMethod: "Insurance",
  },
];

// Make sampleBills exportable so it can be used by the detail page
export const getSampleBills = () => sampleBills;
export const getBillById = (id: string): Bill | undefined => sampleBills.find(bill => bill.id === id);


export default function ViewBillsPage() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filteredBills, setFilteredBills] = React.useState<Bill[]>(sampleBills);

  React.useEffect(() => {
    const results = sampleBills.filter(bill =>
      bill.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.billNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredBills(results);
  }, [searchTerm]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
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
                placeholder="Search by patient name or bill number..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full max-w-sm pl-10"
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
                      <TableCell className="text-right">${bill.totalAmount.toFixed(2)}</TableCell>
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

    