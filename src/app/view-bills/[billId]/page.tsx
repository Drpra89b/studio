
"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import PageHeader from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, FileText, Printer, Share2 } from "lucide-react";
import { Bill, getBillById } from "../page"; // Importing from the parent page for sample data
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";


export default function BillDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const billId = params.billId as string;
  const [bill, setBill] = React.useState<Bill | null | undefined>(undefined); // undefined for loading, null for not found

  React.useEffect(() => {
    if (billId) {
      const foundBill = getBillById(billId);
      setBill(foundBill || null);
    }
  }, [billId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };
  
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  };

  if (bill === undefined) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <FileText className="h-16 w-16 text-muted-foreground animate-pulse mb-4" />
        <p className="text-muted-foreground">Loading bill details...</p>
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <PageHeader title="Bill Not Found" description="The requested bill could not be found." icon={FileText} />
        <Button onClick={() => router.push("/view-bills")} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Bills List
        </Button>
      </div>
    );
  }

  const handlePrint = () => {
    // Placeholder for print functionality
    toast({ title: "Print Action", description: "Printing functionality is not yet implemented."});
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleShare = () => {
    // Placeholder for share functionality
    toast({ title: "Share Action", description: "Sharing functionality is not yet implemented."});
  };


  return (
    <div className="space-y-6">
      <PageHeader title={`Bill Details: ${bill.billNumber}`} description={`Viewing details for bill issued to ${bill.patientName}.`} icon={FileText} />

      <div className="flex flex-col md:flex-row gap-4 items-start">
        <Button onClick={() => router.push("/view-bills")} variant="outline" className="w-full md:w-auto">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Bills List
        </Button>
        <div className="flex-grow" />
        <Button variant="outline" onClick={handlePrint} className="w-full md:w-auto">
          <Printer className="mr-2 h-4 w-4" /> Print Bill
        </Button>
        <Button variant="outline" onClick={handleShare} className="w-full md:w-auto">
          <Share2 className="mr-2 h-4 w-4" /> Share Bill
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader className="bg-muted/30 p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
              <CardTitle className="text-2xl">Invoice #{bill.billNumber}</CardTitle>
              <CardDescription>Date Issued: {formatDate(bill.date)}</CardDescription>
            </div>
            <Badge
              variant={
                bill.status === "Paid" ? "default" :
                bill.status === "Pending" ? "secondary" :
                "destructive"
              }
              className={cn(
                "text-sm mt-2 sm:mt-0 px-3 py-1",
                bill.status === "Paid" && "bg-green-500 hover:bg-green-600 text-white",
                bill.status === "Pending" && "bg-yellow-500 hover:bg-yellow-600 text-black",
                bill.status === "Cancelled" && "bg-red-500 hover:bg-red-600 text-white"
              )}
            >
              {bill.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h3 className="font-semibold text-foreground mb-1">Billed To:</h3>
              <p className="text-muted-foreground">{bill.patientName}</p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">Prescribed By:</h3>
              <p className="text-muted-foreground">{bill.doctorName}</p>
            </div>
            {bill.paymentMethod && (
              <div>
                <h3 className="font-semibold text-foreground mb-1">Payment Method:</h3>
                <p className="text-muted-foreground">{bill.paymentMethod}</p>
              </div>
            )}
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3">Items:</h3>
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Medication</TableHead>
                    <TableHead>Batch No.</TableHead>
                    <TableHead>Expiry</TableHead>
                    <TableHead className="text-center">Qty</TableHead>
                    <TableHead className="text-right">Price/Unit</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bill.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.medicationName}</TableCell>
                      <TableCell>{item.batchNo}</TableCell>
                      <TableCell>{new Date(item.expiryDate).toLocaleDateString()}</TableCell>
                      <TableCell className="text-center">{item.quantity}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.pricePerUnit)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.totalPrice)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <Separator />
          
          <div className="flex justify-end">
            <div className="w-full max-w-xs space-y-2 text-sm">
              {/* Subtotal could be calculated if needed, for now just showing total */}
              <div className="flex justify-between font-semibold text-lg">
                <span>Grand Total:</span>
                <span>{formatCurrency(bill.totalAmount)}</span>
              </div>
            </div>
          </div>

          {bill.notes && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold text-foreground mb-1">Notes:</h3>
                <p className="text-muted-foreground text-sm whitespace-pre-wrap">{bill.notes}</p>
              </div>
            </>
          )}
        </CardContent>
        <CardFooter className="p-6 bg-muted/30 border-t">
            <p className="text-xs text-muted-foreground">
                Thank you for choosing MediStore! If you have any questions about this bill, please contact us.
            </p>
        </CardFooter>
      </Card>
    </div>
  );
}

    