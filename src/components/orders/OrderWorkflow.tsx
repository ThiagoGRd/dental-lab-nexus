
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ArrowLeftRight,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase, hasError, safeData } from "@/integrations/supabase/client";
import { updateWorkflow } from "@/utils/orderUtils";

interface WorkflowStep {
  name: string;
  description: string;
  responsible: 'dentist' | 'lab';
  completedAt?: string;
  notes?: string;
}

interface WorkflowProps {
  orderId: string;
  refreshData?: () => void;
}

export default function OrderWorkflow({ orderId, refreshData }: WorkflowProps) {
  const [loading, setLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [workflow, setWorkflow] = useState<{
    id: string;
    templateId: string;
    currentStep: number;
    templateName: string;
    steps: WorkflowStep[];
    history: any[];
    notes: string | null;
  } | null>(null);

  const loadWorkflowData = useCallback(async () => {
    try {
      console.log('Carregando workflow para ordem:', orderId);
      setLoading(true);
      setError(null);

      // Buscar o workflow da ordem atual
      const { data: workflowData, error: workflowError } = await supabase
        .from('workflows')
        .select('*')
        .eq('order_id', orderId)
        .maybeSingle();

      if (workflowError) {
        console.error('Erro ao carregar workflow:', workflowError);
        setError('Não foi possível carregar o fluxo de trabalho.');
        setLoading(false);
        return;
      }

      if (!workflowData) {
        setError('Fluxo de trabalho não encontrado para esta ordem.');
        setLoading(false);
        return;
      }

      console.log('Workflow data carregado:', workflowData);

      // Mock workflow data since we don't have templates yet
      const mockSteps: WorkflowStep[] = [
        {
          name: 'Análise Inicial',
          description: 'Análise dos requisitos do projeto',
          responsible: 'dentist'
        },
        {
          name: 'Desenvolvimento',
          description: 'Desenvolvimento da solução',
          responsible: 'lab'
        },
        {
          name: 'Revisão',
          description: 'Revisão final do trabalho',
          responsible: 'dentist'
        }
      ];

      setWorkflow({
        id: workflowData.id,
        templateId: 'default',
        currentStep: workflowData.progress ? Math.floor(workflowData.progress / 33) : 0,
        templateName: workflowData.name || 'Fluxo Padrão',
        steps: mockSteps,
        history: [],
        notes: workflowData.description
      });
    } catch (error) {
      console.error('Erro ao carregar workflow:', error);
      setError('Ocorreu um erro ao carregar o fluxo de trabalho.');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (orderId) {
      loadWorkflowData();
    }
  }, [orderId, loadWorkflowData]);

  const advanceStep = async () => {
    if (!workflow || workflow.currentStep >= workflow.steps.length - 1) return;

    try {
      setUpdateLoading(true);
      const nextStep = workflow.currentStep + 1;
      const updatedHistory = [...workflow.history, {
        step: workflow.currentStep,
        stepName: workflow.steps[workflow.currentStep].name,
        movedAt: new Date().toISOString(),
        action: 'advance'
      }];

      console.log('Avançando workflow:', {
        id: workflow.id,
        nextStep,
        updatedHistory
      });

      const result = await updateWorkflow(
        workflow.id,
        nextStep
      );

      if (hasError(result)) {
        console.error('Erro ao avançar etapa:', result.error);
        toast.error('Não foi possível avançar para a próxima etapa.');
        return;
      }

      toast.success('Avançado para a próxima etapa com sucesso!');
      
      // Atualizar o workflow localmente
      setWorkflow({
        ...workflow,
        currentStep: nextStep,
        history: updatedHistory
      });
      
      // Atualizar os dados da ordem se houver função de refresh
      if (refreshData) refreshData();
    } catch (error) {
      console.error('Erro ao processar atualização:', error);
      toast.error('Ocorreu um erro ao atualizar o fluxo de trabalho.');
    } finally {
      setUpdateLoading(false);
    }
  };

  const goBackStep = async () => {
    if (!workflow || workflow.currentStep <= 0) return;

    try {
      setUpdateLoading(true);
      const prevStep = workflow.currentStep - 1;
      const updatedHistory = [...workflow.history, {
        step: workflow.currentStep,
        stepName: workflow.steps[workflow.currentStep].name,
        movedAt: new Date().toISOString(),
        action: 'revert'
      }];

      console.log('Retrocedendo workflow:', {
        id: workflow.id,
        prevStep,
        updatedHistory
      });

      const result = await updateWorkflow(
        workflow.id,
        prevStep
      );

      if (hasError(result)) {
        console.error('Erro ao retroceder etapa:', result.error);
        toast.error('Não foi possível retroceder para a etapa anterior.');
        return;
      }

      toast.success('Retornado para a etapa anterior com sucesso!');
      
      // Atualizar o workflow localmente
      setWorkflow({
        ...workflow,
        currentStep: prevStep,
        history: updatedHistory
      });
      
      // Atualizar os dados da ordem se houver função de refresh
      if (refreshData) refreshData();
    } catch (error) {
      console.error('Erro ao processar atualização:', error);
      toast.error('Ocorreu um erro ao atualizar o fluxo de trabalho.');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleRefresh = () => {
    loadWorkflowData();
    toast.info('Atualizando dados do fluxo de trabalho...');
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-dentalblue-600" />
            <div>Carregando fluxo de trabalho...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !workflow) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-500">
            <AlertCircle className="mx-auto h-8 w-8 mb-2" />
            <p>{error || "Fluxo de trabalho não disponível"}</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-4" 
              onClick={handleRefresh}
            >
              <RefreshCw className="mr-2 h-4 w-4" /> Tentar novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center gap-2">
            <ArrowLeftRight className="h-5 w-5" />
            Fluxo de Trabalho: {workflow.templateName}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="relative">
          {/* Barra de progresso */}
          <div className="absolute top-4 left-4 right-4 h-1 bg-gray-200 rounded">
            <div 
              className="absolute top-0 left-0 h-1 bg-dentalblue-600 rounded"
              style={{ 
                width: `${(workflow.currentStep / (workflow.steps.length - 1)) * 100}%`
              }}
            />
          </div>
          
          {/* Etapas */}
          <div className="mt-8 space-y-4">
            {workflow.steps.map((step, index) => (
              <div 
                key={index}
                className={cn(
                  "p-4 border rounded-md",
                  workflow.currentStep === index 
                    ? "border-dentalblue-600 bg-dentalblue-50" 
                    : index < workflow.currentStep
                    ? "border-green-200 bg-green-50"
                    : "border-gray-200"
                )}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    {index < workflow.currentStep ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : workflow.currentStep === index ? (
                      <Clock className="h-5 w-5 text-dentalblue-600" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border border-gray-300 flex items-center justify-center text-xs">
                        {index + 1}
                      </div>
                    )}
                    <span className={cn(
                      "font-medium",
                      workflow.currentStep === index ? "text-dentalblue-800" : ""
                    )}>
                      {step.name}
                    </span>
                  </div>
                  <Badge 
                    variant={step.responsible === 'dentist' ? 'outline' : 'secondary'}
                  >
                    {step.responsible === 'dentist' ? 'Dentista' : 'Laboratório'}
                  </Badge>
                </div>
                {workflow.currentStep === index && (
                  <p className="text-sm text-gray-600 mt-2">{step.description}</p>
                )}
              </div>
            ))}
          </div>
          
          {/* Botões de ação */}
          <div className="mt-6 flex justify-between">
            <Button 
              variant="outline" 
              onClick={goBackStep}
              disabled={workflow.currentStep <= 0 || updateLoading}
            >
              {updateLoading ? (
                <><RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Processando...</>
              ) : (
                <>Etapa Anterior</>
              )}
            </Button>
            <Button 
              onClick={advanceStep}
              disabled={workflow.currentStep >= workflow.steps.length - 1 || updateLoading}
              className="bg-dentalblue-600 hover:bg-dentalblue-700"
            >
              {updateLoading ? (
                <><RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Processando...</>
              ) : (
                <>Próxima Etapa <ArrowRight className="ml-1 h-4 w-4" /></>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
