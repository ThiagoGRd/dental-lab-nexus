
import React, { useEffect, useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { supabase } from "@/integrations/supabase/client";

const orderFormSchema = z.object({
  client: z.string().min(1, 'O cliente é obrigatório'),
  patientName: z.string().min(1, 'O nome do paciente é obrigatório'),
  service: z.string().min(1, 'O serviço é obrigatório'),
  status: z.string().min(1, 'O status é obrigatório'),
  dueDate: z.string().min(1, 'A data de entrega é obrigatória'),
  isUrgent: z.boolean().default(false),
  shade: z.string().min(1, 'A cor/escala é obrigatória'),
  notes: z.string().optional(),
  workflowTemplateId: z.string().optional(),
});

type OrderFormValues = z.infer<typeof orderFormSchema>;

interface OrderEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: any | null;
  onSave: (updatedOrder: any) => void;
}

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string | null;
}

export default function OrderEditDialog({ open, onOpenChange, order, onSave }: OrderEditDialogProps) {
  const [workflowTemplates, setWorkflowTemplates] = useState<WorkflowTemplate[]>([]);
  const [currentWorkflow, setCurrentWorkflow] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      client: order?.client || '',
      patientName: order?.patientName || '',
      service: order?.service || '',
      status: order?.status || 'pending',
      dueDate: order?.dueDate || '',
      isUrgent: order?.isUrgent || false,
      shade: order?.shade || '',
      notes: order?.notes || '',
      workflowTemplateId: '',
    },
  });

  // Carregar templates de workflow
  useEffect(() => {
    if (open) {
      loadWorkflowTemplates();
      checkExistingWorkflow();
    }
  }, [open, order]);

  // Update form values when order changes
  useEffect(() => {
    if (order) {
      form.reset({
        client: order.client || '',
        patientName: order.patientName || '',
        service: order.service || '',
        status: order.status || 'pending',
        dueDate: order.dueDate || '',
        isUrgent: order.isUrgent || false,
        shade: order.shade || 'A2',
        notes: order.notes || '',
        workflowTemplateId: '',
      });
    }
  }, [order, form]);

  const loadWorkflowTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('workflow_templates')
        .select('id, name, description')
        .order('name');
        
      if (error) {
        console.error("Erro ao carregar templates de workflow:", error);
      } else {
        setWorkflowTemplates(data || []);
      }
    } catch (error) {
      console.error("Erro ao carregar templates:", error);
    }
  };

  const checkExistingWorkflow = async () => {
    if (!order) return;
    
    try {
      const { data, error } = await supabase
        .from('order_workflows')
        .select('template_id')
        .eq('order_id', order.originalData?.orderId || order.id)
        .single();
        
      if (error) {
        console.error("Erro ao verificar workflow existente:", error);
        setCurrentWorkflow(null);
      } else if (data) {
        setCurrentWorkflow(data.template_id);
      } else {
        setCurrentWorkflow(null);
      }
    } catch (error) {
      console.error("Erro ao verificar workflow:", error);
    }
  };

  const handleSubmit = async (data: OrderFormValues) => {
    if (!order) return;
    
    setLoading(true);
    
    try {
      // Preparar dados atualizados
      const updatedOrder = {
        ...order,
        ...data,
      };
      
      // Verificar se precisa criar ou atualizar workflow
      if (data.workflowTemplateId) {
        if (currentWorkflow) {
          // Já existe um workflow para esta ordem, não fazemos nada
          console.log("Workflow já existe para esta ordem");
        } else {
          // Criar novo workflow
          const { error: workflowError } = await supabase
            .from('order_workflows')
            .insert({
              order_id: order.originalData?.orderId || order.id,
              template_id: data.workflowTemplateId,
              current_step: 0,
              history: [],
              notes: `Workflow iniciado em ${new Date().toLocaleDateString()}`
            });
            
          if (workflowError) {
            console.error("Erro ao criar workflow:", workflowError);
            toast.error("Erro ao criar fluxo de trabalho para esta ordem.");
          } else {
            toast.success("Fluxo de trabalho associado com sucesso!");
          }
        }
      }
      
      onSave(updatedOrder);
      setLoading(false);
    } catch (error) {
      console.error("Erro ao atualizar ordem:", error);
      toast.error("Ocorreu um erro ao salvar as alterações.");
      setLoading(false);
    }
  };

  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Editar Ordem de Serviço</DialogTitle>
          <DialogDescription>
            #{order.id} • Edite os dados da ordem de serviço
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="client"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cliente</FormLabel>
                    <Select 
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um cliente" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Clínica Dental Care">Clínica Dental Care</SelectItem>
                        <SelectItem value="Dr. Roberto Alves">Dr. Roberto Alves</SelectItem>
                        <SelectItem value="Odontologia Sorriso">Odontologia Sorriso</SelectItem>
                        <SelectItem value="Dra. Márcia Santos">Dra. Márcia Santos</SelectItem>
                        <SelectItem value="Centro Odontológico Bem Estar">Centro Odontológico Bem Estar</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="patientName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Paciente</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do paciente" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="service"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Serviço</FormLabel>
                  <Select 
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um serviço" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Coroa em Zircônia">Coroa em Zircônia</SelectItem>
                      <SelectItem value="Prótese Fixa">Prótese Fixa</SelectItem>
                      <SelectItem value="Faceta">Faceta</SelectItem>
                      <SelectItem value="Implante">Implante</SelectItem>
                      <SelectItem value="Prótese Removível">Prótese Removível</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select 
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="production">Em Produção</SelectItem>
                        <SelectItem value="waiting">Aguardando Material</SelectItem>
                        <SelectItem value="completed">Finalizado</SelectItem>
                        <SelectItem value="delivered">Entregue</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Entrega</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="shade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cor/Escala</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: A2" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="isUrgent"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Ordem Urgente</FormLabel>
                    <p className="text-sm text-gray-500">
                      Prazo de entrega reduzido (3 dias úteis)
                    </p>
                  </div>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Instruções especiais ou observações adicionais" 
                      className="resize-none" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {!currentWorkflow && (
              <FormField
                control={form.control}
                name="workflowTemplateId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Associar Fluxo de Trabalho</FormLabel>
                    <Select 
                      onValueChange={field.onChange}
                      value={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um fluxo de trabalho (opcional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Nenhum</SelectItem>
                        {workflowTemplates.map(template => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-1">
                      Associar um fluxo de trabalho para acompanhar as etapas de produção
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            {currentWorkflow && (
              <div className="rounded-md border border-blue-200 bg-blue-50 p-3">
                <p className="text-sm text-blue-700">
                  Esta ordem já possui um fluxo de trabalho associado. 
                  Você pode visualizá-lo nos detalhes da ordem.
                </p>
              </div>
            )}
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
