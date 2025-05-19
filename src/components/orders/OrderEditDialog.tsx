
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
  FormDescription,
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
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from 'date-fns';
import { supabase, hasError, safeData } from "@/integrations/supabase/client";
import { updateOrder, createWorkflow } from "@/utils/orderUtils";
import type { Database } from '@/integrations/supabase/types';

const orderFormSchema = z.object({
  client: z.string().min(1, 'O cliente é obrigatório'),
  patientName: z.string().min(1, 'O nome do paciente é obrigatório'),
  service: z.string().min(1, 'O serviço é obrigatório'),
  status: z.string().min(1, 'O status é obrigatório'),
  dueDate: z.string().min(1, 'A data de entrega é obrigatória'),
  isUrgent: z.boolean().default(false),
  shade: z.string().min(1, 'A cor/escala é obrigatória'),
  shadeDetails: z.string().optional(),
  material: z.string().optional(),
  prosthesisType: z.string().optional(),
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

const materialOptions = [
  { value: 'zirconia', label: 'Zircônia' },
  { value: 'metal_ceramica', label: 'Metalocerâmica' },
  { value: 'e_max', label: 'E-Max' },
  { value: 'resina', label: 'Resina' },
  { value: 'acrilico', label: 'Acrílico' },
  { value: 'outro', label: 'Outro' }
];

const prosthesisTypes = [
  { value: 'coroa', label: 'Coroa' },
  { value: 'ponte', label: 'Ponte' },
  { value: 'protese_total', label: 'Prótese Total' },
  { value: 'protese_parcial', label: 'Prótese Parcial' },
  { value: 'implante', label: 'Implante' },
  { value: 'faceta', label: 'Faceta' },
  { value: 'onlay', label: 'Onlay/Inlay' },
  { value: 'outro', label: 'Outro' }
];

export default function OrderEditDialog({ open, onOpenChange, order, onSave }: OrderEditDialogProps) {
  const [workflowTemplates, setWorkflowTemplates] = useState<WorkflowTemplate[]>([]);
  const [currentWorkflow, setCurrentWorkflow] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      client: '',
      patientName: '',
      service: '',
      status: 'pending',
      dueDate: format(new Date(), 'yyyy-MM-dd'),
      isUrgent: false,
      shade: 'A2',
      shadeDetails: '',
      material: '',
      prosthesisType: '',
      notes: '',
      workflowTemplateId: '',
    },
  });

  // Extract patient information and technical details from notes
  const extractInfoFromNotes = (notes: string | undefined) => {
    if (!notes) return { patientName: '', cleanNotes: '', shadeDetails: '', material: '', prosthesisType: '' };
    
    let patientName = '';
    let shadeDetails = '';
    let material = '';
    let prosthesisType = '';
    let cleanNotes = notes;
    
    // Extract patient name
    const patientMatch = notes.match(/Paciente:\s*([^,\-]+)/);
    if (patientMatch && patientMatch[1]) {
      patientName = patientMatch[1].trim();
      cleanNotes = cleanNotes.replace(/Paciente:\s*[^,\-]+(,|\s*-\s*|$)/, '').trim();
    }
    
    // Extract color details
    const colorMatch = notes.match(/Cor:\s*([^,\-]+)/);
    if (colorMatch && colorMatch[1]) {
      shadeDetails = colorMatch[1].trim();
      cleanNotes = cleanNotes.replace(/Cor:\s*[^,\-]+(,|\s*-\s*|$)/, '').trim();
    }
    
    // Extract material
    const materialMatch = notes.match(/Material:\s*([^,\-]+)/);
    if (materialMatch && materialMatch[1]) {
      material = materialMatch[1].trim();
      cleanNotes = cleanNotes.replace(/Material:\s*[^,\-]+(,|\s*-\s*|$)/, '').trim();
    }
    
    // Extract prosthesis type
    const typeMatch = notes.match(/Tipo:\s*([^,\-]+)/);
    if (typeMatch && typeMatch[1]) {
      prosthesisType = typeMatch[1].trim();
      cleanNotes = cleanNotes.replace(/Tipo:\s*[^,\-]+(,|\s*-\s*|$)/, '').trim();
    }
    
    return { patientName, cleanNotes, shadeDetails, material, prosthesisType };
  };
  
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
      console.log('Dados da ordem carregados:', order);
      
      // Extract all information from notes
      const { patientName, cleanNotes, shadeDetails, material, prosthesisType } = 
        extractInfoFromNotes(order.notes);
      
      const finalPatientName = patientName || order.patientName || '';
      
      form.reset({
        client: order.client || '',
        patientName: finalPatientName,
        service: order.service || '',
        status: order.status || 'pending',
        dueDate: order.dueDate || format(new Date(), 'yyyy-MM-dd'),
        isUrgent: order.isUrgent || false,
        shade: order.shade || 'A2',
        shadeDetails: shadeDetails || '',
        material: material || '',
        prosthesisType: prosthesisType || '',
        notes: cleanNotes || '',
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
        const typedTemplates = safeData<WorkflowTemplate[]>(data, []);
        setWorkflowTemplates(typedTemplates);
      }
    } catch (error) {
      console.error("Erro ao carregar templates:", error);
    }
  };

  const checkExistingWorkflow = async () => {
    if (!order) return;
    
    try {
      const orderId = order.originalData?.orderId || order.id;
      console.log('Verificando workflow para ordem:', orderId);
      
      const { data, error } = await supabase
        .from('order_workflows')
        .select('template_id')
        .eq('order_id', orderId)
        .maybeSingle();
        
      if (error && error.code !== 'PGRST116') {
        console.error("Erro ao verificar workflow existente:", error);
        setCurrentWorkflow(null);
      } else if (data) {
        console.log('Workflow existente encontrado:', data);
        const typedData = data as any;
        setCurrentWorkflow(typedData.template_id);
      } else {
        console.log('Nenhum workflow encontrado para esta ordem');
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
      // Obter o ID real da ordem
      const orderId = order.originalData?.orderId || order.id;
      console.log('Atualizando ordem com ID:', orderId);
      console.log('Dados para atualização:', data);
      
      // Criamos um objeto para passar ao hook
      const updatedOrderData = {
        ...order,
        status: data.status,
        dueDate: data.dueDate,
        isUrgent: data.isUrgent,
        notes: data.notes,
        patientName: data.patientName,
        shadeDetails: data.shadeDetails,
        material: data.material,
        prosthesisType: data.prosthesisType,
        originalData: order.originalData
      };
      
      // Atualizar no Supabase usando a função helper
      const updateResult = await updateOrder(
        orderId,
        data.status,
        data.dueDate ? new Date(data.dueDate).toISOString() : null,
        data.isUrgent ? 'urgent' : 'normal',
        data.notes || ''
      );
        
      if (hasError(updateResult)) {
        console.error("Erro ao atualizar ordem:", updateResult.error);
        toast.error("Erro ao salvar as alterações.");
        setLoading(false);
        return;
      }
      
      // Verificar se precisa criar workflow
      if (data.workflowTemplateId && data.workflowTemplateId !== 'none') {
        if (currentWorkflow) {
          // Já existe um workflow para esta ordem, não fazemos nada
          console.log("Workflow já existe para esta ordem");
        } else {
          // Criar novo workflow
          console.log('Criando novo workflow com template:', data.workflowTemplateId);
          const workflowNotes = `Workflow iniciado em ${new Date().toLocaleDateString()}`;
          const workflowResult = await createWorkflow(
            orderId,
            data.workflowTemplateId,
            0,
            [],
            workflowNotes
          );
            
          if (hasError(workflowResult)) {
            console.error("Erro ao criar workflow:", workflowResult.error);
            toast.error("Erro ao criar fluxo de trabalho para esta ordem.");
          } else {
            toast.success("Fluxo de trabalho associado com sucesso!");
          }
        }
      }
      
      toast.success("Ordem atualizada com sucesso!");
      onSave(updatedOrderData);
      
    } catch (error) {
      console.error("Erro ao atualizar ordem:", error);
      toast.error("Ocorreu um erro ao salvar as alterações.");
    } finally {
      setLoading(false);
    }
  };

  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Editar Ordem de Serviço</DialogTitle>
          <DialogDescription>
            #{order.id?.substring(0, 8)} • Edite os dados da ordem de serviço
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
                      disabled={true}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um cliente" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={field.value}>{field.value}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription className="text-xs">
                      O cliente não pode ser alterado
                    </FormDescription>
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
                    disabled={true}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um serviço" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={field.value}>{field.value}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription className="text-xs">
                    O serviço não pode ser alterado
                  </FormDescription>
                </FormItem>
              )}
            />
            
            {/* Campos específicos para protéticos */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="prosthesisType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Prótese</FormLabel>
                    <Select 
                      onValueChange={field.onChange}
                      value={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {prosthesisTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="material"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Material</FormLabel>
                    <Select 
                      onValueChange={field.onChange}
                      value={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o material" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {materialOptions.map(material => (
                          <SelectItem key={material.value} value={material.value}>{material.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="shade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Escala Base</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: A2" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="shadeDetails"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Detalhes de Cor</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Cervical A3, Incisal mais translúcido" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
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
                  <FormItem className="flex flex-col">
                    <FormLabel>Data de Entrega</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(new Date(field.value), "dd/MM/yyyy")
                            ) : (
                              <span>Selecione uma data</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
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
                      className="resize-none min-h-[100px]" 
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
                      value={field.value || "none"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um fluxo de trabalho (opcional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Nenhum</SelectItem>
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
              <Button type="submit" className="bg-dentalblue-600 hover:bg-dentalblue-700" disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
