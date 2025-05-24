"use client";

import * as React from "react";
import PageHeader from "@/components/shared/page-header";
import { ListOrdered, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Bill {
  id: string;
  billNumber: string;
  patientName: string;
  doctorName: string;
  date: string;
  totalAmount: number;
  status: "Paid" | "Pending" | "Cancelled";
}

const sampleBills: Bill[] = [
  { id: "1", billNumber: "BILL-789012", patientName: "Alice Wonderland", doctorName: "Dr. Smith", date: "2024-07-20", totalAmount: 125.50, status: "Paid" },
  { id: "2", billNumber: "BILL-789013", patientName: "Bob The Builder", doctorName: "Dr. Jones", date: "2024-07-20", totalAmount: 75.00, status: "Pending" },
  { id: "3", billNumber: "BILL-789014", patientName: "Charlie Brown", doctorName: "Dr. Smith", date: "2024-07-19", totalAmount: 210.75, status: "Paid" },
  { id: "4", billNumber: "BILL-789015", patientName: "Diana Prince", doctorName: "Dr. Brown", date: "2024-07-19", totalAmount: 55.20, status: "Cancelled" },
  { id: "5", billNumber: "BILL-789016", patientName: "Edward Scissorhands", doctorName: "Dr. Jones", date: "2024-07-18", totalAmount: 150.00, status: "Paid" },
];

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
                      <TableCell>{bill.date}</TableCell>
                      <TableCell>
                        <Badge variant={
                          bill.status === "Paid" ? "default" :
                          bill.status === "Pending" ? "secondary" : 
                          "destructive" // Using 'default' which is primary, 'secondary' for pending
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
                        <Button variant="outline" size="sm">View</Button>
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
