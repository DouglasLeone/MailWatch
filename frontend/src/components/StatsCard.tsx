// Componente de card estatístico - Design Premium
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning';
  className?: string;
  delay?: number;
  trend?: { value: number; isPositive: boolean };
  subtitle?: string;
}

export function StatsCard({ 
  title, 
  value, 
  icon, 
  variant = 'default', 
  className, 
  delay = 0,
  trend,
  subtitle 
}: StatsCardProps) {
  const variants = {
    default: {
      bg: 'bg-card border-border/50',
      iconBg: 'bg-muted',
      iconColor: 'text-muted-foreground',
      valueColor: 'text-foreground',
    },
    primary: {
      bg: 'bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20',
      iconBg: 'bg-primary/15',
      iconColor: 'text-primary',
      valueColor: 'text-primary',
    },
    success: {
      bg: 'bg-gradient-to-br from-success/5 to-success/10 border-success/20',
      iconBg: 'bg-success/15',
      iconColor: 'text-success',
      valueColor: 'text-success',
    },
    warning: {
      bg: 'bg-gradient-to-br from-warning/5 to-warning/10 border-warning/20',
      iconBg: 'bg-warning/15',
      iconColor: 'text-warning',
      valueColor: 'text-warning',
    },
  };

  const currentVariant = variants[variant];

  return (
    <div
      className={cn(
        "group relative rounded-2xl border p-6 shadow-card transition-all duration-300 hover:shadow-card-hover card-lift overflow-hidden animate-slide-up",
        currentVariant.bg,
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-foreground/[0.02] pointer-events-none" />
      
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className={cn(
            "flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110",
            currentVariant.iconBg
          )}>
            <div className={currentVariant.iconColor}>{icon}</div>
          </div>
          {trend && (
            <div className={cn(
              "flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
              trend.isPositive 
                ? "bg-success/10 text-success" 
                : "bg-destructive/10 text-destructive"
            )}>
              {trend.isPositive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {Math.abs(trend.value)}%
            </div>
          )}
        </div>
        
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground tracking-wide">{title}</p>
          <p className={cn(
            "text-3xl font-bold tracking-tight",
            currentVariant.valueColor
          )}>
            {typeof value === 'number' ? value.toLocaleString('pt-BR') : value}
          </p>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}
