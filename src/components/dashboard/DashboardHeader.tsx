
import React from 'react';

interface DashboardHeaderProps {
  title: string;
  description: string;
}

export default function DashboardHeader({ title, description }: DashboardHeaderProps) {
  return (
    <div className="mb-6">
      <h1 className="text-3xl font-bold text-dentalblue-800">{title}</h1>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
