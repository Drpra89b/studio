
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
  Store, // Added Store icon
} from 'lucide-react';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'New Bill', icon: FilePlus2 },
  { href: '/view-bills', label: 'View Bills', icon: ListOrdered },
  { href: '/add-stock', label: 'Add Stock', icon: PackagePlus },
  { href: '/view-stock', label: 'View Stock', icon: PackageSearch },
  { href: '/reports', label: 'View Reports', icon: LineChart },
  { href: '/manage-staff', label: 'Manage Staff', icon: Users },
  { href: '/manage-devices', label: 'Manage Devices', icon: TabletSmartphone },
  { href: '/pharmacy-profile', label: 'Pharmacy Profile', icon: Store }, // Added Pharmacy Profile link
  { href: '/settings', label: 'Settings', icon: Settings },
  { href: '/logout', label: 'Logout', icon: LogOut },
];

export default function SidebarNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {navItems.map((item) => (
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
