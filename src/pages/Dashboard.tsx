
import React from 'react';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import StatCards from '@/components/dashboard/StatCards';
import StatusChart from '@/components/dashboard/StatusChart';
import RecentOrders from '@/components/dashboard/RecentOrders';
import { useDashboardData } from '@/hooks/useDashboardData';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useEffect } from 'react';

export default function Dashboard() {
  const { loading, stats, recentOrders, statusData, error } = useDashboardData();

  // Mostrar toast de erro se houver
  useEffect(() => {
    if (error) {
      toast.error(`Erro ao carregar dashboard: ${error}`);
    }
  }, [error]);

  return (
    <div className="p-6">
      <DashboardHeader 
        title="Dashboard" 
        description="Visão geral do seu laboratório"
      />

      {loading ? (
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="rounded-lg border p-4 bg-white shadow-sm">
                <Skeleton className="h-8 w-24 mb-2" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-lg border p-4 bg-white shadow-sm h-[350px]">
              <Skeleton className="h-6 w-32 mb-4" />
              <Skeleton className="h-[250px] w-full rounded-md" />
            </div>
            <div className="rounded-lg border p-4 bg-white shadow-sm h-[350px]">
              <Skeleton className="h-6 w-32 mb-4" />
              <div className="space-y-3">
                {[1, 2, 3, 4].map(i => (
                  <Skeleton key={i} className="h-16 w-full rounded-md" />
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <StatCards stats={stats} loading={loading} />

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <StatusChart data={statusData || []} />
            
            {recentOrders && recentOrders.length > 0 ? (
              <RecentOrders orders={recentOrders} />
            ) : (
              <div className="rounded-lg border p-4 bg-white shadow-sm flex items-center justify-center h-[300px]">
                <p className="text-gray-500">Nenhum pedido recente disponível</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
