
import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Buscar estatísticas de pedidos
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('id, status, priority, created_at, client_id, deadline')
          .order('created_at', { ascending: false });
          
        if (ordersError) {
          console.error('Erro ao buscar pedidos:', ordersError);
          return;
        }
        
        // Calcular estatísticas
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        const ordersThisMonth = ordersData.filter(order => {
          const orderDate = new Date(order.created_at);
          return orderDate.getMonth() === currentMonth && 
                 orderDate.getFullYear() === currentYear;
        });
        
        const inProduction = ordersData.filter(order => order.status === 'production').length;
        const completed = ordersThisMonth.filter(order => 
          order.status === 'completed' || order.status === 'delivered'
        ).length;
        const urgent = ordersData.filter(order => order.priority === 'urgent').length;

        // Buscar clientes para relacionar com os pedidos recentes
        const clientIds = ordersData.slice(0, 5).map(order => order.client_id);
        const { data: clientsData, error: clientsError } = await supabase
          .from('clients')
          .select('id, name')
          .in('id', clientIds);
          
        if (clientsError) {
          console.error('Erro ao buscar clientes:', clientsError);
        }

        // Preparar dados para exibição de ordens recentes
        const recentOrdersFormatted = ordersData.slice(0, 5).map(order => {
          const client = clientsData?.find(c => c.id === order.client_id);
          return {
            id: order.id.substring(0, 8),
            client: client?.name || 'Cliente não encontrado',
            service: 'Serviço', // Idealmente buscar de order_items
            createdAt: format(new Date(order.created_at), 'yyyy-MM-dd'),
            dueDate: order.deadline ? format(new Date(order.deadline), 'yyyy-MM-dd') : 'Não definida',
            status: order.status,
            isUrgent: order.priority === 'urgent'
          };
        });

        // Calcular dados para o gráfico de status
        const statusCounts = {
          pending: ordersData.filter(order => order.status === 'pending').length,
          production: ordersData.filter(order => order.status === 'production').length,
          waiting: ordersData.filter(order => order.status === 'waiting').length,
          completed: ordersData.filter(order => order.status === 'completed').length,
          delivered: ordersData.filter(order => order.status === 'delivered').length
        };

        const chartData = [
          { name: 'Pendente', value: statusCounts.pending, color: '#FCD34D' },
          { name: 'Em Produção', value: statusCounts.production, color: '#60A5FA' },
          { name: 'Aguardando Material', value: statusCounts.waiting, color: '#C084FC' },
          { name: 'Finalizado', value: statusCounts.completed, color: '#4ADE80' },
          { name: 'Entregue', value: statusCounts.delivered, color: '#9CA3AF' },
        ];

        // Atualizar o estado com os dados calculados
        setStats({
          totalOrders: ordersThisMonth.length,
          inProduction,
          completed,
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

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-dentalblue-800">Dashboard</h1>
        <p className="text-gray-600">Visão geral do seu laboratório</p>
      </div>

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

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <StatusChart data={statusData} />
        <RecentOrders orders={recentOrders} />
      </div>
    </div>
  );
}
