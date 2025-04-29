
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
import { Plus } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from "@/integrations/supabase/client";

const orderFormSchema = z.object({
  client: z.string().min(1, 'O cliente é obrigatório'),
  patientName: z.string().min(1, 'O nome do paciente é obrigatório'),
  service: z.string().min(1, 'O serviço é obrigatório'),
  dueDate: z.string().min(1, 'A data de entrega é obrigatória'),
  isUrgent: z.boolean().default(false),
  shade: z.string().min(1, 'A cor/escala é obrigatória'),
  notes: z.string().optional(),
});

type OrderFormValues = z.infer<typeof orderFormSchema>;

interface NewOrderDialogProps {
  children: React.ReactNode;
}

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
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

export default function NewOrderDialog({ children }: NewOrderDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Carrega serviços e clientes
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Carrega serviços do Supabase
        const { data: servicesData, error: servicesError } = await supabase
          .from('services')
          .select('*')
          .eq('active', true)
          .order('name');
        
        if (servicesError) {
          console.error("Erro ao carregar serviços:", servicesError);
          toast.error('Não foi possível carregar a lista de serviços.');
        } else {
          setServices(servicesData || []);
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
          setClients(clientsData || []);
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
      notes: ''
    }
  });

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
      
      // Inserir a ordem no Supabase
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          client_id: selectedClient.id,
          deadline: data.dueDate,
          priority: data.isUrgent ? 'urgent' : 'normal',
          notes: `Paciente: ${data.patientName}${data.notes ? ' - ' + data.notes : ''}`,
          status: 'pending'
        })
        .select()
        .single();
      
      if (orderError) {
        console.error("Erro ao criar ordem:", orderError);
        throw new Error(orderError.message);
      }
      
      // Inserir o item da ordem
      const { error: orderItemError } = await supabase
        .from('order_items')
        .insert({
          order_id: orderData.id,
          service_id: selectedService.id,
          price: selectedService.price,
          total: selectedService.price,
          notes: `Paciente: ${data.patientName}, Cor/Escala: ${data.shade}`
        });
      
      if (orderItemError) {
        console.error("Erro ao adicionar item à ordem:", orderItemError);
        throw new Error(orderItemError.message);
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
