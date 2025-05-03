
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import OrderDetailsDialog from '@/components/orders/OrderDetailsDialog';
import { supabase, hasError } from "@/integrations/supabase/client";
import { format } from 'date-fns';
import { statusLabels, OrderStatus } from '@/data/mockData';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { X } from 'lucide-react';

interface ClientOrdersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  clientName: string;
}

export default function ClientOrdersDialog({
  open,
  onOpenChange,
  clientId,
  clientName
}: ClientOrdersDialogProps) {
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [loading, setLoading] = useState(true);
  const [clientOrders, setClientOrders] = useState<any[]>([]);
  const [totalValue, setTotalValue] = useState<number>(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<any>(null);
  
  useEffect(() => {
    // Só carrega os dados quando o diálogo estiver aberto
    if (open && clientId) {
      fetchClientOrders();
    }
  }, [open, clientId]);
  
  const fetchClientOrders = async () => {
    if (!clientId) return;
    
    try {
      setLoading(true);
      
      // Buscar ordens deste cliente
      const ordersResponse = await supabase
        .from('orders')
        .select(`
          id, 
          status, 
          priority, 
          created_at, 
          deadline, 
          notes,
          total_value
        `)
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });
        
      if (hasError(ordersResponse)) {
        console.error('Erro ao buscar ordens do cliente:', ordersResponse.error);
        return;
      }
      
      const ordersData = ordersResponse.data || [];
      
      // Calcular o valor total de todas as ordens
      let calculatedTotal = 0;
      
      // Buscar itens de serviço para cada ordem para calcular o valor total corretamente
      if (ordersData && ordersData.length > 0) {
        // Obter todos os IDs de ordem
        const orderIds = ordersData.map(order => order.id);
        
        // Buscar detalhes dos itens para calcular o valor total
        const orderItemsResponse = await supabase
          .from('order_items')
          .select(`order_id, price, quantity, total`)
          .in('order_id', orderIds);
          
        if (hasError(orderItemsResponse)) {
          console.error('Erro ao buscar itens das ordens:', orderItemsResponse.error);
        } else {
          const orderItemsData = orderItemsResponse.data || [];
          
          // Agrupar o valor total por ordem
          const orderTotals: Record<string, number> = {};
          
          // Calcular o total para cada ordem
          orderItemsData.forEach(item => {
            if (!orderTotals[item.order_id]) {
              orderTotals[item.order_id] = 0;
            }
            // Usar o item.total registrado ou calcular a partir do preço e quantidade
            const itemValue = item.total || (item.price * item.quantity);
            orderTotals[item.order_id] += Number(itemValue);
          });
          
          // Atualizar os dados da ordem com os totais calculados
          const updatedOrdersData = ordersData.map(order => {
            const calculatedOrderTotal = orderTotals[order.id] || 0;
            calculatedTotal += Number(calculatedOrderTotal);
            
            // Também atualiza o total_value no objeto da ordem
            return {
              ...order,
              total_value: calculatedOrderTotal
            };
          });
          
          setClientOrders(updatedOrdersData);
          setTotalValue(calculatedTotal);
          console.log('Total calculated from order items:', calculatedTotal);
        }
      } else {
        setClientOrders([]);
        setTotalValue(0);
      }
      
      // Buscar itens de serviço para cada ordem
      const orderIds = ordersData?.map(order => order.id) || [];
      const orderItemsResponse = await supabase
        .from('order_items')
        .select(`
          order_id,
          service_id,
          notes,
          price,
          quantity,
          total
        `)
        .in('order_id', orderIds);

      if (hasError(orderItemsResponse)) {
        console.error('Erro ao buscar itens de ordem:', orderItemsResponse.error);
      }
      
      const orderItemsData = orderItemsResponse.data || [];

      // Buscar serviços para associar aos itens
      const serviceIds = orderItemsData?.map(item => item.service_id) || [];
      const servicesResponse = await supabase
        .from('services')
        .select('id, name')
        .in('id', serviceIds);

      if (hasError(servicesResponse)) {
        console.error('Erro ao buscar serviços:', servicesResponse.error);
      }
      
      const servicesData = servicesResponse.data || [];

      // Formatar dados das ordens
      if (ordersData) {
        const formattedOrders = ordersData.map(order => {
          const orderItem = orderItemsData?.find(item => item.order_id === order.id);
          const service = orderItem 
            ? servicesData?.find(s => s.id === orderItem.service_id)
            : null;
          
          // Use the total_value that might have been updated above
          const orderValue = order.total_value !== null && order.total_value !== undefined 
            ? Number(order.total_value) 
            : 0;
            
          return {
            id: order.id,
            client: clientName,
            service: service?.name || 'Serviço não especificado',
            createdAt: format(new Date(order.created_at), 'yyyy-MM-dd'),
            dueDate: order.deadline ? format(new Date(order.deadline), 'yyyy-MM-dd') : '',
            status: order.status as OrderStatus,
            isUrgent: order.priority === 'urgent',
            notes: order.notes || '',
            value: orderValue,
            originalData: {
              orderId: order.id,
              clientId: clientId
            }
          };
        });

        setClientOrders(formattedOrders);
      }
    } catch (error) {
      console.error('Erro ao carregar ordens do cliente:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleViewOrder = (order: any) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };
  
  const handleDeleteOrder = (order: any) => {
    setOrderToDelete(order);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteOrder = async () => {
    if (!orderToDelete) return;
    
    try {
      setLoading(true);
      
      // Primeiro excluir os itens da ordem
      const deleteItemsResponse = await supabase
        .from('order_items')
        .delete()
        .eq('order_id', orderToDelete.originalData.orderId);
        
      if (hasError(deleteItemsResponse)) {
        console.error('Erro ao excluir itens da ordem:', deleteItemsResponse.error);
        toast.error('Erro ao excluir a ordem de serviço.');
        return;
      }
      
      // Depois excluir a ordem em si
      const deleteOrderResponse = await supabase
        .from('orders')
        .delete()
        .eq('id', orderToDelete.originalData.orderId);
        
      if (hasError(deleteOrderResponse)) {
        console.error('Erro ao excluir ordem:', deleteOrderResponse.error);
        toast.error('Erro ao excluir a ordem de serviço.');
        return;
      }
      
      // Atualizar a lista localmente
      const updatedOrders = clientOrders.filter(o => o.id !== orderToDelete.id);
      setClientOrders(updatedOrders);
      
      // Recalcular o valor total
      const newTotalValue = updatedOrders.reduce((acc, order) => acc + Number(order.value || 0), 0);
      setTotalValue(newTotalValue);
      
      toast.success('Ordem de serviço excluída com sucesso.');
    } catch (error) {
      console.error('Erro ao processar exclusão:', error);
      toast.error('Ocorreu um erro ao excluir a ordem.');
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
      setOrderToDelete(null);
    }
  };
  
  // Formatar valor em reais
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };
  
  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Ordens de Serviço - {clientName}</DialogTitle>
            <DialogDescription>
              Histórico de ordens de serviço deste cliente
            </DialogDescription>
          </DialogHeader>
          
          <div className="mb-4 flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Total de ordens: <span className="font-medium">{clientOrders.length}</span></p>
            </div>
            <div>
              <p className="text-sm text-gray-600">
                Valor total: <span className="font-medium">{formatCurrency(totalValue)}</span>
              </p>
            </div>
          </div>
          
          {loading ? (
            <div className="text-center py-8">Carregando ordens de serviço...</div>
          ) : (
            <div className="border rounded-md max-h-[400px] overflow-y-auto">
              <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 bg-muted/50 p-4 font-medium">
                <div>Serviço</div>
                <div>Data de Entrega</div>
                <div>Status</div>
                <div className="text-right">Ações</div>
              </div>
              
              <div className="divide-y">
                {clientOrders.length > 0 ? (
                  clientOrders.map((order) => (
                    <div key={order.id} className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 p-4">
                      <div>
                        <div className="font-medium">{order.service}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="text-xs text-gray-600">#{order.id.substring(0, 8)}</div>
                          <div className="text-xs text-gray-600">{formatCurrency(order.value)}</div>
                        </div>
                      </div>
                      <div className="text-sm">
                        {order.dueDate || 'Não definida'}
                      </div>
                      <div>
                        <span className={cn(
                          "rounded-full border px-2 py-1 text-xs font-medium",
                          statusLabels[order.status]?.className || 'bg-gray-100 text-gray-800 border-gray-300'
                        )}>
                          {statusLabels[order.status]?.label || 'Desconhecido'}
                        </span>
                      </div>
                      <div className="flex space-x-2 justify-end">
                        <Button variant="ghost" size="sm" onClick={() => handleViewOrder(order)}>
                          Ver Detalhes
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-600 hover:text-red-700 hover:bg-red-100"
                          onClick={() => handleDeleteOrder(order)}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Excluir
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    Este cliente não possui ordens de serviço.
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <OrderDetailsDialog
        open={showOrderDetails}
        onOpenChange={setShowOrderDetails}
        order={selectedOrder}
        clientMode={true}
      />
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Ordem de Serviço</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta ordem de serviço? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteOrder}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
