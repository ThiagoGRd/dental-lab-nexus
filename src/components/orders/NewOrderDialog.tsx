
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
  service: z.string().min(1, 'O serviço é obrigatório'),
  dueDate: z.string().min(1, 'A data de entrega é obrigatória'),
  isUrgent: z.boolean().default(false),
  shade: z.string().min(1, 'A cor/escala é obrigatória'),
  material: z.string().min(1, 'O material é obrigatório'),
  notes: z.string().optional(),
});

type OrderFormValues = z.infer<typeof orderFormSchema>;

interface NewOrderDialogProps {
  children: React.ReactNode;
}

interface Service {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
}

interface Client {
  id: string;
  name: string;
  contact: string;
  phone: string;
  email: string;
  address: string;
  document: string;
  ordersCount: number;
  totalValue: string;
  status: string;
}

export default function NewOrderDialog({ children }: NewOrderDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  
  // Carrega serviços e clientes
  useEffect(() => {
    // Carrega serviços do localStorage ou usa dados mockados
    const storedServices = localStorage.getItem('services');
    if (storedServices) {
      setServices(JSON.parse(storedServices));
    } else {
      // Dados mockados de serviços
      const initialServices = [
        { id: 1, name: 'Prótese Dentária', description: 'Prótese dentária completa', price: 1500, category: 'Protético' },
        { id: 2, name: 'Coroa de Porcelana', description: 'Coroa unitária de porcelana', price: 800, category: 'Protético' },
        { id: 3, name: 'Moldagem Digital', description: 'Escaneamento e modelagem 3D', price: 350, category: 'Digital' },
        { id: 4, name: 'Modelo de Estudo', description: 'Modelo de gesso para análise', price: 120, category: 'Convencional' },
        { id: 5, name: 'Faceta de Resina', description: 'Faceta estética', price: 400, category: 'Estético' },
      ];
      setServices(initialServices);
    }
    
    // Carrega clientes do banco de dados Supabase
    const fetchClients = async () => {
      try {
        const { data: clientsData, error } = await supabase
          .from('clients')
          .select('*')
          .order('name');
        
        if (error) {
          throw error;
        }
        
        if (clientsData) {
          // Transform Supabase clients data to match the Client interface
          const formattedClients = clientsData.map(client => ({
            id: client.id,
            name: client.name || '',
            contact: client.contact_name || '',
            phone: client.phone || '',
            email: client.email || '',
            address: client.address || '',
            document: client.document || '',
            ordersCount: 0, // Placeholder, could be calculated if needed
            totalValue: 'R$ 0,00', // Placeholder
            status: 'active' // Assuming all fetched clients are active
          }));
          
          setClients(formattedClients);
        }
      } catch (error) {
        console.error('Erro ao carregar clientes:', error);
        toast.error('Não foi possível carregar a lista de clientes.');
      }
    };
    
    fetchClients();
  }, [open]); // Recarrega quando o diálogo é aberto

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      client: '',
      service: '',
      dueDate: format(
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias no futuro
        'yyyy-MM-dd'
      ),
      isUrgent: false,
      shade: '',
      material: '',
      notes: ''
    }
  });

  const handleSubmit = async (data: OrderFormValues) => {
    console.log("Nova ordem:", data);
    
    // Aqui você pode implementar a lógica para salvar a ordem no Supabase
    // Exemplo:
    try {
      // Encontre o cliente pelo nome
      const selectedClient = clients.find(client => client.name === data.client);
      
      if (!selectedClient) {
        toast.error('Cliente não encontrado.');
        return;
      }
      
      // Implemente quando estiver pronto para salvar no banco de dados
      // const { error } = await supabase.from('orders').insert({
      //   client_id: selectedClient.id,
      //   service: data.service,
      //   deadline: new Date(data.dueDate),
      //   priority: data.isUrgent ? 'urgent' : 'normal',
      //   notes: data.notes,
      //   status: 'pending'
      //   // outros campos conforme necessário
      // });
      
      // if (error) throw error;
      
      toast.success('Ordem de serviço criada com sucesso!');
      setOpen(false);
      form.reset();
    } catch (error: any) {
      console.error('Erro ao criar ordem:', error);
      toast.error('Ocorreu um erro ao criar a ordem.');
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
            </div>
            
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
            
            <div className="grid grid-cols-2 gap-4">
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
                name="material"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Material</FormLabel>
                    <Select 
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o material" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Zircônia Multicamada">Zircônia Multicamada</SelectItem>
                        <SelectItem value="Dissilicato de Lítio">Dissilicato de Lítio</SelectItem>
                        <SelectItem value="Resina Z350">Resina Z350</SelectItem>
                        <SelectItem value="Metal para Infraestrutura">Metal para Infraestrutura</SelectItem>
                        <SelectItem value="Cerâmica Feldspática">Cerâmica Feldspática</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
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
              <Button type="submit" className="bg-dentalblue-600 hover:bg-dentalblue-700">
                Criar Ordem
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
