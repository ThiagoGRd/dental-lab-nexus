
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
  
  // Carrega serviços e clientes do localStorage ou usa dados mockados
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
    
    // Carrega clientes do localStorage ou usa dados mockados
    const mockClients = [
      {
        id: 'CLI001',
        name: 'Clínica Dental Care',
        contact: 'Dr. Carlos Silva',
        phone: '(11) 98765-4321',
        email: 'contato@dentalcare.com',
        address: 'Av. Paulista, 1000 - São Paulo, SP',
        document: '12.345.678/0001-90',
        ordersCount: 24,
        totalValue: 'R$ 12.450,00',
        status: 'active',
      },
      {
        id: 'CLI002',
        name: 'Dr. Roberto Alves',
        contact: 'Roberto Alves',
        phone: '(11) 91234-5678',
        email: 'dr.roberto@gmail.com',
        address: 'Rua Augusta, 500 - São Paulo, SP',
        document: '123.456.789-10',
        ordersCount: 18,
        totalValue: 'R$ 9.870,00',
        status: 'active',
      },
      {
        id: 'CLI003',
        name: 'Odontologia Sorriso',
        contact: 'Dra. Ana Beatriz',
        phone: '(11) 93456-7890',
        email: 'contato@odontosorriso.com',
        address: 'Av. Brasil, 200 - Campinas, SP',
        document: '23.456.789/0001-12',
        ordersCount: 32,
        totalValue: 'R$ 15.750,00',
        status: 'active',
      },
      {
        id: 'CLI004',
        name: 'Dra. Márcia Santos',
        contact: 'Márcia Santos',
        phone: '(11) 97890-1234',
        email: 'dra.marcia@outlook.com',
        address: 'Rua Itapeva, 300 - São Paulo, SP',
        document: '234.567.890-12',
        ordersCount: 15,
        totalValue: 'R$ 8.320,00',
        status: 'inactive',
      },
      {
        id: 'CLI005',
        name: 'Centro Odontológico Bem Estar',
        contact: 'Dr. Felipe Souza',
        phone: '(11) 95678-9012',
        email: 'contato@bemestar.com',
        address: 'Av. Brigadeiro Faria Lima, 1500 - São Paulo, SP',
        document: '34.567.890/0001-23',
        ordersCount: 27,
        totalValue: 'R$ 13.980,00',
        status: 'active',
      },
    ];
    setClients(mockClients.filter(client => client.status === 'active'));
  }, []);

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

  const handleSubmit = (data: OrderFormValues) => {
    console.log("Nova ordem:", data);
    toast.success('Ordem de serviço criada com sucesso!');
    setOpen(false);
    form.reset();
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
