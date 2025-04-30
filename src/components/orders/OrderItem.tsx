
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { OrderStatus, statusLabels } from '@/data/mockData';

export interface OrderItemProps {
  order: {
    id: string;
    client: string;
    patientName?: string;
    service: string;
    dueDate: string;
    status: OrderStatus;
    isUrgent: boolean;
  };
  onView: (order: any) => void;
  onEdit: (order: any) => void;
}

export function OrderItem({ order, onView, onEdit }: OrderItemProps) {
  return (
    <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 p-4">
      <div>
        <div className="flex items-center gap-2">
          {/* Exibir nome do paciente se disponível, senão exibir nome do cliente */}
          <span className="font-medium">
            {order.patientName || order.client}
          </span>
          {order.isUrgent && (
            <Badge variant="destructive" className="text-xs">Urgente</Badge>
          )}
        </div>
        {/* Se estiver mostrando o nome do paciente, mostrar o cliente como informação secundária */}
        {order.patientName && (
          <div className="text-sm text-muted-foreground">
            Cliente: {order.client}
          </div>
        )}
        <div className="text-sm text-muted-foreground">{order.service}</div>
        <div className="text-xs text-muted-foreground">#{order.id.substring(0, 8)}</div>
      </div>
      <div className="hidden sm:block text-sm">
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
      <div className="flex space-x-2">
        <Button variant="ghost" size="sm" onClick={() => onView(order)}>
          Ver
        </Button>
        <Button variant="outline" size="sm" onClick={() => onEdit(order)}>
          Editar
        </Button>
      </div>
    </div>
  );
}
