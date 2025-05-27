
import React from 'react';
import { cn } from '@/lib/utils';

interface ModernCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'bordered' | 'gradient';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const ModernCard = React.forwardRef<HTMLDivElement, ModernCardProps>(
  ({ className, variant = 'default', padding = 'md', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-xl transition-all duration-200',
          {
            'bg-card border border-border shadow-sm hover:shadow-md': variant === 'default',
            'bg-card border border-border shadow-lg hover:shadow-xl': variant === 'elevated',
            'bg-card border-2 border-primary/20 hover:border-primary/40': variant === 'bordered',
            'bg-gradient-to-br from-primary/5 to-accent/5 border border-border': variant === 'gradient',
          },
          {
            'p-0': padding === 'none',
            'p-3': padding === 'sm',
            'p-6': padding === 'md',
            'p-8': padding === 'lg',
          },
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

ModernCard.displayName = 'ModernCard';
