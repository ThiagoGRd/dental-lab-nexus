
import { useState, useEffect, useCallback } from 'react';
import { 
  WorkflowInstance, 
  WorkflowStep, 
  WorkflowStepType, 
  StepStatus, 
  ProcedureType,
  WorkflowTemplate,
  MaterialUsage,
  WorkflowStatus
} from '../types/workflow';
import { supabase } from '../integrations/supabase/client';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

// Templates de workflow para diferentes tipos de procedimentos
const workflowTemplates: Record<ProcedureType, WorkflowTemplate> = {
  [ProcedureType.TOTAL_PROSTHESIS]: {
    id: 'template-total-prosthesis',
    name: 'Prótese Total',
    procedureType: ProcedureType.TOTAL_PROSTHESIS,
    steps: [
      WorkflowStepType.RECEPTION,
      WorkflowStepType.MODELING,
      WorkflowStepType.TEETH_MOUNTING,
      WorkflowStepType.DENTIST_TESTING,
      WorkflowStepType.ACRYLIZATION,
      WorkflowStepType.FINISHING,
      WorkflowStepType.QUALITY_CONTROL,
      WorkflowStepType.SHIPPING
    ],
    estimatedTotalDuration: 24
  },
  [ProcedureType.PARTIAL_REMOVIBLE_PROSTHESIS]: {
    id: 'template-ppr',
    name: 'Prótese Parcial Removível',
    procedureType: ProcedureType.PARTIAL_REMOVIBLE_PROSTHESIS,
    steps: [
      WorkflowStepType.RECEPTION,
      WorkflowStepType.MODELING,
      WorkflowStepType.CASTING,
      WorkflowStepType.DENTIST_TESTING,
      WorkflowStepType.TEETH_MOUNTING,
      WorkflowStepType.ACRYLIZATION,
      WorkflowStepType.FINISHING,
      WorkflowStepType.QUALITY_CONTROL,
      WorkflowStepType.SHIPPING
    ],
    estimatedTotalDuration: 32
  },
  [ProcedureType.IMPLANT_PROTOCOL]: {
    id: 'template-implant',
    name: 'Protocolo de Implantes',
    procedureType: ProcedureType.IMPLANT_PROTOCOL,
    steps: [
      WorkflowStepType.RECEPTION,
      WorkflowStepType.MODELING,
      WorkflowStepType.BAR_CASTING,
      WorkflowStepType.DENTIST_TESTING,
      WorkflowStepType.TEETH_MOUNTING,
      WorkflowStepType.ACRYLIZATION,
      WorkflowStepType.FINISHING,
      WorkflowStepType.QUALITY_CONTROL,
      WorkflowStepType.SHIPPING
    ],
    estimatedTotalDuration: 40
  },
  [ProcedureType.PROVISIONAL]: {
    id: 'template-provisional',
    name: 'Provisório em Resina',
    procedureType: ProcedureType.PROVISIONAL,
    steps: [
      WorkflowStepType.RECEPTION,
      WorkflowStepType.MODELING,
      WorkflowStepType.FINISHING,
      WorkflowStepType.QUALITY_CONTROL,
      WorkflowStepType.SHIPPING
    ],
    estimatedTotalDuration: 8
  },
  [ProcedureType.CUSTOM]: {
    id: 'template-custom',
    name: 'Personalizado',
    procedureType: ProcedureType.CUSTOM,
    steps: [
      WorkflowStepType.RECEPTION,
      WorkflowStepType.MODELING,
      WorkflowStepType.FINISHING,
      WorkflowStepType.QUALITY_CONTROL,
      WorkflowStepType.SHIPPING
    ],
    estimatedTotalDuration: 16
  }
};

