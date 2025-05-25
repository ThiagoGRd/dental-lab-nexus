import { useState, useEffect, useCallback } from 'react';
import { 
  WorkflowInstance, 
  WorkflowStep, 
  WorkflowStepType, 
  StepStatus, 
  ProcedureType,
  WorkflowTemplate,
  MaterialUsage
} from '../types/workflow';
import { supabase } from '../integrations/supabase/client';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

// Templates de workflow para diferentes tipos de procedimentos
const workflowTemplates: WorkflowTemplate[] = [
  {
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
    estimatedTotalDuration: 24, // horas
    defaultMaterials: [
      {
        materialId: 'material-acrylic',
        materialName: 'Resina Acrílica',
        quantity: 50,
        unit: 'g',
        automaticDeduction: true
      },
      {
        materialId: 'material-teeth',
        materialName: 'Dentes Artificiais',
        quantity: 14,
        unit: 'unidades',
        automaticDeduction: true
      }
    ]
  },
  {
    id: 'template-ppr',
    name: 'Prótese Parcial Removível',
    procedureType: ProcedureType.PARTIAL_REMOVABLE_PROSTHESIS,
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
    estimatedTotalDuration: 32, // horas
    defaultMaterials: [
      {
        materialId: 'material-metal',
        materialName: 'Liga Metálica',
        quantity: 15,
        unit: 'g',
        automaticDeduction: true
      },
      {
        materialId: 'material-acrylic',
        materialName: 'Resina Acrílica',
        quantity: 30,
        unit: 'g',
        automaticDeduction: true
      }
    ]
  },
  {
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
    estimatedTotalDuration: 40, // horas
    defaultMaterials: [
      {
        materialId: 'material-titanium',
        materialName: 'Barra de Titânio',
        quantity: 1,
        unit: 'unidade',
        automaticDeduction: true
      },
      {
        materialId: 'material-teeth',
        materialName: 'Dentes Artificiais',
        quantity: 12,
        unit: 'unidades',
        automaticDeduction: true
      }
    ]
  },
  {
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
    estimatedTotalDuration: 8, // horas
    defaultMaterials: [
      {
        materialId: 'material-pmma',
        materialName: 'Resina PMMA',
        quantity: 20,
        unit: 'g',
        automaticDeduction: true
      }
    ]
  }
];

