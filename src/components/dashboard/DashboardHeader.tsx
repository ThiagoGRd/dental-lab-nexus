
import React from 'react';

interface DashboardHeaderProps {
  title: string;
  description: string;
}

export default function DashboardHeader({ title, description }: DashboardHeaderProps) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-semibold text-gray-800">{title}</h1>
      <p className="text-gray-500 mt-2">{description}</p>
      <div className="h-0.5 w-24 bg-blue-500 mt-3"></div>
    </div>
  );
}
