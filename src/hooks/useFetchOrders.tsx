
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
  const mountedRef = useRef(true);

  const fetchOrders = useCallback(async () => {
    // Cancelar requisição anterior se existir
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Criar novo AbortController
    abortControllerRef.current = new AbortController();

    try {
      console.log('🔄 Iniciando busca de ordens...');
      setLoading(true);
      setError(null);
      
      // 1. Buscar ordens com dados relacionados em uma única query otimizada
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id, 
          status, 
          priority, 
          created_at, 
          deadline, 
          notes,
          client_id,
          clients!inner(id, name),
          order_items(
            id,
            service_id,
            notes,
            services(id, name)
          )
        `)
        .order('created_at', { ascending: false });
      
      if (!mountedRef.current) return [];
      
      if (ordersError) {
        throw new Error(`Erro ao buscar ordens: ${ordersError.message}`);
      }
      
      console.log(`📦 Encontradas ${ordersData?.length || 0} ordens`);
      
      if (!ordersData || ordersData.length === 0) {
        setOrders([]);
        return [];
      }
      
      // Formatar ordens com dados já carregados
      const formattedOrders: Order[] = ordersData.map(order => {
        const client = order.clients;
        const firstOrderItem = order.order_items?.[0];
        const service = firstOrderItem?.services;
            
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
          createdAt: order.created_at ? format(new Date(order.created_at), 'yyyy-MM-dd') : '',
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

      console.log(`✅ Ordens formatadas: ${formattedOrders.length}`);
      
      if (mountedRef.current) {
        setOrders(formattedOrders);
      }
      
      return formattedOrders;
      
    } catch (error) {
      if (!mountedRef.current) return [];
      
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('❌ Erro ao buscar ordens:', error);
      setError(errorMessage);
      toast.error('Erro ao carregar ordens de serviço', {
        description: 'Verifique sua conexão e tente novamente.'
      });
      return [];
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchOrders();
    
    // Setup realtime subscription para atualizações automáticas
    const channel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        () => {
          console.log('🔄 Ordem atualizada, recarregando...');
          fetchOrders();
        }
      )
      .subscribe();
    
    // Cleanup na desmontagem
    return () => {
      mountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      supabase.removeChannel(channel);
    };
  }, [fetchOrders]);

  return { 
    loading, 
    orders, 
    error, 
    refetch: fetchOrders 
  };
}
