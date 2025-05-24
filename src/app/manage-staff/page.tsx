
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Image from 'next/image'; // Kept for potential future use, but QR dialog is removed

import PageHeader from "@/components/shared/page-header";
import { Users, UserPlus, Edit, UserCheck, UserX } from "lucide-react";
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
  username: string;
  email: string;
  status: "Active" | "Disabled"; // Removed "Pending Activation"
  // Role is implicitly "Staff" for users created here
}

const initialSampleStaff: StaffMember[] = [
  { id: "1", name: "John Doe", username: "johnd", email: "john.doe@medistore.com", status: "Active" },
  { id: "2", name: "Jane Smith", username: "janes", email: "jane.smith@medistore.com", status: "Active" },
  { id: "3", name: "Mike Ross", username: "miker", email: "mike.ross@medistore.com", status: "Disabled" },
];

const addStaffFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  username: z.string().min(3, { message: "Username must be at least 3 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

type AddStaffFormValues = z.infer<typeof addStaffFormSchema>;

export default function ManageStaffPage() {
  const { toast } = useToast();
  const [staffList, setStaffList] = React.useState<StaffMember[]>(initialSampleStaff);
  const [isAddStaffDialogOpen, setIsAddStaffDialogOpen] = React.useState(false);

  const form = useForm<AddStaffFormValues>({
    resolver: zodResolver(addStaffFormSchema),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
    },
  });

  function onAddStaffSubmit(data: AddStaffFormValues) {
    const newStaffMember: StaffMember = {
      id: `staff-${Date.now()}`,
      name: data.name,
      username: data.username,
      email: data.email,
      status: "Active", // New users are active by default
    };
    setStaffList(prevStaff => [newStaffMember, ...prevStaff]);
    toast({
      title: "Staff User Created",
      description: `${data.name} (Username: ${data.username}) has been added as an active staff member.`,
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
      toastMessage = `${staffMemberName} has been enabled.`;
    } else if (newStatus === "Disabled") {
      toastMessage = `${staffMemberName} has been disabled.`;
    }

    toast({
      title: "Staff Status Updated",
      description: toastMessage,
      variant: newStatus === "Disabled" ? "destructive" : "default",
    });
  };


  return (
    <div className="space-y-6">
      <PageHeader title="Manage Staff" description="Add new staff, manage their status, and control access." icon={Users} />

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
                  Enter the details for the new staff member. Their account will be created as 'Active'.
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
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., johndoe" {...field} />
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
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Set initial password" {...field} />
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
                    <TableHead>Username</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staffList.map((staff) => (
                    <TableRow key={staff.id}>
                      <TableCell className="font-medium">{staff.name}</TableCell>
                      <TableCell>{staff.username}</TableCell>
                      <TableCell>{staff.email}</TableCell>
                      <TableCell>
                        <Badge variant={
                          staff.status === "Active" ? "default" : "destructive"
                        }
                        className={cn(
                          staff.status === "Active" && "bg-green-500 hover:bg-green-600 text-white",
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
    </div>
  );
}
