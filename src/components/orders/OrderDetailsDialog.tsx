
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface OrderDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: any | null;
  clientMode?: boolean;
}

export default function OrderDetailsDialog({ 
  open, 
  onOpenChange, 
  order,
  clientMode = false
}: OrderDetailsDialogProps) {
  if (!order) return null;

  const statusStyles = {
    'pending': 'bg-yellow-100 text-yellow-800 border-yellow-300',
    'production': 'bg-blue-100 text-blue-800 border-blue-300',
    'waiting': 'bg-orange-100 text-orange-800 border-orange-300',
    'completed': 'bg-green-100 text-green-800 border-green-300',
    'delivered': 'bg-purple-100 text-purple-800 border-purple-300',
  };

  const statusLabels = {
    'pending': 'Pendente',
    'production': 'Em Produção',
    'waiting': 'Aguardando Material',
    'completed': 'Finalizado',
    'delivered': 'Entregue',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {clientMode ? 'Detalhes da Ordem do Cliente' : 'Detalhes da Ordem de Serviço'}
          </DialogTitle>
          <DialogDescription>
            #{order.id} • {order.dueDate}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Cliente</h3>
              <p className="text-lg font-semibold">{order.client}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Status</h3>
              <div className="mt-1">
                <Badge className={statusStyles[order.status as keyof typeof statusStyles]}>
                  {statusLabels[order.status as keyof typeof statusLabels]}
                </Badge>
                {order.isUrgent && (
                  <Badge variant="destructive" className="ml-2">Urgente</Badge>
                )}
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">Serviço</h3>
            <p>{order.service}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Material</h3>
              <p>{order.material || 'Zircônia'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Cor/Escala</h3>
              <p>{order.shade || 'A2'}</p>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">Observações</h3>
            <p className="text-sm text-gray-700">{order.notes || 'Nenhuma observação adicional.'}</p>
          </div>
        </div>
        
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
