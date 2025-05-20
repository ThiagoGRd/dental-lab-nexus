
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { OrderStatus, statusLabels } from '@/data/mockData';
import { BadgeCheck, Wrench } from 'lucide-react';
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
    notes?: string; // Adicionado para extrair detalhes técnicos
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

  // Extract prosthesis type from notes for badge display
  const getProsthesisType = (): string | null => {
    if (!order.notes) return null;
    
    const typeMatch = order.notes.match(/Tipo:\s*([^,\-]+)/);
    if (typeMatch && typeMatch[1]) {
      return typeMatch[1].trim();
    }
    return null;
  };
  
  const prosthesisType = getProsthesisType();
  
  // Map prosthesis type to a human-readable label
  const getProsthesisTypeBadgeLabel = (type: string): string => {
    const typeMap: Record<string, string> = {
      'coroa': 'Coroa',
      'ponte': 'Ponte',
      'protese_total': 'Prótese Total',
      'protese_parcial': 'PPR',
      'implante': 'Implante',
      'faceta': 'Faceta',
      'onlay': 'Onlay',
      'outro': 'Outro'
    };
    
    return typeMap[type] || type;
  };
  
  // Function to determine badge color based on prosthesis type
  const getProsthesisTypeBadgeClass = (type: string): string => {
    const typeColorMap: Record<string, string> = {
      'coroa': 'bg-blue-100 text-blue-800 border-blue-200',
      'ponte': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'protese_total': 'bg-purple-100 text-purple-800 border-purple-200',
      'protese_parcial': 'bg-pink-100 text-pink-800 border-pink-200',
      'implante': 'bg-cyan-100 text-cyan-800 border-cyan-200',
      'faceta': 'bg-emerald-100 text-emerald-800 border-emerald-200',
      'onlay': 'bg-teal-100 text-teal-800 border-teal-200',
      'outro': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    
    return typeColorMap[type] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 p-4">
      <div>
        {/* Destacar o nome do paciente quando disponível */}
        {order.patientName ? (
          <>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-purple-500 dark:text-purple-300 flex items-center gap-1">
                <BadgeCheck className="h-4 w-4" />
                {order.patientName}
              </span>
              {order.isUrgent && (
                <Badge variant="destructive" className="text-xs">Urgente</Badge>
              )}
              {prosthesisType && (
                <Badge variant="outline" className={cn("text-xs ml-1", getProsthesisTypeBadgeClass(prosthesisType))}>
                  <Wrench className="h-3 w-3 mr-1" />
                  {getProsthesisTypeBadgeLabel(prosthesisType)}
                </Badge>
              )}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Cliente: {order.client}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium">
              {order.client}
            </span>
            {order.isUrgent && (
              <Badge variant="destructive" className="text-xs">Urgente</Badge>
            )}
            {prosthesisType && (
              <Badge variant="outline" className={cn("text-xs", getProsthesisTypeBadgeClass(prosthesisType))}>
                <Wrench className="h-3 w-3 mr-1" />
                {getProsthesisTypeBadgeLabel(prosthesisType)}
              </Badge>
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
