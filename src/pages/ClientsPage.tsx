
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Plus, User, Phone, Mail, MapPin, Building, FileText, Edit, Trash2, UserPlus } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import ClientOrdersDialog from '@/components/clients/ClientOrdersDialog';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";

// Definição explícita do tipo Client adaptado para o formato do Supabase
type Client = {
  id: string;
  name: string;
  contact_name: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  document: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Campos calculados (não existem no banco)
  ordersCount?: number;
  totalValue?: number;
  totalValueFormatted?: string;
  status?: string;
};

// Schema para validação do formulário de cliente
const clientSchema = z.object({
  name: z.string().min(3, { message: "Nome deve ter no mínimo 3 caracteres" }),
  contact_name: z.string().min(3, { message: "Nome do contato deve ter no mínimo 3 caracteres" }),
  email: z.string().email({ message: "Email inválido" }),
  phone: z.string().min(10, { message: "Telefone deve ter no mínimo 10 dígitos" }),
  document: z.string().optional(),
  address: z.string().min(5, { message: "Endereço deve ter no mínimo 5 caracteres" }),
  city: z.string().min(2, { message: "Cidade deve ter no mínimo 2 caracteres" }),
  state: z.string().min(2, { message: "Estado deve ter no mínimo 2 caracteres" }),
  zip_code: z.string().min(5, { message: "CEP deve ter no mínimo 5 caracteres" }),
  notes: z.string().optional(),
});

type ClientFormValues = z.infer<typeof clientSchema>;

