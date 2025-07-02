import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  created_at: string;
  updated_at: string;
  ordersCount: number;
  totalValue: number;
  status: string;
}

export default function ClientsPageSimple() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Erro ao buscar clientes:', error);
        toast.error('Não foi possível carregar os clientes.');
        return;
      }
      
      if (data) {
        // Convert to match expected interface
        const clientsData = data.map(client => ({
          ...client,
          ordersCount: 0,
          totalValue: 0,
          status: 'ativo'
        }));
        setClients(clientsData);
      }
    } catch (error) {
      console.error('Erro ao processar dados dos clientes:', error);
      toast.error('Ocorreu um erro ao processar os dados dos clientes.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Clientes</h1>
          <p className="text-muted-foreground">Gerencie os clientes do laboratório</p>
        </div>
        <Button onClick={() => toast.info('Funcionalidade em desenvolvimento')}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Cliente
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <p className="text-muted-foreground">Carregando dados dos clientes...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {clients.length > 0 ? (
                clients.map((client) => (
                  <div key={client.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{client.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {client.email || 'Sem email'} • {client.phone || 'Sem telefone'}
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {client.ordersCount} pedidos
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum cliente encontrado.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}