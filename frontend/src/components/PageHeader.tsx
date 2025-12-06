// Componente de cabeçalho de página - Design Premium
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
  badge?: {
    text: string;
    variant?: 'default' | 'primary' | 'success' | 'warning' | 'destructive';
  };
}

export function PageHeader({ title, description, actions, className, badge }: PageHeaderProps) {
  const badgeVariants = {
    default: 'bg-muted text-muted-foreground',
    primary: 'bg-primary/10 text-primary',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    destructive: 'bg-destructive/10 text-destructive',
  };

  return (
    <div className={cn("mb-8 animate-fade-in", className)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground lg:text-3xl">
              {title}
            </h1>
            {badge && (
              <span className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
                badgeVariants[badge.variant || 'default']
              )}>
                {badge.text}
              </span>
            )}
          </div>
          {description && (
            <p className="text-sm text-muted-foreground max-w-lg">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
