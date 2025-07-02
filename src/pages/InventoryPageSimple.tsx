import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  min_quantity: number;
  supplier: string;
  created_at: string;
  updated_at: string;
}

export default function InventoryPageSimple() {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      
      // Using services table as temporary inventory placeholder
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Erro ao buscar dados do estoque:', error);
        toast.error('Não foi possível carregar os itens do estoque.');
        return;
      }
      
      if (data) {
        // Convert services to inventory format temporarily
        const inventoryData = data.map(service => ({
          id: service.id,
          name: service.name,
          category: 'Material',
          quantity: 100,
          unit: 'un',
          min_quantity: 10,
          supplier: 'Fornecedor',
          created_at: service.created_at,
          updated_at: service.updated_at
        }));
        setInventoryItems(inventoryData);
      }
    } catch (error) {
      console.error('Erro ao processar dados do estoque:', error);
      toast.error('Ocorreu um erro ao processar os dados do estoque.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Estoque</h1>
          <p className="text-muted-foreground">Gerencie o estoque de materiais do laboratório</p>
        </div>
        <Button onClick={() => toast.info('Funcionalidade em desenvolvimento')}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Item
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Inventário</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <p className="text-muted-foreground">Carregando dados do estoque...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {inventoryItems.length > 0 ? (
                inventoryItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {item.quantity} {item.unit} - {item.category}
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {item.supplier}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum item encontrado no estoque.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}