
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { OrderItem } from './OrderItem';
import { OrderStatus } from '@/data/mockData';
import { Loader2, Package } from 'lucide-react';

interface OrderListProps {
  orders: Array<{
    id: string;
    client: string;
    patientName?: string;
    service: string;
    createdAt: string;
    dueDate: string;
    status: OrderStatus;
    isUrgent: boolean;
    notes?: string;
    originalData?: {
      clientId: string;
      orderId: string;
    };
  }>;
  loading: boolean;
  onViewOrder: (order: any) => void;
  onEditOrder: (order: any) => void;
}

export function OrderList({ orders, loading, onViewOrder, onEditOrder }: OrderListProps) {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="rounded-md border">
          <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 bg-muted/50 p-4 font-medium border-b">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Cliente / Paciente / Serviço
            </div>
            <div className="hidden sm:block">Data de Entrega</div>
            <div>Status</div>
            <div>Ações</div>
          </div>
          
          <div className="divide-y">
            {loading ? (
              <div className="p-8 text-center">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                <p className="text-muted-foreground">Carregando ordens de serviço...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="p-8 text-center">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhuma ordem de serviço encontrada.</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Tente ajustar os filtros ou criar uma nova ordem.
                </p>
              </div>
            ) : (
              orders.map((order) => (
                <OrderItem 
                  key={order.id} 
                  order={order} 
                  onView={onViewOrder} 
                  onEdit={onEditOrder} 
                />
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
