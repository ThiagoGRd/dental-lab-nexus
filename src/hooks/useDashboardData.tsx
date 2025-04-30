
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { format } from 'date-fns';
import { mockStatusData } from '@/data/mockData';

export function useDashboardData() {
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
        
        // Uso de Promise.all para consultas paralelas
        const [ordersResult, clientsResult] = await Promise.all([
          // Limitar a quantidade de dados retornados com select simplificado
          supabase
            .from('orders')
            .select('id, status, priority, created_at, client_id, deadline, notes')
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
          
          // Extrair o nome do paciente das notas, se disponível
          let patientName = '';
          if (order.notes && order.notes.includes('Paciente:')) {
            const patientMatch = order.notes.match(/Paciente:\s*([^,\-]+)/);
            if (patientMatch && patientMatch[1]) {
              patientName = patientMatch[1].trim();
            }
          }
          
          return {
            id: order.id.substring(0, 8),
            client: client?.name || 'Cliente não encontrado',
            patientName: patientName, // Adicionar o nome do paciente extraído das notas
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

  return {
    loading,
    stats,
    recentOrders,
    statusData
  };
}
