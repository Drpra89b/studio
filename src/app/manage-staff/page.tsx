
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Image from 'next/image';

import PageHeader from "@/components/shared/page-header";
import { Users, QrCode, UserPlus, Edit, UserCheck, UserX } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

interface StaffMember {
  id: string;
  name: string;
  role: string;
  email: string;
  status: "Active" | "Pending Activation" | "Disabled";
}

const initialSampleStaff: StaffMember[] = [
  { id: "1", name: "John Doe", role: "Pharmacist", email: "john.doe@medistore.com", status: "Active" },
  { id: "2", name: "Jane Smith", role: "Cashier", email: "jane.smith@medistore.com", status: "Active" },
  { id: "3", name: "Mike Ross", role: "Technician", email: "mike.ross@medistore.com", status: "Pending Activation" },
  { id: "4", name: "Sarah Connor", role: "Admin", email: "sarah.connor@medistore.com", status: "Disabled" },
];

const addStaffFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  role: z.string().min(2, { message: "Role must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
});

type AddStaffFormValues = z.infer<typeof addStaffFormSchema>;

export default function ManageStaffPage() {
  const { toast } = useToast();
  const [staffList, setStaffList] = React.useState<StaffMember[]>(initialSampleStaff);
  const [isAddStaffDialogOpen, setIsAddStaffDialogOpen] = React.useState(false);
  const [isQrCodeDialogOpen, setIsQrCodeDialogOpen] = React.useState(false);
  const [selectedStaffForActivation, setSelectedStaffForActivation] = React.useState<StaffMember | null>(null);

  const form = useForm<AddStaffFormValues>({
    resolver: zodResolver(addStaffFormSchema),
    defaultValues: {
      name: "",
      role: "",
      email: "",
    },
  });

  function onAddStaffSubmit(data: AddStaffFormValues) {
    const newStaffMember: StaffMember = {
      id: `staff-${Date.now()}`,
      name: data.name,
      role: data.role,
      email: data.email,
      status: "Pending Activation",
    };
    setStaffList(prevStaff => [newStaffMember, ...prevStaff]);
    toast({
      title: "Staff Added",
      description: `${data.name} has been added as ${data.role}. Their status is Pending Activation.`,
    });
    form.reset();
    setIsAddStaffDialogOpen(false);
  }

  const handleToggleStaffStatus = (staffId: string, newStatus: StaffMember['status']) => {
    setStaffList(prevStaffList =>
      prevStaffList.map(staff =>
        staff.id === staffId ? { ...staff, status: newStatus } : staff
      )
    );

    let toastMessage = "";
    const staffMemberName = staffList.find(s => s.id === staffId)?.name || "Staff member";

    if (newStatus === "Active") {
      toastMessage = `${staffMemberName} has been activated.`;
    } else if (newStatus === "Disabled") {
      toastMessage = `${staffMemberName} has been disabled.`;
    } else { 
      toastMessage = `${staffMemberName}'s status set to ${newStatus}.`;
    }

    toast({
      title: "Staff Status Updated",
      description: toastMessage,
      variant: newStatus === "Disabled" ? "destructive" : "default",
    });
  };

  const openQrActivationDialog = (staff: StaffMember) => {
    setSelectedStaffForActivation(staff);
    setIsQrCodeDialogOpen(true);
  };

  const confirmQrActivation = () => {
    if (selectedStaffForActivation) {
      handleToggleStaffStatus(selectedStaffForActivation.id, "Active");
    }
    setIsQrCodeDialogOpen(false);
    setSelectedStaffForActivation(null);
  };


  return (
    <div className="space-y-6">
      <PageHeader title="Manage Staff" description="Add new staff, manage roles, and control access." icon={Users} />

      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <div>
            <CardTitle>Staff List</CardTitle>
            <CardDescription>Overview of all staff members and their status.</CardDescription>
          </div>
          <Dialog open={isAddStaffDialogOpen} onOpenChange={setIsAddStaffDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setIsAddStaffDialogOpen(true)}>
                <UserPlus className="mr-2 h-4 w-4" /> Add New Staff
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Staff Member</DialogTitle>
                <DialogDescription>
                  Enter the details for the new staff member. Their account will be pending activation.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onAddStaffSubmit)} className="space-y-4 py-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Pharmacist, Cashier" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="e.g., user@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => { form.reset(); setIsAddStaffDialogOpen(false); }}>Cancel</Button>
                    <Button type="submit">Add Staff</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
           {staffList.length === 0 ? (
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
                  {staffList.map((staff) => (
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
                        <Button variant="outline" size="sm" onClick={() => toast({ title: "Edit Clicked", description: "Edit functionality placeholder."})}>
                            <Edit className="mr-2 h-4 w-4"/> Edit
                        </Button>
                        {staff.status === "Pending Activation" && (
                           <>
                             <Button variant="outline" size="sm" className="text-primary border-primary hover:bg-primary/10" onClick={() => openQrActivationDialog(staff)}>
                               <QrCode className="mr-2 h-4 w-4"/> Activate
                             </Button>
                             <Button variant="destructive" size="sm" onClick={() => handleToggleStaffStatus(staff.id, "Disabled")}>
                               <UserX className="mr-2 h-4 w-4"/> Disable
                             </Button>
                           </>
                        )}
                         {staff.status === "Active" && (
                           <Button variant="destructive" size="sm" onClick={() => handleToggleStaffStatus(staff.id, "Disabled")}>
                             <UserX className="mr-2 h-4 w-4"/> Disable
                           </Button>
                        )}
                        {staff.status === "Disabled" && (
                           <Button variant="default" size="sm" className="bg-green-500 hover:bg-green-600 text-white" onClick={() => handleToggleStaffStatus(staff.id, "Active")}>
                             <UserCheck className="mr-2 h-4 w-4"/> Enable
                           </Button>
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

      {/* QR Code Activation Dialog */}
      {selectedStaffForActivation && (
        <Dialog open={isQrCodeDialogOpen} onOpenChange={(isOpen) => {
          setIsQrCodeDialogOpen(isOpen);
          if (!isOpen) setSelectedStaffForActivation(null);
        }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Activate Staff: {selectedStaffForActivation.name}</DialogTitle>
              <DialogDescription>
                Ask {selectedStaffForActivation.name} to scan this QR code with their device to complete activation.
                Once they confirm successful scanning, click the button below.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center justify-center space-y-4 py-4">
              <Image 
                src="https://placehold.co/200x200.png?text=Scan+Me" 
                alt="Placeholder QR Code" 
                width={200} 
                height={200}
                data-ai-hint="qr code" 
                className="rounded-md shadow-md"
              />
              <p className="text-sm text-muted-foreground">
                (This is a placeholder QR code for demonstration.)
              </p>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => {setIsQrCodeDialogOpen(false); setSelectedStaffForActivation(null);}}>Cancel</Button>
              <Button type="button" onClick={confirmQrActivation}>Confirm Activation & Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Staff Activation Process Notes</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>New staff members are added with a "Pending Activation" status.</p>
          <p>To activate a staff account:</p>
          <ol className="list-decimal list-inside pl-4">
            <li>Click the "Activate" button (with the <QrCode className="inline h-4 w-4" /> icon) next to the staff member.</li>
            <li>A dialog will appear displaying a QR code (placeholder for this demo).</li>
            <li>Instruct the staff member to scan this QR code with their device (simulated step).</li>
            <li>Once the staff member confirms they have scanned it, click "Confirm Activation & Close" in the dialog.</li>
            <li>The staff member's status will then be updated to "Active".</li>
          </ol>
          <p>Disabling or re-enabling staff is also done via the action buttons in the table.</p>
        </CardContent>
      </Card>
    </div>
  );
}
