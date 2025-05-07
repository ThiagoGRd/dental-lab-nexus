
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type OrderStatus = 'pending' | 'production' | 'waiting' | 'completed' | 'delivered';

type Order = {
  id: string;
  client: string;
  patientName?: string;
  service: string;
  createdAt: string;
  dueDate: string;
  status: OrderStatus;
  isUrgent?: boolean;
}

const statuses: Record<OrderStatus, { label: string, className: string }> = {
  'pending': { label: 'Pendente', className: 'status-pending' },
  'production': { label: 'Em Produção', className: 'status-production' },
  'waiting': { label: 'Aguardando Material', className: 'status-waiting' },
  'completed': { label: 'Finalizado', className: 'status-completed' },
  'delivered': { label: 'Entregue', className: 'status-delivered' },
};

type RecentOrdersProps = {
  orders: Order[];
  onViewAllClick?: () => void;
  onOrderClick?: (order: Order) => void;
}

export default function RecentOrders({ 
  orders, 
  onViewAllClick, 
  onOrderClick 
}: RecentOrdersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ordens Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {orders.map((order) => (
            <div 
              key={order.id} 
              className={cn(
                "flex items-center gap-4 rounded-lg border p-3",
                onOrderClick && "cursor-pointer hover:bg-gray-50 transition-colors"
              )}
              onClick={() => onOrderClick && onOrderClick(order)}
            >
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">
                    {order.patientName || order.client}
                  </p>
                  {order.isUrgent && (
                    <Badge variant="destructive" className="text-xs">Urgente</Badge>
                  )}
                </div>
                {order.patientName && (
                  <p className="text-xs text-muted-foreground">
                    Cliente: {order.client}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
                  {order.service}
                </p>
              </div>
              <div className="hidden md:block">
                <p className="text-sm text-muted-foreground">Vencimento</p>
                <p className="text-sm font-medium">{order.dueDate}</p>
              </div>
              <div>
                <p className={cn(
                  "rounded-full border px-2 py-1 text-xs font-medium",
                  statuses[order.status].className
                )}>
                  {statuses[order.status].label}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={(e) => {
                e.stopPropagation(); // Evitar que o clique se propague para o elemento pai
                onOrderClick && onOrderClick(order);
              }}>
                Ver
              </Button>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-center">
          <Button variant="outline" onClick={onViewAllClick}>Ver Todas as Ordens</Button>
        </div>
      </CardContent>
    </Card>
  );
}
