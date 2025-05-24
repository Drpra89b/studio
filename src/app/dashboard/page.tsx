
"use client";

import * as React from "react";
import { LayoutDashboard, IndianRupee, AlertTriangle, ShoppingCart, CalendarClock, TrendingUp, Users, BarChart3, Loader2 } from "lucide-react";
import PageHeader from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ChartConfig } from "@/components/ui/chart";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { Bar, Line, ComposedChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Cell, LabelList } from "recharts";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const salesData = [
  { date: "2024-07-20", salesCount: 5, totalAmount: 3500.75 },
  { date: "2024-07-21", salesCount: 8, totalAmount: 5250.00 },
  { date: "2024-07-22", salesCount: 3, totalAmount: 1800.50 },
  { date: "2024-07-23", salesCount: 10, totalAmount: 7800.25 },
  { date: "2024-07-24", salesCount: 6, totalAmount: 4200.00 },
  { date: "2024-07-25", salesCount: 7, totalAmount: 4950.60 },
  { date: "2024-07-26", salesCount: 4, totalAmount: 2800.00 },
  { date: "2024-07-27", salesCount: 9, totalAmount: 6300.00 },
  { date: "2024-07-28", salesCount: 2, totalAmount: 1400.00 },
  { date: "2024-07-29", salesCount: 11, totalAmount: 8800.50 },
];

const chartConfig = {
  totalAmount: {
    label: "Total Amount (₹)",
    color: "hsl(var(--chart-4))", // Yellow
  },
  salesCount: {
    label: "Number of Sales",
    color: "hsl(var(--chart-3))", // Dark Blue (used for legend and Y-axis)
  },
} satisfies ChartConfig;

const barColors = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-5))",
  "hsl(var(--primary))", 
  "hsl(var(--accent))",  
];

interface NotificationItem {
  id: string;
  type: "lowStock" | "expiringSoon" | "info";
  title: string;
  message: string;
  timestamp: string;
}

const sampleNotifications: NotificationItem[] = [
  { 
    id: "1", 
    type: "lowStock", 
    title: "Low Stock: Paracetamol 500mg", 
    message: "Only 15 units left. Consider reordering.", 
    timestamp: "2 hours ago" 
  },
  { 
    id: "2", 
    type: "expiringSoon", 
    title: "Expiring Soon: Amoxicillin 250mg (Batch A098)", 
    message: "Expires in 10 days. Current stock: 20 units.", 
    timestamp: "Yesterday" 
  },
  { 
    id: "3", 
    type: "info", 
    title: "System Maintenance Scheduled", 
    message: "Brief maintenance on Aug 5th, 2 AM - 3 AM.", 
    timestamp: "3 days ago" 
  },
   { 
    id: "4", 
    type: "lowStock", 
    title: "Low Stock: Ibuprofen Drops", 
    message: "Only 5 units left. Urgent reorder needed.", 
    timestamp: "Just now" 
  },
];

