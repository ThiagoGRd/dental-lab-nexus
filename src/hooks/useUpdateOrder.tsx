
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export function useUpdateOrder(orders: any[], setOrders: (orders: any[]) => void) {
  const handleUpdateOrder = async (updatedOrder: any) => {
    try {
      console.log('Attempting to update order:', updatedOrder);
      
      // Prepare notes with patient name and technical details more efficiently
      let notes = '';
      
      // Adicionar nome do paciente
      if (updatedOrder.patientName) {
        notes += `Paciente: ${updatedOrder.patientName}`;
      }
      
      // Adicionar detalhes técnicos específicos de prótese
      if (updatedOrder.shadeDetails) {
        notes += notes ? ` - Cor: ${updatedOrder.shadeDetails}` : `Cor: ${updatedOrder.shadeDetails}`;
      }
      
      if (updatedOrder.material) {
        notes += notes ? ` - Material: ${updatedOrder.material}` : `Material: ${updatedOrder.material}`;
      }
      
      if (updatedOrder.prosthesisType) {
        notes += notes ? ` - Tipo: ${updatedOrder.prosthesisType}` : `Tipo: ${updatedOrder.prosthesisType}`;
      }
      
      // Adicionar observações adicionais
      if (updatedOrder.notes) {
        notes += notes ? ` - ${updatedOrder.notes}` : updatedOrder.notes;
      }
      
      // Create update object
      const updateData = {
        status: updatedOrder.status,
        deadline: updatedOrder.dueDate ? new Date(updatedOrder.dueDate).toISOString() : null,
        priority: updatedOrder.isUrgent ? 'urgent' : 'normal',
        notes: notes
      };
      
      console.log('Update data:', updateData);
      
      // Obter o ID correto da ordem
      const orderId = updatedOrder.originalData?.orderId || updatedOrder.id;
      console.log('Order ID:', orderId);
      
      // Update in Supabase
      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId);
        
      if (error) {
        console.error('Erro ao atualizar ordem:', error);
        toast.error('Erro ao atualizar ordem de serviço.');
        return false;
      }
      
      console.log('Order updated successfully in Supabase');
      
      // Update local state efficiently using map
      const updatedOrders = orders.map(order => {
        if (order.id === orderId) {
          return { 
            ...order, 
            status: updatedOrder.status,
            dueDate: updatedOrder.dueDate,
            isUrgent: updatedOrder.isUrgent,
            notes: updatedOrder.notes,
            patientName: updatedOrder.patientName,
            shadeDetails: updatedOrder.shadeDetails,
            material: updatedOrder.material,
            prosthesisType: updatedOrder.prosthesisType
          };
        }
        return order;
      });
      
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
