
"use client";

import * as React from "react";
// Link import is removed as it's no longer used
import PageHeader from "@/components/shared/page-header";
import { Settings as SettingsIcon, Printer, FileText, Database, Palette } from "lucide-react"; // UserCog removed
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
  const [isDarkMode, setIsDarkMode] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    // Initialize dark mode state based on current document class
    const currentThemeIsDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(currentThemeIsDark);
  }, []);

  const handleThemeChange = (checked: boolean) => {
    setIsDarkMode(checked);
    if (checked) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  if (!mounted) {
    return (
      <div className="space-y-6">
         <PageHeader title="Settings" description="Configure application preferences and options." icon={SettingsIcon} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Configure application preferences and options." icon={SettingsIcon} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Printer className="h-5 w-5 text-primary" /> Printer Settings</CardTitle>
              <CardDescription>Customize printing options.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="printerType">Printer Type</Label>
                <Select>
                  <SelectTrigger id="printerType">
                    <SelectValue placeholder="Select printer type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="thermal">Thermal Printer</SelectItem>
                    <SelectItem value="laser">Laser Printer (A4)</SelectItem>
                    <SelectItem value="dotmatrix">Dot Matrix Printer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
               <div className="flex items-center space-x-2 pt-2">
                <Switch id="showLogoOnInvoice" />
                <Label htmlFor="showLogoOnInvoice" className="cursor-pointer">Show Pharmacy Logo on Invoice</Label>
              </div>
            </CardContent>
          </Card>
          
          {/* Staff Permissions Card Removed */}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary" /> Doctor Management</CardTitle>
              <CardDescription>Add or remove doctor names for quick selection in billing.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newDoctorName">Add New Doctor</Label>
                <div className="flex gap-2">
                  <Input id="newDoctorName" placeholder="Enter doctor's full name" />
                  <Button>Add Doctor</Button>
                </div>
              </div>
              <Separator className="my-4" />
              <p className="text-sm font-medium">Current Doctors:</p>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                <li>Dr. Smith (Default)</li>
                <li>Dr. Jones (Default)</li>
                {/* Dynamically list added doctors here */}
              </ul>
               <p className="text-xs text-muted-foreground pt-2">Note: Doctor list management is a placeholder.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Database className="h-5 w-5 text-primary" /> Data Management</CardTitle>
              <CardDescription>Options related to data storage and backups.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <Label htmlFor="localBillStorage" className="text-base">Store Bills Locally</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable this to keep a local copy of bills on this device.
                  </p>
                </div>
                <Switch id="localBillStorage" />
              </div>
               <Button variant="outline">Backup Data</Button>
               <Button variant="outline" className="ml-2">Restore Data</Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
           <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Palette className="h-5 w-5 text-primary" /> Appearance</CardTitle>
              <CardDescription>Customize the look and feel of the application.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                        <Label htmlFor="darkMode" className="text-base">Dark Mode</Label>
                        <p className="text-sm text-muted-foreground">
                            Toggle between light and dark themes.
                        </p>
                    </div>
                    <Switch 
                      id="darkMode" 
                      onCheckedChange={handleThemeChange}
                      checked={isDarkMode}
                    />
                </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button size="lg">Save Settings</Button>
      </div>
    </div>
  );
}
