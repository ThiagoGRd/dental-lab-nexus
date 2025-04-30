
import React, { useState, useEffect, useMemo } from 'react';
import StatCard from '@/components/dashboard/StatCard';
import StatusChart from '@/components/dashboard/StatusChart';
import RecentOrders from '@/components/dashboard/RecentOrders';
import { FileText, Clock, Check, AlertTriangle } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { format } from 'date-fns';
import { mockStatusData } from '@/data/mockData';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    inProduction: 0,
    completed: 0,
    urgent: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [statusData, setStatusData] = useState(mockStatusData);

  // Otimize a consulta ao banco de dados
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Uso de Promise.all para consultas paralelas
        const [ordersResult, clientsResult] = await Promise.all([
          // Limitar a quantidade de dados retornados com select simplificado
          supabase
            .from('orders')
            .select('id, status, priority, created_at, client_id, deadline')
            .order('created_at', { ascending: false }),
          
          // Buscar apenas os clientes necessários após ter IDs dos pedidos
          supabase
            .from('clients')
            .select('id, name')
        ]);
        
        if (ordersResult.error) {
          console.error('Erro ao buscar pedidos:', ordersResult.error);
          return;
        }
        
        const ordersData = ordersResult.data || [];
        const clientsData = clientsResult.data || [];
        
        // Usar a função Date apenas uma vez para o mês e ano atual
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        // Otimizar cálculos com um único loop pelos pedidos
        let inProduction = 0;
        let completedThisMonth = 0;
        let urgent = 0;
        let ordersThisMonth = 0;
        
        ordersData.forEach(order => {
          const orderDate = new Date(order.created_at);
          const isCurrentMonth = orderDate.getMonth() === currentMonth && 
                                orderDate.getFullYear() === currentYear;
          
          if (isCurrentMonth) {
            ordersThisMonth++;
            if (order.status === 'completed' || order.status === 'delivered') {
              completedThisMonth++;
            }
          }
          
          if (order.status === 'production') {
            inProduction++;
          }
          
          if (order.priority === 'urgent') {
            urgent++;
          }
        });

        // Preparar dados para exibição de ordens recentes - apenas os 5 primeiros
        const recentOrdersData = ordersData.slice(0, 5);
        const clientsMap = new Map(clientsData.map(client => [client.id, client]));
        
        const recentOrdersFormatted = recentOrdersData.map(order => {
          const client = clientsMap.get(order.client_id);
          return {
            id: order.id.substring(0, 8),
            client: client?.name || 'Cliente não encontrado',
            service: 'Serviço',
            createdAt: format(new Date(order.created_at), 'yyyy-MM-dd'),
            dueDate: order.deadline ? format(new Date(order.deadline), 'yyyy-MM-dd') : 'Não definida',
            status: order.status,
            isUrgent: order.priority === 'urgent'
          };
        });

        // Calcular dados para o gráfico de status de forma mais eficiente
        const statusCounts = {
          pending: 0,
          production: 0,
          waiting: 0, 
          completed: 0,
          delivered: 0
        };
        
        ordersData.forEach(order => {
          if (statusCounts.hasOwnProperty(order.status)) {
            statusCounts[order.status]++;
          }
        });

        const chartData = [
          { name: 'Pendente', value: statusCounts.pending, color: '#FCD34D' },
          { name: 'Em Produção', value: statusCounts.production, color: '#60A5FA' },
          { name: 'Aguardando Material', value: statusCounts.waiting, color: '#C084FC' },
          { name: 'Finalizado', value: statusCounts.completed, color: '#4ADE80' },
          { name: 'Entregue', value: statusCounts.delivered, color: '#9CA3AF' },
        ];

        // Atualizar o estado com os dados calculados
        setStats({
          totalOrders: ordersThisMonth,
          inProduction,
          completed: completedThisMonth,
          urgent
        });
        setRecentOrders(recentOrdersFormatted);
        setStatusData(chartData);
        
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Componentes memorizados para evitar re-renderizações desnecessárias
  const statsCards = useMemo(() => (
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
  ), [loading, stats]);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-dentalblue-800">Dashboard</h1>
        <p className="text-gray-600">Visão geral do seu laboratório</p>
      </div>

      {statsCards}

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <StatusChart data={statusData} />
        <RecentOrders orders={recentOrders} />
      </div>
    </div>
  );
}
