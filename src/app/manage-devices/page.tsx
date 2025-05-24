
"use client";

import * as React from "react";
import PageHeader from "@/components/shared/page-header";
import { TabletSmartphone, Trash2, Laptop, Smartphone } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

interface Device {
  id: string;
  name: string;
  type: "Mobile" | "Tablet" | "Desktop";
  lastLogin: string;
  ipAddress: string;
}

const sampleDevices: Device[] = []; // Cleared sample devices


export default function ManageDevicesPage() {
  const { toast } = useToast();
  const [devices, setDevices] = React.useState<Device[]>(sampleDevices);

  const handleRemoveDevice = (deviceId: string) => {
    setDevices(prevDevices => prevDevices.filter(device => device.id !== deviceId));
    toast({
      title: "Device Removed",
      description: `Device access has been revoked successfully.`,
    });
  };

  const getDeviceIcon = (type: Device["type"]) => {
    switch (type) {
      case "Mobile": return <Smartphone className="h-5 w-5 text-muted-foreground" />;
      case "Tablet": return <TabletSmartphone className="h-5 w-5 text-muted-foreground" />;
      case "Desktop": return <Laptop className="h-5 w-5 text-muted-foreground" />;
      default: return <TabletSmartphone className="h-5 w-5 text-muted-foreground" />;
    }
  };
  
  return (
    <div className="space-y-6">
      <PageHeader title="Manage Devices" description="View and manage devices logged into the application." icon={TabletSmartphone} />

      <Card>
        <CardHeader>
          <CardTitle>Logged-in Devices</CardTitle>
          <CardDescription>
            Monitor devices accessing MediStore. You can revoke access if needed. (This is a conceptual feature).
          </CardDescription>
        </CardHeader>
        <CardContent>
           {devices.length === 0 ? (
             <p className="text-sm text-muted-foreground text-center py-4">No devices are currently logged in or tracked.</p>
           ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Device Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {devices.map((device) => (
                    <TableRow key={device.id}>
                      <TableCell className="font-medium">{device.name}</TableCell>
                      <TableCell className="flex items-center gap-2">
                        {getDeviceIcon(device.type)}
                        {device.type}
                      </TableCell>
                      <TableCell>{device.lastLogin}</TableCell>
                      <TableCell>{device.ipAddress}</TableCell>
                      <TableCell className="text-center">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="mr-2 h-4 w-4" /> Revoke Access
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action will remove access for the device "{device.name}". 
                                The user will need to log in again. This cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleRemoveDevice(device.id)}>
                                Yes, Revoke Access
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
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
