
import React from 'react';

interface DashboardHeaderProps {
  title: string;
  description: string;
}

export default function DashboardHeader({ title, description }: DashboardHeaderProps) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-modern-primary to-modern-tertiary bg-clip-text text-transparent">{title}</h1>
      <p className="text-slate-500 mt-2">{description}</p>
      <div className="h-1 w-24 bg-gradient-to-r from-modern-primary to-modern-tertiary rounded-full mt-3"></div>
    </div>
  );
}
