
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import PageHeader from "@/components/shared/page-header";
import { Users, UserPlus, Edit, UserCheck, UserX, Trash2 } from "lucide-react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

export interface StaffMember {
  id: string;
  name: string;
  username: string;
  email: string;
  status: "Active" | "Disabled";
}

// Export initialSampleStaff to be used by login page as fallback
export const initialSampleStaff: StaffMember[] = [
  { id: "1", name: "John Doe", username: "johnd", email: "john.doe@medistore.com", status: "Active" },
  { id: "2", name: "Jane Smith", username: "janes", email: "jane.smith@medistore.com", status: "Active" },
  { id: "3", name: "Mike Ross", username: "miker", email: "mike.ross@medistore.com", status: "Disabled" },
];

const addStaffFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  username: z.string().min(3, { message: "Username must be at least 3 characters." }).regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores."),
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});
type AddStaffFormValues = z.infer<typeof addStaffFormSchema>;

const editStaffFormSchema = z.object({
  id: z.string(),
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  username: z.string().min(3, { message: "Username must be at least 3 characters." }).regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores."),
  email: z.string().email({ message: "Please enter a valid email address." }),
});
type EditStaffFormValues = z.infer<typeof editStaffFormSchema>;

// Export STAFF_LIST_STORAGE_KEY to be used by login page
export const STAFF_LIST_STORAGE_KEY = "staffList";

