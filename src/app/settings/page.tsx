
"use client";

import * as React from "react";
import Link from "next/link";
import PageHeader from "@/components/shared/page-header";
import { Settings as SettingsIcon, Printer, FileText, Database, Palette, Trash2, Percent, UploadCloud, DownloadCloud, UserCog } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

const DOCTORS_STORAGE_KEY = "managedDoctorsList";
const IS_TAX_ENABLED_KEY = "isTaxEnabled";
const DEFAULT_GST_RATE_KEY = "defaultGstRate";
const PHARMACY_PROFILE_KEY = "pharmacyProfile";
const STAFF_LIST_KEY = "staffList";
const APP_VERSION = "1.0.0"; // Define app version for metadata

// List of all localStorage keys managed by the app
const APP_STORAGE_KEYS = [
  DOCTORS_STORAGE_KEY,
  IS_TAX_ENABLED_KEY,
  DEFAULT_GST_RATE_KEY,
  PHARMACY_PROFILE_KEY,
  STAFF_LIST_KEY,
  "pharmacyName",
];

const defaultDoctorsFallback = ["Dr. Other (Manual Entry)"];


export default function SettingsPage() {
  const { toast } = useToast();
  const [isDarkMode, setIsDarkMode] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [doctorsList, setDoctorsList] = React.useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const storedDoctors = localStorage.getItem(DOCTORS_STORAGE_KEY);
      if (storedDoctors) {
        try {
          const parsed = JSON.parse(storedDoctors);
          if (Array.isArray(parsed)) {
             // Ensure "Dr. Other (Manual Entry)" is always present and at the top if missing
            const uniqueDoctors = Array.from(new Set([defaultDoctorsFallback[0], ...parsed]));
            return uniqueDoctors;
          }
          return defaultDoctorsFallback;
        } catch (e) {
          console.error("Failed to parse doctors list from localStorage", e);
        }
      }
    }
    return defaultDoctorsFallback;
  });

  const [newDoctorName, setNewDoctorName] = React.useState("");

  const [isTaxEnabled, setIsTaxEnabled] = React.useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(IS_TAX_ENABLED_KEY);
      return stored === 'true';
    }
    return false;
  });
  const [defaultGstRate, setDefaultGstRate] = React.useState<number | string>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(DEFAULT_GST_RATE_KEY);
      return stored ? parseFloat(stored) : 12; // Default GST rate
    }
    return 12;
  });


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

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(IS_TAX_ENABLED_KEY, String(isTaxEnabled));
    }
  }, [isTaxEnabled]);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(DEFAULT_GST_RATE_KEY, String(defaultGstRate));
    }
  }, [defaultGstRate]);


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
    const formattedDoctorName = `Dr. ${newDoctorName.trim().replace(/^Dr\.\s*/i, '')}`;
    if (doctorsList.map(doc => doc.toLowerCase()).includes(formattedDoctorName.toLowerCase())) {
      toast({ title: "Error", description: `${formattedDoctorName} already exists in the list.`, variant: "destructive" });
      return;
    }
    setDoctorsList(prevList => [...prevList, formattedDoctorName]);
    toast({ title: "Doctor Added", description: `${formattedDoctorName} has been added.` });
    setNewDoctorName("");
  };

  const handleRemoveDoctor = (doctorNameToRemove: string) => {
    if (doctorNameToRemove.toLowerCase() === defaultDoctorsFallback[0].toLowerCase()) {
        toast({ title: "Action Not Allowed", description: `The '${defaultDoctorsFallback[0]}' option cannot be removed.`, variant: "destructive" });
        return;
    }
    setDoctorsList(prevList => prevList.filter(doc => doc !== doctorNameToRemove));
    toast({ title: "Doctor Removed", description: `${doctorNameToRemove} has been removed.` });
  };

  const handleGstRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "") {
        setDefaultGstRate("");
    } else {
        const numValue = parseFloat(value);
        if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
            setDefaultGstRate(numValue);
        } else if (isNaN(numValue) && value.length <=5) { // Allow typing, e.g. "12."
            setDefaultGstRate(value);
        }
    }
  };

  const handleSaveSettings = () => {
    if (typeof defaultGstRate === 'string' && (defaultGstRate === "" || isNaN(parseFloat(defaultGstRate)))) {
        toast({
            title: "Invalid GST Rate",
            description: "Please enter a valid number for the GST rate.",
            variant: "destructive",
        });
        return;
    }
     toast({
      title: "Settings Saved",
      description: "Your application settings have been updated.",
    });
  };

  const handleBackupData = () => {
    if (typeof window === 'undefined') return;
    
    const appData: Record<string, any> = {};
    APP_STORAGE_KEYS.forEach(key => {
      const item = localStorage.getItem(key);
      if (item !== null) {
        try {
          appData[key] = JSON.parse(item);
        } catch (e) {
          // If not JSON (e.g. simple string, boolean, or number stored as string), store as is.
          // JSON.parse would fail for "true" or "12" directly.
          // But if it was stringified object/array, parsing is needed.
          // For our known keys, isTaxEnabled and defaultGstRate are boolean/number like.
          // pharmacyName is string. Others are stringified JSON.
          if (key === IS_TAX_ENABLED_KEY) appData[key] = item === 'true';
          else if (key === DEFAULT_GST_RATE_KEY) appData[key] = parseFloat(item);
          else if (key === "pharmacyName") appData[key] = item;
          else appData[key] = item; // Fallback for unexpected non-JSON, though most should be JSON or handled above
        }
      }
    });
    
    const backupFileContent = {
      metadata: {
        appName: "MediStoreApp",
        backupDate: new Date().toISOString(),
        version: APP_VERSION,
      },
      data: appData
    };

    const jsonString = JSON.stringify(backupFileContent, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    a.download = `medistore_backup_${timestamp}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Data Backup Successful",
      description: "Your application data has been downloaded as a JSON file.",
    });
  };

  const handleRestoreDataClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (typeof window === 'undefined') return;
    const file = event.target.files?.[0];
    if (!file) {
      toast({ title: "Restore Canceled", description: "No file selected for restore.", variant: "destructive"});
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonString = e.target?.result as string;
        const backupFileContent = JSON.parse(jsonString);
        
        if (!backupFileContent.data || !backupFileContent.metadata) {
          toast({ title: "Restore Failed", description: "Invalid backup file structure. Missing metadata or data key.", variant: "destructive"});
          if (fileInputRef.current) fileInputRef.current.value = "";
          return;
        }
        
        // Basic check for metadata version if needed in future
        // if (backupFileContent.metadata.version !== APP_VERSION) { ... }

        const restoredData = backupFileContent.data;
        let restoredCount = 0;
        for (const key in restoredData) {
          if (APP_STORAGE_KEYS.includes(key)) {
            // Ensure data is stringified before storing, as localStorage only takes strings
            // Booleans and numbers from parsed JSON need to be converted to string.
            // Objects/Arrays need to be stringified.
            const valueToStore = typeof restoredData[key] === 'object' 
                ? JSON.stringify(restoredData[key]) 
                : String(restoredData[key]);
            localStorage.setItem(key, valueToStore);
            restoredCount++;
          }
        }
        
        if (restoredCount > 0) {
          toast({
            title: "Data Restore Successful",
            description: `Restored ${restoredCount} data items. Please refresh the application to see all changes.`,
          });
          // Optionally, trigger a soft reload or state updates
          // window.location.reload(); // Hard reload might be simplest for a full restore
        } else {
           toast({ title: "Restore Failed", description: "No relevant application data found in the backup file.", variant: "destructive"});
        }

      } catch (error) {
        console.error("Restore error:", error);
        toast({ title: "Restore Failed", description: "Invalid backup file format or corrupted data.", variant: "destructive"});
      } finally {
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    };
    reader.readAsText(file);
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
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" style={{ display: 'none' }} />

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
              <CardTitle className="flex items-center gap-2"><Percent className="h-5 w-5 text-primary" /> Tax Settings</CardTitle>
              <CardDescription>Configure GST calculation for bills.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <Label htmlFor="enableTaxes" className="text-base">Enable Taxes</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable this to include GST calculations in bills.
                  </p>
                </div>
                <Switch 
                  id="enableTaxes" 
                  checked={isTaxEnabled} 
                  onCheckedChange={setIsTaxEnabled}
                />
              </div>
              {isTaxEnabled && (
                <div className="space-y-2">
                  <Label htmlFor="defaultGstRate">Default GST Rate (%)</Label>
                  <Input 
                    id="defaultGstRate" 
                    type="number" 
                    placeholder="e.g., 12" 
                    value={defaultGstRate}
                    onChange={handleGstRateChange}
                    step="0.01"
                    min="0"
                    max="100"
                  />
                   <p className="text-xs text-muted-foreground">
                    This global rate will be applied to all taxable items if taxes are enabled.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary" /> Doctor Management</CardTitle>
              <CardDescription>Add or remove doctor names for quick selection in billing. This list will be used on the 'New Bill' page.</CardDescription>
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
                <ul className="list-none space-y-2 max-h-60 overflow-y-auto pr-2">
                  {doctorsList.map((doctor, index) => (
                    <li key={index} className="flex items-center justify-between p-2 border rounded-md bg-muted/50">
                      <span>{doctor}</span>
                      {doctor.toLowerCase() !== defaultDoctorsFallback[0].toLowerCase() && ( 
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveDoctor(doctor)} title={`Remove ${doctor}`}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No doctors added yet. Add one above, or "{defaultDoctorsFallback[0]}" will be used as default.</p>
              )}
              <p className="text-xs text-muted-foreground pt-2">
                The "{defaultDoctorsFallback[0]}" option allows for manual doctor name input on the billing page and cannot be removed.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Database className="h-5 w-5 text-primary" /> Data Management</CardTitle>
              <CardDescription>Options related to data storage and backups. All data is stored locally in your browser.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <Label htmlFor="localBillStorage" className="text-base">Store Data Locally</Label>
                  <p className="text-sm text-muted-foreground">
                    Data is currently stored in your browser's local storage. This switch is a conceptual placeholder.
                  </p>
                </div>
                <Switch id="localBillStorage" checked={true} disabled />
              </div>
               <div className="flex flex-col sm:flex-row gap-2">
                <Button variant="outline" onClick={handleBackupData} className="w-full sm:w-auto">
                    <DownloadCloud className="mr-2 h-4 w-4" /> Backup Data to File
                </Button>
                <Button variant="outline" onClick={handleRestoreDataClick} className="w-full sm:w-auto">
                    <UploadCloud className="mr-2 h-4 w-4" /> Restore Data from File
                </Button>
               </div>
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
        <Button size="lg" onClick={handleSaveSettings}>Save Settings</Button>
      </div>
    </div>
  );
}
    

      