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
  DialogTrigger,
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
  FormDescription 
} from '@/components/ui/form';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Plus, HelpCircle } from 'lucide-react';
import { format, addBusinessDays } from 'date-fns';
import { supabase, hasError, safeData } from "@/integrations/supabase/client";
import { createOrder, createOrderItem, createWorkflow } from "@/utils/orderUtils";
import type { Database } from '@/integrations/supabase/types';

// Define interfaces to match expected types
interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  workflow_template_id: string | null;
}

interface Client {
  id: string;
  name: string;
  contact_name: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  document: string | null;
}

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string | null;
}

const orderFormSchema = z.object({
  client: z.string().min(1, 'O cliente é obrigatório'),
  patientName: z.string().min(1, 'O nome do paciente é obrigatório'),
  service: z.string().min(1, 'O serviço é obrigatório'),
  dueDate: z.string().min(1, 'A data de entrega é obrigatória'),
  isUrgent: z.boolean().default(false),
  shade: z.string().min(1, 'A cor/escala é obrigatória'),
  notes: z.string().optional(),
  workflowTemplateId: z.string().optional(),
});

type OrderFormValues = z.infer<typeof orderFormSchema>;

interface NewOrderDialogProps {
  children: React.ReactNode;
}

export default function NewOrderDialog({ children }: NewOrderDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [workflowTemplates, setWorkflowTemplates] = useState<WorkflowTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedServiceWorkflow, setSelectedServiceWorkflow] = useState<string | null>(null);
  
  // Carrega serviços e clientes
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Carrega serviços do Supabase
        const { data: servicesData, error: servicesError } = await supabase
          .from('services')
          .select('*')
          .eq('active', true as any)  // Fixed type issue with casting
          .order('name');
        
        if (servicesError) {
          console.error("Erro ao carregar serviços:", servicesError);
          toast.error('Não foi possível carregar a lista de serviços.');
        } else {
          const typedServices = safeData<Service[]>(servicesData, []);
          setServices(typedServices);
        }
        
        // Carrega clientes do banco de dados Supabase
        const { data: clientsData, error: clientsError } = await supabase
          .from('clients')
          .select('*')
          .order('name');
        
        if (clientsError) {
          console.error("Erro ao carregar clientes:", clientsError);
          toast.error('Não foi possível carregar a lista de clientes.');
        } else {
          const typedClients = safeData<Client[]>(clientsData, []);
          setClients(typedClients);
        }
        
        // Carrega templates de workflow
        const { data: templatesData, error: templatesError } = await supabase
          .from('workflow_templates')
          .select('id, name, description')
          .order('name');
          
        if (templatesError) {
          console.error("Erro ao carregar templates de workflow:", templatesError);
        } else {
          const typedTemplates = safeData<WorkflowTemplate[]>(templatesData, []);
          setWorkflowTemplates(typedTemplates);
        }
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
        toast.error('Ocorreu um erro ao carregar os dados necessários.');
      }
    };
    
    if (open) {
      fetchData();
    }
  }, [open]); // Recarrega quando o diálogo é aberto

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      client: '',
      patientName: '',
      service: '',
      dueDate: format(
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias no futuro
        'yyyy-MM-dd'
      ),
      isUrgent: false,
      shade: '',
      notes: '',
      workflowTemplateId: ''
    }
  });
  
  // Observe changes to the selected service to auto-select workflow
  const watchedService = form.watch('service');
  useEffect(() => {
    if (watchedService) {
      const selectedService = services.find(s => s.name === watchedService);
      if (selectedService && selectedService.workflow_template_id) {
        setSelectedServiceWorkflow(selectedService.workflow_template_id);
        form.setValue('workflowTemplateId', selectedService.workflow_template_id);
      } else {
        setSelectedServiceWorkflow(null);
      }
    }
  }, [watchedService, services, form]);

  // Watch for changes to the isUrgent field and update dueDate accordingly
  const isUrgent = form.watch('isUrgent');
  useEffect(() => {
    if (isUrgent) {
      // Set due date to 3 business days from today when marked as urgent
      // Using addBusinessDays from date-fns v2
      const newDueDate = format(addBusinessDays(new Date(), 3), 'yyyy-MM-dd');
      form.setValue('dueDate', newDueDate);
    } else {
      // Reset to default (7 days) when not urgent
      form.setValue('dueDate', format(
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        'yyyy-MM-dd'
      ));
    }
  }, [isUrgent, form]);

  const handleSubmit = async (data: OrderFormValues) => {
    setLoading(true);
    
    try {
      // Encontrar o cliente pelo nome
      const selectedClient = clients.find(client => client.name === data.client);
      if (!selectedClient) {
        toast.error('Cliente não encontrado.');
        return;
      }
      
      // Encontrar o serviço pelo nome
      const selectedService = services.find(service => service.name === data.service);
      if (!selectedService) {
        toast.error('Serviço não encontrado.');
        return;
      }
      
      // Preparar notas com o nome do paciente
      const notes = `Paciente: ${data.patientName}${data.notes ? ' - ' + data.notes : ''}`;
      
      // Criar a ordem
      const orderResult = await createOrder(
        selectedClient.id,
        data.dueDate,
        data.isUrgent ? 'urgent' : 'normal',
        notes
      );
      
      if (hasError(orderResult)) {
        console.error("Erro ao criar ordem:", orderResult.error);
        throw new Error(orderResult.error.message);
      }
      
      const orderData = safeData<Database['public']['Tables']['orders']['Row'] | null>(orderResult, null);
      
      if (!orderData) {
        throw new Error("Dados da ordem não retornados");
      }
      
      // Criar o item da ordem
      const itemNotes = `Paciente: ${data.patientName}, Cor/Escala: ${data.shade}`;
      const orderItemResult = await createOrderItem(
        orderData.id,
        selectedService.id,
        selectedService.price,
        selectedService.price,
        itemNotes
      );
      
      if (hasError(orderItemResult)) {
        console.error("Erro ao adicionar item à ordem:", orderItemResult.error);
        throw new Error(orderItemResult.error.message);
      }
      
      // Criar workflow se selecionado
      if (data.workflowTemplateId && data.workflowTemplateId !== 'none') {
        const workflowNotes = `Workflow iniciado em ${new Date().toLocaleDateString()}`;
        const workflowResult = await createWorkflow(
          orderData.id,
          data.workflowTemplateId,
          0,
          [],
          workflowNotes
        );
          
        if (hasError(workflowResult)) {
          console.error("Erro ao criar workflow:", workflowResult.error);
          toast.error("Erro ao criar fluxo de trabalho para esta ordem.");
        }
      }
      
      toast.success('Ordem de serviço criada com sucesso!');
      setOpen(false);
      form.reset(); // Limpa o formulário
    } catch (error: any) {
      console.error('Erro ao criar ordem:', error);
      toast.error(`Ocorreu um erro ao criar a ordem: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Nova Ordem de Serviço</DialogTitle>
          <DialogDescription>
            Preencha as informações para criar uma nova ordem de serviço
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
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um cliente" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.name}>
                            {client.name}
                          </SelectItem>
                        ))}
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
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um serviço" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {services.map((service) => (
                        <SelectItem key={service.id} value={service.name}>
                          {service.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
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
                    {isUrgent && (
                      <p className="text-xs text-amber-600 mt-1">
                        Para ordens urgentes, a data de entrega será em 3 dias úteis
                      </p>
                    )}
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="isUrgent"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-6">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Ordem Urgente</FormLabel>
                      <FormDescription>
                        Prazo de entrega reduzido (3 dias úteis)
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>
            
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
            
            <FormField
              control={form.control}
              name="workflowTemplateId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1">
                    Fluxo de Trabalho 
                    <HelpCircle className="h-4 w-4 text-gray-400" />
                  </FormLabel>
                  <Select 
                    onValueChange={field.onChange}
                    value={field.value || "none"}
                    disabled={!!selectedServiceWorkflow}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={selectedServiceWorkflow ? "Fluxo de trabalho do serviço" : "Selecione um fluxo de trabalho (opcional)"} />
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
                  {selectedServiceWorkflow ? (
                    <p className="text-xs text-blue-600 mt-1">
                      Este serviço já tem um fluxo de trabalho associado
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500 mt-1">
                      Associar um fluxo de trabalho para acompanhar as etapas de produção
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-dentalblue-600 hover:bg-dentalblue-700" disabled={loading}>
                {loading ? 'Criando...' : 'Criar Ordem'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
