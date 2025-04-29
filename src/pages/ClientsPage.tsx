
import React, { useState } from 'react';
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

// Definição explícita do tipo Client
type Client = {
  id: string;
  name: string;
  contactName: string;
  phone: string;
  email: string;
  address: string;
  document: string;
  city: string;
  state: string;
  zipCode: string;
  notes: string;
  ordersCount: number;
  totalValue: string;
  status: string;
};

// Schema para validação do formulário de cliente
const clientSchema = z.object({
  name: z.string().min(3, { message: "Nome deve ter no mínimo 3 caracteres" }),
  contactName: z.string().min(3, { message: "Nome do contato deve ter no mínimo 3 caracteres" }),
  email: z.string().email({ message: "Email inválido" }),
  phone: z.string().min(10, { message: "Telefone deve ter no mínimo 10 dígitos" }),
  document: z.string().optional(),
  address: z.string().min(5, { message: "Endereço deve ter no mínimo 5 caracteres" }),
  city: z.string().min(2, { message: "Cidade deve ter no mínimo 2 caracteres" }),
  state: z.string().min(2, { message: "Estado deve ter no mínimo 2 caracteres" }),
  zipCode: z.string().min(5, { message: "CEP deve ter no mínimo 5 caracteres" }),
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
  
  // Mock clients data
  const [clients, setClients] = useState<Client[]>([
    {
      id: 'CLI001',
      name: 'Clínica Dental Care',
      contactName: 'Dr. Carlos Silva',
      phone: '(11) 98765-4321',
      email: 'contato@dentalcare.com',
      address: 'Av. Paulista, 1000 - São Paulo, SP',
      document: '12.345.678/0001-90',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01310-100',
      notes: 'Cliente referência em atendimentos odontológicos de luxo.',
      ordersCount: 24,
      totalValue: 'R$ 12.450,00',
      status: 'active',
    },
    {
      id: 'CLI002',
      name: 'Dr. Roberto Alves',
      contactName: 'Roberto Alves',
      phone: '(11) 91234-5678',
      email: 'dr.roberto@gmail.com',
      address: 'Rua Augusta, 500 - São Paulo, SP',
      document: '123.456.789-10',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01304-000',
      notes: 'Prefere receber as entregas após as 14h.',
      ordersCount: 18,
      totalValue: 'R$ 9.870,00',
      status: 'active',
    },
    {
      id: 'CLI003',
      name: 'Odontologia Sorriso',
      contactName: 'Dra. Ana Beatriz',
      phone: '(11) 93456-7890',
      email: 'contato@odontosorriso.com',
      address: 'Av. Brasil, 200 - Campinas, SP',
      document: '23.456.789/0001-12',
      city: 'Campinas',
      state: 'SP',
      zipCode: '13010-060',
      notes: 'Sempre solicita urgência nas ordens.',
      ordersCount: 32,
      totalValue: 'R$ 15.750,00',
      status: 'active',
    },
    {
      id: 'CLI004',
      name: 'Dra. Márcia Santos',
      contactName: 'Márcia Santos',
      phone: '(11) 97890-1234',
      email: 'dra.marcia@outlook.com',
      address: 'Rua Itapeva, 300 - São Paulo, SP',
      document: '234.567.890-12',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01332-000',
      notes: 'Cliente inativo desde 01/2023.',
      ordersCount: 15,
      totalValue: 'R$ 8.320,00',
      status: 'inactive',
    },
    {
      id: 'CLI005',
      name: 'Centro Odontológico Bem Estar',
      contactName: 'Dr. Felipe Souza',
      phone: '(11) 95678-9012',
      email: 'contato@bemestar.com',
      address: 'Av. Brigadeiro Faria Lima, 1500 - São Paulo, SP',
      document: '34.567.890/0001-23',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01452-002',
      notes: 'Preferência por contato via WhatsApp.',
      ordersCount: 27,
      totalValue: 'R$ 13.980,00',
      status: 'active',
    },
  ]);

  // Cliente forms using react-hook-form
  const addForm = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: "",
      contactName: "",
      email: "",
      phone: "",
      document: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      notes: "",
    },
  });

  const editForm = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: "",
      contactName: "",
      email: "",
      phone: "",
      document: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      notes: "",
    },
  });

  const handleAddClient = (values: ClientFormValues) => {
    // Corrigido: Forçamos todos os campos a serem obrigatórios ao criar um novo cliente
    const newClient: Client = {
      id: `CLI${String(clients.length + 1).padStart(3, '0')}`,
      name: values.name,
      contactName: values.contactName,
      email: values.email,
      phone: values.phone,
      document: values.document || "",
      address: values.address,
      city: values.city,
      state: values.state,
      zipCode: values.zipCode,
      notes: values.notes || "",
      ordersCount: 0,
      totalValue: 'R$ 0,00',
      status: 'active',
    };
    
    setClients([...clients, newClient]);
    toast.success("Cliente cadastrado com sucesso!");
    addForm.reset();
    setIsAddClientDialogOpen(false);
  };

  const handleEditClient = (values: ClientFormValues) => {
    if (!selectedClient) return;

    const updatedClients = clients.map(client => {
      if (client.id === selectedClient.id) {
        // Corrigido: Garantimos que todos os campos obrigatórios são preenchidos
        return {
          ...client,
          name: values.name,
          contactName: values.contactName,
          email: values.email,
          phone: values.phone,
          document: values.document || client.document,
          address: values.address,
          city: values.city,
          state: values.state,
          zipCode: values.zipCode,
          notes: values.notes || client.notes,
        };
      }
      return client;
    });

    setClients(updatedClients);
    toast.success("Cliente atualizado com sucesso!");
    editForm.reset();
    setIsEditClientDialogOpen(false);
  };

  const handleEditSetup = (client: Client) => {
    setSelectedClient(client);
    
    // Preenche o formulário com os dados do cliente selecionado
    editForm.reset({
      name: client.name,
      contactName: client.contactName,
      email: client.email,
      phone: client.phone,
      document: client.document,
      address: client.address,
      city: client.city,
      state: client.state,
      zipCode: client.zipCode,
      notes: client.notes,
    });
    
    setIsEditClientDialogOpen(true);
  };

  const handleViewOrders = (client: Client) => {
    setSelectedClient(client);
    setIsClientOrdersDialogOpen(true);
  };

  const handleDeleteClient = (clientId: string) => {
    const updatedClients = clients.map(client => {
      if (client.id === clientId) {
        return { ...client, status: 'inactive' };
      }
      return client;
    });
    
    setClients(updatedClients);
    toast.success("Cliente desativado com sucesso!");
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
        client.contactName.toLowerCase().includes(query) ||
        client.email.toLowerCase().includes(query) ||
        client.phone.includes(query)
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
                    name="contactName"
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
                      name="zipCode"
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
        {filteredClients.length === 0 ? (
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
                        <Building className="mr-2 h-4 w-4 text-muted-foreground" /> {client.document}
                      </p>
                      <p className="text-muted-foreground flex items-center">
                        <Phone className="mr-2 h-4 w-4 text-muted-foreground" /> {client.phone}
                      </p>
                      <p className="text-muted-foreground flex items-center">
                        <Mail className="mr-2 h-4 w-4 text-muted-foreground" /> {client.email}
                      </p>
                      <p className="text-muted-foreground flex items-center">
                        <MapPin className="mr-2 h-4 w-4 text-muted-foreground" /> {client.address}
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
                        <span className="text-sm font-bold">{client.totalValue}</span>
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
                  name="contactName"
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
                    name="zipCode"
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
                                setIsEditClientDialogOpen(false);
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