export default function ManageStaffPage() {
  const { toast } = useToast();
  const [staffList, setStaffList] = React.useState<StaffMember[]>(() => {
    if (typeof window !== 'undefined') {
      const storedStaff = localStorage.getItem(STAFF_LIST_STORAGE_KEY);
      if (storedStaff) {
        try {
          const parsedList = JSON.parse(storedStaff);
          // Ensure it's an array before returning
          if (Array.isArray(parsedList)) {
            return parsedList;
          }
          console.warn("Stored staff list was not an array, using initial samples.");
          return initialSampleStaff;
        } catch (e) {
          console.error("Failed to parse staff list from localStorage, using initial samples.", e);
          return initialSampleStaff;
        }
      }
    }
    return initialSampleStaff;
  });

  const [isAddStaffDialogOpen, setIsAddStaffDialogOpen] = React.useState(false);
  const [isEditStaffDialogOpen, setIsEditStaffDialogOpen] = React.useState(false);
  const [editingStaff, setEditingStaff] = React.useState<StaffMember | null>(null);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STAFF_LIST_STORAGE_KEY, JSON.stringify(staffList));
    }
  }, [staffList]);

  const addForm = useForm<AddStaffFormValues>({
    resolver: zodResolver(addStaffFormSchema),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
    },
  });

  const editForm = useForm<EditStaffFormValues>({
    resolver: zodResolver(editStaffFormSchema),
    defaultValues: {
      id: "",
      name: "",
      username: "",
      email: "",
    },
  });

  function onAddStaffSubmit(data: AddStaffFormValues) {
    const newStaffMember: StaffMember = {
      id: `staff-${Date.now()}`,
      name: data.name,
      username: data.username,
      email: data.email,
      status: "Active", 
    };
    setStaffList(prevStaff => [newStaffMember, ...prevStaff]);
    toast({
      title: "Staff User Created",
      description: `${data.name} (Username: ${data.username}) has been added as an active staff member.`,
    });
    addForm.reset();
    setIsAddStaffDialogOpen(false);
  }

  const handleEditStaff = (staff: StaffMember) => {
    setEditingStaff(staff);
    editForm.reset({
      id: staff.id,
      name: staff.name,
      username: staff.username,
      email: staff.email,
    });
    setIsEditStaffDialogOpen(true);
  };

  function onEditStaffSubmit(data: EditStaffFormValues) {
    if (!editingStaff) return;

    setStaffList(prevStaffList =>
      prevStaffList.map(staff =>
        staff.id === editingStaff.id ? { ...staff, name: data.name, username: data.username, email: data.email } : staff
      )
    );
    toast({
      title: "Staff User Updated",
      description: `${data.name}'s details have been updated.`,
    });
    setIsEditStaffDialogOpen(false);
    setEditingStaff(null);
    editForm.reset();
  }

  const handleToggleStaffStatus = (staffId: string, newStatus: StaffMember['status']) => {
    setStaffList(prevStaffList =>
      prevStaffList.map(staff =>
        staff.id === staffId ? { ...staff, status: newStatus } : staff
      )
    );

    const staffMemberName = staffList.find(s => s.id === staffId)?.name || "Staff member";
    let toastMessage = "";
    if (newStatus === "Active") {
      toastMessage = `${staffMemberName} has been enabled.`;
    } else if (newStatus === "Disabled") {
      toastMessage = `${staffMemberName} has been disabled.`;
    }
    toast({
      title: "Staff Status Updated",
      description: toastMessage,
      variant: newStatus === "Disabled" ? "default" : "default", // Keep variant default for disable
    });
  };

  const handleDeleteStaff = (staffId: string) => {
    const staffMember = staffList.find(s => s.id === staffId);
    setStaffList(prevStaffList => prevStaffList.filter(staff => staff.id !== staffId));
    toast({
      title: "Staff User Deleted",
      description: `Staff member ${staffMember?.name || ''} has been permanently deleted.`,
      variant: "destructive",
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
              <Button onClick={() => { addForm.reset(); setIsAddStaffDialogOpen(true); }}>
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
              <Form {...addForm}>
                <form onSubmit={addForm.handleSubmit(onAddStaffSubmit)} className="space-y-4 py-4">
                  <FormField control={addForm.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl><Input placeholder="e.g., John Doe" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={addForm.control} name="username" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl><Input placeholder="e.g., johndoe" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={addForm.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl><Input type="email" placeholder="e.g., user@example.com" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={addForm.control} name="password" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Initial Password</FormLabel>
                      <FormControl><Input type="password" placeholder="Set initial password" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => { addForm.reset(); setIsAddStaffDialogOpen(false); }}>Cancel</Button>
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
                        <Badge variant={staff.status === "Active" ? "default" : "destructive"}
                          className={cn(
                            "font-semibold", // Make text bold for better visibility
                            staff.status === "Active" && "bg-green-500 hover:bg-green-600 text-white",
                            staff.status === "Disabled" && "bg-slate-500 hover:bg-slate-600 text-white"
                          )}>
                          {staff.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center space-x-1 sm:space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditStaff(staff)} className="min-w-24 sm:min-w-28">
                            <Edit className="mr-1 sm:mr-2 h-4 w-4"/> Edit
                        </Button>
                        {staff.status === "Active" && (
                           <Button variant="outline" size="sm" onClick={() => handleToggleStaffStatus(staff.id, "Disabled")} className="min-w-24 sm:min-w-28 hover:bg-yellow-500 hover:text-white">
                             <UserX className="mr-1 sm:mr-2 h-4 w-4"/> Disable
                           </Button>
                        )}
                        {staff.status === "Disabled" && (
                          <>
                            <Button variant="outline" size="sm" className="min-w-24 sm:min-w-28 hover:bg-green-500 hover:text-white" onClick={() => handleToggleStaffStatus(staff.id, "Active")}>
                              <UserCheck className="mr-1 sm:mr-2 h-4 w-4"/> Enable
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm" className="min-w-24 sm:min-w-28">
                                  <Trash2 className="mr-1 sm:mr-2 h-4 w-4"/> Delete
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action will permanently delete the staff member "{staff.name}". This cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteStaff(staff.id)}>
                                    Yes, Delete Staff Member
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </>
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

      {/* Edit Staff Dialog */}
      <Dialog open={isEditStaffDialogOpen} onOpenChange={(isOpen) => {
          setIsEditStaffDialogOpen(isOpen);
          if (!isOpen) setEditingStaff(null);
        }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Staff Member</DialogTitle>
            <DialogDescription>
              Update the details for {editingStaff?.name}. Password cannot be changed here.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditStaffSubmit)} className="space-y-4 py-4">
              <FormField control={editForm.control} name="id" render={({ field }) => <Input type="hidden" {...field} />} />
              <FormField control={editForm.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl><Input placeholder="e.g., John Doe" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={editForm.control} name="username" render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl><Input placeholder="e.g., johndoe" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={editForm.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl><Input type="email" placeholder="e.g., user@example.com" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => { setIsEditStaffDialogOpen(false); setEditingStaff(null); }}>Cancel</Button>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
