
import { useCallback, useEffect } from 'react';
import useWorkflow from './useWorkflow';
import useInventory from './useInventory';
import { WorkflowStep, WorkflowStepType, MaterialUsage } from '@/types/workflow';
import { toast } from 'sonner';

// Hook para integrar workflow com controle de estoque
export const useWorkflowInventory = (orderId?: string) => {
  const { 
    workflow, 
    currentStep, 
    advanceToNextStep,
    refreshWorkflow
  } = useWorkflow(orderId);
  
  const {
    inventoryItems,
    refreshInventory: refreshItems
  } = useInventory();

  // Avançar workflow com dedução de materiais (simplificado)
  const advanceWorkflowWithMaterialDeduction = useCallback(async (
    notes?: string,
    materials?: MaterialUsage[]
  ) => {
    if (!workflow || !currentStep) {
      toast.error('Nenhum fluxo de trabalho ativo.');
      return false;
    }
    
    try {
      // Para agora, apenas avançar o workflow sem dedução de materiais
      const result = await advanceToNextStep(notes);
      
      if (result) {
        toast.success('Etapa avançada com sucesso!');
      }
      
      return result;
    } catch (err) {
      console.error('Erro ao avançar workflow:', err);
      toast.error('Ocorreu um erro ao processar os materiais.');
      return false;
    }
  }, [workflow, currentStep, advanceToNextStep]);

  // Obter informações de estoque para um material
  const getMaterialStockInfo = useCallback((materialId: string) => {
    return inventoryItems.find(item => item.id === materialId);
  }, [inventoryItems]);

  // Verificar se há estoque suficiente para uma lista de materiais
  const checkSufficientStock = useCallback((materials: MaterialUsage[]) => {
    const insufficientItems = [];
    
    for (const material of materials) {
      const stockItem = getMaterialStockInfo(material.materialId);
      
      if (!stockItem || stockItem.quantity < material.quantity) {
        insufficientItems.push({
          materialId: material.materialId,
          materialName: stockItem?.name || 'Material desconhecido',
          required: material.quantity,
          available: stockItem?.quantity || 0,
          unit: stockItem?.unit || material.unit
        });
      }
    }
    
    return {
      sufficient: insufficientItems.length === 0,
      insufficientItems
    };
  }, [getMaterialStockInfo]);

  // Funções simplificadas para compatibilidade
  const hasPendingDeductions = useCallback(() => {
    return false; // Simplificado por enquanto
  }, []);

  const getCurrentPendingDeductions = useCallback(() => {
    return []; // Simplificado por enquanto
  }, []);

  const confirmMaterialDeduction = useCallback(async (
    stepId: string,
    materialId: string,
    confirmedQuantity?: number
  ) => {
    toast.info('Funcionalidade de dedução de materiais ainda não implementada.');
    return false;
  }, []);

  const confirmAllPendingDeductions = useCallback(async (stepId: string) => {
    toast.info('Funcionalidade de dedução de materiais ainda não implementada.');
    return false;
  }, []);

  // Atualizar dados quando o workflow mudar
  useEffect(() => {
    if (workflow) {
      refreshItems();
    }
  }, [workflow, refreshItems]);

  return {
    workflow,
    currentStep,
    hasPendingDeductions,
    getCurrentPendingDeductions,
    advanceWorkflowWithMaterialDeduction,
    confirmMaterialDeduction,
    confirmAllPendingDeductions,
    getMaterialStockInfo,
    checkSufficientStock,
    refreshWorkflow
  };
};

export default useWorkflowInventory;
