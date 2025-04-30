
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { OrderItem } from './OrderItem';
import { OrderStatus } from '@/data/mockData';

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
          <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 bg-muted/50 p-4 font-medium">
            <div>Cliente / Paciente / Serviço</div>
            <div className="hidden sm:block">Data de Entrega</div>
            <div>Status</div>
            <div>Ações</div>
          </div>
          <div className="divide-y">
            {loading ? (
              <div className="p-8 text-center">
                Carregando ordens de serviço...
              </div>
            ) : orders.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                Nenhuma ordem de serviço encontrada.
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
