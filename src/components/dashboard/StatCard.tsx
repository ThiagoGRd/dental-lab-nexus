
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type StatCardProps = {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
};

export default function StatCard({
  title,
  value,
  description,
  icon,
  trend,
  trendValue,
  className,
}: StatCardProps) {
  return (
    <Card className={cn("transition-all hover:shadow-md border-l-4 border-l-modern-primary bg-white", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="h-6 w-6 text-modern-primary">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center text-xs text-muted-foreground mt-1">
          {trend && (
            <div 
              className={cn(
                "mr-1 font-medium", 
                trend === 'up' && "text-modern-success",
                trend === 'down' && "text-modern-danger"
              )}
            >
              {trend === 'up' && '↑ '}
              {trend === 'down' && '↓ '}
              {trendValue}
            </div>
          )}
          <div className="text-slate-500">{description}</div>
        </div>
      </CardContent>
    </Card>
  );
}
