
import React from 'react';
import { cn } from '@/lib/utils';
import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down';
  trendValue?: string;
  className?: string;
  onClick?: () => void;
}

export default function StatCard({
  title,
  value,
  description,
  icon,
  trend,
  trendValue,
  className,
  onClick
}: StatCardProps) {
  return (
    <div 
      className={cn(
        "rounded-lg border p-4 bg-white shadow-sm",
        onClick && "cursor-pointer hover:shadow-md transition-all",
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <div className="rounded-full bg-gray-50 p-2">{icon}</div>
      </div>
      <div className="mt-3">
        <p className="text-2xl font-semibold">{value}</p>
        <div className="flex items-center mt-1">
          <p className="text-xs text-gray-500">{description}</p>
          {trend && trendValue && (
            <div className={cn(
              "ml-2 flex items-center text-xs",
              trend === 'up' ? 'text-green-500' : 'text-red-500'
            )}>
              {trend === 'up' ? <ArrowUpIcon className="h-3 w-3 mr-0.5" /> : <ArrowDownIcon className="h-3 w-3 mr-0.5" />}
              {trendValue}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
