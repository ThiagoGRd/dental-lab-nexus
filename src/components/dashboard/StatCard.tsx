
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
    <Card className={cn("transition-all duration-300 hover:shadow-glow border-l-4 border-l-modern-primary bg-white/90 backdrop-blur-sm rounded-xl", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-600">{title}</CardTitle>
        {icon && <div className="h-7 w-7 text-modern-primary bg-modern-primary/10 p-1.5 rounded-lg">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-slate-800">{value}</div>
        <div className="flex items-center text-xs mt-2">
          {trend && (
            <div 
              className={cn(
                "mr-1 font-medium px-2 py-1 rounded-full", 
                trend === 'up' ? "text-modern-success bg-modern-success/10" : "",
                trend === 'down' ? "text-modern-danger bg-modern-danger/10" : ""
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
