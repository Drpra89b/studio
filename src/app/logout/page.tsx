"use client";

import * as React from "react";
import { LogOut, CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import PageHeader from "@/components/shared/page-header";

export default function LogoutPage() {
  // In a real app, actual logout logic (clearing session, redirecting) would happen here or in a server action.
  // For this scaffold, it's a confirmation page.

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
          <Button asChild className="w-full">
            <Link href="/">
              Return to Login
            </Link>
          </Button>
          <p className="mt-4 text-xs text-muted-foreground">
            (This is a simulated logout. In a real application, you would be redirected to a login page.)
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
