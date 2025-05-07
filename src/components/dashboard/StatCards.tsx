
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
  onTotalOrdersClick?: () => void;
  onInProductionClick?: () => void;
  onCompletedClick?: () => void;
  onUrgentClick?: () => void;
}

export default function StatCards({ 
  stats, 
  loading, 
  onTotalOrdersClick,
  onInProductionClick,
  onCompletedClick,
  onUrgentClick
}: StatCardsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total de Ordens"
        value={loading ? "..." : stats.totalOrders.toString()}
        description="no mês atual"
        icon={<FileText />}
        trend="up"
        trendValue="12%"
        onClick={onTotalOrdersClick}
        className="cursor-pointer hover:bg-gray-50 transition-colors"
      />
      <StatCard
        title="Em Produção"
        value={loading ? "..." : stats.inProduction.toString()}
        description="ordens ativas"
        icon={<Clock />}
        onClick={onInProductionClick}
        className="cursor-pointer hover:bg-gray-50 transition-colors"
      />
      <StatCard
        title="Finalizadas"
        value={loading ? "..." : stats.completed.toString()}
        description="este mês"
        icon={<Check />}
        trend="up"
        trendValue="8%"
        onClick={onCompletedClick}
        className="cursor-pointer hover:bg-gray-50 transition-colors"
      />
      <StatCard
        title="Ordens Urgentes"
        value={loading ? "..." : stats.urgent.toString()}
        description="com prioridade"
        icon={<AlertTriangle />}
        className="border-red-200 bg-red-50 cursor-pointer hover:bg-red-100 transition-colors"
        onClick={onUrgentClick}
      />
    </div>
  );
}
