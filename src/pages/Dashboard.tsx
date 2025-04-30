
import React from 'react';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import StatCards from '@/components/dashboard/StatCards';
import StatusChart from '@/components/dashboard/StatusChart';
import RecentOrders from '@/components/dashboard/RecentOrders';
import { useDashboardData } from '@/hooks/useDashboardData';

export default function Dashboard() {
  const { loading, stats, recentOrders, statusData } = useDashboardData();

  return (
    <div className="p-6">
      <DashboardHeader 
        title="Dashboard" 
        description="Visão geral do seu laboratório"
      />

      <StatCards stats={stats} loading={loading} />

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <StatusChart data={statusData} />
        <RecentOrders orders={recentOrders} />
      </div>
    </div>
  );
}
