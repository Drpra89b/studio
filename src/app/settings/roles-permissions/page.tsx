
"use client";

import * as React from "react";
import Link from "next/link";
import { UserCog, ArrowLeft } from "lucide-react"; // Corrected from UsersCog
import PageHeader from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function RolesPermissionsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Manage Roles & Permissions"
        description="Define and assign roles and permissions to staff members."
        icon={UserCog} // Corrected from UsersCog
      />

      <Card>
        <CardHeader>
          <CardTitle>Feature Under Development</CardTitle>
          <CardDescription>
            This section is a placeholder for advanced role and permission management.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Implementing granular roles and permissions (e.g., allowing specific staff members to access
            certain modules like "Reports" or "Add Stock", or restricting actions like editing bills)
            requires a more complex backend setup and database integration.
          </p>
          <p className="text-sm text-muted-foreground">
            For now, the application distinguishes between general "Admin" and "Staff" roles, primarily
            affecting navigation and access to administrative pages like "Manage Staff" or "Settings".
          </p>
          <div className="flex justify-start pt-2">
            <Button variant="outline" asChild>
              <Link href="/settings">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Settings
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
