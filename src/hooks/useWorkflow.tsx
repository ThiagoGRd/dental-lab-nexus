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
      // Usar a tabela order_workflows que existe
      const { data, error } = await supabase
        .from('order_workflows')
        .select('*')
        .eq('order_id', orderId)
        .single();
        
      if (error) {
        console.error('Erro ao buscar workflow:', error);
        setError('Não foi possível carregar o fluxo de trabalho.');
        return;
      }
      
      if (data) {
        // Simular dados de workflow baseado nos dados da tabela
        const mockWorkflow: WorkflowInstance = {
          id: data.id,
          orderId: data.order_id,
          templateId: data.template_id,
          currentStepIndex: data.current_step,
          steps: [],
          startDate: new Date(data.created_at),
          estimatedEndDate: new Date(),
          status: 'ACTIVE',
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
      // Usar a tabela order_workflows que existe
      const { data, error } = await supabase
        .from('order_workflows')
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
          orderId: item.order_id,
          templateId: item.template_id,
          currentStepIndex: item.current_step,
          steps: [],
          startDate: new Date(item.created_at),
          estimatedEndDate: new Date(),
          status: 'ACTIVE',
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
      // Encontrar template adequado
      const template = templates.find(t => t.procedureType === procedureType);
      
      if (!template) {
        setError('Tipo de procedimento não suportado.');
        return null;
      }

      // Salvar na tabela order_workflows
      const { data, error: saveError } = await supabase
        .from('order_workflows')
        .insert({
          order_id: orderId,
          template_id: template.id,
          current_step: 0,
          notes: `Workflow criado para ${template.name}`
        })
        .select()
        .single();
        
      if (saveError) {
        console.error('Erro ao salvar workflow:', saveError);
        setError('Não foi possível salvar o fluxo de trabalho.');
        return null;
      }
      
      // Criar instância de workflow mock
      const newWorkflow: WorkflowInstance = {
        id: data.id,
        orderId,
        templateId: template.id,
        currentStepIndex: 0,
        steps: [],
        startDate: new Date(),
        estimatedEndDate: new Date(),
        status: 'ACTIVE',
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
      // Atualizar na tabela order_workflows
      const { error: updateError } = await supabase
        .from('order_workflows')
        .update({
          current_step: workflow.currentStepIndex + 1,
          notes: notes || 'Avançado para próxima etapa'
        })
        .eq('order_id', workflow.orderId);
        
      if (updateError) {
        console.error('Erro ao atualizar workflow:', updateError);
        setError('Não foi possível atualizar o fluxo de trabalho.');
        return false;
      }
      
      // Atualizar estado local
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
