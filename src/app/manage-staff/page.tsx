
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import io, { type Socket } from "socket.io-client";

import PageHeader from "@/components/shared/page-header";
import { Users, UserPlus, Edit, UserCheck, UserX, Trash2, Loader2 } from "lucide-react";
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
import type { StaffMemberSupabase } from "@/app/api/staff/route"; // Import Supabase type

// Interface for client-side usage, mapping from StaffMemberSupabase if needed
// For now, we'll assume StaffMemberSupabase structure is largely compatible with UI needs
export type StaffMember = StaffMemberSupabase; 


// Zod schema for creating staff (matches API, password included for form submission)
const addStaffFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  username: z.string().min(3, { message: "Username must be at least 3 characters." }).regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores."),
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  // Status defaults to 'Active' on the backend if not provided or handled there
});
type AddStaffFormValues = z.infer<typeof addStaffFormSchema>;

// Zod schema for editing staff (matches API)
const editStaffFormSchema = z.object({
  id: z.string(), 
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  username: z.string().min(3, { message: "Username must be at least 3 characters." }).regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores."),
  email: z.string().email({ message: "Please enter a valid email address." }),
});
type EditStaffFormValues = z.infer<typeof editStaffFormSchema>;

let socket: Socket | null = null;

export default function ManageStaffPage() {
  const { toast } = useToast();
  const [staffList, setStaffList] = React.useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const [isAddStaffDialogOpen, setIsAddStaffDialogOpen] = React.useState(false);
  const [isEditStaffDialogOpen, setIsEditStaffDialogOpen] = React.useState(false);
  const [editingStaff, setEditingStaff] = React.useState<StaffMember | null>(null);

  const fetchStaff = async () => {
    setIsLoading(true);
    let errorDescription = "Could not load staff list. Please check server logs or try again later.";
    try {
      const response = await fetch('/api/staff');
      if (!response.ok) {
        try {
          const errorData = await response.json();
          if (errorData && errorData.message) {
            errorDescription = errorData.message;
          } else {
            errorDescription = `Failed to fetch staff. Status: ${response.status}`;
          }
        } catch (jsonError) {
          errorDescription = `Failed to fetch staff. Status: ${response.status}. Response not readable.`;
        }
        throw new Error(errorDescription);
      }
      const data = await response.json();
      setStaffList(data as StaffMember[]);
    } catch (error) {
      console.error("Failed to fetch staff list from API (Supabase):", error);
      toast({
        title: "Error Loading Staff",
        description: (error as Error).message, 
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchStaff();

    const initializeSocket = () => {
      socket = io(undefined!, {
        path: '/api/socket_io',
        addTrailingSlash: false,
        reconnectionAttempts: 3,
      });

      socket.on('connect', () => {
        console.log('Socket.IO: Connected to server (Supabase backend)');
        toast({ title: "Realtime Active", description: "Attempting to connect for live staff updates.", variant: "default" });
      });

      socket.on('connect_error', (err) => {
        console.error('Socket.IO: Connection error:', err.message);
         toast({ title: "Realtime Connection Issue", description: `Could not connect for live updates: ${err.message}. Realtime features may be unavailable.`, variant: "destructive" });
      });
      
      socket.on('disconnect', (reason) => {
        console.log('Socket.IO: Disconnected from server. Reason:', reason);
        if (reason !== 'io client disconnect') { 
            toast({ title: "Realtime Inactive", description: "Disconnected from live updates.", variant: "destructive" });
        }
      });
      
      socket.on('staffAdded', (newStaffMember: StaffMember) => {
        console.log('Socket.IO: staffAdded event received (Supabase)', newStaffMember);
        setStaffList((prevList) => {
          if (prevList.find(staff => staff.id === newStaffMember.id)) {
            return prevList;
          }
          return [newStaffMember, ...prevList].sort((a,b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
        });
        toast({
          title: "Staff List Updated (Realtime)",
          description: `${newStaffMember.name} was added.`,
        });
      });
       // Add listeners for staffUpdated and staffDeleted if implementing those realtime events
       socket.on('staffUpdated', (updatedStaff: StaffMember) => {
        setStaffList(prevList => 
            prevList.map(staff => staff.id === updatedStaff.id ? updatedStaff : staff)
                    .sort((a,b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
        );
        toast({ title: "Staff List Updated", description: `${updatedStaff.name}'s details were updated.` });
      });

      socket.on('staffDeleted', (deletedStaffId: string) => {
        setStaffList(prevList => prevList.filter(staff => staff.id !== deletedStaffId));
        toast({ title: "Staff Member Removed", description: `A staff member was removed.` });
      });
    };

    initializeSocket();

    return () => {
      if (socket) {
        socket.disconnect();
        socket = null;
        console.log('Socket.IO: Disconnected on component unmount.');
      }
    };
  }, [toast]);


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
  });

  async function onAddStaffSubmit(data: AddStaffFormValues) {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({...data, status: "Active"}), 
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create staff member');
      }
      // Data will be added via socket event if successful.
      // Optionally, call fetchStaff() if socket is unreliable or as a fallback.
      // await fetchStaff();
      
      toast({
        title: "Staff User Created",
        description: `${data.name} (Username: ${data.username}) has been submitted for addition.`,
      });
      addForm.reset();
      setIsAddStaffDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error Creating Staff",
        description: (error as Error).message || "Could not create staff member.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
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

  async function onEditStaffSubmit(data: EditStaffFormValues) {
    if (!editingStaff) return;
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/staff/${editingStaff.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: data.name, username: data.username, email: data.email }), 
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update staff member');
      }
      const updatedStaff = await response.json();
      // Emit event from backend for other clients, update local state immediately or via socket.
      if (socket) socket.emit('clientStaffUpdated', updatedStaff); // Client informs server, server broadcasts
      await fetchStaff(); // Or rely on socket for this client too
      
      toast({
        title: "Staff User Updated",
        description: `${data.name}'s details have been updated.`,
      });
      setIsEditStaffDialogOpen(false);
      setEditingStaff(null);
    } catch (error) {
      toast({
        title: "Error Updating Staff",
        description: (error as Error).message || "Could not update staff member.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleToggleStaffStatus = async (staffId: string, newStatus: StaffMember['status']) => {
    setIsSubmitting(true);
    const staffMemberName = staffList.find(s => s.id === staffId)?.name || "Staff member";
    try {
      const response = await fetch(`/api/staff/${staffId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update staff status');
      }
      const updatedStaff = await response.json();
      // Emit event from backend for other clients, update local state immediately or via socket.
      if (socket) socket.emit('clientStaffUpdated', updatedStaff); // Client informs server, server broadcasts
      await fetchStaff(); // Or rely on socket for this client too

      toast({
        title: "Staff Status Updated",
        description: `${staffMemberName} has been ${newStatus === "Active" ? "enabled" : "disabled"}.`,
      });
    } catch (error) {
      toast({
        title: "Error Updating Status",
        description: (error as Error).message || "Could not update staff status.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStaff = async (staffId: string) => {
    setIsSubmitting(true);
    const staffMemberName = staffList.find(s => s.id === staffId)?.name || "Staff member";
    try {
      const response = await fetch(`/api/staff/${staffId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete staff member');
      }
      // Emit event from backend for other clients, update local state immediately or via socket.
      if (socket) socket.emit('clientStaffDeleted', staffId); // Client informs server, server broadcasts
      await fetchStaff(); // Or rely on socket for this client too
      
      toast({
        title: "Staff User Deleted",
        description: `Staff member ${staffMemberName} has been permanently deleted.`,
      });
    } catch (error) {
      toast({
        title: "Error Deleting Staff",
        description: (error as Error).message || "Could not delete staff member.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading Staff...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Manage Staff" description="Add new staff, manage their status, and control access. Uses Supabase backend." icon={Users} />

      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <div>
            <CardTitle>Staff List</CardTitle>
            <CardDescription>Overview of all staff members. Realtime updates for additions may occur if connected.</CardDescription>
          </div>
          <Dialog open={isAddStaffDialogOpen} onOpenChange={setIsAddStaffDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { addForm.reset(); setIsAddStaffDialogOpen(true); }} disabled={isSubmitting}>
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
                      <FormDescription>This password is for the application, not a Supabase Auth user.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => { addForm.reset(); setIsAddStaffDialogOpen(false); }} disabled={isSubmitting}>Cancel</Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Add Staff
                    </Button>
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
                    <TableHead>Created At</TableHead>
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
                            "font-semibold",
                            staff.status === "Active" && "bg-green-500 hover:bg-green-600 text-white",
                            staff.status === "Disabled" && "bg-slate-500 hover:bg-slate-600 text-white"
                          )}>
                          {staff.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{staff.created_at ? new Date(staff.created_at).toLocaleDateString() : 'N/A'}</TableCell>
                      <TableCell className="text-center space-x-1 sm:space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditStaff(staff)} className="min-w-24 sm:min-w-28" disabled={isSubmitting}>
                            <Edit className="mr-1 sm:mr-2 h-4 w-4"/> Edit
                        </Button>
                        {staff.status === "Active" && (
                           <Button variant="outline" size="sm" onClick={() => handleToggleStaffStatus(staff.id, "Disabled")} className="min-w-24 sm:min-w-28 hover:bg-yellow-500 hover:text-white" disabled={isSubmitting}>
                             <UserX className="mr-1 sm:mr-2 h-4 w-4"/> Disable
                           </Button>
                        )}
                        {staff.status === "Disabled" && (
                          <>
                            <Button variant="outline" size="sm" className="min-w-24 sm:min-w-28 hover:bg-green-500 hover:text-white" onClick={() => handleToggleStaffStatus(staff.id, "Active")} disabled={isSubmitting}>
                              <UserCheck className="mr-1 sm:mr-2 h-4 w-4"/> Enable
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm" className="min-w-24 sm:min-w-28" disabled={isSubmitting}>
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
                                  <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteStaff(staff.id)} disabled={isSubmitting}>
                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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

      <Dialog open={isEditStaffDialogOpen} onOpenChange={(isOpen) => {
          setIsEditStaffDialogOpen(isOpen);
          if (!isOpen) setEditingStaff(null);
        }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Staff Member</DialogTitle>
            <DialogDescription>
              Update the details for {editingStaff?.name}.
            </DialogDescription>
          </DialogHeader>
          {editingStaff && (
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
                <Button type="button" variant="outline" onClick={() => { setIsEditStaffDialogOpen(false); setEditingStaff(null); }} disabled={isSubmitting}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </Form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
