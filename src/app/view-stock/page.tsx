"use client";

import * as React from "react";
import PageHeader from "@/components/shared/page-header";
import { PackageSearch, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface StockItem {
  id: string;
  name: string;
  batch: string;
  quantity: number;
  expiryDate: string;
  lowStockThreshold?: number;
}

const sampleStock: StockItem[] = [
  { id: "1", name: "Paracetamol 500mg", batch: "P123", quantity: 150, expiryDate: "2025-12-31", lowStockThreshold: 50 },
  { id: "2", name: "Amoxicillin 250mg", batch: "A098", quantity: 20, expiryDate: "2024-08-15", lowStockThreshold: 30 },
  { id: "3", name: "Ibuprofen Drops", batch: "I765", quantity: 5, expiryDate: "2024-07-30", lowStockThreshold: 10 }, // Expiring soon
  { id: "4", name: "Vitamin C Tablets", batch: "VC001", quantity: 200, expiryDate: "2026-05-01", lowStockThreshold: 100 },
  { id: "5", name: "Saline Solution", batch: "SLN45", quantity: 8, expiryDate: "2024-09-01", lowStockThreshold: 15 },
  { id: "6", name: "Aspirin 75mg", batch: "ASP002", quantity: 45, expiryDate: "2025-02-28", lowStockThreshold: 50 },
];

const LOW_STOCK_DEFAULT = 20; // Default threshold if not specified per item
const EXPIRY_WARNING_DAYS = 90; // Days before expiry to show warning

export default function ViewStockPage() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [showLowStockOnly, setShowLowStockOnly] = React.useState(false);
  const [showExpiringSoonOnly, setShowExpiringSoonOnly] = React.useState(false);
  
  const filteredStock = React.useMemo(() => {
    return sampleStock
      .filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.batch.toLowerCase().includes(searchTerm.toLowerCase()))
      .filter(item => {
        if (!showLowStockOnly) return true;
        return item.quantity < (item.lowStockThreshold || LOW_STOCK_DEFAULT);
      })
      .filter(item => {
        if (!showExpiringSoonOnly) return true;
        const expiry = new Date(item.expiryDate);
        const today = new Date();
        const diffTime = expiry.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= EXPIRY_WARNING_DAYS && diffDays > 0;
      });
  }, [searchTerm, showLowStockOnly, showExpiringSoonOnly]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const getQuantityBadge = (item: StockItem) => {
    const threshold = item.lowStockThreshold || LOW_STOCK_DEFAULT;
    if (item.quantity < threshold / 2) return "bg-red-500 hover:bg-red-600 text-white"; // Very Low
    if (item.quantity < threshold) return "bg-orange-400 hover:bg-orange-500 text-white"; // Low
    return "bg-green-500 hover:bg-green-600 text-white"; // Sufficient
  };

  const getExpiryBadge = (expiryDateStr: string) => {
    const expiry = new Date(expiryDateStr);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return "bg-destructive hover:bg-destructive/90 text-destructive-foreground"; // Expired
    if (diffDays <= EXPIRY_WARNING_DAYS) return "bg-yellow-500 hover:bg-yellow-600 text-black"; // Expiring Soon
    return ""; // No badge / Normal
  };


  return (
    <div className="space-y-6">
      <PageHeader title="View Stock" description="Check available stock, identify low quantities and expiring medications." icon={PackageSearch} />

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Inventory Overview</CardTitle>
              <CardDescription>Current stock levels and expiry information.</CardDescription>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-grow sm:flex-grow-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by name or batch..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full pl-10"
                />
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">
                    <Filter className="mr-2 h-4 w-4" /> Filters
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-4 space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium leading-none">Filter Options</h4>
                    <p className="text-sm text-muted-foreground">
                      Refine your stock view.
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="lowStock" 
                      checked={showLowStockOnly} 
                      onCheckedChange={(checked) => setShowLowStockOnly(!!checked)}
                    />
                    <Label htmlFor="lowStock" className="text-sm font-normal">Show Low Stock Only</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="expiringSoon" 
                      checked={showExpiringSoonOnly} 
                      onCheckedChange={(checked) => setShowExpiringSoonOnly(!!checked)}
                    />
                    <Label htmlFor="expiringSoon" className="text-sm font-normal">Show Expiring Soon Only</Label>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardHeader>
        <CardContent>
           {filteredStock.length === 0 ? (
             <p className="text-sm text-muted-foreground text-center py-4">
              {searchTerm || showLowStockOnly || showExpiringSoonOnly ? "No stock items match your criteria." : "No stock items available."}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Batch No.</TableHead>
                    <TableHead className="text-center">Quantity</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStock.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.batch}</TableCell>
                      <TableCell className="text-center">
                        <Badge className={cn("text-xs", getQuantityBadge(item))}>
                          {item.quantity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className={cn(getExpiryBadge(item.expiryDate) && "font-semibold", getExpiryBadge(item.expiryDate))}>
                          {new Date(item.expiryDate).toLocaleDateString()}
                        </span>
                        {getExpiryBadge(item.expiryDate).includes("destructive") && <Badge variant="destructive" className="ml-2 text-xs">Expired</Badge>}
                        {getExpiryBadge(item.expiryDate).includes("yellow") && <Badge className="ml-2 text-xs bg-yellow-500 hover:bg-yellow-600 text-black">Expiring Soon</Badge>}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button variant="outline" size="sm">Details</Button>
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
