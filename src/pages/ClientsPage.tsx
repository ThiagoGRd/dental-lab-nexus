
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Search, Plus, User, Phone, Mail, MapPin } from 'lucide-react';

export default function ClientsPage() {
  // Mock clients data
  const clients = [
    {
      id: 'CLI001',
      name: 'Clínica Dental Care',
      contact: 'Dr. Carlos Silva',
      phone: '(11) 98765-4321',
      email: 'contato@dentalcare.com',
      address: 'Av. Paulista, 1000 - São Paulo, SP',
      ordersCount: 24,
      totalValue: 'R$ 12.450,00',
    },
    {
      id: 'CLI002',
      name: 'Dr. Roberto Alves',
      contact: 'Roberto Alves',
      phone: '(11) 91234-5678',
      email: 'dr.roberto@gmail.com',
      address: 'Rua Augusta, 500 - São Paulo, SP',
      ordersCount: 18,
      totalValue: 'R$ 9.870,00',
    },
    {
      id: 'CLI003',
      name: 'Odontologia Sorriso',
      contact: 'Dra. Ana Beatriz',
      phone: '(11) 93456-7890',
      email: 'contato@odontosorriso.com',
      address: 'Av. Brasil, 200 - Campinas, SP',
      ordersCount: 32,
      totalValue: 'R$ 15.750,00',
    },
    {
      id: 'CLI004',
      name: 'Dra. Márcia Santos',
      contact: 'Márcia Santos',
      phone: '(11) 97890-1234',
      email: 'dra.marcia@outlook.com',
      address: 'Rua Itapeva, 300 - São Paulo, SP',
      ordersCount: 15,
      totalValue: 'R$ 8.320,00',
    },
    {
      id: 'CLI005',
      name: 'Centro Odontológico Bem Estar',
      contact: 'Dr. Felipe Souza',
      phone: '(11) 95678-9012',
      email: 'contato@bemestar.com',
      address: 'Av. Brigadeiro Faria Lima, 1500 - São Paulo, SP',
      ordersCount: 27,
      totalValue: 'R$ 13.980,00',
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dentalblue-800">Clientes</h1>
          <p className="text-gray-600">Gerencie os clientes do laboratório</p>
        </div>
        <Button className="bg-dentalblue-600 hover:bg-dentalblue-700">
          <Plus className="mr-2 h-4 w-4" /> Novo Cliente
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Buscar Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <Input
                placeholder="Buscar por nome, email ou telefone..."
                className="pl-9"
              />
            </div>
            <Button>Buscar</Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        {clients.map((client) => (
          <Card key={client.id} className="overflow-hidden transition-all hover:shadow-md">
            <div className="border-l-4 border-dentalblue-500">
              <CardContent className="grid gap-4 p-6 sm:grid-cols-3">
                <div className="col-span-2">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <User className="h-4 w-4 text-dentalblue-600" /> {client.name}
                  </h3>
                  <div className="mt-2 space-y-1 text-sm">
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
                    <Button variant="outline" size="sm">
                      Ver Histórico
                    </Button>
                    <Button size="sm" className="bg-dentalblue-600 hover:bg-dentalblue-700">
                      Editar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
