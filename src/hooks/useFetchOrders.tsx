
import { useState, useEffect, useCallback } from 'react';
import { supabase, hasError, safeData } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';

export function useFetchOrders() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);

  // Use useCallback to avoid recreating this function on each render
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      
      // Use a more efficient Promise.all for parallel requests
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
      
      if (hasError(ordersResponse)) {
        console.error('Erro ao buscar ordens:', ordersResponse.error);
        toast.error('Erro ao carregar as ordens de serviço.');
        return [];
      }
      
      const ordersData = safeData(ordersResponse, []);
      const clientsData = hasError(clientsResponse) ? [] : safeData(clientsResponse, []);
      const orderItemsData = hasError(orderItemsResponse) ? [] : safeData(orderItemsResponse, []);
      const servicesData = hasError(servicesResponse) ? [] : safeData(servicesResponse, []);
      
      // Use Maps for O(1) lookups instead of find() which is O(n)
      const clientsMap = new Map(clientsData?.map((c: any) => [c.id, c]));
      const orderItemsMap = new Map(orderItemsData?.map((item: any) => [item.order_id, item]));
      const servicesMap = new Map(servicesData?.map((s: any) => [s.id, s]));

      // Format the orders data more efficiently
      const formattedOrders = ordersData.map((order: any) => {
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

      return formattedOrders;
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast.error('Ocorreu um erro inesperado ao carregar os dados.');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);
    
  useEffect(() => {
    fetchOrders().then(formattedOrders => {
      if (formattedOrders) {
        setOrders(formattedOrders);
      }
    });
  }, [fetchOrders]);

  return { loading, orders };
}
