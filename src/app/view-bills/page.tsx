
"use client";

import * as React from "react";
import Link from "next/link";
import PageHeader from "@/components/shared/page-header";
import { ListOrdered, Search, FileText, Phone } from "lucide-react";
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
  pricePerUnit: number;
  totalPrice: number; 
}

export interface Bill {
  id: string;
  billNumber: string;
  patientName: string;
  patientMobileNumber?: string;
  doctorName: string;
  date: string; 
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
    patientMobileNumber: "9876543210",
    doctorName: "Dr. Smith",
    date: new Date("2024-07-20").toISOString(),
    totalAmount: 1255.50,
    status: "Paid",
    items: [
      { id: "item1", medicationName: "Paracetamol 500mg", quantity: 2, pricePerUnit: 250.25, totalPrice: 500.50 },
      { id: "item2", medicationName: "Amoxicillin 250mg", quantity: 1, pricePerUnit: 755.00, totalPrice: 755.00 },
    ],
    paymentMethod: "Credit Card",
    notes: "Patient requested a digital copy."
  },
  {
    id: "2",
    billNumber: "BILL-789013",
    patientName: "Bob The Builder",
    patientMobileNumber: "8765432109",
    doctorName: "Dr. Jones",
    date: new Date("2024-07-20").toISOString(),
    totalAmount: 750.00,
    status: "Pending",
    items: [
      { id: "item3", medicationName: "Ibuprofen 200mg", quantity: 3, pricePerUnit: 250.00, totalPrice: 750.00 },
    ],
    paymentMethod: "Cash",
  },
  {
    id: "3",
    billNumber: "BILL-789014",
    patientName: "Charlie Brown",
    doctorName: "Dr. Smith",
    date: new Date("2024-07-19").toISOString(),
    totalAmount: 2107.75,
    status: "Paid",
    items: [
      { id: "item4", medicationName: "Vitamin C Tablets", quantity: 5, pricePerUnit: 100.15, totalPrice: 500.75 },
      { id: "item5", medicationName: "Cough Syrup", quantity: 2, pricePerUnit: 803.50, totalPrice: 1607.00 },
    ],
    notes: "Follow up in a week."
  },
  {
    id: "4",
    billNumber: "BILL-789015",
    patientName: "Diana Prince",
    patientMobileNumber: "7654321098",
    doctorName: "Dr. Brown",
    date: new Date("2024-07-19").toISOString(),
    totalAmount: 552.00,
    status: "Cancelled",
    items: [
      { id: "item6", medicationName: "Band-Aids (Box)", quantity: 1, pricePerUnit: 552.00, totalPrice: 552.00 },
    ],
  },
  {
    id: "5",
    billNumber: "BILL-789016",
    patientName: "Edward Scissorhands",
    doctorName: "Dr. Jones",
    date: new Date("2024-07-18").toISOString(),
    totalAmount: 1500.00,
    status: "Paid",
    items: [
      { id: "item7", medicationName: "Aspirin 75mg", quantity: 10, pricePerUnit: 150.00, totalPrice: 1500.00 },
    ],
    paymentMethod: "Insurance",
  },
];

export const getSampleBills = () => sampleBills;
export const getBillById = (id: string): Bill | undefined => sampleBills.find(bill => bill.id === id);


export default function ViewBillsPage() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filteredBills, setFilteredBills] = React.useState<Bill[]>(sampleBills);

  React.useEffect(() => {
    const results = sampleBills.filter(bill =>
      bill.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.billNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (bill.patientMobileNumber && bill.patientMobileNumber.includes(searchTerm))
    );
    setFilteredBills(results);
  }, [searchTerm]);

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

    

