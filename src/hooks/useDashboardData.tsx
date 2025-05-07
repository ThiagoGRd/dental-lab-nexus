
import { useState, useEffect } from 'react';
import { supabase, hasError, safeData } from "@/integrations/supabase/client";
import { format } from 'date-fns';
import { toast } from 'sonner';

export function useDashboardData() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    inProduction: 0,
    completed: 0,
    urgent: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        console.log('Iniciando busca de dados para o dashboard...');
        
        // Buscar dados das ordens com tratamento mais robusto de erros
        console.log('Buscando ordens...');
        const ordersResult = await supabase
          .from('orders')
          .select('id, status, priority, created_at, client_id, deadline, notes');
        
        if (hasError(ordersResult)) {
          console.error('Erro ao buscar ordens:', ordersResult.error);
          toast.error('Falha ao carregar dados de ordens');
          setError(ordersResult.error?.message || 'Erro desconhecido');
          setLoading(false);
          return;
        }
        
        // Buscar dados dos clientes
        console.log('Buscando clientes...');
        const clientsResult = await supabase
          .from('clients')
          .select('id, name');
          
        if (hasError(clientsResult)) {
          console.error('Erro ao buscar clientes:', clientsResult.error);
          toast.error('Falha ao carregar dados de clientes');
          // Continuar mesmo com erro em clientes
        }
        
        const ordersData = safeData(ordersResult, []);
        const clientsData = safeData(clientsResult, []);
        
        console.log('Dashboard: Pedidos carregados:', ordersData.length);
        console.log('Dashboard: Clientes carregados:', clientsData.length);
        
        // Verificar se temos dados para processar
        if (ordersData.length === 0) {
          console.log('Nenhum pedido encontrado no banco de dados');
          
          // Definir dados padrão para a visualização
          setStats({
            totalOrders: 0,
            inProduction: 0,
            completed: 0,
            urgent: 0
          });
          
          setRecentOrders([]);
          
          setStatusData([
            { name: 'Pendente', value: 0, color: '#FCD34D' },
            { name: 'Em Produção', value: 0, color: '#60A5FA' },
            { name: 'Aguardando Material', value: 0, color: '#C084FC' },
            { name: 'Finalizado', value: 0, color: '#4ADE80' },
            { name: 'Entregue', value: 0, color: '#9CA3AF' },
          ]);
          
          setLoading(false);
          return;
        }
        
        // Calcular estatísticas
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        let inProduction = 0;
        let completedThisMonth = 0;
        let urgent = 0;
        let ordersThisMonth = 0;
        
        // Inicializar contadores de status
        const statusCounts = {
          pending: 0,
          production: 0,
          waiting: 0, 
          completed: 0,
          delivered: 0
        };
        
        // Processar cada ordem para calcular estatísticas
        ordersData.forEach(order => {
          // Incrementar contador de status
          if (statusCounts[order.status] !== undefined) {
            statusCounts[order.status]++;
          }
          
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

        console.log('Dashboard stats calculados:', { 
          totalOrders: ordersThisMonth, 
          inProduction, 
          completed: completedThisMonth, 
          urgent 
        });
        console.log('Status counts:', statusCounts);

        // Processar ordens recentes
        const recentOrdersData = ordersData
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5);
        
        // Criar mapa para busca rápida de clientes
        const clientsMap = new Map(clientsData.map(client => [client.id, client]));
        
        const recentOrdersFormatted = recentOrdersData.map(order => {
          const client = clientsMap.get(order.client_id) || { name: 'Cliente não encontrado' };
          
          // Extrair nome do paciente
          let patientName = '';
          if (order.notes && typeof order.notes === 'string' && order.notes.includes('Paciente:')) {
            const patientMatch = order.notes.match(/Paciente:\s*([^,\-]+)/);
            if (patientMatch && patientMatch[1]) {
              patientName = patientMatch[1].trim();
            }
          }
          
          return {
            id: order.id.substring(0, 8),
            client: client.name,
            patientName,
            service: 'Serviço',
            createdAt: format(new Date(order.created_at), 'dd/MM/yyyy'),
            dueDate: order.deadline ? format(new Date(order.deadline), 'dd/MM/yyyy') : 'Não definida',
            status: order.status,
            isUrgent: order.priority === 'urgent'
          };
        });

        console.log('Dashboard: Ordens recentes formatadas:', recentOrdersFormatted.length);

        // Preparar dados para o gráfico de status
        const chartData = [
          { name: 'Pendente', value: statusCounts.pending, color: '#FCD34D' },
          { name: 'Em Produção', value: statusCounts.production, color: '#60A5FA' },
          { name: 'Aguardando Material', value: statusCounts.waiting, color: '#C084FC' },
          { name: 'Finalizado', value: statusCounts.completed, color: '#4ADE80' },
          { name: 'Entregue', value: statusCounts.delivered, color: '#9CA3AF' },
        ];

        console.log('Dashboard: Chart data:', chartData);

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
        toast.error('Erro ao carregar dados do dashboard');
        setError(error?.message || 'Erro desconhecido');
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
    statusData,
    error
  };
}