export default function DashboardPage() {
  const [isAdmin, setIsAdmin] = React.useState<boolean | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const adminStatus = localStorage.getItem('isAdmin');
      setIsAdmin(adminStatus === 'true');
    }
    setIsLoading(false);
  }, []);

  const formatCurrency = (value: number) => `₹${value.toFixed(0)}`;

  const getNotificationIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "lowStock":
        return <ShoppingCart className="h-5 w-5 text-orange-500" />;
      case "expiringSoon":
        return <CalendarClock className="h-5 w-5 text-red-500" />;
      case "info":
        return <AlertTriangle className="h-5 w-5 text-blue-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading Dashboard...</span>
      </div>
    );
  }

  const pageTitle = isAdmin ? "Admin Dashboard" : "Staff Dashboard";
  const pageDescription = isAdmin 
    ? "Overview of sales and pharmacy performance." 
    : "Quick overview of today's activity and important notifications.";
  const pageIcon = isAdmin ? LayoutDashboard : BarChart3;

  return (
    <div className="space-y-6">
      <PageHeader title={pageTitle} description={pageDescription} icon={pageIcon} />

      {isAdmin && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Daily Sales Performance</CardTitle>
              <CardDescription>
                Showing number of sales and total amount generated per day for the last 10 days. Each bar represents a day's sales count.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                <ResponsiveContainer width="100%" height={350}>
                  <ComposedChart data={salesData} margin={{ top: 20, right: 20, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    />
                    <YAxis
                      yAxisId="left"
                      orientation="left"
                      stroke="var(--color-totalAmount)" 
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tickFormatter={(value) => `₹${value / 1000}k`}
                      domain={['auto', 'auto']}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      stroke="var(--color-salesCount)" 
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      domain={['auto', 'dataMax + 5']}
                    />
                    <ChartTooltip
                      cursor={true}
                      content={<ChartTooltipContent 
                        indicator="line" 
                        labelFormatter={(label, payload) => {
                          if (payload && payload.length > 0 && payload[0].payload.date) {
                             return new Date(payload[0].payload.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
                          }
                          return label;
                        }}
                        formatter={(value, name, props) => {
                          if (name === "totalAmount") {
                            return [`₹${Number(value).toFixed(2)}`, "Total Amount"];
                          }
                          if (name === "salesCount") {
                            return [value, "Number of Sales"];
                          }
                          return [value, name];
                        }}
                      />}
                    />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar dataKey="salesCount" yAxisId="right" radius={[4, 4, 0, 0]} barSize={30}>
                      {salesData.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
                      ))}
                      <LabelList 
                        dataKey="totalAmount" 
                        position="top" 
                        formatter={formatCurrency} 
                        fill="hsl(var(--foreground))" 
                        fontSize={12}
                        offset={5} 
                      />
                    </Bar>
                    <Line type="monotone" dataKey="totalAmount" yAxisId="left" stroke="var(--color-totalAmount)" strokeWidth={2} dot={{ r: 4, fill: "var(--color-totalAmount)" }} activeDot={{r: 6}} />
                  </ComposedChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-primary"/>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between"><span>Total Bills Today:</span> <span className="font-semibold">12</span></div>
                <div className="flex justify-between"><span>Pending Orders:</span> <span className="font-semibold">3</span></div>
                <div className="flex justify-between"><span>Low Stock Items:</span> <span className="font-semibold">5</span></div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-primary"/>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">No recent activity to show. (Placeholder)</p>
              </CardContent>
            </Card>
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-primary"/>Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                {sampleNotifications.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No new notifications.</p>
                ) : (
                  <div className="space-y-4">
                    {sampleNotifications.map((notification, index) => (
                      <React.Fragment key={notification.id}>
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 pt-0.5">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium leading-tight">{notification.title}</p>
                            <p className="text-xs text-muted-foreground">{notification.message}</p>
                            <p className="text-xs text-muted-foreground/70 mt-0.5">{notification.timestamp}</p>
                          </div>
                        </div>
                        {index < sampleNotifications.length - 1 && <Separator className="my-2" />}
                      </React.Fragment>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {!isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><IndianRupee className="h-5 w-5 text-primary"/>Today's Sales Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                <span className="text-sm">Total Bills Generated:</span> 
                <span className="font-semibold text-lg">23</span> {/* Placeholder */}
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                <span className="text-sm">Total Revenue:</span> 
                <span className="font-semibold text-lg">₹15,780.50</span> {/* Placeholder */}
              </div>
               <p className="text-xs text-muted-foreground text-center pt-2">(Live data for today's sales is not yet implemented.)</p>
            </CardContent>
          </Card>
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-primary"/>Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              {sampleNotifications.length === 0 ? (
                <p className="text-sm text-muted-foreground">No new notifications.</p>
              ) : (
                <div className="space-y-4">
                  {sampleNotifications.map((notification, index) => (
                    <React.Fragment key={notification.id}>
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 pt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium leading-tight">{notification.title}</p>
                          <p className="text-xs text-muted-foreground">{notification.message}</p>
                          <p className="text-xs text-muted-foreground/70 mt-0.5">{notification.timestamp}</p>
                        </div>
                      </div>
                      {index < sampleNotifications.length - 1 && <Separator className="my-2" />}
                    </React.Fragment>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
