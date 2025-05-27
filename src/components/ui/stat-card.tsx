
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ModernCard } from './modern-card';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
  variant = 'default'
}: StatCardProps) {
  return (
    <ModernCard 
      variant="elevated" 
      className={cn(
        'relative overflow-hidden group hover:scale-[1.02] transition-transform duration-200',
        {
          'border-primary/20': variant === 'primary',
          'border-green-500/20': variant === 'success',
          'border-amber-500/20': variant === 'warning',
          'border-red-500/20': variant === 'danger',
        },
        className
      )}
    >
      {/* Background decoration */}
      <div className={cn(
        'absolute top-0 right-0 w-20 h-20 rounded-full blur-3xl opacity-10 transition-opacity group-hover:opacity-20',
        {
          'bg-primary': variant === 'primary',
          'bg-green-500': variant === 'success',
          'bg-amber-500': variant === 'warning',
          'bg-red-500': variant === 'danger',
          'bg-muted': variant === 'default',
        }
      )} />
      
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="flex items-baseline space-x-2">
            <h3 className="text-2xl font-bold text-foreground">{value}</h3>
            {trend && (
              <span className={cn(
                'text-xs font-medium px-1.5 py-0.5 rounded-full',
                trend.isPositive 
                  ? 'text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/30'
                  : 'text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/30'
              )}>
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
            )}
          </div>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        
        {Icon && (
          <div className={cn(
            'p-2 rounded-lg',
            {
              'bg-primary/10 text-primary': variant === 'primary',
              'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400': variant === 'success',
              'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400': variant === 'warning',
              'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400': variant === 'danger',
              'bg-muted text-muted-foreground': variant === 'default',
            }
          )}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </ModernCard>
  );
}
