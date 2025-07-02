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

// Mock templates since we don't have templates table yet
const mockTemplates: WorkflowTemplate[] = [
  {
    id: 'template-default',
    name: 'Fluxo Padrão',
    procedureType: ProcedureType.TOTAL_PROSTHESIS,
    steps: [
      WorkflowStepType.RECEPTION,
      WorkflowStepType.MODELING,
      WorkflowStepType.FINISHING,
      WorkflowStepType.QUALITY_CONTROL,
      WorkflowStepType.SHIPPING
    ],
    estimatedTotalDuration: 24,
    defaultMaterials: []
  }
];

export const useWorkflow = (orderId?: string) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [workflow, setWorkflow] = useState<WorkflowInstance | null>(null);
  const [templates, setTemplates] = useState<WorkflowTemplate[]>(mockTemplates);
  const [currentStep, setCurrentStep] = useState<WorkflowStep | null>(null);
  const [allWorkflows, setAllWorkflows] = useState<WorkflowInstance[]>([]);

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
    urgent: boolean = false,
    customSteps?: WorkflowStepType[]
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const template = templates[0]; // Use default template
      
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
  }, [templates]);

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

  // Enviar para o dentista
  const sendToDentist = useCallback(async (notes?: string) => {
    if (!workflow) {
      setError('Nenhum fluxo de trabalho ativo.');
      return false;
    }
    
    try {
      const updatedWorkflow = {
        ...workflow,
        sentToDentist: true
      };
      
      setWorkflow(updatedWorkflow);
      
      toast.success('Trabalho enviado para o dentista com sucesso!');
      return true;
    } catch (err) {
      console.error('Erro inesperado:', err);
      setError('Ocorreu um erro ao enviar o trabalho para o dentista.');
      return false;
    }
  }, [workflow]);

  // Receber de volta do dentista
  const receiveFromDentist = useCallback(async (
    feedback: string,
    requiresAdjustments: boolean
  ) => {
    if (!workflow) {
      setError('Nenhum fluxo de trabalho ativo.');
      return false;
    }
    
    try {
      const updatedWorkflow = {
        ...workflow,
        sentToDentist: false,
        dentistFeedback: feedback,
        returnedFromDentist: new Date()
      };
      
      setWorkflow(updatedWorkflow);
      
      toast.success('Trabalho recebido do dentista com sucesso!');
      return true;
    } catch (err) {
      console.error('Erro inesperado:', err);
      setError('Ocorreu um erro ao receber o trabalho do dentista.');
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

  return {
    loading,
    error,
    workflow,
    currentStep,
    allWorkflows,
    templates,
    createWorkflow,
    advanceToNextStep,
    sendToDentist,
    receiveFromDentist,
    refreshWorkflow: fetchWorkflow,
    refreshAllWorkflows: fetchAllWorkflows
  };
};

export default useWorkflow;