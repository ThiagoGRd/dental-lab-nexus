
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { typedUpdate } from '@/utils/supabaseTypeHelpers';

export function useUpdateOrder(orders: any[], setOrders: (orders: any[]) => void) {
  const handleUpdateOrder = async (updatedOrder: any) => {
    try {
      // Prepare notes with patient name more efficiently
      const notes = updatedOrder.patientName 
        ? `Paciente: ${updatedOrder.patientName}${updatedOrder.notes ? ' - ' + updatedOrder.notes : ''}`
        : updatedOrder.notes;
      
      // Create update object with proper typing
      const updateData = {
        status: updatedOrder.status,
        deadline: updatedOrder.dueDate ? new Date(updatedOrder.dueDate).toISOString() : null,
        priority: updatedOrder.isUrgent ? 'urgent' : 'normal',
        notes: notes
      } as Database['public']['Tables']['orders']['Update'];
      
      // Update in Supabase using type-safe helper
      const orderId = updatedOrder.originalData?.orderId || updatedOrder.id;
      const { error } = await typedUpdate('orders', orderId, updateData);
        
      if (error) {
        console.error('Erro ao atualizar ordem:', error);
        toast.error('Erro ao atualizar ordem de serviço.');
        return false;
      }
      
      // Update local state efficiently using map
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

  return { handleUpdateOrder };
}
