
"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import PageHeader from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// Removed Badge import as it's no longer used for status
// import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, FileText, Printer, Share2, Home, Phone, Mail, ShieldCheck } from "lucide-react";
import type { Bill, BillItem } from "../page";
import { getBillById } from "../page";
// import { cn } from "@/lib/utils"; // cn no longer needed for status badge
import { useToast } from "@/hooks/use-toast";

interface PharmacyProfileData {
  pharmacyName: string;
  invoiceTitle?: string;
  addressStreet: string;
  addressCity: string;
  addressState: string;
  addressZipCode: string;
  contactNumber: string;
  emailAddress: string;
  licenseNumber: string;
  gstin?: string;
}


export default function BillDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const billId = params.billId as string;
  const [bill, setBill] = React.useState<Bill | null | undefined>(undefined);
  const [pharmacyProfile, setPharmacyProfile] = React.useState<PharmacyProfileData | null>(null);

  React.useEffect(() => {
    if (billId) {
      const foundBill = getBillById(billId);
      setBill(foundBill || null);
    }

    if (typeof window !== 'undefined') {
      const storedProfile = localStorage.getItem('pharmacyProfile');
      if (storedProfile) {
        try {
          setPharmacyProfile(JSON.parse(storedProfile));
        } catch (e) {
          console.error("Failed to parse pharmacy profile from localStorage for bill header", e);
          setPharmacyProfile(null);
        }
      }
    }
  }, [billId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2 });
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
    if (typeof window !== 'undefined') {
      window.print();
      toast({ title: "Print Initiated", description: "Your browser's print dialog should appear."});
    } else {
      toast({ title: "Print Error", description: "Printing is not available in this environment.", variant: "destructive"});
    }
  };

  const handleShare = async () => {
    if (!bill || typeof window === 'undefined') return;

    const shareData = {
      title: `${pharmacyProfile?.invoiceTitle || 'Bill'} from ${pharmacyProfile?.pharmacyName || 'MediStore'}: ${bill.billNumber}`,
      text: `View details for bill ${bill.billNumber} issued to ${bill.patientName}. Amount: ${formatCurrency(bill.totalAmount)}`,
      url: window.location.href,
    };

    const copyToClipboardFallback = async () => {
      try {
        await navigator.clipboard.writeText(shareData.url);
        toast({ title: "Link Copied", description: "Bill link copied to clipboard." });
      } catch (copyError) {
        console.error("Clipboard API error:", copyError);
        toast({ title: "Copy Error", description: "Could not copy link to clipboard.", variant: "destructive" });
      }
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        toast({ title: "Bill Shared", description: "The bill link has been shared." });
      } catch (error) {
        console.error("Web Share API error:", error);
        const domError = error as DOMException;

        if (domError && domError.name === 'AbortError') {
          toast({ title: "Share Canceled", description: "You cancelled the share action.", variant: "default" });
        } else if (domError && domError.name === 'NotAllowedError') {
          toast({
            title: "Share Permission Denied",
            description: "Could not share due to permissions. Copied link to clipboard instead.",
            variant: "default",
          });
          await copyToClipboardFallback();
        }
        else {
          toast({
            title: "Share Error",
            description: "Could not share the bill. Copied link to clipboard instead.",
            variant: "destructive"
          });
          await copyToClipboardFallback();
        }
      }
    } else {
      toast({ title: "Share Not Supported", description: "Web Share not supported. Copied link to clipboard."});
      await copyToClipboardFallback();
    }
  };

  const displayedInvoiceTitle = pharmacyProfile?.invoiceTitle || "Invoice";


  return (
    <div className="space-y-6 print:space-y-0">
      <PageHeader title={`${displayedInvoiceTitle}: ${bill.billNumber}`} description={`Viewing details for bill issued to ${bill.patientName}.`} icon={FileText} className="print:hidden" />

      <div className="flex flex-col md:flex-row gap-4 items-start print:hidden">
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

      <Card className="shadow-lg print:shadow-none print:border-none">
        {pharmacyProfile && (
          <div className="p-6 print:px-0 print:pt-0 print:pb-4 mb-0 print:mb-2 border-b print:border-b-2 print:border-gray-300">
            <h2 className="text-2xl font-bold text-center print:text-xl mb-1">{pharmacyProfile.pharmacyName}</h2>
            <p className="text-xs text-muted-foreground text-center print:text-xs">
              {pharmacyProfile.addressStreet}, {pharmacyProfile.addressCity}, {pharmacyProfile.addressState} - {pharmacyProfile.addressZipCode}
            </p>
            <div className="text-xs text-muted-foreground text-center print:text-xs mt-1 space-x-2">
              <span><Phone className="inline h-3 w-3 mr-1" />{pharmacyProfile.contactNumber}</span>
              <span>|</span>
              <span><Mail className="inline h-3 w-3 mr-1" />{pharmacyProfile.emailAddress}</span>
            </div>
            <div className="text-xs text-muted-foreground text-center print:text-xs mt-1 space-x-2">
                 <span><ShieldCheck className="inline h-3 w-3 mr-1" />License No: {pharmacyProfile.licenseNumber}</span>
                {bill.isTaxApplied && pharmacyProfile.gstin && (
                    <>
                        <span>|</span>
                        <span>GSTIN: {pharmacyProfile.gstin}</span>
                    </>
                )}
            </div>
          </div>
        )}

        <CardHeader className="bg-muted/30 p-6 print:bg-transparent print:px-0 print:pt-2">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
              <CardTitle className="text-xl print:text-lg">{displayedInvoiceTitle} #{bill.billNumber}</CardTitle>
              <CardDescription className="print:text-xs">Date Issued: {formatDate(bill.date)}</CardDescription>
            </div>
            {/* Removed Status Badge */}
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6 print:p-0 print:space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm print:grid-cols-2 print:gap-4">
            <div>
              <h3 className="font-semibold text-foreground mb-1 print:text-sm">Billed To:</h3>
              <p className="text-muted-foreground print:text-xs">{bill.patientName}</p>
              {bill.patientMobileNumber && <p className="text-muted-foreground print:text-xs"><Phone className="inline h-3 w-3 mr-1" />{bill.patientMobileNumber}</p>}
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1 print:text-sm">Prescribed By:</h3>
              <p className="text-muted-foreground print:text-xs">{bill.doctorName}</p>
            </div>
            {/* Removed PaymentMethod display */}
          </div>

          <Separator className="print:my-2" />

          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3 print:text-base print:mb-2">Items:</h3>
            <div className="overflow-x-auto rounded-md border print:border-none print:rounded-none">
              <Table className="print:text-xs">
                <TableHeader>
                  <TableRow className="print:border-b print:border-gray-300">
                    <TableHead className="print:py-1 print:px-2">Medication</TableHead>
                    <TableHead className="text-center print:py-1 print:px-2">Qty</TableHead>
                    <TableHead className="text-right print:py-1 print:px-2">Price/Unit{bill.isTaxApplied ? " (Pre-Tax)" : ""}</TableHead>
                    {bill.isTaxApplied && bill.gstRateApplied !== undefined && (
                        <>
                            <TableHead className="text-right print:py-1 print:px-2">GST ({bill.gstRateApplied}%)</TableHead>
                            <TableHead className="text-right print:py-1 print:px-2">GST Amt.</TableHead>
                        </>
                    )}
                    <TableHead className="text-right print:py-1 print:px-2">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bill.items.map((item) => (
                    <TableRow key={item.id} className="print:border-b print:border-gray-200">
                      <TableCell className="font-medium print:py-1 print:px-2">{item.medicationName}</TableCell>
                      <TableCell className="text-center print:py-1 print:px-2">{item.quantity}</TableCell>
                      <TableCell className="text-right print:py-1 print:px-2">{formatCurrency(item.pricePerUnit)}</TableCell>
                       {bill.isTaxApplied && bill.gstRateApplied !== undefined && (
                           <>
                               <TableCell className="text-right print:py-1 print:px-2">{item.taxRate?.toFixed(2) || bill.gstRateApplied?.toFixed(2)}%</TableCell>
                               <TableCell className="text-right print:py-1 print:px-2">{formatCurrency(item.gstAmount || 0)}</TableCell>
                           </>
                       )}
                      <TableCell className="text-right print:py-1 print:px-2">{formatCurrency(item.totalPrice)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <Separator className="print:my-2"/>

          <div className="flex justify-end">
            <div className="w-full max-w-xs space-y-1 text-sm print:max-w-none print:w-auto print:ml-auto text-right">
              {bill.isTaxApplied && bill.subTotal !== undefined && bill.totalGstAmount !== undefined && (
                <>
                  <div className="flex justify-between">
                    <span>Subtotal (Pre-Tax):</span>
                    <span>{formatCurrency(bill.subTotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total GST ({bill.gstRateApplied?.toFixed(2) || 0}%):</span>
                    <span>{formatCurrency(bill.totalGstAmount)}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between font-semibold text-lg print:text-base">
                <span>Grand Total:</span>
                <span>{formatCurrency(bill.totalAmount)}</span>
              </div>
            </div>
          </div>

          {bill.notes && (
            <>
              <Separator className="print:my-2"/>
              <div>
                <h3 className="font-semibold text-foreground mb-1 print:text-sm">Notes:</h3>
                <p className="text-muted-foreground text-sm whitespace-pre-wrap print:text-xs">{bill.notes}</p>
              </div>
            </>
          )}
        </CardContent>
        <CardFooter className="p-6 bg-muted/30 border-t print:bg-transparent print:p-0 print:mt-4 print:border-t print:border-gray-300">
            <p className="text-xs text-muted-foreground print:text-center print:w-full">
                Thank you for choosing {pharmacyProfile?.pharmacyName || "MediStore"}! If you have any questions about this bill, please contact us.
            </p>
        </CardFooter>
      </Card>
    </div>
  );
}
