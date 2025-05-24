
"use client"; 

import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import * as React from 'react'; 
import './globals.css';
import { SidebarProvider, Sidebar, SidebarInset, SidebarTrigger, SidebarHeader, SidebarContent, SidebarFooter } from '@/components/ui/sidebar';
import SidebarNav from '@/components/layout/sidebar-nav';
import { Toaster } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';
import { UserCircle, Settings, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [dynamicPharmacyName, setDynamicPharmacyName] = React.useState("MediStore");
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean | null>(null);
  const [isAdmin, setIsAdmin] = React.useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Function to update auth state, can be called by effect or event
  const updateAuthState = () => {
    const authStatus = localStorage.getItem('isAuthenticated');
    const adminStatus = localStorage.getItem('isAdmin');
    
    if (authStatus === 'true') {
      setIsAuthenticated(true);
      setIsAdmin(adminStatus === 'true');
    } else {
      setIsAuthenticated(false);
      setIsAdmin(false);
    }
  };

  React.useEffect(() => {
    const storedName = localStorage.getItem('pharmacyName');
    if (storedName) {
      setDynamicPharmacyName(storedName);
      document.title = `${storedName} Pharmacy Management`;
    } else {
      document.title = `MediStore Pharmacy Management`;
    }
    
    const handleNameUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<string>;
      if (customEvent.detail) {
          setDynamicPharmacyName(customEvent.detail);
          document.title = `${customEvent.detail} Pharmacy Management`;
      }
    };
    window.addEventListener('pharmacyNameUpdated', handleNameUpdate);

    // Initial auth check
    updateAuthState();

    // Listen for auth changes (e.g., after login/logout)
    window.addEventListener('authChanged', updateAuthState);
    
    return () => {
      window.removeEventListener('pharmacyNameUpdated', handleNameUpdate);
      window.removeEventListener('authChanged', updateAuthState);
    };
  }, []);

  React.useEffect(() => {
    if (isAuthenticated === false && pathname !== '/login') {
      router.push('/login');
    } else if (isAuthenticated === true && pathname === '/login') {
      router.push('/'); 
    }
  }, [isAuthenticated, pathname, router]);

  if (isAuthenticated === null) { 
    return (
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading Application...</span>
          </div>
          <Toaster />
        </body>
      </html>
    );
  }

  if (!isAuthenticated && pathname !== '/login') {
     return (
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
             <span className="ml-2 text-muted-foreground">Redirecting to login...</span>
          </div>
          <Toaster />
        </body>
      </html>
    );
  }
  
  if (pathname === '/login' && !isAuthenticated) {
    return (
      <html lang="en">
        <head>
           <title>{`${dynamicPharmacyName} Pharmacy Management - Login`}</title>
           <meta name="description" content={`Login to ${dynamicPharmacyName} Pharmacy Management`} />
        </head>
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          {children}
          <Toaster />
        </body>
      </html>
    );
  }


  return (
    <html lang="en">
      <head>
        <title>{`${dynamicPharmacyName} Pharmacy Management`}</title>
        <meta name="description" content={`Pharmacy Management Application by ${dynamicPharmacyName}`} />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <SidebarProvider defaultOpen>
          <Sidebar className="border-r" collapsible="icon">
            <SidebarHeader className="p-4">
              <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-sidebar-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9.5 14.5 2 2 4-4"/></svg>
                <span>{dynamicPharmacyName}</span>
              </Link>
            </SidebarHeader>
            <SidebarContent className="p-2">
              <SidebarNav isAdmin={isAdmin} />
            </SidebarContent>
            <SidebarFooter className="p-2 border-t">
               <Button variant="ghost" className="w-full justify-start gap-2">
                 <UserCircle className="h-5 w-5" />
                 <span className="text-sm">{isAdmin ? "Admin User" : "Staff User"}</span>
               </Button>
            </SidebarFooter>
          </Sidebar>
          <SidebarInset>
            <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-md sm:px-6 md:px-8">
              <div className="md:hidden">
                <SidebarTrigger />
              </div>
              <div className="flex-1 text-center md:text-left">
                 {/* Optionally add a dynamic page title here */}
              </div>
              <div>
                {isAdmin && (
                  <Button variant="ghost" size="icon" asChild>
                    <Link href="/settings">
                      <Settings className="h-5 w-5" />
                      <span className="sr-only">Settings</span>
                    </Link>
                  </Button>
                )}
              </div>
            </header>
            <main className="flex-1 p-4 sm:p-6 md:p-8">
              {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  );
}