export const useWorkflow = (orderId?: string) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [workflow, setWorkflow] = useState<WorkflowInstance | null>(null);
  const [templates, setTemplates] = useState<WorkflowTemplate[]>(workflowTemplates);
  const [currentStep, setCurrentStep] = useState<WorkflowStep | null>(null);
  const [allWorkflows, setAllWorkflows] = useState<WorkflowInstance[]>([]);

  // Carregar workflow específico
  const fetchWorkflow = useCallback(async () => {
    if (!orderId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Em um cenário real, isso buscaria do Supabase
      // Por enquanto, simularemos com dados locais
      const { data, error } = await supabase
        .from('workflows')
        .select('*')
        .eq('order_id', orderId)
        .single();
        
      if (error) {
        console.error('Erro ao buscar workflow:', error);
        setError('Não foi possível carregar o fluxo de trabalho.');
        return;
      }
      
      if (data) {
        const workflowData = JSON.parse(data.workflow_data) as WorkflowInstance;
        setWorkflow(workflowData);
        
        if (workflowData.steps.length > 0 && workflowData.currentStepIndex < workflowData.steps.length) {
          setCurrentStep(workflowData.steps[workflowData.currentStepIndex]);
        }
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
      // Em um cenário real, isso buscaria do Supabase
      const { data, error } = await supabase
        .from('workflows')
        .select('*');
        
      if (error) {
        console.error('Erro ao buscar workflows:', error);
        setError('Não foi possível carregar os fluxos de trabalho.');
        return;
      }
      
      if (data) {
        const workflows = data.map(item => JSON.parse(item.workflow_data) as WorkflowInstance);
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
      // Encontrar template adequado
      const template = templates.find(t => t.procedureType === procedureType);
      
      if (!template) {
        setError('Tipo de procedimento não suportado.');
        return null;
      }
      
      // Usar steps customizados ou do template
      const workflowSteps = customSteps || template.steps;
      
      // Criar steps iniciais
      const steps: WorkflowStep[] = workflowSteps.map((type, index) => ({
        id: uuidv4(),
        type,
        status: index === 0 ? StepStatus.IN_PROGRESS : StepStatus.PENDING,
        startDate: index === 0 ? new Date() : undefined,
        materialsUsed: index === 0 ? template.defaultMaterials : undefined
      }));
      
      // Calcular data estimada de conclusão
      const startDate = new Date();
      const estimatedEndDate = new Date();
      estimatedEndDate.setHours(estimatedEndDate.getHours() + template.estimatedTotalDuration);
      
      // Se for urgente, reduzir o prazo para 3 dias úteis
      if (urgent) {
        estimatedEndDate.setDate(estimatedEndDate.getDate() + 3);
      }
      
      // Criar instância de workflow
      const newWorkflow: WorkflowInstance = {
        id: uuidv4(),
        orderId,
        templateId: template.id,
        currentStepIndex: 0,
        steps,
        startDate,
        estimatedEndDate,
        status: 'ACTIVE',
        urgent,
        sentToDentist: false
      };
      
      // Em um cenário real, salvaríamos no Supabase
      const { error: saveError } = await supabase
        .from('workflows')
        .insert({
          order_id: orderId,
          workflow_data: JSON.stringify(newWorkflow)
        });
        
      if (saveError) {
        console.error('Erro ao salvar workflow:', saveError);
        setError('Não foi possível salvar o fluxo de trabalho.');
        return null;
      }
      
      setWorkflow(newWorkflow);
      setCurrentStep(steps[0]);
      
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
      // Atualizar etapa atual
      const updatedSteps = [...workflow.steps];
      const currentStepIndex = workflow.currentStepIndex;
      
      // Finalizar etapa atual
      updatedSteps[currentStepIndex] = {
        ...updatedSteps[currentStepIndex],
        status: StepStatus.COMPLETED,
        endDate: new Date(),
        notes: notes || updatedSteps[currentStepIndex].notes,
        materialsUsed: materialsUsed || updatedSteps[currentStepIndex].materialsUsed
      };
      
      // Verificar se há próxima etapa
      if (currentStepIndex + 1 >= updatedSteps.length) {
        // Finalizar workflow
        const updatedWorkflow: WorkflowInstance = {
          ...workflow,
          steps: updatedSteps,
          status: 'COMPLETED',
          actualEndDate: new Date()
        };
        
        // Em um cenário real, atualizaríamos no Supabase
        const { error: updateError } = await supabase
          .from('workflows')
          .update({
            workflow_data: JSON.stringify(updatedWorkflow)
          })
          .eq('order_id', workflow.orderId);
          
        if (updateError) {
          console.error('Erro ao atualizar workflow:', updateError);
          setError('Não foi possível atualizar o fluxo de trabalho.');
          return false;
        }
        
        setWorkflow(updatedWorkflow);
        setCurrentStep(null);
        
        toast.success('Fluxo de trabalho concluído com sucesso!');
        return true;
      }
      
      // Iniciar próxima etapa
      updatedSteps[currentStepIndex + 1] = {
        ...updatedSteps[currentStepIndex + 1],
        status: StepStatus.IN_PROGRESS,
        startDate: new Date()
      };
      
      const updatedWorkflow: WorkflowInstance = {
        ...workflow,
        steps: updatedSteps,
        currentStepIndex: currentStepIndex + 1
      };
      
      // Em um cenário real, atualizaríamos no Supabase
      const { error: updateError } = await supabase
        .from('workflows')
        .update({
          workflow_data: JSON.stringify(updatedWorkflow)
        })
        .eq('order_id', workflow.orderId);
        
      if (updateError) {
        console.error('Erro ao atualizar workflow:', updateError);
        setError('Não foi possível atualizar o fluxo de trabalho.');
        return false;
      }
      
      setWorkflow(updatedWorkflow);
      setCurrentStep(updatedSteps[currentStepIndex + 1]);
      
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
      // Verificar se já está com o dentista
      if (workflow.sentToDentist) {
        setError('Este trabalho já foi enviado para o dentista.');
        return false;
      }
      
      // Atualizar etapa atual para DENTIST_TESTING
      const updatedSteps = [...workflow.steps];
      const currentStepIndex = workflow.currentStepIndex;
      
      // Finalizar etapa atual
      updatedSteps[currentStepIndex] = {
        ...updatedSteps[currentStepIndex],
        status: StepStatus.COMPLETED,
        endDate: new Date(),
        notes: notes || updatedSteps[currentStepIndex].notes
      };
      
      // Adicionar etapa de teste no dentista
      const dentistTestingStep: WorkflowStep = {
        id: uuidv4(),
        type: WorkflowStepType.DENTIST_TESTING,
        status: StepStatus.IN_PROGRESS,
        startDate: new Date(),
        notes: 'Enviado para teste no dentista'
      };
      
      // Inserir nova etapa após a atual
      updatedSteps.splice(currentStepIndex + 1, 0, dentistTestingStep);
      
      const updatedWorkflow: WorkflowInstance = {
        ...workflow,
        steps: updatedSteps,
        currentStepIndex: currentStepIndex + 1,
        sentToDentist: true
      };
      
      // Em um cenário real, atualizaríamos no Supabase
      const { error: updateError } = await supabase
        .from('workflows')
        .update({
          workflow_data: JSON.stringify(updatedWorkflow)
        })
        .eq('order_id', workflow.orderId);
        
      if (updateError) {
        console.error('Erro ao atualizar workflow:', updateError);
        setError('Não foi possível atualizar o fluxo de trabalho.');
        return false;
      }
      
      setWorkflow(updatedWorkflow);
      setCurrentStep(dentistTestingStep);
      
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
      // Verificar se está com o dentista
      if (!workflow.sentToDentist) {
        setError('Este trabalho não foi enviado para o dentista.');
        return false;
      }
      
      // Atualizar etapa atual
      const updatedSteps = [...workflow.steps];
      const currentStepIndex = workflow.currentStepIndex;
      
      // Finalizar etapa de teste no dentista
      updatedSteps[currentStepIndex] = {
        ...updatedSteps[currentStepIndex],
        status: StepStatus.COMPLETED,
        endDate: new Date(),
        notes: `Feedback do dentista: ${feedback}`
      };
      
      let nextStepIndex = currentStepIndex + 1;
      
      // Se precisa de ajustes, adicionar etapa de ajustes
      if (requiresAdjustments) {
        const adjustmentStep: WorkflowStep = {
          id: uuidv4(),
          type: WorkflowStepType.RETURNED_FOR_ADJUSTMENTS,
          status: StepStatus.IN_PROGRESS,
          startDate: new Date(),
          notes: `Ajustes necessários: ${feedback}`
        };
        
        // Inserir etapa de ajustes
        updatedSteps.splice(nextStepIndex, 0, adjustmentStep);
      } else {
        // Se não precisa de ajustes, iniciar próxima etapa normal
        if (nextStepIndex < updatedSteps.length) {
          updatedSteps[nextStepIndex] = {
            ...updatedSteps[nextStepIndex],
            status: StepStatus.IN_PROGRESS,
            startDate: new Date()
          };
        }
      }
      
      const updatedWorkflow: WorkflowInstance = {
        ...workflow,
        steps: updatedSteps,
        currentStepIndex: nextStepIndex,
        sentToDentist: false,
        dentistFeedback: feedback,
        returnedFromDentist: new Date()
      };
      
      // Em um cenário real, atualizaríamos no Supabase
      const { error: updateError } = await supabase
        .from('workflows')
        .update({
          workflow_data: JSON.stringify(updatedWorkflow)
        })
        .eq('order_id', workflow.orderId);
        
      if (updateError) {
        console.error('Erro ao atualizar workflow:', updateError);
        setError('Não foi possível atualizar o fluxo de trabalho.');
        return false;
      }
      
      setWorkflow(updatedWorkflow);
      setCurrentStep(updatedSteps[nextStepIndex]);
      
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
