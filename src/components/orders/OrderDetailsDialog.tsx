
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Calendar, User, FileText, Package, AlertTriangle, Clock } from 'lucide-react';
import { format, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { statusLabels } from '@/data/mockData';
import { cn } from '@/lib/utils';

interface OrderDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: any;
}

export default function OrderDetailsDialog({ open, onOpenChange, order }: OrderDetailsDialogProps) {
  if (!order) return null;

  const formattedDueDate = order.dueDate ? 
    (() => {
      const dateObj = new Date(order.dueDate);
      return isValid(dateObj) ? format(dateObj, 'dd/MM/yyyy', { locale: ptBR }) : 'Não definida';
    })() : 'Não definida';

  const formattedCreatedDate = order.createdAt ? 
    (() => {
      const dateObj = new Date(order.createdAt);
      return isValid(dateObj) ? format(dateObj, 'dd/MM/yyyy HH:mm', { locale: ptBR }) : 'Não definida';
    })() : 'Não definida';

  const extractDetailFromNotes = (notes: string, detail: string): string | null => {
    if (!notes) return null;
    const regex = new RegExp(`${detail}:\\s*([^,\\-]+)`, 'i');
    const match = notes.match(regex);
    return match && match[1] ? match[1].trim() : null;
  };

  const prosthesisType = extractDetailFromNotes(order.notes || '', 'Tipo');
  const material = extractDetailFromNotes(order.notes || '', 'Material');
  const shade = extractDetailFromNotes(order.notes || '', 'Cor');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Detalhes da Ordem #{order.id.substring(0, 8)}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status e Prioridade */}
          <div className="flex items-center gap-4">
            <Badge className={cn(
              "px-3 py-1",
              statusLabels[order.status]?.className || 'bg-gray-100 text-gray-800'
            )}>
              {statusLabels[order.status]?.label || 'Desconhecido'}
            </Badge>
            {order.isUrgent && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Urgente
              </Badge>
            )}
          </div>

          {/* Informações Principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Cliente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">{order.client}</p>
                {order.patientName && (
                  <p className="text-sm text-muted-foreground">
                    Paciente: {order.patientName}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Serviço
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">{order.service}</p>
              </CardContent>
            </Card>
          </div>

          {/* Datas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Data de Criação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">{formattedCreatedDate}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Data de Entrega
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">{formattedDueDate}</p>
              </CardContent>
            </Card>
          </div>

          {/* Detalhes Técnicos */}
          {(prosthesisType || material || shade) && (
            <>
              <Separator />
              <div>
                <h3 className="font-medium mb-3">Detalhes Técnicos</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {prosthesisType && (
                    <div>
                      <p className="text-sm text-muted-foreground">Tipo</p>
                      <p className="font-medium">{prosthesisType}</p>
                    </div>
                  )}
                  {material && (
                    <div>
                      <p className="text-sm text-muted-foreground">Material</p>
                      <p className="font-medium">{material}</p>
                    </div>
                  )}
                  {shade && (
                    <div>
                      <p className="text-sm text-muted-foreground">Cor</p>
                      <p className="font-medium">{shade}</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Observações */}
          {order.notes && (
            <>
              <Separator />
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Observações
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{order.notes}</p>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
