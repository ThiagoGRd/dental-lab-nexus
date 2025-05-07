
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { OrderStatus, statusLabels } from '@/data/mockData';
import { BadgeCheck } from 'lucide-react';
import { format, isValid } from 'date-fns';

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
  // Format the date to DD/MM/AAAA if it's valid
  const formattedDueDate = order.dueDate ? 
    (() => {
      const dateObj = new Date(order.dueDate);
      return isValid(dateObj) ? format(dateObj, 'dd/MM/yyyy') : 'Não definida';
    })() : 'Não definida';

  return (
    <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 p-4">
      <div>
        {/* Destacar o nome do paciente quando disponível */}
        {order.patientName ? (
          <>
            <div className="flex items-center gap-2">
              <span className="font-bold text-purple-500 dark:text-purple-300 flex items-center gap-1">
                <BadgeCheck className="h-4 w-4" />
                {order.patientName}
              </span>
              {order.isUrgent && (
                <Badge variant="destructive" className="text-xs">Urgente</Badge>
              )}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Cliente: {order.client}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <span className="font-medium">
              {order.client}
            </span>
            {order.isUrgent && (
              <Badge variant="destructive" className="text-xs">Urgente</Badge>
            )}
          </div>
        )}
        <div className="text-sm text-muted-foreground">{order.service}</div>
        <div className="text-xs text-muted-foreground">#{order.id.substring(0, 8)}</div>
      </div>
      <div className="hidden sm:block text-sm">
        {formattedDueDate}
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
