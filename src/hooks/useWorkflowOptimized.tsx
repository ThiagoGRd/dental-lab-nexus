import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

// Tipos para o hook de workflow
import { 
  Workflow, 
  WorkflowStep, 
  WorkflowTemplate, 
  WorkflowStatus,
  ProcedureType
} from '@/types/workflow';

/**
 * Hook para gerenciamento de fluxos de trabalho (workflows)
 * 
 * Este hook fornece funcionalidades para:
 * - Criar novos fluxos de trabalho baseados em templates
 * - Atualizar status de fluxos de trabalho
 * - Avançar ou retroceder etapas
 * - Enviar/receber trabalhos do dentista
 * - Gerenciar histórico de alterações
 * 
 * @returns Objeto com funções e estados para gerenciar workflows
 */
export function useWorkflow() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Templates de workflow para diferentes tipos de procedimentos
  const workflowTemplates: Record<ProcedureType, WorkflowTemplate> = {
    'PROTESE_TOTAL': {
      name: 'Prótese Total',
      steps: [
        { id: 1, name: 'Moldagem', description: 'Recepção da moldagem', estimatedDuration: 1 },
        { id: 2, name: 'Modelo de Gesso', description: 'Confecção do modelo de gesso', estimatedDuration: 1 },
        { id: 3, name: 'Placa Base', description: 'Confecção da placa base e plano de cera', estimatedDuration: 1 },
        { id: 4, name: 'Prova de Dentes', description: 'Montagem e prova de dentes', estimatedDuration: 2 },
        { id: 5, name: 'Acrilização', description: 'Acrilização e acabamento', estimatedDuration: 2 },
        { id: 6, name: 'Finalização', description: 'Polimento e ajustes finais', estimatedDuration: 1 },
      ]
    },
    'PROTESE_PARCIAL_REMOVIVEL': {
      name: 'Prótese Parcial Removível',
      steps: [
        { id: 1, name: 'Moldagem', description: 'Recepção da moldagem', estimatedDuration: 1 },
        { id: 2, name: 'Modelo de Gesso', description: 'Confecção do modelo de gesso', estimatedDuration: 1 },
        { id: 3, name: 'Estrutura Metálica', description: 'Confecção da estrutura metálica', estimatedDuration: 3 },
        { id: 4, name: 'Prova de Estrutura', description: 'Prova da estrutura metálica', estimatedDuration: 1 },
        { id: 5, name: 'Montagem de Dentes', description: 'Montagem dos dentes artificiais', estimatedDuration: 2 },
        { id: 6, name: 'Acrilização', description: 'Acrilização e acabamento', estimatedDuration: 2 },
        { id: 7, name: 'Finalização', description: 'Polimento e ajustes finais', estimatedDuration: 1 },
      ]
    },
    'PROTOCOLO_IMPLANTES': {
      name: 'Protocolo de Implantes',
      steps: [
        { id: 1, name: 'Moldagem', description: 'Recepção da moldagem de transferência', estimatedDuration: 1 },
        { id: 2, name: 'Modelo de Gesso', description: 'Confecção do modelo de gesso com análogos', estimatedDuration: 1 },
        { id: 3, name: 'Barra Metálica', description: 'Confecção da barra metálica', estimatedDuration: 5 },
        { id: 4, name: 'Prova de Barra', description: 'Prova da barra metálica', estimatedDuration: 1 },
        { id: 5, name: 'Montagem de Dentes', description: 'Montagem dos dentes artificiais', estimatedDuration: 3 },
        { id: 6, name: 'Prova de Dentes', description: 'Prova dos dentes montados', estimatedDuration: 1 },
        { id: 7, name: 'Acrilização', description: 'Acrilização e acabamento', estimatedDuration: 3 },
        { id: 8, name: 'Finalização', description: 'Polimento e ajustes finais', estimatedDuration: 1 },
      ]
    },
    'PROVISORIO_RESINA': {
      name: 'Provisório em Resina',
      steps: [
        { id: 1, name: 'Moldagem', description: 'Recepção da moldagem', estimatedDuration: 1 },
        { id: 2, name: 'Modelo de Gesso', description: 'Confecção do modelo de gesso', estimatedDuration: 1 },
        { id: 3, name: 'Confecção', description: 'Confecção do provisório em resina', estimatedDuration: 1 },
        { id: 4, name: 'Finalização', description: 'Acabamento e polimento', estimatedDuration: 1 },
      ]
    }
  };
  
  /**
   * Carrega todos os workflows do banco de dados
   */
  const fetchWorkflows = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('workflows')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      setWorkflows(data || []);
    } catch (err: any) {
      console.error('Erro ao carregar workflows:', err);
      setError(err.message || 'Erro ao carregar workflows');
      toast.error('Erro ao carregar workflows');
    } finally {
      setLoading(false);
    }
  }, []);
  
  /**
   * Carrega os workflows ao montar o componente
   */
  useEffect(() => {
    fetchWorkflows();
  }, [fetchWorkflows]);
  
  /**
   * Cria um novo workflow baseado em um template
   */
  const createWorkflow = useCallback(async (
    orderId: string,
    procedureType: ProcedureType,
    clientName: string,
    dentistName: string,
    isUrgent: boolean
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      // Obter o template para o tipo de procedimento
      const template = workflowTemplates[procedureType];
      
      if (!template) {
        throw new Error(`Template não encontrado para o tipo de procedimento: ${procedureType}`);
      }
      
      // Calcular data de entrega (dias úteis)
      const deliveryDate = calculateDeliveryDate(isUrgent ? 3 : 7);
      
      // Criar o novo workflow
      const newWorkflow: Workflow = {
        id: uuidv4(),
        order_id: orderId,
        name: template.name,
        procedure_type: procedureType,
        client_name: clientName,
        dentist_name: dentistName,
        current_step: 1,
        total_steps: template.steps.length,
        status: 'IN_PROGRESS',
        is_urgent: isUrgent,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        delivery_date: deliveryDate.toISOString(),
        steps: template.steps.map(step => ({
          ...step,
          status: step.id === 1 ? 'IN_PROGRESS' : 'PENDING',
          started_at: step.id === 1 ? new Date().toISOString() : null,
          completed_at: null,
          assigned_to: null,
          notes: ''
        })),
        history: [
          {
            id: uuidv4(),
            timestamp: new Date().toISOString(),
            action: 'CREATED',
            description: `Workflow criado para ${clientName}`,
            user: 'Sistema'
          }
        ]
      };
      
      // Salvar no banco de dados
      const { error } = await supabase
        .from('workflows')
        .insert(newWorkflow);
      
      if (error) {
        throw error;
      }
      
      // Atualizar estado local
      setWorkflows(prev => [newWorkflow, ...prev]);
      
      toast.success('Workflow criado com sucesso');
      return newWorkflow;
    } catch (err: any) {
      console.error('Erro ao criar workflow:', err);
      setError(err.message || 'Erro ao criar workflow');
      toast.error('Erro ao criar workflow');
      return null;
    } finally {
      setLoading(false);
    }
  }, [workflowTemplates]);
  
  /**
   * Atualiza o status de um workflow
   */
  const updateWorkflowStatus = useCallback(async (
    workflowId: string,
    newStatus: WorkflowStatus,
    notes?: string
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      // Encontrar o workflow
      const workflow = workflows.find(w => w.id === workflowId);
      
      if (!workflow) {
        throw new Error(`Workflow não encontrado: ${workflowId}`);
      }
      
      // Criar entrada no histórico
      const historyEntry = {
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        action: 'STATUS_CHANGED',
        description: `Status alterado de ${workflow.status} para ${newStatus}${notes ? `: ${notes}` : ''}`,
        user: 'Sistema'
      };
      
      // Atualizar workflow
      const updatedWorkflow = {
        ...workflow,
        status: newStatus,
        updated_at: new Date().toISOString(),
        history: [...workflow.history, historyEntry]
      };
      
      // Salvar no banco de dados
      const { error } = await supabase
        .from('workflows')
        .update(updatedWorkflow)
        .eq('id', workflowId);
      
      if (error) {
        throw error;
      }
      
      // Atualizar estado local
      setWorkflows(prev => prev.map(w => w.id === workflowId ? updatedWorkflow : w));
      
      toast.success('Status do workflow atualizado com sucesso');
      return updatedWorkflow;
    } catch (err: any) {
      console.error('Erro ao atualizar status do workflow:', err);
      setError(err.message || 'Erro ao atualizar status do workflow');
      toast.error('Erro ao atualizar status do workflow');
      return null;
    } finally {
      setLoading(false);
    }
  }, [workflows]);
  
  /**
   * Avança para a próxima etapa do workflow
   */
  const advanceWorkflowStep = useCallback(async (
    workflowId: string,
    notes?: string,
    assignedTo?: string
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      // Encontrar o workflow
      const workflow = workflows.find(w => w.id === workflowId);
      
      if (!workflow) {
        throw new Error(`Workflow não encontrado: ${workflowId}`);
      }
      
      // Verificar se já está na última etapa
      if (workflow.current_step >= workflow.total_steps) {
        throw new Error('Workflow já está na última etapa');
      }
      
      // Atualizar etapa atual
      const currentStepIndex = workflow.steps.findIndex(s => s.id === workflow.current_step);
      const nextStepIndex = currentStepIndex + 1;
      
      if (currentStepIndex === -1 || nextStepIndex >= workflow.steps.length) {
        throw new Error('Erro ao encontrar etapas do workflow');
      }
      
      // Atualizar etapas
      const updatedSteps = [...workflow.steps];
      
      // Marcar etapa atual como concluída
      updatedSteps[currentStepIndex] = {
        ...updatedSteps[currentStepIndex],
        status: 'COMPLETED',
        completed_at: new Date().toISOString(),
        notes: notes || updatedSteps[currentStepIndex].notes
      };
      
      // Marcar próxima etapa como em andamento
      updatedSteps[nextStepIndex] = {
        ...updatedSteps[nextStepIndex],
        status: 'IN_PROGRESS',
        started_at: new Date().toISOString(),
        assigned_to: assignedTo || null
      };
      
      // Criar entrada no histórico
      const historyEntry = {
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        action: 'STEP_ADVANCED',
        description: `Avançou de ${workflow.steps[currentStepIndex].name} para ${workflow.steps[nextStepIndex].name}${notes ? `: ${notes}` : ''}`,
        user: assignedTo || 'Sistema'
      };
      
      // Atualizar workflow
      const updatedWorkflow = {
        ...workflow,
        current_step: workflow.steps[nextStepIndex].id,
        updated_at: new Date().toISOString(),
        steps: updatedSteps,
        history: [...workflow.history, historyEntry]
      };
      
      // Salvar no banco de dados
      const { error } = await supabase
        .from('workflows')
        .update(updatedWorkflow)
        .eq('id', workflowId);
      
      if (error) {
        throw error;
      }
      
      // Atualizar estado local
      setWorkflows(prev => prev.map(w => w.id === workflowId ? updatedWorkflow : w));
      
      toast.success('Workflow avançado para próxima etapa');
      return updatedWorkflow;
    } catch (err: any) {
      console.error('Erro ao avançar etapa do workflow:', err);
      setError(err.message || 'Erro ao avançar etapa do workflow');
      toast.error('Erro ao avançar etapa do workflow');
      return null;
    } finally {
      setLoading(false);
    }
  }, [workflows]);
  
  /**
   * Retorna para a etapa anterior do workflow
   */
  const revertWorkflowStep = useCallback(async (
    workflowId: string,
    reason: string
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      // Encontrar o workflow
      const workflow = workflows.find(w => w.id === workflowId);
      
      if (!workflow) {
        throw new Error(`Workflow não encontrado: ${workflowId}`);
      }
      
      // Verificar se já está na primeira etapa
      if (workflow.current_step <= 1) {
        throw new Error('Workflow já está na primeira etapa');
      }
      
      // Atualizar etapa atual
      const currentStepIndex = workflow.steps.findIndex(s => s.id === workflow.current_step);
      const prevStepIndex = currentStepIndex - 1;
      
      if (currentStepIndex === -1 || prevStepIndex < 0) {
        throw new Error('Erro ao encontrar etapas do workflow');
      }
      
      // Atualizar etapas
      const updatedSteps = [...workflow.steps];
      
      // Marcar etapa atual como pendente
      updatedSteps[currentStepIndex] = {
        ...updatedSteps[currentStepIndex],
        status: 'PENDING',
        started_at: null,
        completed_at: null
      };
      
      // Marcar etapa anterior como em andamento novamente
      updatedSteps[prevStepIndex] = {
        ...updatedSteps[prevStepIndex],
        status: 'IN_PROGRESS',
        completed_at: null,
        notes: `${updatedSteps[prevStepIndex].notes}\nRetornado: ${reason}`
      };
      
      // Criar entrada no histórico
      const historyEntry = {
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        action: 'STEP_REVERTED',
        description: `Retornou de ${workflow.steps[currentStepIndex].name} para ${workflow.steps[prevStepIndex].name}: ${reason}`,
        user: 'Sistema'
      };
      
      // Atualizar workflow
      const updatedWorkflow = {
        ...workflow,
        current_step: workflow.steps[prevStepIndex].id,
        updated_at: new Date().toISOString(),
        steps: updatedSteps,
        history: [...workflow.history, historyEntry]
      };
      
      // Salvar no banco de dados
      const { error } = await supabase
        .from('workflows')
        .update(updatedWorkflow)
        .eq('id', workflowId);
      
      if (error) {
        throw error;
      }
      
      // Atualizar estado local
      setWorkflows(prev => prev.map(w => w.id === workflowId ? updatedWorkflow : w));
      
      toast.success('Workflow retornou para etapa anterior');
      return updatedWorkflow;
    } catch (err: any) {
      console.error('Erro ao retornar etapa do workflow:', err);
      setError(err.message || 'Erro ao retornar etapa do workflow');
      toast.error('Erro ao retornar etapa do workflow');
      return null;
    } finally {
      setLoading(false);
    }
  }, [workflows]);
  
  /**
   * Envia o trabalho para o dentista (prova)
   */
  const sendToDentist = useCallback(async (
    workflowId: string,
    notes?: string
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      // Encontrar o workflow
      const workflow = workflows.find(w => w.id === workflowId);
      
      if (!workflow) {
        throw new Error(`Workflow não encontrado: ${workflowId}`);
      }
      
      // Criar entrada no histórico
      const historyEntry = {
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        action: 'SENT_TO_DENTIST',
        description: `Enviado para prova com o dentista${notes ? `: ${notes}` : ''}`,
        user: 'Sistema'
      };
      
      // Atualizar workflow
      const updatedWorkflow = {
        ...workflow,
        status: 'WITH_DENTIST',
        updated_at: new Date().toISOString(),
        history: [...workflow.history, historyEntry]
      };
      
      // Salvar no banco de dados
      const { error } = await supabase
        .from('workflows')
        .update(updatedWorkflow)
        .eq('id', workflowId);
      
      if (error) {
        throw error;
      }
      
      // Atualizar estado local
      setWorkflows(prev => prev.map(w => w.id === workflowId ? updatedWorkflow : w));
      
      toast.success('Trabalho enviado para o dentista');
      return updatedWorkflow;
    } catch (err: any) {
      console.error('Erro ao enviar trabalho para o dentista:', err);
      setError(err.message || 'Erro ao enviar trabalho para o dentista');
      toast.error('Erro ao enviar trabalho para o dentista');
      return null;
    } finally {
      setLoading(false);
    }
  }, [workflows]);
  
  /**
   * Recebe o trabalho de volta do dentista
   */
  const receiveFromDentist = useCallback(async (
    workflowId: string,
    approved: boolean,
    notes?: string
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      // Encontrar o workflow
      const workflow = workflows.find(w => w.id === workflowId);
      
      if (!workflow) {
        throw new Error(`Workflow não encontrado: ${workflowId}`);
      }
      
      // Verificar se o workflow está com o dentista
      if (workflow.status !== 'WITH_DENTIST') {
        throw new Error('Workflow não está com o dentista');
      }
      
      // Criar entrada no histórico
      const historyEntry = {
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        action: 'RECEIVED_FROM_DENTIST',
        description: `Recebido do dentista: ${approved ? 'Aprovado' : 'Necessita ajustes'}${notes ? `: ${notes}` : ''}`,
        user: 'Sistema'
      };
      
      // Atualizar workflow
      const updatedWorkflow = {
        ...workflow,
        status: approved ? 'IN_PROGRESS' : 'NEEDS_ADJUSTMENT',
        updated_at: new Date().toISOString(),
        history: [...workflow.history, historyEntry]
      };
      
      // Salvar no banco de dados
      const { error } = await supabase
        .from('workflows')
        .update(updatedWorkflow)
        .eq('id', workflowId);
      
      if (error) {
        throw error;
      }
      
      // Atualizar estado local
      setWorkflows(prev => prev.map(w => w.id === workflowId ? updatedWorkflow : w));
      
      toast.success(`Trabalho recebido do dentista: ${approved ? 'Aprovado' : 'Necessita ajustes'}`);
      return updatedWorkflow;
    } catch (err: any) {
      console.error('Erro ao receber trabalho do dentista:', err);
      setError(err.message || 'Erro ao receber trabalho do dentista');
      toast.error('Erro ao receber trabalho do dentista');
      return null;
    } finally {
      setLoading(false);
    }
  }, [workflows]);
  
  /**
   * Adiciona uma nota a uma etapa do workflow
   */
  const addStepNote = useCallback(async (
    workflowId: string,
    stepId: number,
    note: string
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      // Encontrar o workflow
      const workflow = workflows.find(w => w.id === workflowId);
      
      if (!workflow) {
        throw new Error(`Workflow não encontrado: ${workflowId}`);
      }
      
      // Encontrar a etapa
      const stepIndex = workflow.steps.findIndex(s => s.id === stepId);
      
      if (stepIndex === -1) {
        throw new Error(`Etapa não encontrada: ${stepId}`);
      }
      
      // Atualizar etapas
      const updatedSteps = [...workflow.steps];
      updatedSteps[stepIndex] = {
        ...updatedSteps[stepIndex],
        notes: updatedSteps[stepIndex].notes 
          ? `${updatedSteps[stepIndex].notes}\n${note}`
          : note
      };
      
      // Criar entrada no histórico
      const historyEntry = {
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        action: 'NOTE_ADDED',
        description: `Nota adicionada à etapa ${workflow.steps[stepIndex].name}: ${note}`,
        user: 'Sistema'
      };
      
      // Atualizar workflow
      const updatedWorkflow = {
        ...workflow,
        updated_at: new Date().toISOString(),
        steps: updatedSteps,
        history: [...workflow.history, historyEntry]
      };
      
      // Salvar no banco de dados
      const { error } = await supabase
        .from('workflows')
        .update(updatedWorkflow)
        .eq('id', workflowId);
      
      if (error) {
        throw error;
      }
      
      // Atualizar estado local
      setWorkflows(prev => prev.map(w => w.id === workflowId ? updatedWorkflow : w));
      
      toast.success('Nota adicionada com sucesso');
      return updatedWorkflow;
    } catch (err: any) {
      console.error('Erro ao adicionar nota:', err);
      setError(err.message || 'Erro ao adicionar nota');
      toast.error('Erro ao adicionar nota');
      return null;
    } finally {
      setLoading(false);
    }
  }, [workflows]);
  
  /**
   * Atualiza a data de entrega do workflow
   */
  const updateDeliveryDate = useCallback(async (
    workflowId: string,
    newDate: Date,
    reason: string
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      // Encontrar o workflow
      const workflow = workflows.find(w => w.id === workflowId);
      
      if (!workflow) {
        throw new Error(`Workflow não encontrado: ${workflowId}`);
      }
      
      // Criar entrada no histórico
      const historyEntry = {
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        action: 'DELIVERY_DATE_CHANGED',
        description: `Data de entrega alterada de ${new Date(workflow.delivery_date).toLocaleDateString()} para ${newDate.toLocaleDateString()}: ${reason}`,
        user: 'Sistema'
      };
      
      // Atualizar workflow
      const updatedWorkflow = {
        ...workflow,
        delivery_date: newDate.toISOString(),
        updated_at: new Date().toISOString(),
        history: [...workflow.history, historyEntry]
      };
      
      // Salvar no banco de dados
      const { error } = await supabase
        .from('workflows')
        .update(updatedWorkflow)
        .eq('id', workflowId);
      
      if (error) {
        throw error;
      }
      
      // Atualizar estado local
      setWorkflows(prev => prev.map(w => w.id === workflowId ? updatedWorkflow : w));
      
      toast.success('Data de entrega atualizada com sucesso');
      return updatedWorkflow;
    } catch (err: any) {
      console.error('Erro ao atualizar data de entrega:', err);
      setError(err.message || 'Erro ao atualizar data de entrega');
      toast.error('Erro ao atualizar data de entrega');
      return null;
    } finally {
      setLoading(false);
    }
  }, [workflows]);
  
  /**
   * Calcula a data de entrega com base em dias úteis
   */
  const calculateDeliveryDate = (businessDays: number): Date => {
    const date = new Date();
    let daysAdded = 0;
    
    while (daysAdded < businessDays) {
      date.setDate(date.getDate() + 1);
      
      // Pular finais de semana (0 = Domingo, 6 = Sábado)
      if (date.getDay() !== 0 && date.getDay() !== 6) {
        daysAdded++;
      }
    }
    
    return date;
  };
  
  /**
   * Filtra workflows por status
   */
  const filterWorkflowsByStatus = useCallback((status: WorkflowStatus | 'ALL') => {
    if (status === 'ALL') {
      return workflows;
    }
    
    return workflows.filter(w => w.status === status);
  }, [workflows]);
  
  /**
   * Filtra workflows por urgência
   */
  const filterWorkflowsByUrgency = useCallback((urgent: boolean | 'ALL') => {
    if (urgent === 'ALL') {
      return workflows;
    }
    
    return workflows.filter(w => w.is_urgent === urgent);
  }, [workflows]);
  
  /**
   * Filtra workflows por tipo de procedimento
   */
  const filterWorkflowsByProcedureType = useCallback((type: ProcedureType | 'ALL') => {
    if (type === 'ALL') {
      return workflows;
    }
    
    return workflows.filter(w => w.procedure_type === type);
  }, [workflows]);
  
  /**
   * Obtém workflows atrasados
   */
  const getDelayedWorkflows = useCallback(() => {
    const now = new Date();
    
    return workflows.filter(w => {
      // Ignorar workflows concluídos ou cancelados
      if (w.status === 'COMPLETED' || w.status === 'CANCELLED') {
        return false;
      }
      
      // Verificar se a data de entrega já passou
      const deliveryDate = new Date(w.delivery_date);
      return deliveryDate < now;
    });
  }, [workflows]);
  
  /**
   * Obtém workflows que vencem hoje
   */
  const getTodayWorkflows = useCallback(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return workflows.filter(w => {
      // Ignorar workflows concluídos ou cancelados
      if (w.status === 'COMPLETED' || w.status === 'CANCELLED') {
        return false;
      }
      
      // Verificar se a data de entrega é hoje
      const deliveryDate = new Date(w.delivery_date);
      const deliveryDay = new Date(deliveryDate.getFullYear(), deliveryDate.getMonth(), deliveryDate.getDate());
      
      return deliveryDay >= today && deliveryDay < tomorrow;
    });
  }, [workflows]);
  
  return {
    workflows,
    loading,
    error,
    fetchWorkflows,
    createWorkflow,
    updateWorkflowStatus,
    advanceWorkflowStep,
    revertWorkflowStep,
    sendToDentist,
    receiveFromDentist,
    addStepNote,
    updateDeliveryDate,
    filterWorkflowsByStatus,
    filterWorkflowsByUrgency,
    filterWorkflowsByProcedureType,
    getDelayedWorkflows,
    getTodayWorkflows,
    workflowTemplates
  };
}
