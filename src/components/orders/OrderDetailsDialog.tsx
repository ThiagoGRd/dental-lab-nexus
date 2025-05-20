
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
import { CalendarIcon, ChevronsRight, DollarSign, Timer, User, Wrench } from 'lucide-react';
import { format } from 'date-fns';
import { supabase, hasError, safeData } from "@/integrations/supabase/client";

interface OrderDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: any | null;
  clientMode?: boolean;
}

export default function OrderDetailsDialog({ open, onOpenChange, order, clientMode = false }: OrderDetailsDialogProps) {
  const [hasWorkflow, setHasWorkflow] = useState(false);
  const [serviceName, setServiceName] = useState("");
  const [client, setClient] = useState<any>(null);
  const [technicalDetails, setTechnicalDetails] = useState({
    shadeDetails: '',
    material: '',
    prosthesisType: ''
  });

  // Reset state when dialog closes to prevent stale data
  useEffect(() => {
    if (!open) {
      setHasWorkflow(false);
      setServiceName("");
      setClient(null);
      setTechnicalDetails({
        shadeDetails: '',
        material: '',
        prosthesisType: ''
      });
    }
  }, [open]);

  useEffect(() => {
    if (order && open) {
      checkWorkflow();
      loadAdditionalData();
      extractTechnicalDetails();
    }
  }, [order, open]);

  // Extrair detalhes técnicos das notas
  const extractTechnicalDetails = () => {
    if (!order || !order.notes) return;
    
    const notes = order.notes;
    let shadeDetails = '';
    let material = '';
    let prosthesisType = '';
    
    // Extrair detalhes de cor
    const colorMatch = notes.match(/Cor:\s*([^,\-]+)/);
    if (colorMatch && colorMatch[1]) {
      shadeDetails = colorMatch[1].trim();
    }
    
    // Extrair material
    const materialMatch = notes.match(/Material:\s*([^,\-]+)/);
    if (materialMatch && materialMatch[1]) {
      material = materialMatch[1].trim();
    }
    
    // Extrair tipo de prótese
    const typeMatch = notes.match(/Tipo:\s*([^,\-]+)/);
    if (typeMatch && typeMatch[1]) {
      prosthesisType = typeMatch[1].trim();
    }
    
    setTechnicalDetails({
      shadeDetails,
      material,
      prosthesisType
    });
  };

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

  // Traduzir valores de material e tipo para exibição
  const getMaterialLabel = (value: string) => {
    const materialMap: Record<string, string> = {
      'zirconia': 'Zircônia',
      'metal_ceramica': 'Metalocerâmica',
      'e_max': 'E-Max',
      'resina': 'Resina',
      'acrilico': 'Acrílico',
      'outro': 'Outro'
    };
    
    return materialMap[value] || value;
  };
  
  const getProsthesisTypeLabel = (value: string) => {
    const typeMap: Record<string, string> = {
      'coroa': 'Coroa',
      'ponte': 'Ponte',
      'protese_total': 'Prótese Total',
      'protese_parcial': 'Prótese Parcial',
      'implante': 'Implante',
      'faceta': 'Faceta',
      'onlay': 'Onlay/Inlay',
      'outro': 'Outro'
    };
    
    return typeMap[value] || value;
  };

  // If order is null, don't render the dialog content to prevent errors
  if (!order) return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Carregando...</DialogTitle>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

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
          
          {/* Novo card para detalhes técnicos */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Especificações Técnicas
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div>
                  <span className="font-medium">Tipo de Prótese:</span>{' '}
                  {technicalDetails.prosthesisType ? 
                    getProsthesisTypeLabel(technicalDetails.prosthesisType) : 
                    'Não especificado'}
                </div>
                <div>
                  <span className="font-medium">Material:</span>{' '}
                  {technicalDetails.material ? 
                    getMaterialLabel(technicalDetails.material) : 
                    'Não especificado'}
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <span className="font-medium">Cor Base:</span>{' '}
                  {order.shade || 'Não especificada'}
                </div>
                <div>
                  <span className="font-medium">Detalhes de Cor:</span>{' '}
                  {technicalDetails.shadeDetails || 'Não especificados'}
                </div>
              </div>
            </CardContent>
          </Card>
          
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
