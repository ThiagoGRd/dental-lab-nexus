
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';

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
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchOrders = useCallback(async () => {
    // Cancelar requisição anterior se existir
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Criar novo AbortController
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    try {
      console.log('Iniciando busca de ordens...');
      setLoading(true);
      setError(null);
      
      // Verificar se foi cancelado
      if (signal.aborted) return [];
      
      // 1. Buscar ordens
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
      
      if (signal.aborted) return [];
      
      if (ordersResponse.error) {
        throw new Error(`Erro ao buscar ordens: ${ordersResponse.error.message}`);
      }
      
      const ordersData = ordersResponse.data || [];
      console.log(`Encontradas ${ordersData.length} ordens`);
      
      if (ordersData.length === 0) {
        setOrders([]);
        return [];
      }
      
      // 2. Buscar dados relacionados em paralelo
      const [clientsResponse, orderItemsResponse, servicesResponse] = await Promise.all([
        supabase.from('clients').select('id, name'),
        supabase.from('order_items').select('order_id, service_id, notes'),
        supabase.from('services').select('id, name')
      ]);
      
      if (signal.aborted) return [];
      
      // Processar dados mesmo se houver erros parciais
      const clientsData = clientsResponse.data || [];
      const orderItemsData = orderItemsResponse.data || [];
      const servicesData = servicesResponse.data || [];
      
      // Criar mapas para lookup eficiente
      const clientsMap = new Map(clientsData.map(c => [c.id, c]));
      const servicesMap = new Map(servicesData.map(s => [s.id, s]));
      const orderItemsMap = new Map();
      
      orderItemsData.forEach(item => {
        orderItemsMap.set(item.order_id, item);
      });

      // Formatar ordens
      const formattedOrders = ordersData.map(order => {
        const client = clientsMap.get(order.client_id);
        const orderItem = orderItemsMap.get(order.id);
        const service = orderItem ? servicesMap.get(orderItem.service_id) : null;
            
        // Extrair nome do paciente das notas
        let patientName = '';
        let cleanNotes = order.notes || '';
        
        if (order.notes?.includes('Paciente:')) {
          const patientMatch = order.notes.match(/Paciente:\s*([^,\-]+)/);
          if (patientMatch?.[1]) {
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

      console.log(`Ordens formatadas: ${formattedOrders.length}`);
      setOrders(formattedOrders);
      return formattedOrders;
      
    } catch (error) {
      if (signal.aborted) {
        console.log('Busca de ordens cancelada');
        return [];
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('Erro ao buscar ordens:', error);
      setError(errorMessage);
      toast.error('Erro ao carregar ordens de serviço');
      return [];
    } finally {
      if (!signal.aborted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    
    // Cleanup na desmontagem
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchOrders]);

  return { 
    loading, 
    orders, 
    error, 
    refetch: fetchOrders 
  };
}
