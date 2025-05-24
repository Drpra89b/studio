"use client";

import * as React from "react";
import PageHeader from "@/components/shared/page-header";
import { LineChart, Download, CalendarRange } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePicker } from "@/components/shared/date-picker";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function ViewReportsPage() {
  const { toast } = useToast();
  const [billingStartDate, setBillingStartDate] = React.useState<Date | undefined>();
  const [billingEndDate, setBillingEndDate] = React.useState<Date | undefined>();
  const [stockStartDate, setStockStartDate] = React.useState<Date | undefined>();
  const [stockEndDate, setStockEndDate] = React.useState<Date | undefined>();

  const handleGenerateBillingReport = () => {
    if (!billingStartDate || !billingEndDate) {
      toast({ title: "Error", description: "Please select both start and end dates for billing report.", variant: "destructive" });
      return;
    }
    if (billingEndDate < billingStartDate) {
      toast({ title: "Error", description: "End date cannot be before start date.", variant: "destructive" });
      return;
    }
    // Placeholder for report generation logic
    toast({ title: "Billing Report Generated", description: `Report from ${billingStartDate.toLocaleDateString()} to ${billingEndDate.toLocaleDateString()} is ready for download (simulated).` });
  };

  const handleGenerateStockReport = () => {
    if (!stockStartDate || !stockEndDate) {
      toast({ title: "Error", description: "Please select both start and end dates for stock report.", variant: "destructive" });
      return;
    }
     if (stockEndDate < stockStartDate) {
      toast({ title: "Error", description: "End date cannot be before start date.", variant: "destructive" });
      return;
    }
    // Placeholder for report generation logic
    toast({ title: "Stock Report Generated", description: `Report from ${stockStartDate.toLocaleDateString()} to ${stockEndDate.toLocaleDateString()} is ready for download (simulated).` });
  };

  return (
    <div className="space-y-6">
      <PageHeader title="View Reports" description="Generate financial and stock reports for specific date ranges." icon={LineChart} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Billing Report</CardTitle>
            <CardDescription>Generate a report of all bills within a selected date range.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
              <div className="space-y-1.5">
                <Label htmlFor="billingStartDate">Start Date</Label>
                <DatePicker date={billingStartDate} setDate={setBillingStartDate} placeholder="Select start date" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="billingEndDate">End Date</Label>
                <DatePicker date={billingEndDate} setDate={setBillingEndDate} placeholder="Select end date" />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleGenerateBillingReport} className="w-full sm:w-auto ml-auto">
              <Download className="mr-2 h-4 w-4" /> Generate Billing Report
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stock Report</CardTitle>
            <CardDescription>Generate a report of stock movements or current inventory within a selected date range.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
              <div className="space-y-1.5">
                <Label htmlFor="stockStartDate">Start Date</Label>
                <DatePicker date={stockStartDate} setDate={setStockStartDate} placeholder="Select start date" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="stockEndDate">End Date</Label>
                <DatePicker date={stockEndDate} setDate={setStockEndDate} placeholder="Select end date" />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleGenerateStockReport} className="w-full sm:w-auto ml-auto">
              <Download className="mr-2 h-4 w-4" /> Generate Stock Report
            </Button>
          </CardFooter>
        </Card>
      </div>
       <Card>
        <CardHeader>
            <CardTitle>Report Previews</CardTitle>
            <CardDescription>Generated reports will be available for download here.</CardDescription>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground py-10">
            <CalendarRange className="mx-auto h-12 w-12 mb-4 text-gray-400" />
            <p>Select date ranges and generate reports to see previews.</p>
            <p className="text-sm">(PDF generation and preview functionality is a placeholder)</p>
        </CardContent>
       </Card>
    </div>
  );
}
