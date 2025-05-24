import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { SidebarProvider, Sidebar, SidebarInset, SidebarTrigger, SidebarHeader, SidebarContent, SidebarFooter } from '@/components/ui/sidebar';
import SidebarNav from '@/components/layout/sidebar-nav';
import { Toaster } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';
import { UserCircle, Settings } from 'lucide-react';
import Link from 'next/link';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'MediStore Pharmacy Management',
  description: 'Pharmacy Management Application by MediStore',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <SidebarProvider defaultOpen>
          <Sidebar className="border-r" collapsible="icon">
            <SidebarHeader className="p-4">
              <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-sidebar-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9.5 14.5 2 2 4-4"/></svg>
                <span>MediStore</span>
              </Link>
            </SidebarHeader>
            <SidebarContent className="p-2">
              <SidebarNav />
            </SidebarContent>
            <SidebarFooter className="p-2 border-t">
               <Button variant="ghost" className="w-full justify-start gap-2">
                 <UserCircle className="h-5 w-5" />
                 <span className="text-sm">Admin User</span>
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
                <Button variant="ghost" size="icon" asChild>
                  <Link href="/settings">
                    <Settings className="h-5 w-5" />
                    <span className="sr-only">Settings</span>
                  </Link>
                </Button>
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
