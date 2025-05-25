import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../integrations/supabase/client';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { 
  InventoryItem, 
  InventoryMovement, 
  MaterialCategory, 
  MeasurementUnit,
  InventoryAlert,
  WorkflowMaterialUsage
} from '../types/inventory';

export const useInventory = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [alerts, setAlerts] = useState<InventoryAlert[]>([]);
  const [pendingDeductions, setPendingDeductions] = useState<WorkflowMaterialUsage[]>([]);

  // Carregar todos os itens do estoque
  const fetchInventoryItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Em um cenário real, isso buscaria do Supabase
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('is_active', true);
        
      if (error) {
        console.error('Erro ao buscar itens de estoque:', error);
        setError('Não foi possível carregar os itens de estoque.');
        return;
      }
      
      if (data) {
        setInventoryItems(data as unknown as InventoryItem[]);
      }
    } catch (err) {
      console.error('Erro inesperado:', err);
      setError('Ocorreu um erro ao processar os dados de estoque.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregar movimentações recentes
  const fetchRecentMovements = useCallback(async (days: number = 30) => {
    setLoading(true);
    setError(null);
    
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      // Em um cenário real, isso buscaria do Supabase
      const { data, error } = await supabase
        .from('inventory_movements')
        .select('*')
        .gte('date', startDate.toISOString())
        .order('date', { ascending: false });
        
      if (error) {
        console.error('Erro ao buscar movimentações:', error);
        setError('Não foi possível carregar as movimentações de estoque.');
        return;
      }
      
      if (data) {
        setMovements(data as unknown as InventoryMovement[]);
      }
    } catch (err) {
      console.error('Erro inesperado:', err);
      setError('Ocorreu um erro ao processar as movimentações de estoque.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregar alertas ativos
  const fetchActiveAlerts = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Em um cenário real, isso buscaria do Supabase
      const { data, error } = await supabase
        .from('inventory_alerts')
        .select('*')
        .eq('is_resolved', false)
        .order('date', { ascending: false });
        
      if (error) {
        console.error('Erro ao buscar alertas:', error);
        setError('Não foi possível carregar os alertas de estoque.');
        return;
      }
      
      if (data) {
        setAlerts(data as unknown as InventoryAlert[]);
      }
    } catch (err) {
      console.error('Erro inesperado:', err);
      setError('Ocorreu um erro ao processar os alertas de estoque.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregar deduções pendentes
  const fetchPendingDeductions = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Em um cenário real, isso buscaria do Supabase
      const { data, error } = await supabase
        .from('workflow_material_usages')
        .select('*')
        .eq('deducted', false);
        
      if (error) {
        console.error('Erro ao buscar deduções pendentes:', error);
        setError('Não foi possível carregar as deduções pendentes.');
        return;
      }
      
      if (data) {
        setPendingDeductions(data as unknown as WorkflowMaterialUsage[]);
      }
    } catch (err) {
      console.error('Erro inesperado:', err);
      setError('Ocorreu um erro ao processar as deduções pendentes.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Adicionar novo item ao estoque
  const addInventoryItem = useCallback(async (item: Omit<InventoryItem, 'id'>) => {
    setLoading(true);
    setError(null);
    
    try {
      const newItem: InventoryItem = {
        ...item,
        id: uuidv4(),
        isActive: true
      };
      
      // Em um cenário real, isso salvaria no Supabase
      const { error } = await supabase
        .from('inventory_items')
        .insert(newItem);
        
      if (error) {
        console.error('Erro ao adicionar item:', error);
        setError('Não foi possível adicionar o item ao estoque.');
        return null;
      }
      
      setInventoryItems(prev => [...prev, newItem]);
      toast.success('Item adicionado ao estoque com sucesso!');
      return newItem;
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
      // Em um cenário real, isso atualizaria no Supabase
      const { error } = await supabase
        .from('inventory_items')
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

  // Registrar movimentação de estoque
  const registerMovement = useCallback(async (movement: Omit<InventoryMovement, 'id' | 'date'>) => {
    setLoading(true);
    setError(null);
    
    try {
      const newMovement: InventoryMovement = {
        ...movement,
        id: uuidv4(),
        date: new Date()
      };
      
      // Buscar item atual
      const item = inventoryItems.find(i => i.id === movement.materialId);
      
      if (!item) {
        setError('Item não encontrado no estoque.');
        return null;
      }
      
      // Calcular nova quantidade
      const newQuantity = item.currentQuantity + movement.quantity;
      
      if (newQuantity < 0) {
        setError('Quantidade insuficiente em estoque.');
        return null;
      }
      
      // Atualizar quantidade do item
      const { error: updateError } = await supabase
        .from('inventory_items')
        .update({ currentQuantity: newQuantity })
        .eq('id', item.id);
        
      if (updateError) {
        console.error('Erro ao atualizar quantidade:', updateError);
        setError('Não foi possível atualizar a quantidade em estoque.');
        return null;
      }
      
      // Registrar movimentação
      const { error } = await supabase
        .from('inventory_movements')
        .insert(newMovement);
        
      if (error) {
        console.error('Erro ao registrar movimentação:', error);
        setError('Não foi possível registrar a movimentação de estoque.');
        return null;
      }
      
      // Atualizar estados locais
      setInventoryItems(prev => 
        prev.map(i => i.id === item.id ? { ...i, currentQuantity: newQuantity } : i)
      );
      
      setMovements(prev => [newMovement, ...prev]);
      
      // Verificar se precisa gerar alerta de estoque baixo
      if (newQuantity <= item.minimumQuantity && movement.quantity < 0) {
        createAlert({
          materialId: item.id,
          type: 'LOW_STOCK',
          message: `Estoque baixo: ${item.name} (${newQuantity} ${item.unit})`,
          isRead: false,
          isResolved: false
        });
      }
      
      toast.success('Movimentação registrada com sucesso!');
      return newMovement;
    } catch (err) {
      console.error('Erro inesperado:', err);
      setError('Ocorreu um erro ao registrar a movimentação de estoque.');
      return null;
    } finally {
      setLoading(false);
    }
  }, [inventoryItems]);

  // Criar alerta de estoque
  const createAlert = useCallback(async (alert: Omit<InventoryAlert, 'id' | 'date'>) => {
    try {
      const newAlert: InventoryAlert = {
        ...alert,
        id: uuidv4(),
        date: new Date()
      };
      
      // Em um cenário real, isso salvaria no Supabase
      const { error } = await supabase
        .from('inventory_alerts')
        .insert(newAlert);
        
      if (error) {
        console.error('Erro ao criar alerta:', error);
        return null;
      }
      
      setAlerts(prev => [newAlert, ...prev]);
      return newAlert;
    } catch (err) {
      console.error('Erro ao criar alerta:', err);
      return null;
    }
  }, []);

  // Resolver alerta
  const resolveAlert = useCallback(async (id: string) => {
    try {
      // Em um cenário real, isso atualizaria no Supabase
      const { error } = await supabase
        .from('inventory_alerts')
        .update({ isResolved: true })
        .eq('id', id);
        
      if (error) {
        console.error('Erro ao resolver alerta:', error);
        return false;
      }
      
      setAlerts(prev => 
        prev.map(alert => alert.id === id ? { ...alert, isResolved: true } : alert)
      );
      
      return true;
    } catch (err) {
      console.error('Erro ao resolver alerta:', err);
      return false;
    }
  }, []);

  // Registrar uso de materiais em workflow
  const registerWorkflowMaterialUsage = useCallback(async (
    workflowId: string,
    stepId: string,
    materialUsages: {
      materialId: string;
      quantity: number;
      unit: MeasurementUnit;
      automaticDeduction: boolean;
    }[]
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const usage: WorkflowMaterialUsage = {
        workflowId,
        stepId,
        materialUsages: materialUsages.map(usage => ({
          ...usage,
          deducted: false
        }))
      };
      
      // Em um cenário real, isso salvaria no Supabase
      const { error } = await supabase
        .from('workflow_material_usages')
        .insert(usage);
        
      if (error) {
        console.error('Erro ao registrar uso de materiais:', error);
        setError('Não foi possível registrar o uso de materiais.');
        return null;
      }
      
      // Se algum material tem dedução automática, processar imediatamente
      const autoDeductMaterials = materialUsages.filter(m => m.automaticDeduction);
      
      if (autoDeductMaterials.length > 0) {
        for (const material of autoDeductMaterials) {
          await registerMovement({
            materialId: material.materialId,
            quantity: -material.quantity, // Negativo para saída
            type: 'OUT',
            orderId: workflowId,
            workflowStepId: stepId,
            userId: 'system', // Em um cenário real, seria o ID do usuário logado
            automaticDeduction: true,
            confirmed: true,
            notes: `Dedução automática - Workflow ${workflowId}`
          });
        }
      } else {
        // Se não tem dedução automática, adicionar à lista de pendentes
        setPendingDeductions(prev => [...prev, usage]);
      }
      
      toast.success('Uso de materiais registrado com sucesso!');
      return usage;
    } catch (err) {
      console.error('Erro inesperado:', err);
      setError('Ocorreu um erro ao registrar o uso de materiais.');
      return null;
    } finally {
      setLoading(false);
    }
  }, [registerMovement]);

  // Confirmar dedução pendente
  const confirmPendingDeduction = useCallback(async (
    workflowId: string,
    stepId: string,
    materialId: string,
    confirmedQuantity?: number
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      // Encontrar a dedução pendente
      const pendingDeduction = pendingDeductions.find(
        pd => pd.workflowId === workflowId && pd.stepId === stepId
      );
      
      if (!pendingDeduction) {
        setError('Dedução pendente não encontrada.');
        return false;
      }
      
      // Encontrar o material específico
      const materialUsage = pendingDeduction.materialUsages.find(
        mu => mu.materialId === materialId
      );
      
      if (!materialUsage) {
        setError('Material não encontrado na dedução pendente.');
        return false;
      }
      
      // Usar quantidade confirmada ou a original
      const quantity = confirmedQuantity !== undefined ? confirmedQuantity : materialUsage.quantity;
      
      // Registrar movimentação
      await registerMovement({
        materialId,
        quantity: -quantity, // Negativo para saída
        type: 'OUT',
        orderId: workflowId,
        workflowStepId: stepId,
        userId: 'user', // Em um cenário real, seria o ID do usuário logado
        automaticDeduction: false,
        confirmed: true,
        notes: `Dedução confirmada manualmente - Workflow ${workflowId}`
      });
      
      // Atualizar status da dedução
      const updatedMaterialUsages = pendingDeduction.materialUsages.map(mu => 
        mu.materialId === materialId 
          ? { 
              ...mu, 
              deducted: true, 
              confirmedBy: 'user', // Em um cenário real, seria o ID do usuário logado
              confirmedAt: new Date() 
            } 
          : mu
      );
      
      // Em um cenário real, isso atualizaria no Supabase
      const { error } = await supabase
        .from('workflow_material_usages')
        .update({ 
          materialUsages: updatedMaterialUsages 
        })
        .eq('workflowId', workflowId)
        .eq('stepId', stepId);
        
      if (error) {
        console.error('Erro ao confirmar dedução:', error);
        setError('Não foi possível confirmar a dedução de material.');
        return false;
      }
      
      // Atualizar estado local
      setPendingDeductions(prev => 
        prev.map(pd => 
          pd.workflowId === workflowId && pd.stepId === stepId
            ? { ...pd, materialUsages: updatedMaterialUsages }
            : pd
        )
      );
      
      toast.success('Dedução de material confirmada com sucesso!');
      return true;
    } catch (err) {
      console.error('Erro inesperado:', err);
      setError('Ocorreu um erro ao confirmar a dedução de material.');
      return false;
    } finally {
      setLoading(false);
    }
  }, [pendingDeductions, registerMovement]);

  // Verificar estoque baixo
  const checkLowStock = useCallback(() => {
    const lowStockItems = inventoryItems.filter(
      item => item.currentQuantity <= item.minimumQuantity
    );
    
    return lowStockItems;
  }, [inventoryItems]);

  // Carregar dados iniciais
  useEffect(() => {
    fetchInventoryItems();
    fetchRecentMovements();
    fetchActiveAlerts();
    fetchPendingDeductions();
  }, [fetchInventoryItems, fetchRecentMovements, fetchActiveAlerts, fetchPendingDeductions]);

  return {
    loading,
    error,
    inventoryItems,
    movements,
    alerts,
    pendingDeductions,
    addInventoryItem,
    updateInventoryItem,
    registerMovement,
    createAlert,
    resolveAlert,
    registerWorkflowMaterialUsage,
    confirmPendingDeduction,
    checkLowStock,
    refreshInventory: fetchInventoryItems,
    refreshMovements: fetchRecentMovements,
    refreshAlerts: fetchActiveAlerts,
    refreshPendingDeductions: fetchPendingDeductions
  };
};

export default useInventory;
