
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { mockRecentOrders } from '@/data/mockData';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import OrderDetailsDialog from '@/components/orders/OrderDetailsDialog';

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
  
  // Simulando ordens para este cliente específico
  const clientOrders = [...mockRecentOrders, ...mockRecentOrders].map((order, index) => ({
    ...order,
    id: `ORD${String(index + 1).padStart(3, '0')}`,
    client: clientName,
  }));
  
  // Estilos para os status das ordens
  const statuses = {
    'pending': { label: 'Pendente', className: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
    'production': { label: 'Em Produção', className: 'bg-blue-100 text-blue-800 border-blue-300' },
    'waiting': { label: 'Aguardando Material', className: 'bg-orange-100 text-orange-800 border-orange-300' },
    'completed': { label: 'Finalizado', className: 'bg-green-100 text-green-800 border-green-300' },
    'delivered': { label: 'Entregue', className: 'bg-purple-100 text-purple-800 border-purple-300' },
  };
  
  const handleViewOrder = (order: any) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
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
                      <div className="text-xs text-gray-600">#{order.id}</div>
                    </div>
                    <div className="text-sm">
                      {order.dueDate}
                    </div>
                    <div>
                      <span className={cn(
                        "rounded-full border px-2 py-1 text-xs font-medium",
                        statuses[order.status as keyof typeof statuses].className
                      )}>
                        {statuses[order.status as keyof typeof statuses].label}
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
