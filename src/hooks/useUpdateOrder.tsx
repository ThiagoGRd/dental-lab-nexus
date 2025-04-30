
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useUpdateOrder(orders: any[], setOrders: (orders: any[]) => void) {
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
        return false;
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

  return { handleUpdateOrder };
}
