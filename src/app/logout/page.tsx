
"use client";

import * as React from "react";
import { LogOut, CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export default function LogoutPage() {
  const router = useRouter();
  const { toast } = useToast();

  React.useEffect(() => {
    // Clear authentication status from localStorage
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("isAuthenticated");
    
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });

    // Optionally, redirect after a short delay or immediately
    // For now, user clicks the button to redirect
  }, [toast]);

  const handleReturnToLogin = () => {
    router.push("/login");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
       <Card className="w-full max-w-md text-center shadow-xl">
        <CardHeader>
           <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
          <CardTitle className="text-2xl font-bold">You have been successfully logged out.</CardTitle>
          <CardDescription className="text-muted-foreground">
            Thank you for using MediStore. We hope to see you again soon!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleReturnToLogin} className="w-full">
            <LogOut className="mr-2 h-4 w-4" /> Return to Login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