export default function ClientsPage() {
  const [isAddClientDialogOpen, setIsAddClientDialogOpen] = useState(false);
  const [isEditClientDialogOpen, setIsEditClientDialogOpen] = useState(false);
  const [isClientOrdersDialogOpen, setIsClientOrdersDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Buscar clientes do Supabase quando o componente montar
  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('clients')
          .select('*')
          .order('name');
        
        if (error) {
          console.error('Erro ao buscar clientes:', error);
          toast.error('Erro ao carregar clientes');
        } else {
          console.log('Clientes carregados:', data);
          const clientsWithMetadata = data.map(client => ({
            ...client,
            ordersCount: 0, // Valor padrão, será atualizado abaixo
            totalValue: 0,
            totalValueFormatted: formatCurrency(0),
            status: 'active' // Assumimos todos ativos por enquanto
          }));
          
          setClients(clientsWithMetadata);
          
          // Buscar dados adicionais para cada cliente
          fetchClientsAdditionalData(clientsWithMetadata);
        }
      } catch (error) {
        console.error('Erro inesperado:', error);
        toast.error('Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    };
    
    fetchClients();
  }, []);

  // Função para buscar dados adicionais de cada cliente
  const fetchClientsAdditionalData = async (clientsList: Client[]) => {
    try {
      // Para cada cliente, buscar contagens de pedidos e valores totais
      for (const client of clientsList) {
        // Buscar contagem de ordens
        const { count } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('client_id', client.id);
        
        // Buscar ordens com itens para calcular valor total
        const { data: ordersData } = await supabase
          .from('orders')
          .select('id')
          .eq('client_id', client.id);
        
        if (ordersData && ordersData.length > 0) {
          // Obter IDs de todas as ordens
          const orderIds = ordersData.map(order => order.id);
          
          // Buscar itens das ordens para calcular valor total
          const { data: orderItems } = await supabase
            .from('order_items')
            .select('order_id, total, price, quantity')
            .in('order_id', orderIds);
          
          // Calcular valor total
          let totalValue = 0;
          if (orderItems && orderItems.length > 0) {
            orderItems.forEach(item => {
              // Usar total se disponível, ou calcular a partir de preço e quantidade
              const itemValue = item.total || (item.price * item.quantity);
              totalValue += Number(itemValue);
            });
          }
          
          // Atualizar cliente com os dados calculados
          setClients(prevClients => 
            prevClients.map(c => 
              c.id === client.id 
                ? {
                    ...c, 
                    ordersCount: count || 0,
                    totalValue,
                    totalValueFormatted: formatCurrency(totalValue)
                  } 
                : c
            )
          );
        } else {
          // Caso não tenha ordens, apenas atualiza a contagem
          setClients(prevClients => 
            prevClients.map(c => 
              c.id === client.id 
                ? {...c, ordersCount: count || 0} 
                : c
            )
          );
        }
      }
    } catch (error) {
      console.error('Erro ao buscar dados adicionais dos clientes:', error);
    }
  };

  // Formatar moeda
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Cliente forms using react-hook-form
  const addForm = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: "",
      contact_name: "",
      email: "",
      phone: "",
      document: "",
      address: "",
      city: "",
      state: "",
      zip_code: "",
      notes: "",
    },
  });

  const editForm = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: "",
      contact_name: "",
      email: "",
      phone: "",
      document: "",
      address: "",
      city: "",
      state: "",
      zip_code: "",
      notes: "",
    },
  });

  const handleAddClient = async (values: ClientFormValues) => {
    try {
      const newClientData = {
        name: values.name,
        contact_name: values.contact_name,
        email: values.email,
        phone: values.phone,
        document: values.document || null,
        address: values.address,
        city: values.city,
        state: values.state,
        zip_code: values.zip_code,
        notes: values.notes || null,
      };
      
      const { data, error } = await supabase
        .from('clients')
        .insert(newClientData)
        .select();
        
      if (error) {
        console.error('Erro ao inserir cliente:', error);
        toast.error('Erro ao cadastrar cliente');
        return;
      }
      
      if (data && data.length > 0) {
        const newClient: Client = {
          ...data[0],
          ordersCount: 0,
          totalValue: 0,
          totalValueFormatted: formatCurrency(0),
          status: 'active',
        };
        
        setClients([...clients, newClient]);
        toast.success("Cliente cadastrado com sucesso!");
        addForm.reset();
        setIsAddClientDialogOpen(false);
      }
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast.error('Erro ao cadastrar cliente');
    }
  };

  const handleEditClient = async (values: ClientFormValues) => {
    if (!selectedClient) return;

    try {
      const updatedData = {
        name: values.name,
        contact_name: values.contact_name,
        email: values.email,
        phone: values.phone,
        document: values.document || null,
        address: values.address,
        city: values.city,
        state: values.state,
        zip_code: values.zip_code,
        notes: values.notes || null,
      };
      
      const { data, error } = await supabase
        .from('clients')
        .update(updatedData)
        .eq('id', selectedClient.id)
        .select();
        
      if (error) {
        console.error('Erro ao atualizar cliente:', error);
        toast.error('Erro ao atualizar cliente');
        return;
      }
      
      if (data && data.length > 0) {
        const updatedClient = {
          ...data[0],
          ordersCount: selectedClient.ordersCount,
          totalValue: selectedClient.totalValue,
          totalValueFormatted: selectedClient.totalValueFormatted,
          status: selectedClient.status,
        };
        
        setClients(clients.map(client => 
          client.id === selectedClient.id ? updatedClient : client
        ));
        
        toast.success("Cliente atualizado com sucesso!");
        editForm.reset();
        setIsEditClientDialogOpen(false);
      }
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast.error('Erro ao atualizar cliente');
    }
  };

  const handleEditSetup = (client: Client) => {
    setSelectedClient(client);
    
    // Preenche o formulário com os dados do cliente selecionado
    editForm.reset({
      name: client.name,
      contact_name: client.contact_name || '',
      email: client.email || '',
      phone: client.phone || '',
      document: client.document || '',
      address: client.address || '',
      city: client.city || '',
      state: client.state || '',
      zip_code: client.zip_code || '',
      notes: client.notes || '',
    });
    
    setIsEditClientDialogOpen(true);
  };

  const handleViewOrders = (client: Client) => {
    setSelectedClient(client);
    setIsClientOrdersDialogOpen(true);
  };

  const handleDeleteClient = async (clientId: string) => {
    try {
      // Em vez de deletar, marcamos como inativo atualizando o objeto local
      setClients(clients.map(client => {
        if (client.id === clientId) {
          return { ...client, status: 'inactive' };
        }
        return client;
      }));
      
      toast.success("Cliente desativado com sucesso!");
      setIsEditClientDialogOpen(false);
    } catch (error) {
      console.error('Erro ao desativar cliente:', error);
      toast.error('Erro ao desativar cliente');
    }
  };

  const filteredClients = clients.filter(client => {
    // Filtro por status
    if (activeTab !== 'all' && client.status !== activeTab) {
      return false;
    }
    
    // Filtro por pesquisa
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        client.name.toLowerCase().includes(query) ||
        (client.contact_name && client.contact_name.toLowerCase().includes(query)) ||
        (client.email && client.email.toLowerCase().includes(query)) ||
        (client.phone && client.phone.includes(query))
      );
    }
    
    return true;
  });

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dentalblue-800">Clientes</h1>
          <p className="text-gray-600">Gerencie os clientes do laboratório</p>
        </div>
        <Dialog open={isAddClientDialogOpen} onOpenChange={setIsAddClientDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-dentalblue-600 hover:bg-dentalblue-700">
              <UserPlus className="mr-2 h-4 w-4" /> Novo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Cliente</DialogTitle>
              <DialogDescription>
                Preencha os dados abaixo para cadastrar um novo cliente no sistema.
              </DialogDescription>
            </DialogHeader>
            <Form {...addForm}>
              <form onSubmit={addForm.handleSubmit(handleAddClient)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={addForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome da Clínica/Dentista</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome completo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={addForm.control}
                    name="contact_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Contato Principal</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome do contato" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={addForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="email@exemplo.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={addForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <Input placeholder="(00) 00000-0000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={addForm.control}
                    name="document"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CPF/CNPJ</FormLabel>
                        <FormControl>
                          <Input placeholder="Documento" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={addForm.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Endereço</FormLabel>
                        <FormControl>
                          <Input placeholder="Rua, número, complemento" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={addForm.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cidade</FormLabel>
                        <FormControl>
                          <Input placeholder="Cidade" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={addForm.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estado</FormLabel>
                          <FormControl>
                            <Input placeholder="UF" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={addForm.control}
                      name="zip_code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CEP</FormLabel>
                          <FormControl>
                            <Input placeholder="00000-000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <FormField
                  control={addForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observações</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Preferências de atendimento, condições especiais, etc."
                          {...field}
                          className="min-h-[80px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsAddClientDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-dentalblue-600 hover:bg-dentalblue-700">
                    Salvar Cliente
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>Gerenciar Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <Input
                placeholder="Buscar por nome, email ou telefone..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-xs">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">Todos</TabsTrigger>
                <TabsTrigger value="active">Ativos</TabsTrigger>
                <TabsTrigger value="inactive">Inativos</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        {loading ? (
          <Card className="py-8">
            <CardContent className="flex flex-col items-center justify-center text-center">
              <div className="animate-pulse flex space-x-4">
                <div className="rounded-full bg-gray-100 h-10 w-10"></div>
                <div className="flex-1 space-y-6 py-1">
                  <div className="h-2 bg-gray-100 rounded"></div>
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="h-2 bg-gray-100 rounded col-span-2"></div>
                      <div className="h-2 bg-gray-100 rounded col-span-1"></div>
                    </div>
                    <div className="h-2 bg-gray-100 rounded"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : filteredClients.length === 0 ? (
          <Card className="py-8">
            <CardContent className="flex flex-col items-center justify-center text-center">
              <div className="rounded-full bg-gray-100 p-3 mb-3">
                <User className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium">Nenhum cliente encontrado</h3>
              <p className="text-sm text-gray-500 mt-1">Tente mudar seus filtros ou cadastre um novo cliente</p>
              <Button onClick={() => setIsAddClientDialogOpen(true)} className="mt-4 bg-dentalblue-600 hover:bg-dentalblue-700">
                <Plus className="mr-2 h-4 w-4" /> Cadastrar Cliente
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredClients.map((client) => (
            <Card key={client.id} className="overflow-hidden transition-all hover:shadow-md">
              <div className="border-l-4 border-dentalblue-500">
                <CardContent className="grid gap-4 p-6 sm:grid-cols-3">
                  <div className="col-span-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-lg flex items-center gap-2">
                        {client.status === 'active' ? (
                          <User className="h-4 w-4 text-dentalblue-600" />
                        ) : (
                          <User className="h-4 w-4 text-gray-400" />
                        )}
                        {client.name}
                      </h3>
                      <span className={`text-xs rounded-full px-2 py-1 ${client.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {client.status === 'active' ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                    <div className="mt-2 space-y-1 text-sm">
                      <p className="text-muted-foreground flex items-center">
                        <Building className="mr-2 h-4 w-4 text-muted-foreground" /> {client.document || 'N/A'}
                      </p>
                      <p className="text-muted-foreground flex items-center">
                        <Phone className="mr-2 h-4 w-4 text-muted-foreground" /> {client.phone || 'N/A'}
                      </p>
                      <p className="text-muted-foreground flex items-center">
                        <Mail className="mr-2 h-4 w-4 text-muted-foreground" /> {client.email || 'N/A'}
                      </p>
                      <p className="text-muted-foreground flex items-center">
                        <MapPin className="mr-2 h-4 w-4 text-muted-foreground" /> {client.address || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between border-b pb-2">
                        <span className="text-sm font-medium">Total de Ordens:</span>
                        <span className="text-sm font-bold">{client.ordersCount}</span>
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-sm font-medium">Valor Total:</span>
                        <span className="text-sm font-bold">{client.totalValueFormatted}</span>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex items-center"
                        onClick={() => handleViewOrders(client)}
                      >
                        <FileText className="mr-2 h-3.5 w-3.5" />
                        Ver Ordens
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex items-center"
                        onClick={() => handleEditSetup(client)}
                      >
                        <Edit className="mr-2 h-3.5 w-3.5" />
                        Editar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>
          ))
        )}
      </div>
      
      {/* Diálogo para editar cliente */}
      <Dialog open={isEditClientDialogOpen} onOpenChange={setIsEditClientDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Editar Cliente</DialogTitle>
            <DialogDescription>
              Atualize os dados do cliente abaixo.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditClient)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da Clínica/Dentista</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome completo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="contact_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Contato Principal</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome do contato" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="email@exemplo.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <Input placeholder="(00) 00000-0000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="document"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CPF/CNPJ</FormLabel>
                      <FormControl>
                        <Input placeholder="Documento" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Endereço</FormLabel>
                      <FormControl>
                        <Input placeholder="Rua, número, complemento" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cidade</FormLabel>
                      <FormControl>
                        <Input placeholder="Cidade" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado</FormLabel>
                        <FormControl>
                          <Input placeholder="UF" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="zip_code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CEP</FormLabel>
                        <FormControl>
                          <Input placeholder="00000-000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <FormField
                control={editForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Preferências de atendimento, condições especiais, etc."
                        {...field}
                        className="min-h-[80px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="flex justify-between items-center">
                <div>
                  {selectedClient && selectedClient.status === 'active' && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" /> Desativar Cliente
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Desativar Cliente</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja desativar este cliente? Ele não aparecerá mais na lista de clientes ativos.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction 
                            className="bg-red-600 hover:bg-red-700"
                            onClick={() => {
                              if (selectedClient) {
                                handleDeleteClient(selectedClient.id);
                              }
                            }}
                          >
                            Desativar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsEditClientDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-dentalblue-600 hover:bg-dentalblue-700">
                    Salvar Alterações
                  </Button>
                </div>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Diálogo para visualizar ordens do cliente */}
      {selectedClient && (
        <ClientOrdersDialog
          open={isClientOrdersDialogOpen}
          onOpenChange={setIsClientOrdersDialogOpen}
          clientId={selectedClient.id}
          clientName={selectedClient.name}
        />
      )}
    </div>
  );
}
