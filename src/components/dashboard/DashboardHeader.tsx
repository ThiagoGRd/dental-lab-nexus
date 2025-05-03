
import React from 'react';

interface DashboardHeaderProps {
  title: string;
  description: string;
}

export default function DashboardHeader({ title, description }: DashboardHeaderProps) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-semibold text-gray-800">{title}</h1>
      <p className="text-gray-500 mt-1">{description}</p>
      <div className="h-0.5 w-16 bg-blue-400 mt-2"></div>
    </div>
  );
}
