
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { OrderStatus } from '@/data/mockData';
import { toast } from 'sonner';
import { format } from 'date-fns';

export function useOrdersData() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<any[]>([]);

  // Carregar ordens do banco de dados
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select(`
            id, 
            status, 
            priority, 
            created_at, 
            deadline, 
            notes,
            client_id
          `)
          .order('created_at', { ascending: false });
          
        if (ordersError) {
          console.error('Erro ao buscar ordens:', ordersError);
          toast.error('Erro ao carregar as ordens de serviço.');
          return;
        }
        
        // Buscar todos os clientes para associar às ordens
        const { data: clientsData, error: clientsError } = await supabase
          .from('clients')
          .select('id, name');
          
        if (clientsError) {
          console.error('Erro ao buscar clientes:', clientsError);
          toast.error('Erro ao carregar dados dos clientes.');
          return;
        }

        // Buscar itens de serviço para cada ordem
        const { data: orderItemsData, error: orderItemsError } = await supabase
          .from('order_items')
          .select(`
            order_id,
            service_id,
            notes
          `);

        if (orderItemsError) {
          console.error('Erro ao buscar itens de ordem:', orderItemsError);
        }

        // Buscar serviços para associar aos itens
        const { data: servicesData, error: servicesError } = await supabase
          .from('services')
          .select('id, name');

        if (servicesError) {
          console.error('Erro ao buscar serviços:', servicesError);
        }

        // Formatar dados das ordens
        const formattedOrders = ordersData.map(order => {
          const client = clientsData?.find(c => c.id === order.client_id);
          const orderItem = orderItemsData?.find(item => item.order_id === order.id);
          const service = orderItem 
            ? servicesData?.find(s => s.id === orderItem.service_id)
            : null;
            
          // Extrair o nome do paciente das notas, se disponível
          let patientName = '';
          if (order.notes && order.notes.includes('Paciente:')) {
            const patientMatch = order.notes.match(/Paciente:\s*([^,\-]+)/);
            if (patientMatch && patientMatch[1]) {
              patientName = patientMatch[1].trim();
            }
          }
          
          // Extrair possíveis notas adicionais
          let cleanNotes = order.notes || '';
          if (cleanNotes.includes('Paciente:')) {
            cleanNotes = cleanNotes.replace(/Paciente:\s*[^,\-]+(,|\s*-\s*|$)/, '').trim();
          }
            
          return {
            id: order.id,
            client: client?.name || 'Cliente não encontrado',
            patientName: patientName,
            service: service?.name || 'Serviço não especificado',
            createdAt: format(new Date(order.created_at), 'yyyy-MM-dd'),
            dueDate: order.deadline ? format(new Date(order.deadline), 'yyyy-MM-dd') : '',
            status: order.status as OrderStatus,
            isUrgent: order.priority === 'urgent',
            notes: cleanNotes,
            // Mantenha os IDs originais para uso em atualizações
            originalData: {
              clientId: order.client_id,
              orderId: order.id
            }
          };
        });

        setOrders(formattedOrders);
        setFilteredOrders(formattedOrders);
      } catch (error) {
        console.error('Erro inesperado:', error);
        toast.error('Ocorreu um erro inesperado ao carregar os dados.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, []);

  // Aplicar filtros
  useEffect(() => {
    const applyFilters = () => {
      let filtered = [...orders];
      
      // Filtro de texto (busca)
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(order => 
          order.client.toLowerCase().includes(term) || 
          order.id.toLowerCase().includes(term) ||
          order.service.toLowerCase().includes(term) ||
          (order.patientName && order.patientName.toLowerCase().includes(term))
        );
      }
      
      // Filtro de status
      if (statusFilter !== 'all') {
        filtered = filtered.filter(order => order.status === statusFilter);
      }
      
      // Filtro de datas
      if (startDate) {
        filtered = filtered.filter(order => 
          new Date(order.dueDate) >= new Date(startDate)
        );
      }
      
      if (endDate) {
        filtered = filtered.filter(order => 
          new Date(order.dueDate) <= new Date(endDate)
        );
      }
      
      setFilteredOrders(filtered);
    };
    
    applyFilters();
  }, [orders, searchTerm, statusFilter, startDate, endDate]);

  const handleUpdateOrder = async (updatedOrder: any) => {
    try {
      // Preparar notas com o nome do paciente
      const notes = updatedOrder.patientName 
        ? `Paciente: ${updatedOrder.patientName}${updatedOrder.notes ? ' - ' + updatedOrder.notes : ''}`
        : updatedOrder.notes;
      
      // Atualizar no Supabase
      const { error } = await supabase
        .from('orders')
        .update({
          status: updatedOrder.status,
          deadline: updatedOrder.dueDate ? new Date(updatedOrder.dueDate).toISOString() : null,
          priority: updatedOrder.isUrgent ? 'urgent' : 'normal',
          notes: notes
        })
        .eq('id', updatedOrder.originalData?.orderId || updatedOrder.id);
        
      if (error) {
        console.error('Erro ao atualizar ordem:', error);
        toast.error('Erro ao atualizar ordem de serviço.');
        return;
      }
      
      // Atualizar a lista de ordens localmente
      const updatedOrders = orders.map(order => 
        (order.id === updatedOrder.id) ? { ...order, ...updatedOrder } : order
      );
      setOrders(updatedOrders);
      toast.success('Ordem atualizada com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao processar atualização:', error);
      toast.error('Ocorreu um erro ao atualizar a ordem.');
      return false;
    }
  };

  const handleFilter = () => {
    // Já está sendo feito pelo useEffect
    toast.success('Filtros aplicados');
  };

  return {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    loading,
    filteredOrders,
    handleUpdateOrder,
    handleFilter
  };
}
