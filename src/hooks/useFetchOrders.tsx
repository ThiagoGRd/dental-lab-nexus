
import { useState, useEffect, useCallback } from 'react';
import { supabase, hasError, safeData } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import type { Database } from '@/integrations/supabase/types';

type Order = {
  id: string;
  client: string;
  patientName: string;
  service: string;
  createdAt: string;
  dueDate: string;
  status: string;
  isUrgent: boolean;
  notes: string;
  originalData: {
    clientId: string;
    orderId: string;
  };
};

export function useFetchOrders() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Use useCallback to avoid recreating this function on each render
  const fetchOrders = useCallback(async () => {
    try {
      console.log('Fetching orders...');
      setLoading(true);
      setError(null);
      
      // Use a more efficient Promise.all for parallel requests
      console.log('Making parallel requests to Supabase...');
      
      // 1. Fetch orders data
      const ordersResponse = await supabase
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
      
      // Check for orders response error early
      if (hasError(ordersResponse)) {
        const errorMessage = ordersResponse.error?.message || 'Desconhecido';
        console.error('Erro ao buscar ordens:', ordersResponse.error);
        toast.error('Erro ao carregar as ordens de serviço.');
        setError(`Erro ao buscar ordens: ${errorMessage}`);
        setLoading(false);
        return [];
      }
      
      console.log('Orders response:', ordersResponse);
      
      // 2. Only fetch related data if we have orders
      const ordersData = safeData<any[]>(ordersResponse, []);
      if (ordersData.length === 0) {
        console.log('No orders data found');
        setLoading(false);
        return [];
      }
      
      // 3. Fetch related data in parallel
      const [clientsResponse, orderItemsResponse, servicesResponse] = await Promise.all([
        supabase
          .from('clients')
          .select('id, name'),
          
        supabase
          .from('order_items')
          .select(`
            order_id,
            service_id,
            notes
          `),
          
        supabase
          .from('services')
          .select('id, name')
      ]);
      
      console.log('Clients response:', clientsResponse);
      console.log('Order items response:', orderItemsResponse);
      console.log('Services response:', servicesResponse);
      
      // Check for other response errors but continue with what we have
      if (hasError(clientsResponse)) {
        console.warn('Erro ao buscar clientes:', clientsResponse.error);
      }
      
      if (hasError(orderItemsResponse)) {
        console.warn('Erro ao buscar itens de ordem:', orderItemsResponse.error);
      }
      
      if (hasError(servicesResponse)) {
        console.warn('Erro ao buscar serviços:', servicesResponse.error);
      }
      
      type OrderRow = Database['public']['Tables']['orders']['Row'];
      type ClientRow = Database['public']['Tables']['clients']['Row'];
      type OrderItemRow = Database['public']['Tables']['order_items']['Row'];
      type ServiceRow = Database['public']['Tables']['services']['Row'];
      
      const clientsData = hasError(clientsResponse) ? [] : safeData<ClientRow[]>(clientsResponse, []);
      const orderItemsData = hasError(orderItemsResponse) ? [] : safeData<OrderItemRow[]>(orderItemsResponse, []);
      const servicesData = hasError(servicesResponse) ? [] : safeData<ServiceRow[]>(servicesResponse, []);
      
      console.log('Extracted data:', {
        orders: ordersData.length,
        clients: clientsData.length,
        orderItems: orderItemsData.length,
        services: servicesData.length
      });
      
      // Use Maps for O(1) lookups instead of find() which is O(n)
      const clientsMap = new Map(clientsData?.map((c) => [c.id, c]));
      const orderItemsMap = new Map();
      
      // Group order items by order_id
      orderItemsData?.forEach((item) => {
        orderItemsMap.set(item.order_id, item);
      });
      
      const servicesMap = new Map(servicesData?.map((s) => [s.id, s]));

      // Format the orders data more efficiently
      const formattedOrders = ordersData.map((order) => {
        const client = clientsMap.get(order.client_id);
        const orderItem = orderItemsMap.get(order.id);
        const service = orderItem ? servicesMap.get(orderItem.service_id) : null;
            
        // Extract patient name once with regex
        let patientName = '';
        let cleanNotes = order.notes || '';
        
        if (order.notes && order.notes.includes('Paciente:')) {
          const patientMatch = order.notes.match(/Paciente:\s*([^,\-]+)/);
          if (patientMatch && patientMatch[1]) {
            patientName = patientMatch[1].trim();
            cleanNotes = cleanNotes.replace(/Paciente:\s*[^,\-]+(,|\s*-\s*|$)/, '').trim();
          }
        }
            
        return {
          id: order.id,
          client: client?.name || 'Cliente não encontrado',
          patientName,
          service: service?.name || 'Serviço não especificado',
          createdAt: format(new Date(order.created_at), 'yyyy-MM-dd'),
          dueDate: order.deadline ? format(new Date(order.deadline), 'yyyy-MM-dd') : '',
          status: order.status,
          isUrgent: order.priority === 'urgent',
          notes: cleanNotes,
          originalData: {
            clientId: order.client_id,
            orderId: order.id
          }
        };
      });

      console.log('Formatted orders:', formattedOrders.length);
      return formattedOrders;
    } catch (error) {
      const errorMessage = (error as Error)?.message || 'Desconhecido';
      console.error('Erro inesperado ao buscar ordens:', error);
      toast.error('Ocorreu um erro inesperado ao carregar os dados.');
      setError(`Erro inesperado: ${errorMessage}`);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);
    
  useEffect(() => {
    console.log('useEffect triggering fetchOrders');
    fetchOrders().then(formattedOrders => {
      if (formattedOrders) {
        console.log('Setting orders:', formattedOrders.length);
        setOrders(formattedOrders);
      }
    });
  }, [fetchOrders]);

  return { loading, orders, error, refetch: fetchOrders };
}
