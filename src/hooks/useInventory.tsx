
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../integrations/supabase/client';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

// Tipos simplificados para funcionar apenas com a tabela 'inventory' existente
interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  min_quantity?: number;
  price?: number;
  category?: string;
  supplier?: string;
  unit?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

interface InventoryMovement {
  id: string;
  item_id: string;
  type: 'IN' | 'OUT';
  quantity: number;
  date: Date;
  notes?: string;
  user_id?: string;
}

interface InventoryAlert {
  id: string;
  item_id: string;
  type: 'LOW_STOCK' | 'OUT_OF_STOCK';
  message: string;
  date: Date;
  resolved: boolean;
}

export const useInventory = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [alerts, setAlerts] = useState<InventoryAlert[]>([]);

  // Carregar todos os itens do estoque usando a tabela 'inventory' existente
  const fetchInventoryItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .order('name');
        
      if (error) {
        console.error('Erro ao buscar itens de estoque:', error);
        setError('Não foi possível carregar os itens de estoque.');
        return;
      }
      
      if (data) {
        setInventoryItems(data as InventoryItem[]);
      }
    } catch (err) {
      console.error('Erro inesperado:', err);
      setError('Ocorreu um erro ao processar os dados de estoque.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Simular movimentações (já que a tabela não existe)
  const fetchRecentMovements = useCallback(async (days: number = 30) => {
    setLoading(true);
    setError(null);
    
    try {
      // Como não temos tabela de movimentações, usar array vazio por enquanto
      setMovements([]);
    } catch (err) {
      console.error('Erro inesperado:', err);
      setError('Ocorreu um erro ao processar as movimentações de estoque.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Simular alertas
  const fetchActiveAlerts = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Verificar itens com estoque baixo
      const lowStockItems = inventoryItems.filter(
        item => item.min_quantity && item.quantity <= item.min_quantity
      );
      
      const generatedAlerts: InventoryAlert[] = lowStockItems.map(item => ({
        id: uuidv4(),
        item_id: item.id,
        type: item.quantity === 0 ? 'OUT_OF_STOCK' : 'LOW_STOCK',
        message: `${item.name}: ${item.quantity} ${item.unit || 'unidades'} restantes`,
        date: new Date(),
        resolved: false
      }));
      
      setAlerts(generatedAlerts);
    } catch (err) {
      console.error('Erro inesperado:', err);
      setError('Ocorreu um erro ao processar os alertas de estoque.');
    } finally {
      setLoading(false);
    }
  }, [inventoryItems]);

  // Adicionar novo item ao estoque
  const addInventoryItem = useCallback(async (item: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('inventory')
        .insert(item)
        .select()
        .single();
        
      if (error) {
        console.error('Erro ao adicionar item:', error);
        setError('Não foi possível adicionar o item ao estoque.');
        return null;
      }
      
      if (data) {
        const newItem = data as InventoryItem;
        setInventoryItems(prev => [...prev, newItem]);
        toast.success('Item adicionado ao estoque com sucesso!');
        return newItem;
      }
      
      return null;
    } catch (err) {
      console.error('Erro inesperado:', err);
      setError('Ocorreu um erro ao adicionar o item ao estoque.');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Atualizar item do estoque
  const updateInventoryItem = useCallback(async (id: string, updates: Partial<InventoryItem>) => {
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase
        .from('inventory')
        .update(updates)
        .eq('id', id);
        
      if (error) {
        console.error('Erro ao atualizar item:', error);
        setError('Não foi possível atualizar o item do estoque.');
        return false;
      }
      
      setInventoryItems(prev => 
        prev.map(item => item.id === id ? { ...item, ...updates } : item)
      );
      
      toast.success('Item atualizado com sucesso!');
      return true;
    } catch (err) {
      console.error('Erro inesperado:', err);
      setError('Ocorreu um erro ao atualizar o item do estoque.');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Ajustar quantidade (entrada ou saída)
  const adjustQuantity = useCallback(async (
    itemId: string,
    quantityChange: number,
    type: 'IN' | 'OUT',
    notes?: string
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const item = inventoryItems.find(i => i.id === itemId);
      
      if (!item) {
        setError('Item não encontrado no estoque.');
        return false;
      }
      
      const newQuantity = item.quantity + quantityChange;
      
      if (newQuantity < 0) {
        setError('Quantidade insuficiente em estoque.');
        return false;
      }
      
      const success = await updateInventoryItem(itemId, { quantity: newQuantity });
      
      if (success) {
        // Simular registro de movimentação
        const movement: InventoryMovement = {
          id: uuidv4(),
          item_id: itemId,
          type,
          quantity: Math.abs(quantityChange),
          date: new Date(),
          notes,
          user_id: 'current_user'
        };
        
        setMovements(prev => [movement, ...prev]);
        
        toast.success(`${type === 'IN' ? 'Entrada' : 'Saída'} registrada com sucesso!`);
      }
      
      return success;
    } catch (err) {
      console.error('Erro inesperado:', err);
      setError('Ocorreu um erro ao ajustar a quantidade.');
      return false;
    } finally {
      setLoading(false);
    }
  }, [inventoryItems, updateInventoryItem]);

  // Deletar item
  const deleteInventoryItem = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase
        .from('inventory')
        .delete()
        .eq('id', id);
        
      if (error) {
        console.error('Erro ao deletar item:', error);
        setError('Não foi possível deletar o item do estoque.');
        return false;
      }
      
      setInventoryItems(prev => prev.filter(item => item.id !== id));
      toast.success('Item removido do estoque com sucesso!');
      return true;
    } catch (err) {
      console.error('Erro inesperado:', err);
      setError('Ocorreu um erro ao deletar o item do estoque.');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Verificar estoque baixo
  const checkLowStock = useCallback(() => {
    const lowStockItems = inventoryItems.filter(
      item => item.min_quantity && item.quantity <= item.min_quantity
    );
    
    return lowStockItems;
  }, [inventoryItems]);

  // Resolver alerta
  const resolveAlert = useCallback(async (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
    return true;
  }, []);

  // Carregar dados iniciais
  useEffect(() => {
    fetchInventoryItems();
  }, [fetchInventoryItems]);

  // Atualizar alertas quando items mudarem
  useEffect(() => {
    if (inventoryItems.length > 0) {
      fetchActiveAlerts();
    }
  }, [inventoryItems, fetchActiveAlerts]);

  return {
    loading,
    error,
    inventoryItems,
    movements,
    alerts,
    addInventoryItem,
    updateInventoryItem,
    adjustQuantity,
    deleteInventoryItem,
    resolveAlert,
    checkLowStock,
    refreshInventory: fetchInventoryItems,
    refreshMovements: fetchRecentMovements,
    refreshAlerts: fetchActiveAlerts
  };
};

export default useInventory;
