
import React, { useState, useEffect } from 'react';
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
  ArrowLeftRight 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from "@/integrations/supabase/client";

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

  useEffect(() => {
    loadWorkflowData();
  }, [orderId]);

  const loadWorkflowData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar o workflow da ordem atual
      const { data: workflowData, error: workflowError } = await supabase
        .from('order_workflows')
        .select(`
          id, 
          template_id,
          current_step,
          history,
          notes,
          workflow_templates:template_id (
            name,
            steps
          )
        `)
        .eq('order_id', orderId)
        .single();

      if (workflowError) {
        console.error('Erro ao carregar workflow:', workflowError);
        setError('Não foi possível carregar o fluxo de trabalho.');
        return;
      }

      if (!workflowData) {
        setError('Fluxo de trabalho não encontrado para esta ordem.');
        return;
      }

      // Formatar os dados - corrigindo o problema de tipo
      const steps = workflowData.workflow_templates.steps as unknown as WorkflowStep[];
      const history = workflowData.history ? (workflowData.history as unknown as any[]) : [];

      setWorkflow({
        id: workflowData.id,
        templateId: workflowData.template_id,
        currentStep: workflowData.current_step,
        templateName: workflowData.workflow_templates.name,
        steps,
        history,
        notes: workflowData.notes
      });
    } catch (error) {
      console.error('Erro ao carregar workflow:', error);
      setError('Ocorreu um erro ao carregar o fluxo de trabalho.');
    } finally {
      setLoading(false);
    }
  };

  const advanceStep = async () => {
    if (!workflow || workflow.currentStep >= workflow.steps.length - 1) return;

    try {
      const nextStep = workflow.currentStep + 1;
      const updatedHistory = [...workflow.history, {
        step: workflow.currentStep,
        stepName: workflow.steps[workflow.currentStep].name,
        movedAt: new Date().toISOString(),
        action: 'advance'
      }];

      const { error } = await supabase
        .from('order_workflows')
        .update({
          current_step: nextStep,
          history: updatedHistory,
          updated_at: new Date().toISOString()
        })
        .eq('id', workflow.id);

      if (error) {
        console.error('Erro ao avançar etapa:', error);
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
    }
  };

  const goBackStep = async () => {
    if (!workflow || workflow.currentStep <= 0) return;

    try {
      const prevStep = workflow.currentStep - 1;
      const updatedHistory = [...workflow.history, {
        step: workflow.currentStep,
        stepName: workflow.steps[workflow.currentStep].name,
        movedAt: new Date().toISOString(),
        action: 'revert'
      }];

      const { error } = await supabase
        .from('order_workflows')
        .update({
          current_step: prevStep,
          history: updatedHistory,
          updated_at: new Date().toISOString()
        })
        .eq('id', workflow.id);

      if (error) {
        console.error('Erro ao retroceder etapa:', error);
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
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Carregando fluxo de trabalho...</div>
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
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <ArrowLeftRight className="h-5 w-5" />
          Fluxo de Trabalho: {workflow.templateName}
        </CardTitle>
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
              disabled={workflow.currentStep <= 0}
            >
              Etapa Anterior
            </Button>
            <Button 
              onClick={advanceStep}
              disabled={workflow.currentStep >= workflow.steps.length - 1}
              className="bg-dentalblue-600 hover:bg-dentalblue-700"
            >
              Próxima Etapa <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
