import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  WorkflowInstance, 
  WorkflowStep, 
  WorkflowStepType, 
  StepStatus,
  ProcedureType
} from '@/types/workflow';
import { 
  ClipboardList, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ArrowRight, 
  Send, 
  RotateCcw,
  Loader2
} from 'lucide-react';

// Mapeamento de cores para status
const statusColors = {
  [StepStatus.PENDING]: 'bg-gray-200 text-gray-700',
  [StepStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-700',
  [StepStatus.COMPLETED]: 'bg-green-100 text-green-700',
  [StepStatus.BLOCKED]: 'bg-red-100 text-red-700',
  [StepStatus.DELAYED]: 'bg-amber-100 text-amber-700'
};

// Mapeamento de ícones para tipos de etapa
const stepIcons = {
  [WorkflowStepType.RECEPTION]: <ClipboardList className="h-5 w-5" />,
  [WorkflowStepType.MODELING]: <ClipboardList className="h-5 w-5" />,
  [WorkflowStepType.CASTING]: <ClipboardList className="h-5 w-5" />,
  [WorkflowStepType.TESTING]: <ClipboardList className="h-5 w-5" />,
  [WorkflowStepType.BAR_CASTING]: <ClipboardList className="h-5 w-5" />,
  [WorkflowStepType.TEETH_MOUNTING]: <ClipboardList className="h-5 w-5" />,
  [WorkflowStepType.ACRYLIZATION]: <ClipboardList className="h-5 w-5" />,
  [WorkflowStepType.FINISHING]: <ClipboardList className="h-5 w-5" />,
  [WorkflowStepType.QUALITY_CONTROL]: <CheckCircle2 className="h-5 w-5" />,
  [WorkflowStepType.SHIPPING]: <Send className="h-5 w-5" />,
  [WorkflowStepType.DENTIST_TESTING]: <Clock className="h-5 w-5" />,
  [WorkflowStepType.RETURNED_FOR_ADJUSTMENTS]: <RotateCcw className="h-5 w-5" />,
  [WorkflowStepType.COMPLETED]: <CheckCircle2 className="h-5 w-5" />
};

// Mapeamento de nomes para tipos de etapa
const stepNames = {
  [WorkflowStepType.RECEPTION]: 'Recepção',
  [WorkflowStepType.MODELING]: 'Modelagem',
  [WorkflowStepType.CASTING]: 'Fundição',
  [WorkflowStepType.TESTING]: 'Prova',
  [WorkflowStepType.BAR_CASTING]: 'Fundição de Barra',
  [WorkflowStepType.TEETH_MOUNTING]: 'Montagem de Dentes',
  [WorkflowStepType.ACRYLIZATION]: 'Acrilização',
  [WorkflowStepType.FINISHING]: 'Acabamento',
  [WorkflowStepType.QUALITY_CONTROL]: 'Controle de Qualidade',
  [WorkflowStepType.SHIPPING]: 'Expedição',
  [WorkflowStepType.DENTIST_TESTING]: 'Em Teste no Dentista',
  [WorkflowStepType.RETURNED_FOR_ADJUSTMENTS]: 'Retornado para Ajustes',
  [WorkflowStepType.COMPLETED]: 'Concluído'
};

// Mapeamento de nomes para tipos de procedimento
const procedureNames = {
  [ProcedureType.TOTAL_PROSTHESIS]: 'Prótese Total',
  [ProcedureType.PARTIAL_REMOVABLE_PROSTHESIS]: 'Prótese Parcial Removível',
  [ProcedureType.IMPLANT_PROTOCOL]: 'Protocolo de Implantes',
  [ProcedureType.PROVISIONAL]: 'Provisório em Resina',
  [ProcedureType.CUSTOM]: 'Personalizado'
};

interface WorkflowStepCardProps {
  step: WorkflowStep;
  isActive: boolean;
  isCompleted: boolean;
}

// Componente para exibir uma etapa do workflow
const WorkflowStepCard: React.FC<WorkflowStepCardProps> = ({ 
  step, 
  isActive,
  isCompleted
}) => {
  return (
    <Card className={`mb-2 ${isActive ? 'border-blue-500 shadow-md' : isCompleted ? 'opacity-70' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`p-2 rounded-full mr-3 ${statusColors[step.status]}`}>
              {stepIcons[step.type]}
            </div>
            <div>
              <h4 className="font-medium">{stepNames[step.type]}</h4>
              {step.assignedTo && (
                <p className="text-sm text-gray-500">Responsável: {step.assignedTo}</p>
              )}
            </div>
          </div>
          <Badge className={statusColors[step.status]}>
            {step.status === StepStatus.PENDING && 'Pendente'}
            {step.status === StepStatus.IN_PROGRESS && 'Em Andamento'}
            {step.status === StepStatus.COMPLETED && 'Concluído'}
            {step.status === StepStatus.BLOCKED && 'Bloqueado'}
            {step.status === StepStatus.DELAYED && 'Atrasado'}
          </Badge>
        </div>
        
        {step.notes && (
          <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
            {step.notes}
          </div>
        )}
        
        {(step.startDate || step.endDate) && (
          <div className="mt-2 text-xs text-gray-500 flex justify-between">
            {step.startDate && (
              <span>Início: {new Date(step.startDate).toLocaleString()}</span>
            )}
            {step.endDate && (
              <span>Fim: {new Date(step.endDate).toLocaleString()}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface WorkflowViewProps {
  workflow: WorkflowInstance;
  loading?: boolean;
  onAdvanceStep?: () => void;
  onSendToDentist?: () => void;
  onReceiveFromDentist?: (feedback: string, requiresAdjustments: boolean) => void;
}

// Componente principal para visualização do workflow
const WorkflowView: React.FC<WorkflowViewProps> = ({
  workflow,
  loading = false,
  onAdvanceStep,
  onSendToDentist,
  onReceiveFromDentist
}) => {
  const currentStep = workflow.steps[workflow.currentStepIndex];
  const isLastStep = workflow.currentStepIndex === workflow.steps.length - 1;
  const isDentistTestingStep = currentStep?.type === WorkflowStepType.DENTIST_TESTING;
  
  // Agrupar etapas por status
  const pendingSteps = workflow.steps.filter(step => step.status === StepStatus.PENDING);
  const inProgressSteps = workflow.steps.filter(step => step.status === StepStatus.IN_PROGRESS);
  const completedSteps = workflow.steps.filter(step => step.status === StepStatus.COMPLETED);
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Fluxo de Trabalho #{workflow.id.substring(0, 8)}</CardTitle>
              <CardDescription>
                {procedureNames[workflow.steps[0].type as unknown as ProcedureType] || 'Procedimento'}
                {workflow.urgent && (
                  <Badge className="ml-2 bg-red-100 text-red-700">URGENTE</Badge>
                )}
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              {workflow.status === 'ACTIVE' && (
                <>
                  {!isDentistTestingStep && !workflow.sentToDentist && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={onSendToDentist}
                      disabled={loading}
                    >
                      <Send className="mr-1 h-4 w-4" />
                      Enviar para Dentista
                    </Button>
                  )}
                  
                  {!isDentistTestingStep && (
                    <Button 
                      onClick={onAdvanceStep}
                      disabled={loading || isLastStep}
                    >
                      {loading ? (
                        <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                      ) : (
                        <ArrowRight className="mr-1 h-4 w-4" />
                      )}
                      {isLastStep ? 'Finalizar' : 'Avançar Etapa'}
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-500 mb-1">
              <span>Início: {new Date(workflow.startDate).toLocaleDateString()}</span>
              <span>
                Previsão: {new Date(workflow.estimatedEndDate).toLocaleDateString()}
                {workflow.actualEndDate && (
                  <> (Concluído: {new Date(workflow.actualEndDate).toLocaleDateString()})</>
                )}
              </span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ 
                  width: `${(completedSteps.length / workflow.steps.length) * 100}%` 
                }}
              ></div>
            </div>
            
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{completedSteps.length} de {workflow.steps.length} etapas concluídas</span>
              <span>{Math.round((completedSteps.length / workflow.steps.length) * 100)}%</span>
            </div>
          </div>
          
          <Tabs defaultValue="current">
            <TabsList className="mb-4">
              <TabsTrigger value="current">Etapa Atual</TabsTrigger>
              <TabsTrigger value="all">Todas as Etapas</TabsTrigger>
              <TabsTrigger value="completed">Concluídas ({completedSteps.length})</TabsTrigger>
              <TabsTrigger value="pending">Pendentes ({pendingSteps.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="current">
              {currentStep && (
                <WorkflowStepCard 
                  step={currentStep} 
                  isActive={true}
                  isCompleted={false}
                />
              )}
            </TabsContent>
            
            <TabsContent value="all">
              <div className="space-y-2">
                {workflow.steps.map((step, index) => (
                  <WorkflowStepCard 
                    key={step.id} 
                    step={step} 
                    isActive={index === workflow.currentStepIndex}
                    isCompleted={index < workflow.currentStepIndex}
                  />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="completed">
              <div className="space-y-2">
                {completedSteps.map(step => (
                  <WorkflowStepCard 
                    key={step.id} 
                    step={step} 
                    isActive={false}
                    isCompleted={true}
                  />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="pending">
              <div className="space-y-2">
                {pendingSteps.map(step => (
                  <WorkflowStepCard 
                    key={step.id} 
                    step={step} 
                    isActive={false}
                    isCompleted={false}
                  />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkflowView;
