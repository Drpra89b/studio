
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FilePlus2,
  ListOrdered,
  PackagePlus,
  PackageSearch,
  LineChart,
  Users,
  TabletSmartphone,
  Settings,
  LogOut,
  Store,
  LayoutDashboard,
} from 'lucide-react';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

const allNavItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, adminOnly: false }, // Now accessible to staff
  { href: '/', label: 'New Bill', icon: FilePlus2, adminOnly: false },
  { href: '/view-bills', label: 'View Bills', icon: ListOrdered, adminOnly: false },
  { href: '/add-stock', label: 'Add Stock', icon: PackagePlus, adminOnly: true },
  { href: '/view-stock', label: 'View Stock', icon: PackageSearch, adminOnly: false },
  { href: '/reports', label: 'View Reports', icon: LineChart, adminOnly: true },
  { href: '/manage-staff', label: 'Manage Staff', icon: Users, adminOnly: true },
  { href: '/manage-devices', label: 'Manage Devices', icon: TabletSmartphone, adminOnly: true },
  { href: '/pharmacy-profile', label: 'Pharmacy Profile', icon: Store, adminOnly: true },
  { href: '/settings', label: 'Settings', icon: Settings, adminOnly: true },
  { href: '/logout', label: 'Logout', icon: LogOut, adminOnly: false },
];

interface SidebarNavProps {
  isAdmin: boolean;
}

export default function SidebarNav({ isAdmin }: SidebarNavProps) {
  const pathname = usePathname();

  const navItems = isAdmin ? allNavItems : allNavItems.filter(item => !item.adminOnly || item.href === '/dashboard' || item.href === '/' || item.href === '/view-bills' || item.href === '/view-stock' || item.href === '/logout' );
  // Ensure staff always see these core items even if adminOnly is false by mistake for others.
  // More robustly: filter out adminOnly: true items if !isAdmin
  const effectiveNavItems = allNavItems.filter(item => {
    if (isAdmin) return true; // Admins see everything
    return !item.adminOnly; // Staff see items not marked as adminOnly
  });


  return (
    <SidebarMenu>
      {effectiveNavItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            asChild
            isActive={pathname === item.href}
            className={cn(
              "w-full justify-start",
              pathname === item.href ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90" : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
            tooltip={{children: item.label, className: "bg-popover text-popover-foreground border shadow-md"}}
          >
            <Link href={item.href} className="flex items-center gap-3">
              <item.icon className="h-5 w-5" />
              <span className="truncate group-data-[collapsible=icon]:hidden">{item.label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
