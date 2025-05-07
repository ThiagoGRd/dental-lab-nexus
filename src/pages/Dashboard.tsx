
import React from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import StatCards from '@/components/dashboard/StatCards';
import StatusChart from '@/components/dashboard/StatusChart';
import RecentOrders from '@/components/dashboard/RecentOrders';
import { useDashboardData } from '@/hooks/useDashboardData';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useEffect } from 'react';
import { navigateToOrdersWithFilter } from '@/utils/navigationUtils';

export default function Dashboard() {
  const { loading, stats, recentOrders, statusData, error } = useDashboardData();
  const navigate = useNavigate();

  // Mostrar toast de erro se houver
  useEffect(() => {
    if (error) {
      toast.error(`Erro ao carregar dashboard: ${error}`);
    }
  }, [error]);

  // Funções para lidar com navegação ao clicar nos cards
  const handleTotalOrdersClick = () => {
    // Navegar para todas as ordens do mês atual
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    navigateToOrdersWithFilter(navigate, {
      startDate: firstDayOfMonth.toISOString().split('T')[0],
      endDate: lastDayOfMonth.toISOString().split('T')[0],
    });
  };

  const handleInProductionClick = () => {
    // Navegar para ordens em produção
    navigateToOrdersWithFilter(navigate, {
      status: 'production'
    });
  };

  const handleCompletedClick = () => {
    // Navegar para ordens finalizadas
    navigateToOrdersWithFilter(navigate, {
      status: 'completed'
    });
  };

  const handleUrgentClick = () => {
    // Navegar para ordens urgentes
    navigateToOrdersWithFilter(navigate, {
      isUrgent: true
    });
  };

  // Função para lidar com clique em um status específico do gráfico
  const handleStatusClick = (status: string) => {
    navigateToOrdersWithFilter(navigate, {
      status: status
    });
  };

  // Função para visualizar todas as ordens
  const handleViewAllOrders = () => {
    navigate('/orders');
  };

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
          <StatCards 
            stats={stats} 
            loading={loading} 
            onTotalOrdersClick={handleTotalOrdersClick}
            onInProductionClick={handleInProductionClick}
            onCompletedClick={handleCompletedClick}
            onUrgentClick={handleUrgentClick}
          />

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <StatusChart 
              data={statusData || []} 
              onStatusClick={handleStatusClick}
            />
            
            {recentOrders && recentOrders.length > 0 ? (
              <RecentOrders 
                orders={recentOrders} 
                onViewAllClick={handleViewAllOrders}
                onOrderClick={(order) => {
                  navigateToOrdersWithFilter(navigate, {
                    searchTerm: order.id
                  });
                }}
              />
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
