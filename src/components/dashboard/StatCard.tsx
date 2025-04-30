
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
    <Card className={cn("transition-all duration-200 bg-white border border-gray-100 rounded-md shadow-sm hover:shadow-md", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
        {icon && <div className="h-7 w-7 text-blue-500">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold text-gray-800">{value}</div>
        <div className="flex items-center text-xs mt-2">
          {trend && (
            <div 
              className={cn(
                "mr-2 font-medium px-1.5 py-0.5 rounded-sm", 
                trend === 'up' ? "text-green-700 bg-green-50" : "",
                trend === 'down' ? "text-red-700 bg-red-50" : ""
              )}
            >
              {trend === 'up' && '↑ '}
              {trend === 'down' && '↓ '}
              {trendValue}
            </div>
          )}
          <div className="text-gray-500">{description}</div>
        </div>
      </CardContent>
    </Card>
  );
}
