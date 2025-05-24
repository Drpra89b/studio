"use client";

import PageHeader from "@/components/shared/page-header";
import { Users, QrCode, UserPlus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface StaffMember {
  id: string;
  name: string;
  role: string;
  email: string;
  status: "Active" | "Pending Activation" | "Disabled";
}

const sampleStaff: StaffMember[] = [
  { id: "1", name: "John Doe", role: "Pharmacist", email: "john.doe@medistore.com", status: "Active" },
  { id: "2", name: "Jane Smith", role: "Cashier", email: "jane.smith@medistore.com", status: "Active" },
  { id: "3", name: "Mike Ross", role: "Technician", email: "mike.ross@medistore.com", status: "Pending Activation" },
  { id: "4", name: "Sarah Connor", role: "Admin", email: "sarah.connor@medistore.com", status: "Disabled" },
];


export default function ManageStaffPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Manage Staff" description="Add new staff, manage roles, and control access." icon={Users} />

      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <div>
            <CardTitle>Staff List</CardTitle>
            <CardDescription>Overview of all staff members and their status.</CardDescription>
          </div>
          <Button>
            <UserPlus className="mr-2 h-4 w-4" /> Add New Staff
          </Button>
        </CardHeader>
        <CardContent>
           {sampleStaff.length === 0 ? (
             <p className="text-sm text-muted-foreground text-center py-4">No staff members added yet.</p>
           ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sampleStaff.map((staff) => (
                    <TableRow key={staff.id}>
                      <TableCell className="font-medium">{staff.name}</TableCell>
                      <TableCell>{staff.role}</TableCell>
                      <TableCell>{staff.email}</TableCell>
                      <TableCell>
                        <Badge variant={
                          staff.status === "Active" ? "default" :
                          staff.status === "Pending Activation" ? "secondary" : 
                          "destructive"
                        }
                        className={cn(
                          staff.status === "Active" && "bg-green-500 hover:bg-green-600 text-white",
                          staff.status === "Pending Activation" && "bg-yellow-500 hover:bg-yellow-600 text-black",
                          staff.status === "Disabled" && "bg-slate-500 hover:bg-slate-600 text-white"
                        )}
                        >
                          {staff.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center space-x-2">
                        <Button variant="outline" size="sm">Edit</Button>
                        {staff.status === "Pending Activation" && (
                           <Button variant="outline" size="sm" className="text-primary border-primary hover:bg-primary/10">
                            <QrCode className="mr-2 h-4 w-4"/> Activate
                           </Button>
                        )}
                         {staff.status !== "Disabled" && (
                           <Button variant="destructive" size="sm">Disable</Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
           )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Staff Activation Process</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>New staff members will complete a sign-up form. After submission, their account will be in a "Pending Activation" state.</p>
          <p>An Admin can then activate the staff account by generating a QR code from their profile or through an action in the table above.</p>
          <p className="font-semibold text-foreground">Note: The sign-up form and QR code generation functionality are not implemented in this scaffold.</p>
           <div className="flex items-center justify-center p-6 bg-muted rounded-md mt-4">
            <QrCode className="h-16 w-16 text-muted-foreground/50" />
            <p className="ml-4">QR Code generation and scanning simulation area.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
