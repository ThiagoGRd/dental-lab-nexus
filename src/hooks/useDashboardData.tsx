
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
        
        // Use Promise.all for parallel requests to reduce waiting time
        const [ordersResult, clientsResult] = await Promise.all([
          // Limit fields and use more efficient queries
          supabase
            .from('orders')
            .select('id, status, priority, created_at, client_id, deadline, notes')
            .order('created_at', { ascending: false }),
          
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
        
        // Optimize by calculating in a single loop
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        let inProduction = 0;
        let completedThisMonth = 0;
        let urgent = 0;
        let ordersThisMonth = 0;
        
        // Calculate stats in a single pass
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

        // Only process the 5 most recent orders for better performance
        const recentOrdersData = ordersData.slice(0, 5);
        
        // Use a Map for O(1) lookups instead of repeated finds
        const clientsMap = new Map(clientsData.map(client => [client.id, client]));
        
        const recentOrdersFormatted = recentOrdersData.map(order => {
          const client = clientsMap.get(order.client_id);
          
          // Extract patient name using a more optimized approach
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
            patientName,
            service: 'Serviço',
            createdAt: format(new Date(order.created_at), 'yyyy-MM-dd'),
            dueDate: order.deadline ? format(new Date(order.deadline), 'yyyy-MM-dd') : 'Não definida',
            status: order.status,
            isUrgent: order.priority === 'urgent'
          };
        });

        // More efficient status counting using a reducer
        const statusCounts = ordersData.reduce((acc, order) => {
          if (acc[order.status] !== undefined) {
            acc[order.status]++;
          }
          return acc;
        }, {
          pending: 0,
          production: 0,
          waiting: 0, 
          completed: 0,
          delivered: 0
        });

        const chartData = [
          { name: 'Pendente', value: statusCounts.pending, color: '#FCD34D' },
          { name: 'Em Produção', value: statusCounts.production, color: '#60A5FA' },
          { name: 'Aguardando Material', value: statusCounts.waiting, color: '#C084FC' },
          { name: 'Finalizado', value: statusCounts.completed, color: '#4ADE80' },
          { name: 'Entregue', value: statusCounts.delivered, color: '#9CA3AF' },
        ];

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
