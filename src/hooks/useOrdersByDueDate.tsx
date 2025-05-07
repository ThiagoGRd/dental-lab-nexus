
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, differenceInDays, parseISO } from 'date-fns';
import { toast } from 'sonner';

interface DueOrderData {
  id: string;
  client: string;
  patientName?: string;
  service: string;
  createdAt: string;
  dueDate: string;
  status: string;
  daysUntilDue: number;
}

export function useOrdersByDueDate(daysThreshold = 7) {
  const [loading, setLoading] = useState(true);
  const [dueOrders, setDueOrders] = useState<DueOrderData[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const fetchDueOrders = async () => {
    try {
      console.log('Fetching due orders...');
      setLoading(true);
      setError(null);
      
      // Get orders that are not completed and have a deadline
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
        .not('status', 'eq', 'completed')
        .not('deadline', 'is', null)
        .order('deadline', { ascending: true });
      
      if (ordersError) {
        console.error('Erro ao buscar ordens com prazo:', ordersError);
        setError(`Erro ao buscar ordens: ${ordersError.message}`);
        setLoading(false);
        return;
      }
      
      if (!ordersData || ordersData.length === 0) {
        setDueOrders([]);
        setLoading(false);
        return;
      }
      
      // Fetch related data (clients and services)
      const [clientsResponse, orderItemsResponse, servicesResponse] = await Promise.all([
        supabase.from('clients').select('id, name'),
        supabase.from('order_items').select('order_id, service_id'),
        supabase.from('services').select('id, name')
      ]);
      
      // Maps for efficient lookups
      const clientsMap = new Map(clientsResponse.data?.map(c => [c.id, c]) || []);
      const orderItemsMap = new Map();
      orderItemsResponse.data?.forEach(item => {
        orderItemsMap.set(item.order_id, item);
      });
      const servicesMap = new Map(servicesResponse.data?.map(s => [s.id, s]) || []);
      
      // Current date for comparison
      const today = new Date();
      
      // Filter and format orders that are due soon
      const formattedDueOrders = ordersData
        .map(order => {
          if (!order.deadline) return null;
          
          const dueDate = parseISO(order.deadline);
          const daysUntilDue = differenceInDays(dueDate, today);
          
          // Filter orders that are due within the threshold
          if (daysUntilDue > daysThreshold) return null;
          
          const client = clientsMap.get(order.client_id);
          const orderItem = orderItemsMap.get(order.id);
          const service = orderItem ? servicesMap.get(orderItem.service_id) : null;
          
          // Extract patient name
          let patientName = '';
          if (order.notes && order.notes.includes('Paciente:')) {
            const patientMatch = order.notes.match(/Paciente:\s*([^,\-]+)/);
            if (patientMatch && patientMatch[1]) {
              patientName = patientMatch[1].trim();
            }
          }
          
          return {
            id: order.id,
            client: client?.name || 'Cliente não encontrado',
            patientName,
            service: service?.name || 'Serviço não especificado',
            createdAt: format(new Date(order.created_at), 'yyyy-MM-dd'),
            dueDate: format(new Date(order.deadline), 'yyyy-MM-dd'),
            status: order.status,
            daysUntilDue
          };
        })
        .filter(Boolean) as DueOrderData[];
      
      console.log(`Found ${formattedDueOrders.length} orders due within ${daysThreshold} days`);
      setDueOrders(formattedDueOrders);
    } catch (err) {
      const errorMessage = (err as Error)?.message || 'Erro desconhecido';
      console.error('Erro ao processar ordens com prazo:', err);
      setError(errorMessage);
      toast.error('Ocorreu um erro ao buscar ordens com prazo próximo');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchDueOrders();
  }, [daysThreshold]);
  
  return { dueOrders, loading, error, refetch: fetchDueOrders };
}
