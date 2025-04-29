
import React from 'react';
import StatCard from '@/components/dashboard/StatCard';
import StatusChart from '@/components/dashboard/StatusChart';
import RecentOrders from '@/components/dashboard/RecentOrders';
import { mockStatusData, mockRecentOrders } from '@/data/mockData';
import { FileText, Clock, Check, AlertTriangle } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-dentalblue-800">Dashboard</h1>
        <p className="text-gray-600">Visão geral do seu laboratório</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total de Ordens"
          value="65"
          description="no mês atual"
          icon={<FileText />}
          trend="up"
          trendValue="12%"
        />
        <StatCard
          title="Em Produção"
          value="18"
          description="ordens ativas"
          icon={<Clock />}
        />
        <StatCard
          title="Finalizadas"
          value="30"
          description="este mês"
          icon={<Check />}
          trend="up"
          trendValue="8%"
        />
        <StatCard
          title="Ordens Urgentes"
          value="5"
          description="com prioridade"
          icon={<AlertTriangle />}
          className="border-red-200 bg-red-50"
        />
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <StatusChart data={mockStatusData} />
        <RecentOrders orders={mockRecentOrders} />
      </div>
    </div>
  );
}
