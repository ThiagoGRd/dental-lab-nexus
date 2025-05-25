import { useCallback, useEffect } from 'react';
import useWorkflow from './useWorkflow';
import useInventory from './useInventory';
import { WorkflowStep, WorkflowStepType, MaterialUsage } from '@/types/workflow';
import { MeasurementUnit } from '@/types/inventory';
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
    registerWorkflowMaterialUsage,
    confirmPendingDeduction,
    pendingDeductions,
    inventoryItems,
    refreshPendingDeductions
  } = useInventory();

  // Verificar se há deduções pendentes para o workflow atual
  const hasPendingDeductions = useCallback(() => {
    if (!workflow) return false;
    
    return pendingDeductions.some(
      pd => pd.workflowId === workflow.id
    );
  }, [workflow, pendingDeductions]);

  // Obter deduções pendentes para o workflow atual
  const getCurrentPendingDeductions = useCallback(() => {
    if (!workflow) return [];
    
    const currentDeductions = pendingDeductions.filter(
      pd => pd.workflowId === workflow.id
    );
    
    return currentDeductions;
  }, [workflow, pendingDeductions]);

  // Converter MaterialUsage do workflow para formato compatível com estoque
  const convertMaterialUsage = useCallback((materials: MaterialUsage[]) => {
    return materials.map(material => ({
      materialId: material.materialId,
      quantity: material.quantity,
      unit: material.unit as MeasurementUnit,
      automaticDeduction: material.automaticDeduction
    }));
  }, []);

  // Avançar workflow com dedução de materiais
  const advanceWorkflowWithMaterialDeduction = useCallback(async (
    notes?: string,
    materials?: MaterialUsage[]
  ) => {
    if (!workflow || !currentStep) {
      toast.error('Nenhum fluxo de trabalho ativo.');
      return false;
    }
    
    try {
      // Se materiais foram fornecidos, registrar uso
      if (materials && materials.length > 0) {
        await registerWorkflowMaterialUsage(
          workflow.id,
          currentStep.id,
          convertMaterialUsage(materials)
        );
      } 
      // Se não foram fornecidos, mas a etapa atual tem materiais definidos
      else if (currentStep.materialsUsed && currentStep.materialsUsed.length > 0) {
        await registerWorkflowMaterialUsage(
          workflow.id,
          currentStep.id,
          convertMaterialUsage(currentStep.materialsUsed)
        );
      }
      
      // Avançar para próxima etapa
      const result = await advanceToNextStep(notes, materials);
      
      if (result) {
        toast.success('Etapa avançada e materiais registrados com sucesso!');
      }
      
      return result;
    } catch (err) {
      console.error('Erro ao avançar workflow com dedução de materiais:', err);
      toast.error('Ocorreu um erro ao processar os materiais.');
      return false;
    }
  }, [workflow, currentStep, registerWorkflowMaterialUsage, advanceToNextStep, convertMaterialUsage]);

  // Confirmar dedução de material específico
  const confirmMaterialDeduction = useCallback(async (
    stepId: string,
    materialId: string,
    confirmedQuantity?: number
  ) => {
    if (!workflow) {
      toast.error('Nenhum fluxo de trabalho ativo.');
      return false;
    }
    
    try {
      const result = await confirmPendingDeduction(
        workflow.id,
        stepId,
        materialId,
        confirmedQuantity
      );
      
      if (result) {
        await refreshPendingDeductions();
        toast.success('Dedução de material confirmada com sucesso!');
      }
      
      return result;
    } catch (err) {
      console.error('Erro ao confirmar dedução de material:', err);
      toast.error('Ocorreu um erro ao confirmar a dedução de material.');
      return false;
    }
  }, [workflow, confirmPendingDeduction, refreshPendingDeductions]);

  // Confirmar todas as deduções pendentes para uma etapa
  const confirmAllPendingDeductions = useCallback(async (stepId: string) => {
    if (!workflow) {
      toast.error('Nenhum fluxo de trabalho ativo.');
      return false;
    }
    
    try {
      const pendingForStep = pendingDeductions.find(
        pd => pd.workflowId === workflow.id && pd.stepId === stepId
      );
      
      if (!pendingForStep) {
        toast.info('Não há deduções pendentes para esta etapa.');
        return true;
      }
      
      let allSuccess = true;
      
      for (const material of pendingForStep.materialUsages) {
        if (!material.deducted) {
          const result = await confirmMaterialDeduction(
            stepId,
            material.materialId
          );
          
          if (!result) {
            allSuccess = false;
          }
        }
      }
      
      if (allSuccess) {
        toast.success('Todas as deduções foram confirmadas com sucesso!');
      } else {
        toast.warning('Algumas deduções não puderam ser confirmadas.');
      }
      
      return allSuccess;
    } catch (err) {
      console.error('Erro ao confirmar todas as deduções:', err);
      toast.error('Ocorreu um erro ao confirmar as deduções de material.');
      return false;
    }
  }, [workflow, pendingDeductions, confirmMaterialDeduction]);

  // Obter informações de estoque para um material
  const getMaterialStockInfo = useCallback((materialId: string) => {
    return inventoryItems.find(item => item.id === materialId);
  }, [inventoryItems]);

  // Verificar se há estoque suficiente para uma lista de materiais
  const checkSufficientStock = useCallback((materials: MaterialUsage[]) => {
    const insufficientItems = [];
    
    for (const material of materials) {
      const stockItem = getMaterialStockInfo(material.materialId);
      
      if (!stockItem || stockItem.currentQuantity < material.quantity) {
        insufficientItems.push({
          materialId: material.materialId,
          materialName: stockItem?.name || 'Material desconhecido',
          required: material.quantity,
          available: stockItem?.currentQuantity || 0,
          unit: stockItem?.unit || material.unit
        });
      }
    }
    
    return {
      sufficient: insufficientItems.length === 0,
      insufficientItems
    };
  }, [getMaterialStockInfo]);

  // Atualizar dados quando o workflow mudar
  useEffect(() => {
    if (workflow) {
      refreshPendingDeductions();
    }
  }, [workflow, refreshPendingDeductions]);

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
