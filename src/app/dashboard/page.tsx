
"use client";

import * as React from "react";
import { LayoutDashboard, IndianRupee } from "lucide-react";
import PageHeader from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ChartConfig } from "@/components/ui/chart";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { Bar, Line, ComposedChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts";

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
    color: "hsl(var(--chart-1))", // Primary chart color
  },
  salesCount: {
    label: "Number of Sales",
    color: "hsl(var(--chart-2))", // Secondary chart color
  },
} satisfies ChartConfig;

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Admin Dashboard" description="Overview of sales and pharmacy performance." icon={LayoutDashboard} />

      <Card>
        <CardHeader>
          <CardTitle>Daily Sales Performance</CardTitle>
          <CardDescription>
            Showing number of sales and total amount generated per day for the last 10 days.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
            <ResponsiveContainer width="100%" height={350}>
              <ComposedChart data={salesData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
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
                  stroke="hsl(var(--chart-1))"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => `₹${value / 1000}k`}
                  domain={['auto', 'auto']}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="hsl(var(--chart-2))"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  domain={['auto', 'auto']}
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
                    formatter={(value, name) => {
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
                <Bar dataKey="salesCount" yAxisId="right" fill="var(--color-salesCount)" radius={[4, 4, 0, 0]} barSize={30} />
                <Line type="monotone" dataKey="totalAmount" yAxisId="left" stroke="var(--color-totalAmount)" strokeWidth={2} dot={{ r: 4, fill: "var(--color-totalAmount)" }} activeDot={{r: 6}} />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Placeholder for more dashboard cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between"><span>Total Bills Today:</span> <span className="font-semibold">12</span></div>
            <div className="flex justify-between"><span>Pending Orders:</span> <span className="font-semibold">3</span></div>
            <div className="flex justify-between"><span>Low Stock Items:</span> <span className="font-semibold">5</span></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No recent activity to show. (Placeholder)</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No new notifications. (Placeholder)</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
