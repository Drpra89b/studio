
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Store, LogIn, User, Shield, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { StaffMember } from "@/app/manage-staff/page"; // Import StaffMember type


export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [role, setRole] = React.useState<"admin" | "staff">("staff");
  const [pharmacyName, setPharmacyName] = React.useState("MediStore");
  const [isLoadingStaffList, setIsLoadingStaffList] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    const storedPharmacyName = localStorage.getItem('pharmacyName');
    if (storedPharmacyName) {
      setPharmacyName(storedPharmacyName);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    if (!username || !password) {
      toast({
        title: "Login Failed",
        description: "Please enter username and password.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    if (role === "staff") {
      setIsLoadingStaffList(true);
      let staffListToAuthAgainst: StaffMember[] = [];
      try {
        const response = await fetch('/api/staff');
        if (!response.ok) {
          throw new Error('Failed to fetch staff list for authentication.');
        }
        staffListToAuthAgainst = await response.json();
      } catch (error) {
        console.error("Failed to fetch staff list from API", error);
        toast({
          title: "Login Error",
          description: "Could not verify staff credentials. Please try again later.",
          variant: "destructive",
        });
        setIsLoadingStaffList(false);
        setIsSubmitting(false);
        return;
      }
      setIsLoadingStaffList(false);
      
      if (staffListToAuthAgainst.length === 0) {
         toast({
          title: "Login Failed",
          description: "No staff accounts configured. Please contact an administrator.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      const staffMember = staffListToAuthAgainst.find(staff => staff.username === username);

      if (!staffMember) {
        toast({
          title: "Login Failed",
          description: "Invalid username or password.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      if (staffMember.status !== "Active") {
        toast({
          title: "Login Denied",
          description: "Your account is not active. Please contact an administrator.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
    }

    // If admin or active staff, proceed
    localStorage.setItem("isAdmin", role === "admin" ? "true" : "false");
    localStorage.setItem("isAuthenticated", "true");
    window.dispatchEvent(new CustomEvent('authChanged'));

    toast({
      title: "Login Successful",
      description: `Welcome, ${username}! You are logged in as ${role}.`,
    });
    router.push("/"); // Redirect to dashboard or home page
    // No need to setIsSubmitting(false) here as we are navigating away.
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <Store className="mx-auto h-12 w-12 text-primary mb-2" />
          <CardTitle className="text-2xl font-bold">{pharmacyName} Login</CardTitle>
          <CardDescription>Enter your credentials to access the system.</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  placeholder="e.g., admin_user or staff_username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="pl-10"
                  disabled={isSubmitting || isLoadingStaffList}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10"
                  disabled={isSubmitting || isLoadingStaffList}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={(value: "admin" | "staff") => setRole(value)} disabled={isSubmitting || isLoadingStaffList}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isSubmitting || isLoadingStaffList}>
              {(isSubmitting || isLoadingStaffList) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Login
            </Button>
          </CardFooter>
        </form>
      </Card>
      <p className="mt-6 text-xs text-muted-foreground">
        Staff login requires an active account created by an admin.
      </p>
    </div>
  );
}
