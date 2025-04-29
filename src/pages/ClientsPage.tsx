
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
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
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  
  // Mock clients data
  const clients = [
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

  // Cliente form using react-hook-form
  const form = useForm<ClientFormValues>({
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

  const onSubmit = (values: ClientFormValues) => {
    console.log(values);
    toast.success("Cliente cadastrado com sucesso!");
    form.reset();
    setIsAddClientDialogOpen(false);
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
        client.contact.toLowerCase().includes(query) ||
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
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
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
                    control={form.control}
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
                    control={form.control}
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
                    control={form.control}
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
                    control={form.control}
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
                    control={form.control}
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
                    control={form.control}
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
                      control={form.control}
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
                      control={form.control}
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
                  control={form.control}
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
                      <Button variant="outline" size="sm" className="flex items-center">
                        <FileText className="mr-2 h-3.5 w-3.5" />
                        Ver Ordens
                      </Button>
                      <Button variant="outline" size="sm" className="flex items-center">
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
    </div>
  );
}