export const useWorkflowOptimized = (orderId?: string) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [workflow, setWorkflow] = useState<WorkflowInstance | null>(null);
  const [allWorkflows, setAllWorkflows] = useState<WorkflowInstance[]>([]);
  const [templates] = useState<WorkflowTemplate[]>(Object.values(workflowTemplates));

  // Carregar workflow específico
  const fetchWorkflow = useCallback(async () => {
    if (!orderId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('workflows')
        .select('*')
        .eq('order_id', orderId)
        .maybeSingle();
        
      if (error) {
        console.error('Erro ao buscar workflow:', error);
        setError('Não foi possível carregar o fluxo de trabalho.');
        return;
      }
      
      if (data) {
        // Simular dados de workflow baseado nos dados da tabela
        const mockWorkflow: WorkflowInstance = {
          id: data.id,
          orderId: data.order_id || orderId,
          templateId: 'template-default',
          currentStepIndex: Math.floor((data.progress || 0) / 20),
          steps: [],
          startDate: new Date(data.created_at),
          estimatedEndDate: new Date(),
          status: WorkflowStatus.ACTIVE,
          urgent: false,
          sentToDentist: false
        };
        
        setWorkflow(mockWorkflow);
      }
    } catch (err) {
      console.error('Erro inesperado:', err);
      setError('Ocorreu um erro ao processar os dados do fluxo de trabalho.');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  // Carregar todos os workflows ativos
  const fetchAllWorkflows = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('workflows')
        .select('*');
        
      if (error) {
        console.error('Erro ao buscar workflows:', error);
        setError('Não foi possível carregar os fluxos de trabalho.');
        return;
      }
      
      if (data) {
        // Simular workflows baseado nos dados da tabela
        const workflows: WorkflowInstance[] = data.map(item => ({
          id: item.id,
          orderId: item.order_id || 'unknown',
          templateId: 'template-default',
          currentStepIndex: Math.floor((item.progress || 0) / 20),
          steps: [],
          startDate: new Date(item.created_at),
          estimatedEndDate: new Date(),
          status: WorkflowStatus.ACTIVE,
          urgent: false,
          sentToDentist: false
        }));
        
        setAllWorkflows(workflows);
      }
    } catch (err) {
      console.error('Erro inesperado:', err);
      setError('Ocorreu um erro ao processar os dados dos fluxos de trabalho.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Criar novo workflow para uma ordem
  const createWorkflow = useCallback(async (
    orderId: string, 
    procedureType: ProcedureType, 
    urgent: boolean = false
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const template = workflowTemplates[procedureType];
      
      if (!template) {
        setError('Tipo de procedimento não suportado.');
        return null;
      }

      const { data, error: saveError } = await supabase
        .from('workflows')
        .insert({
          name: `Workflow para Ordem ${orderId}`,
          description: `Fluxo de trabalho criado para a ordem ${orderId}`,
          order_id: orderId,
          status: 'active',
          progress: 0
        })
        .select()
        .single();
        
      if (saveError) {
        console.error('Erro ao salvar workflow:', saveError);
        setError('Não foi possível salvar o fluxo de trabalho.');
        return null;
      }
      
      const newWorkflow: WorkflowInstance = {
        id: data.id,
        orderId,
        templateId: template.id,
        currentStepIndex: 0,
        steps: [],
        startDate: new Date(),
        estimatedEndDate: new Date(),
        status: WorkflowStatus.ACTIVE,
        urgent,
        sentToDentist: false
      };
      
      setWorkflow(newWorkflow);
      
      toast.success('Fluxo de trabalho criado com sucesso!');
      return newWorkflow;
    } catch (err) {
      console.error('Erro inesperado:', err);
      setError('Ocorreu um erro ao criar o fluxo de trabalho.');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Avançar para próxima etapa
  const advanceToNextStep = useCallback(async (
    notes?: string,
    materialsUsed?: MaterialUsage[]
  ) => {
    if (!workflow) {
      setError('Nenhum fluxo de trabalho ativo.');
      return false;
    }
    
    try {
      const newProgress = Math.min((workflow.currentStepIndex + 1) * 20, 100);
      
      const { error: updateError } = await supabase
        .from('workflows')
        .update({
          progress: newProgress,
          description: notes || 'Avançado para próxima etapa'
        })
        .eq('id', workflow.id);
        
      if (updateError) {
        console.error('Erro ao atualizar workflow:', updateError);
        setError('Não foi possível atualizar o fluxo de trabalho.');
        return false;
      }
      
      const updatedWorkflow = {
        ...workflow,
        currentStepIndex: workflow.currentStepIndex + 1
      };
      
      setWorkflow(updatedWorkflow);
      
      toast.success('Avançado para próxima etapa com sucesso!');
      return true;
    } catch (err) {
      console.error('Erro inesperado:', err);
      setError('Ocorreu um erro ao avançar o fluxo de trabalho.');
      return false;
    }
  }, [workflow]);

  // Carregar dados iniciais
  useEffect(() => {
    if (orderId) {
      fetchWorkflow();
    } else {
      fetchAllWorkflows();
    }
  }, [orderId, fetchWorkflow, fetchAllWorkflows]);

  const currentStep = workflow?.steps[workflow.currentStepIndex] || null;

  return {
    loading,
    error,
    workflow,
    currentStep,
    allWorkflows,
    templates,
    createWorkflow,
    advanceToNextStep,
    refreshWorkflow: fetchWorkflow,
    refreshAllWorkflows: fetchAllWorkflows
  };
};

export default useWorkflowOptimized;
