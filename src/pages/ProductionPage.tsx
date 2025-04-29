
import React, { useState } from 'react';
import { mockRecentOrders } from '@/data/mockData';
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

export default function ProductionPage() {
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  // Status labels and styles for display
  const statuses = {
    'pending': { label: 'Pendente', className: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
    'production': { label: 'Em Produção', className: 'bg-blue-100 text-blue-800 border-blue-300' },
    'waiting': { label: 'Aguardando Material', className: 'bg-orange-100 text-orange-800 border-orange-300' },
    'completed': { label: 'Finalizado', className: 'bg-green-100 text-green-800 border-green-300' },
    'delivered': { label: 'Entregue', className: 'bg-purple-100 text-purple-800 border-purple-300' },
  };

  // Use mock data for now
  const orders = [...mockRecentOrders, ...mockRecentOrders].map((order, index) => ({
    ...order,
    id: `ORD${String(index + 1).padStart(3, '0')}`,
  }));

  const pendingOrders = orders.filter(order => order.status === 'pending');
  const productionOrders = orders.filter(order => order.status === 'production');
  const waitingOrders = orders.filter(order => order.status === 'waiting');
  const completedOrders = orders.filter(order => order.status === 'completed');

  const handleViewOrder = (order: any) => {
    setSelectedOrder(order);
    setIsViewDialogOpen(true);
  };

  const updateStatus = (order: any, newStatus: string) => {
    // In a real app, this would update the order in the database
    toast.success(`Ordem ${order.id} atualizada para ${statuses[newStatus as keyof typeof statuses].label}`);
  };

  const renderOrderCard = (order: any) => (
    <Card key={order.id} className="mb-4">
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{order.client}</span>
              {order.isUrgent && (
                <Badge variant="destructive" className="text-xs">Urgente</Badge>
              )}
            </div>
            <div className="text-sm text-muted-foreground">#{order.id} - {order.service}</div>
          </div>
          <span className={cn(
            "rounded-full border px-2 py-1 text-xs font-medium",
            statuses[order.status as keyof typeof statuses].className
          )}>
            {statuses[order.status as keyof typeof statuses].label}
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex justify-between items-center mt-2">
          <div className="text-sm">
            <p>Data entrega: {order.dueDate}</p>
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
              <Button size="sm" variant="outline" onClick={() => updateStatus(order, 'completed')}>
                Finalizar
              </Button>
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
      
      {/* Dialog para visualizar detalhes da ordem */}
      <OrderDetailsDialog 
        open={isViewDialogOpen} 
        onOpenChange={setIsViewDialogOpen}
        order={selectedOrder}
      />
    </div>
  );
}
