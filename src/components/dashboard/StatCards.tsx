
import React from 'react';
import StatCard from '@/components/dashboard/StatCard';
import { FileText, Clock, Check, AlertTriangle } from 'lucide-react';

interface StatCardsProps {
  stats: {
    totalOrders: number;
    inProduction: number;
    completed: number;
    urgent: number;
  };
  loading: boolean;
}

export default function StatCards({ stats, loading }: StatCardsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total de Ordens"
        value={loading ? "..." : stats.totalOrders.toString()}
        description="no mês atual"
        icon={<FileText />}
        trend="up"
        trendValue="12%"
      />
      <StatCard
        title="Em Produção"
        value={loading ? "..." : stats.inProduction.toString()}
        description="ordens ativas"
        icon={<Clock />}
      />
      <StatCard
        title="Finalizadas"
        value={loading ? "..." : stats.completed.toString()}
        description="este mês"
        icon={<Check />}
        trend="up"
        trendValue="8%"
      />
      <StatCard
        title="Ordens Urgentes"
        value={loading ? "..." : stats.urgent.toString()}
        description="com prioridade"
        icon={<AlertTriangle />}
        className="border-red-200 bg-red-50"
      />
    </div>
  );
}
