
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import OrderDetailsDialog from '@/components/orders/OrderDetailsDialog';
import { supabase } from "@/integrations/supabase/client";
import { format } from 'date-fns';
import { statusLabels, OrderStatus } from '@/data/mockData';
import { OrderItem } from '@/components/orders/OrderItem';

export default function ProductionPage() {
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  
  const [pendingOrders, setPendingOrders] = useState<any[]>([]);
  const [productionOrders, setProductionOrders] = useState<any[]>([]);
  const [waitingOrders, setWaitingOrders] = useState<any[]>([]);
  const [completedOrders, setCompletedOrders] = useState<any[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        
        // Buscar ordens ativas (não entregues)
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
            total_value
          `)
          .not('status', 'eq', 'delivered')
          .order('created_at', { ascending: false });
          
        if (ordersError) {
          console.error('Erro ao buscar ordens:', ordersError);
          toast.error('Erro ao carregar as ordens de serviço.');
          return;
        }
        
        // Buscar todos os clientes para associar às ordens
        const { data: clientsData, error: clientsError } = await supabase
          .from('clients')
          .select('id, name');
          
        if (clientsError) {
          console.error('Erro ao buscar clientes:', clientsError);
          toast.error('Erro ao carregar dados dos clientes.');
          return;
        }

        // Buscar itens de serviço para cada ordem
        const { data: orderItemsData, error: orderItemsError } = await supabase
          .from('order_items')
          .select(`
            order_id,
            service_id,
            notes
          `);

        if (orderItemsError) {
          console.error('Erro ao buscar itens de ordem:', orderItemsError);
        }

        // Buscar serviços para associar aos itens
        const { data: servicesData, error: servicesError } = await supabase
          .from('services')
          .select('id, name');

        if (servicesError) {
          console.error('Erro ao buscar serviços:', servicesError);
        }

        // Formatar dados das ordens
        const formattedOrders = ordersData.map(order => {
          const client = clientsData?.find(c => c.id === order.client_id);
          const orderItem = orderItemsData?.find(item => item.order_id === order.id);
          const service = orderItem 
            ? servicesData?.find(s => s.id === orderItem.service_id)
            : null;
            
          // Extrair o nome do paciente das notas
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
            patientName: patientName,
            service: service?.name || 'Serviço não especificado',
            createdAt: format(new Date(order.created_at), 'yyyy-MM-dd'),
            dueDate: order.deadline ? format(new Date(order.deadline), 'yyyy-MM-dd') : '',
            status: order.status as OrderStatus,
            isUrgent: order.priority === 'urgent',
            notes: cleanNotes,
            totalValue: order.total_value || 0,
            // Dados originais para atualizações
            originalData: {
              orderId: order.id,
              clientId: order.client_id
            }
          };
        });

        setOrders(formattedOrders);
        
        // Separar ordens por status
        setPendingOrders(formattedOrders.filter(order => order.status === 'pending'));
        setProductionOrders(formattedOrders.filter(order => order.status === 'production'));
        setWaitingOrders(formattedOrders.filter(order => order.status === 'waiting'));
        setCompletedOrders(formattedOrders.filter(order => order.status === 'completed'));
        
      } catch (error) {
        console.error('Erro inesperado:', error);
        toast.error('Ocorreu um erro inesperado ao carregar os dados.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, []);

  const handleViewOrder = (order: any) => {
    setSelectedOrder(order);
    setIsViewDialogOpen(true);
  };

  // Função para criar conta a receber quando uma ordem for marcada como entregue
  const createReceivableAccount = async (order: any) => {
    try {
      console.log('Criando conta a receber para ordem:', order.id, 'no valor de:', order.totalValue);
      
      // Verificar se o valor da ordem está definido
      if (!order.totalValue || order.totalValue <= 0) {
        // Buscar o valor da ordem diretamente do banco de dados para garantir valor atualizado
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select('total_value, client_id')
          .eq('id', order.originalData?.orderId || order.id)
          .single();
          
        if (orderError) {
          console.error('Erro ao buscar valor da ordem:', orderError);
          throw new Error('Não foi possível obter o valor da ordem.');
        }
        
        if (orderData && orderData.total_value > 0) {
          order.totalValue = orderData.total_value;
          console.log('Valor da ordem recuperado do banco de dados:', order.totalValue);
        } else {
          // Se ainda não tiver valor, buscar dos itens da ordem
          const { data: orderItemsData, error: itemsError } = await supabase
            .from('order_items')
            .select('total')
            .eq('order_id', order.originalData?.orderId || order.id);
            
          if (itemsError) {
            console.error('Erro ao buscar itens da ordem:', itemsError);
            throw new Error('Não foi possível obter os itens da ordem.');
          }
          
          if (orderItemsData && orderItemsData.length > 0) {
            const calculatedTotal = orderItemsData.reduce((sum, item) => sum + (Number(item.total) || 0), 0);
            order.totalValue = calculatedTotal;
            console.log('Valor da ordem calculado dos itens:', order.totalValue);
          }
        }
      }
      
      // Se ainda não tiver valor, definir um valor mínimo para evitar zero
      if (!order.totalValue || order.totalValue <= 0) {
        order.totalValue = 100; // Valor padrão mínimo
        console.log('Usando valor padrão mínimo:', order.totalValue);
      }
      
      // Dados para a nova conta a receber
      const receivableData = {
        description: `Receita: ${order.client}`,
        amount: order.totalValue,
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Vencimento em 7 dias
        status: 'pending',
        notes: `Ordem de serviço #${order.id.substring(0, 8)} entregue`,
        type: 'revenue',
        related_order_id: order.originalData?.orderId || order.id
      };
      
      // Inserir nova conta a receber
      const { data, error } = await supabase
        .from('finances')
        .insert(receivableData)
        .select()
        .single();
        
      if (error) {
        console.error('Erro ao criar conta a receber:', error);
        throw new Error('Não foi possível criar a conta a receber.');
      }
      
      toast.success('Conta a receber criada automaticamente.');
      return data;
      
    } catch (error) {
      console.error('Erro ao gerar conta a receber:', error);
      toast.error('Ocorreu um erro ao gerar a conta a receber.');
      return null;
    }
  };

  const updateStatus = async (order: any, newStatus: string) => {
    try {
      // Atualizar no banco de dados
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', order.originalData?.orderId || order.id);
        
      if (error) {
        console.error('Erro ao atualizar status:', error);
        toast.error('Erro ao atualizar status da ordem.');
        return;
      }
      
      // Se a ordem está sendo entregue (status delivered), criar conta a receber
      if (newStatus === 'delivered') {
        await createReceivableAccount(order);
      }
      
      // Atualizar localmente
      const updatedOrder = { ...order, status: newStatus as OrderStatus };
      
      // Remover a ordem da lista atual
      let updatedPendingOrders = [...pendingOrders];
      let updatedProductionOrders = [...productionOrders];
      let updatedWaitingOrders = [...waitingOrders];
      let updatedCompletedOrders = [...completedOrders];
      
      // Remover de qualquer lista em que esteja
      if (order.status === 'pending') {
        updatedPendingOrders = updatedPendingOrders.filter(o => o.id !== order.id);
      } else if (order.status === 'production') {
        updatedProductionOrders = updatedProductionOrders.filter(o => o.id !== order.id);
      } else if (order.status === 'waiting') {
        updatedWaitingOrders = updatedWaitingOrders.filter(o => o.id !== order.id);
      } else if (order.status === 'completed') {
        updatedCompletedOrders = updatedCompletedOrders.filter(o => o.id !== order.id);
      }
      
      // Adicionar à nova lista
      if (newStatus === 'pending') {
        updatedPendingOrders.push(updatedOrder);
      } else if (newStatus === 'production') {
        updatedProductionOrders.push(updatedOrder);
      } else if (newStatus === 'waiting') {
        updatedWaitingOrders.push(updatedOrder);
      } else if (newStatus === 'completed') {
        updatedCompletedOrders.push(updatedOrder);
      } else if (newStatus === 'delivered') {
        // Para ordens entregues, apenas removemos da lista atual
      }
      
      // Atualizar os estados
      setPendingOrders(updatedPendingOrders);
      setProductionOrders(updatedProductionOrders);
      setWaitingOrders(updatedWaitingOrders);
      setCompletedOrders(updatedCompletedOrders);
      
      toast.success(`Ordem ${order.id.substring(0, 8)} atualizada para ${statusLabels[newStatus as OrderStatus]?.label || newStatus}`);
    } catch (error) {
      console.error('Erro ao processar atualização:', error);
      toast.error('Ocorreu um erro ao atualizar a ordem.');
    }
  };

  const renderOrderCard = (order: any) => (
    <Card key={order.id} className="mb-4">
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-center">
          <div>
            {/* Destacar nome do paciente quando disponível */}
            {order.patientName ? (
              <>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-purple-500 dark:text-purple-300 text-lg">
                    {order.patientName}
                  </span>
                  {order.isUrgent && (
                    <Badge variant="destructive" className="text-xs">Urgente</Badge>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  Cliente: {order.client}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <span className="font-medium">{order.client}</span>
                {order.isUrgent && (
                  <Badge variant="destructive" className="text-xs">Urgente</Badge>
                )}
              </div>
            )}
            <div className="text-sm text-muted-foreground">#{order.id.substring(0, 8)} - {order.service}</div>
          </div>
          <span className={cn(
            "rounded-full border px-2 py-1 text-xs font-medium",
            statusLabels[order.status]?.className || 'bg-gray-100 text-gray-800 border-gray-300'
          )}>
            {statusLabels[order.status]?.label || 'Desconhecido'}
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex justify-between items-center mt-2">
          <div className="text-sm">
            <p>Data entrega: {order.dueDate || 'Não definida'}</p>
            <p className="mt-1">Valor: R$ {order.totalValue.toFixed(2)}</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={() => handleViewOrder(order)}>
              Detalhes
            </Button>
            
            {order.status === 'pending' && (
              <Button size="sm" variant="outline" onClick={() => updateStatus(order, 'production')}>
                Iniciar Produção
              </Button>
            )}
            
            {order.status === 'production' && (
              <>
                <Button size="sm" variant="outline" onClick={() => updateStatus(order, 'waiting')}>
                  Aguardando Material
                </Button>
                <Button size="sm" variant="outline" onClick={() => updateStatus(order, 'completed')}>
                  Finalizar
                </Button>
              </>
            )}
            
            {order.status === 'waiting' && (
              <Button size="sm" variant="outline" onClick={() => updateStatus(order, 'production')}>
                Retomar Produção
              </Button>
            )}
            
            {order.status === 'completed' && (
              <Button size="sm" variant="outline" onClick={() => updateStatus(order, 'delivered')}>
                Marcar como Entregue
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-dentalblue-800">Produção</h1>
      <p className="text-gray-600 mb-6">Gerencie o fluxo de produção do laboratório</p>
      
      {loading ? (
        <div className="text-center py-8">Carregando ordens de serviço...</div>
      ) : (
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="pending">
              Pendentes ({pendingOrders.length})
            </TabsTrigger>
            <TabsTrigger value="production">
              Em Produção ({productionOrders.length})
            </TabsTrigger>
            <TabsTrigger value="waiting">
              Aguardando Material ({waitingOrders.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Concluídos ({completedOrders.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="pending" className="mt-0">
            <div className="space-y-4">
              {pendingOrders.length === 0 ? (
                <p className="text-center py-8 text-gray-500">Não há ordens de serviço pendentes.</p>
              ) : (
                pendingOrders.map(renderOrderCard)
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="production" className="mt-0">
            <div className="space-y-4">
              {productionOrders.length === 0 ? (
                <p className="text-center py-8 text-gray-500">Não há ordens em produção.</p>
              ) : (
                productionOrders.map(renderOrderCard)
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="waiting" className="mt-0">
            <div className="space-y-4">
              {waitingOrders.length === 0 ? (
                <p className="text-center py-8 text-gray-500">Não há ordens aguardando material.</p>
              ) : (
                waitingOrders.map(renderOrderCard)
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="completed" className="mt-0">
            <div className="space-y-4">
              {completedOrders.length === 0 ? (
                <p className="text-center py-8 text-gray-500">Não há ordens concluídas.</p>
              ) : (
                completedOrders.map(renderOrderCard)
              )}
            </div>
          </TabsContent>
        </Tabs>
      )}
      
      {/* Dialog para visualizar detalhes da ordem */}
      <OrderDetailsDialog 
        open={isViewDialogOpen} 
        onOpenChange={setIsViewDialogOpen}
        order={selectedOrder}
      />
    </div>
  );
}
