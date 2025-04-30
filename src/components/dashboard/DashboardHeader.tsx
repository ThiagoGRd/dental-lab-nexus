
import React from 'react';

interface DashboardHeaderProps {
  title: string;
  description: string;
}

export default function DashboardHeader({ title, description }: DashboardHeaderProps) {
  return (
    <div className="mb-10">
      <h1 className="text-4xl font-bold bg-gradient-to-r from-modern-primary to-modern-tertiary bg-clip-text text-transparent">{title}</h1>
      <p className="text-slate-600 mt-3 text-lg">{description}</p>
      <div className="h-1.5 w-32 bg-gradient-to-r from-modern-primary to-modern-tertiary rounded-full mt-4 animate-pulse"></div>
    </div>
  );
}
