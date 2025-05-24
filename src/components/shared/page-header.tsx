import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  className?: string;
}

export default function PageHeader({ title, description, icon: Icon, className }: PageHeaderProps) {
  return (
    <div className={cn("mb-6 sm:mb-8", className)}>
      <div className="flex items-center gap-3">
        {Icon && <Icon className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />}
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          {title}
        </h1>
      </div>
      {description && (
        <p className="mt-1 text-sm sm:text-base text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
}
