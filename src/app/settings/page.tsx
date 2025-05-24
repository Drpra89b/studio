
"use client";

import * as React from "react";
import PageHeader from "@/components/shared/page-header";
import { Settings as SettingsIcon, Printer, FileText, Database, Palette, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

const DOCTORS_STORAGE_KEY = "managedDoctorsList";
const defaultDoctors = ["Dr. Smith", "Dr. Jones", "Dr. Brown (Other)"]; // Renamed Dr. Other

export default function SettingsPage() {
  const { toast } = useToast();
  const [isDarkMode, setIsDarkMode] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  const [doctorsList, setDoctorsList] = React.useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const storedDoctors = localStorage.getItem(DOCTORS_STORAGE_KEY);
      if (storedDoctors) {
        try {
          return JSON.parse(storedDoctors);
        } catch (e) {
          console.error("Failed to parse doctors list from localStorage", e);
        }
      }
    }
    return defaultDoctors;
  });

  const [newDoctorName, setNewDoctorName] = React.useState("");

  React.useEffect(() => {
    setMounted(true);
    const currentThemeIsDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(currentThemeIsDark);
  }, []);
  
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(DOCTORS_STORAGE_KEY, JSON.stringify(doctorsList));
    }
  }, [doctorsList]);

  const handleThemeChange = (checked: boolean) => {
    setIsDarkMode(checked);
    if (checked) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleAddDoctor = () => {
    if (newDoctorName.trim() === "") {
      toast({ title: "Error", description: "Doctor name cannot be empty.", variant: "destructive" });
      return;
    }
    if (doctorsList.map(doc => doc.toLowerCase()).includes(newDoctorName.trim().toLowerCase())) {
      toast({ title: "Error", description: `Dr. ${newDoctorName.trim()} already exists in the list.`, variant: "destructive" });
      return;
    }
    setDoctorsList(prevList => [...prevList, `Dr. ${newDoctorName.trim()}`]);
    toast({ title: "Doctor Added", description: `Dr. ${newDoctorName.trim()} has been added.` });
    setNewDoctorName("");
  };

  const handleRemoveDoctor = (doctorNameToRemove: string) => {
    // Prevent removing default "Other" option if it's a critical part of a workflow
    if (doctorNameToRemove.toLowerCase().includes("(other)")) {
        toast({ title: "Action Not Allowed", description: "The 'Other' option cannot be removed.", variant: "destructive" });
        return;
    }
    setDoctorsList(prevList => prevList.filter(doc => doc !== doctorNameToRemove));
    toast({ title: "Doctor Removed", description: `${doctorNameToRemove} has been removed.` });
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
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary" /> Doctor Management</CardTitle>
              <CardDescription>Add or remove doctor names for quick selection in billing.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newDoctorNameInput">Add New Doctor (Name only, "Dr." prefix will be added)</Label>
                <div className="flex gap-2">
                  <Input 
                    id="newDoctorNameInput" 
                    placeholder="e.g., Smith" 
                    value={newDoctorName}
                    onChange={(e) => setNewDoctorName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleAddDoctor(); }}
                  />
                  <Button onClick={handleAddDoctor}>Add Doctor</Button>
                </div>
              </div>
              <Separator className="my-4" />
              <p className="text-sm font-medium">Current Doctors:</p>
              {doctorsList.length > 0 ? (
                <ul className="list-none space-y-2">
                  {doctorsList.map((doctor, index) => (
                    <li key={index} className="flex items-center justify-between p-2 border rounded-md bg-muted/50">
                      <span>{doctor}</span>
                      {!doctor.toLowerCase().includes("(other)") && ( // Don't allow deleting the "Other" option
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveDoctor(doctor)} title={`Remove ${doctor}`}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No doctors added yet.</p>
              )}
              <p className="text-xs text-muted-foreground pt-2">
                Note: This list manages doctors available on the settings page.
                To use these in "New Bill", further integration is needed.
              </p>
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

    