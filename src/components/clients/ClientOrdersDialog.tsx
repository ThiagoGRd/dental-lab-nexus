
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
import { supabase } from "@/integrations/supabase/client";
import { format } from 'date-fns';
import { statusLabels, OrderStatus } from '@/data/mockData';

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
      const { data: ordersData, error: ordersError } = await supabase
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
        
      if (ordersError) {
        console.error('Erro ao buscar ordens do cliente:', ordersError);
        return;
      }
      
      // Calcular o valor total de todas as ordens
      const totalSum = ordersData.reduce((sum, order) => {
        // Garantir que o valor é numérico antes de somar
        const orderValue = order.total_value && typeof order.total_value === 'number' 
          ? order.total_value 
          : 0;
        return sum + orderValue;
      }, 0);
      
      setTotalValue(totalSum);
      console.log('Total value of all orders:', totalSum);
      
      // Buscar itens de serviço para cada ordem
      const orderIds = ordersData.map(order => order.id);
      const { data: orderItemsData, error: orderItemsError } = await supabase
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

      if (orderItemsError) {
        console.error('Erro ao buscar itens de ordem:', orderItemsError);
      }

      // Buscar serviços para associar aos itens
      const serviceIds = orderItemsData?.map(item => item.service_id) || [];
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('id, name')
        .in('id', serviceIds);

      if (servicesError) {
        console.error('Erro ao buscar serviços:', servicesError);
      }

      // Formatar dados das ordens
      const formattedOrders = ordersData.map(order => {
        const orderItem = orderItemsData?.find(item => item.order_id === order.id);
        const service = orderItem 
          ? servicesData?.find(s => s.id === orderItem.service_id)
          : null;
          
        return {
          id: order.id,
          client: clientName,
          service: service?.name || 'Serviço não especificado',
          createdAt: format(new Date(order.created_at), 'yyyy-MM-dd'),
          dueDate: order.deadline ? format(new Date(order.deadline), 'yyyy-MM-dd') : '',
          status: order.status as OrderStatus,
          isUrgent: order.priority === 'urgent',
          notes: order.notes || '',
          value: order.total_value || 0,
          originalData: {
            orderId: order.id,
            clientId: clientId
          }
        };
      });

      setClientOrders(formattedOrders);
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
    </>
  );
}
