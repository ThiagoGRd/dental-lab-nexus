
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';

export function useFetchOrders() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);

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
            status: order.status,
            isUrgent: order.priority === 'urgent',
            notes: cleanNotes,
            // Mantenha os IDs originais para uso em atualizações
            originalData: {
              clientId: order.client_id,
              orderId: order.id
            }
          };
        });

        return formattedOrders;
      } catch (error) {
        console.error('Erro inesperado:', error);
        toast.error('Ocorreu um erro inesperado ao carregar os dados.');
        return [];
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders().then(formattedOrders => {
      if (formattedOrders) {
        setOrders(formattedOrders);
      }
    });
  }, []);

  return { loading, orders };
}
