import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../integrations/supabase/client';
import { toast } from 'sonner';

// Simple workflow hook that works with current schema
export const useWorkflow = (orderId?: string) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [workflow, setWorkflow] = useState<any>(null);

  const fetchWorkflow = useCallback(async () => {
    if (!orderId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('workflows')
        .select('*')
        .eq('order_id', orderId)
        .maybeSingle();
        
      if (error) {
        console.error('Erro ao buscar workflow:', error);
        setError('Não foi possível carregar o fluxo de trabalho.');
        return;
      }
      
      if (data) {
        setWorkflow({
          id: data.id,
          orderId: data.order_id,
          name: data.name,
          progress: data.progress || 0,
          status: data.status
        });
      }
    } catch (err) {
      console.error('Erro inesperado:', err);
      setError('Ocorreu um erro ao processar os dados do fluxo de trabalho.');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (orderId) {
      fetchWorkflow();
    }
  }, [orderId, fetchWorkflow]);

  return {
    loading,
    error,
    workflow,
    refreshWorkflow: fetchWorkflow
  };
};

export default useWorkflow;