
import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { statusLabels } from '@/data/mockData';
import OrderWorkflow from './OrderWorkflow';
import { CalendarIcon, ChevronsRight, DollarSign, Timer, User } from 'lucide-react';
import { format } from 'date-fns';
import { supabase, hasError, safeData } from "@/integrations/supabase/client";

interface OrderDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: any | null;
  clientMode?: boolean; // Make it optional with a default value
}

export default function OrderDetailsDialog({ open, onOpenChange, order, clientMode = false }: OrderDetailsDialogProps) {
  const [hasWorkflow, setHasWorkflow] = useState(false);
  const [serviceName, setServiceName] = useState("");
  const [client, setClient] = useState<any>(null);

  useEffect(() => {
    if (order && open) {
      checkWorkflow();
      loadAdditionalData();
    }
  }, [order, open]);

  const checkWorkflow = async () => {
    if (!order) return;

    try {
      const workflowResponse = await supabase
        .from('order_workflows')
        .select('id')
        .eq('order_id', order.originalData?.orderId || order.id);
      
      if (hasError(workflowResponse)) {
        console.error('Erro ao verificar workflow:', workflowResponse.error);
        return;
      }
      
      const workflowData = safeData(workflowResponse, []);
      setHasWorkflow(workflowData.length > 0);
    } catch (error) {
      console.error("Erro ao verificar workflow:", error);
      setHasWorkflow(false);
    }
  };

  const loadAdditionalData = async () => {
    if (!order) return;

    try {
      // Carregar informações detalhadas do serviço
      const itemResponse = await supabase
        .from('order_items')
        .select('service_id')
        .eq('order_id', order.originalData?.orderId || order.id);

      if (hasError(itemResponse)) {
        console.error('Erro ao carregar item da ordem:', itemResponse.error);
        return;
      }

      const itemData = safeData(itemResponse, []);
      
      if (itemData && itemData.length > 0) {
        const serviceResponse = await supabase
          .from('services')
          .select('name')
          .eq('id', itemData[0].service_id);

        if (hasError(serviceResponse)) {
          console.error('Erro ao carregar serviço:', serviceResponse.error);
          return;
        }

        const serviceData = safeData(serviceResponse, []);
          
        if (serviceData && serviceData.length > 0) {
          setServiceName(serviceData[0].name);
        }
      }

      // Carregar informações detalhadas do cliente
      if (order.originalData?.clientId) {
        const clientResponse = await supabase
          .from('clients')
          .select('*')
          .eq('id', order.originalData.clientId);
          
        if (hasError(clientResponse)) {
          console.error('Erro ao carregar cliente:', clientResponse.error);
          return;
        }

        const clientData = safeData(clientResponse, []);
          
        if (clientData && clientData.length > 0) {
          setClient(clientData[0]);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar dados adicionais:", error);
    }
  };

  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            Ordem #{order.id?.substring(0, 8)}
            {order.isUrgent && (
              <Badge variant="destructive" className="ml-2">Urgente</Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Detalhes da ordem de serviço
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informações do Cliente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <span className="font-medium">Cliente:</span> {order.client}
                </div>
                {client && (
                  <>
                    {client.contact_name && (
                      <div>
                        <span className="font-medium">Contato:</span> {client.contact_name}
                      </div>
                    )}
                    {client.phone && (
                      <div>
                        <span className="font-medium">Telefone:</span> {client.phone}
                      </div>
                    )}
                    {client.email && (
                      <div>
                        <span className="font-medium">Email:</span> {client.email}
                      </div>
                    )}
                  </>
                )}
                {order.patientName && (
                  <div>
                    <span className="font-medium">Paciente:</span> {order.patientName}
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Detalhes do Serviço
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <span className="font-medium">Serviço:</span> {serviceName || order.service}
                </div>
                {order.shade && (
                  <div>
                    <span className="font-medium">Cor/Escala:</span> {order.shade}
                  </div>
                )}
                <div>
                  <span className="font-medium">Status:</span>{' '}
                  <span className={cn(
                    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                    statusLabels[order.status]?.className || 'bg-gray-100 text-gray-800'
                  )}>
                    {statusLabels[order.status]?.label || 'Desconhecido'}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Criado em:</span> {order.createdAt}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  Prazos
                </CardTitle>
                {order.isUrgent && (
                  <Badge variant="destructive" className="ml-2">Urgente</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                <Timer className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Criado em:</span> {order.createdAt}
                <ChevronsRight className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Entrega prevista:</span> {order.dueDate || 'Não definida'}
              </div>
              {order.isUrgent && (
                <p className="text-sm text-red-600 mt-1">Esta ordem é marcada como urgente e tem prioridade.</p>
              )}
            </CardContent>
          </Card>
          
          {order.notes && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Observações</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{order.notes}</p>
              </CardContent>
            </Card>
          )}
          
          {hasWorkflow && (
            <OrderWorkflow 
              orderId={order.originalData?.orderId || order.id} 
            />
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
