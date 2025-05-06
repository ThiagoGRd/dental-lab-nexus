
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
      const [ordersResponse, clientsResponse, orderItemsResponse, servicesResponse] = await Promise.all([
        // Select only needed fields to reduce data transferred
        supabase
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
          .order('created_at', { ascending: false }),
          
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
      
      console.log('Orders response:', ordersResponse);
      console.log('Clients response:', clientsResponse);
      console.log('Order items response:', orderItemsResponse);
      console.log('Services response:', servicesResponse);
      
      if (hasError(ordersResponse)) {
        console.error('Erro ao buscar ordens:', ordersResponse.error);
        toast.error('Erro ao carregar as ordens de serviço.');
        setError(`Erro ao buscar ordens: ${ordersResponse.error?.message || 'Desconhecido'}`);
        return [];
      }
      
      type OrderRow = Database['public']['Tables']['orders']['Row'];
      type ClientRow = Database['public']['Tables']['clients']['Row'];
      type OrderItemRow = Database['public']['Tables']['order_items']['Row'];
      type ServiceRow = Database['public']['Tables']['services']['Row'];
      
      const ordersData = safeData<OrderRow[]>(ordersResponse, []);
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
      console.error('Erro inesperado:', error);
      toast.error('Ocorreu um erro inesperado ao carregar os dados.');
      setError(`Erro inesperado: ${(error as Error)?.message || 'Desconhecido'}`);
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
