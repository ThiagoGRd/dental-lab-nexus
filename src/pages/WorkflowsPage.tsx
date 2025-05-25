import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  ClipboardList, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  ArrowLeft,
  Plus,
  Search,
  Filter
} from 'lucide-react';
import WorkflowView from '@/components/production-workflow/WorkflowView';
import useWorkflow from '@/hooks/useWorkflow';
import { WorkflowInstance, StepStatus } from '@/types/workflow';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const WorkflowsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDentistDialog, setShowDentistDialog] = useState(false);
  const [dentistFeedback, setDentistFeedback] = useState('');
  const [requiresAdjustments, setRequiresAdjustments] = useState(false);
  
  const { 
    loading, 
    error, 
    workflow, 
    allWorkflows, 
    advanceToNextStep, 
    sendToDentist, 
    receiveFromDentist 
  } = useWorkflow(id);

  // Filtrar workflows
  const filteredWorkflows = allWorkflows.filter(wf => {
    const matchesSearch = searchTerm === '' || 
      wf.orderId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && wf.status === 'ACTIVE') ||
      (statusFilter === 'completed' && wf.status === 'COMPLETED') ||
      (statusFilter === 'urgent' && wf.urgent);
    
    return matchesSearch && matchesStatus;
  });

  // Agrupar workflows por status
  const urgentWorkflows = filteredWorkflows.filter(wf => wf.urgent && wf.status === 'ACTIVE');
  const activeWorkflows = filteredWorkflows.filter(wf => wf.status === 'ACTIVE' && !wf.urgent);
  const completedWorkflows = filteredWorkflows.filter(wf => wf.status === 'COMPLETED');

  // Handlers
  const handleAdvanceStep = async () => {
    if (workflow) {
      await advanceToNextStep();
    }
  };

  const handleSendToDentist = async () => {
    if (workflow) {
      await sendToDentist();
    }
  };

  const handleReceiveFromDentist = async () => {
    if (workflow) {
      await receiveFromDentist(dentistFeedback, requiresAdjustments);
      setShowDentistDialog(false);
      setDentistFeedback('');
      setRequiresAdjustments(false);
    }
  };

  // Renderizar detalhes de um workflow específico
  if (id && workflow) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center mb-6">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/workflows')}
            className="mr-4"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold">Detalhes do Fluxo de Trabalho</h1>
        </div>

        {error ? (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center text-red-500">
                <AlertTriangle className="mr-2 h-5 w-5" />
                <p>{error}</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <WorkflowView 
              workflow={workflow}
              loading={loading}
              onAdvanceStep={handleAdvanceStep}
              onSendToDentist={handleSendToDentist}
              onReceiveFromDentist={(feedback, requiresAdjustments) => {
                setDentistFeedback(feedback);
                setRequiresAdjustments(requiresAdjustments);
                setShowDentistDialog(true);
              }}
            />

            {/* Dialog para receber feedback do dentista */}
            <Dialog open={showDentistDialog} onOpenChange={setShowDentistDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Feedback do Dentista</DialogTitle>
                  <DialogDescription>
                    Registre o feedback do dentista e indique se são necessários ajustes.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <Textarea
                    placeholder="Descreva o feedback do dentista..."
                    value={dentistFeedback}
                    onChange={(e) => setDentistFeedback(e.target.value)}
                    className="min-h-[100px]"
                  />
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="requires-adjustments"
                      checked={requiresAdjustments}
                      onCheckedChange={setRequiresAdjustments}
                    />
                    <Label htmlFor="requires-adjustments">
                      Necessita de ajustes
                    </Label>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowDentistDialog(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleReceiveFromDentist}>
                    Registrar Feedback
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        )}
      </div>
    );
  }

  // Renderizar lista de workflows
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Fluxos de Trabalho</h1>
        <Button>
          <Plus className="mr-1 h-4 w-4" />
          Novo Fluxo de Trabalho
        </Button>
      </div>

      <div className="flex items-center space-x-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Buscar por ID da ordem..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <div className="flex items-center">
              <Filter className="mr-1 h-4 w-4" />
              <SelectValue placeholder="Filtrar por status" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Ativos</SelectItem>
            <SelectItem value="completed">Concluídos</SelectItem>
            <SelectItem value="urgent">Urgentes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {error ? (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center text-red-500">
              <AlertTriangle className="mr-2 h-5 w-5" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="urgent">
          <TabsList className="mb-4">
            <TabsTrigger value="urgent">
              Urgentes ({urgentWorkflows.length})
            </TabsTrigger>
            <TabsTrigger value="active">
              Ativos ({activeWorkflows.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Concluídos ({completedWorkflows.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="urgent">
            {urgentWorkflows.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-gray-500">
                  Não há fluxos de trabalho urgentes.
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {urgentWorkflows.map((wf) => (
                  <WorkflowCard key={wf.id} workflow={wf} />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="active">
            {activeWorkflows.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-gray-500">
                  Não há fluxos de trabalho ativos.
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeWorkflows.map((wf) => (
                  <WorkflowCard key={wf.id} workflow={wf} />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="completed">
            {completedWorkflows.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-gray-500">
                  Não há fluxos de trabalho concluídos.
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {completedWorkflows.map((wf) => (
                  <WorkflowCard key={wf.id} workflow={wf} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

// Componente de card para exibir um workflow na lista
const WorkflowCard: React.FC<{ workflow: WorkflowInstance }> = ({ workflow }) => {
  const navigate = useNavigate();
  const currentStep = workflow.steps[workflow.currentStepIndex];
  
  // Calcular progresso
  const completedSteps = workflow.steps.filter(step => step.status === StepStatus.COMPLETED);
  const progress = Math.round((completedSteps.length / workflow.steps.length) * 100);
  
  // Verificar se está atrasado
  const isLate = workflow.estimatedEndDate && new Date() > new Date(workflow.estimatedEndDate);
  
  return (
    <Card 
      className={`cursor-pointer hover:shadow-md transition-shadow ${
        workflow.urgent ? 'border-red-500' : ''
      }`}
      onClick={() => navigate(`/workflows/${workflow.id}`)}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">Ordem #{workflow.orderId.substring(0, 8)}</CardTitle>
            <CardDescription>
              Iniciado em {new Date(workflow.startDate).toLocaleDateString()}
            </CardDescription>
          </div>
          {workflow.urgent && (
            <Badge className="bg-red-100 text-red-700">URGENTE</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium">Progresso</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  isLate ? 'bg-red-600' : 'bg-blue-600'
                }`}
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className={`p-1.5 rounded-full mr-2 ${
              currentStep.status === StepStatus.IN_PROGRESS 
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700'
            }`}>
              {currentStep.status === StepStatus.IN_PROGRESS ? (
                <Clock className="h-4 w-4" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium">
                {currentStep.type === 'DENTIST_TESTING' 
                  ? 'Em Teste no Dentista'
                  : currentStep.type === 'RETURNED_FOR_ADJUSTMENTS'
                  ? 'Retornado para Ajustes'
                  : currentStep.type}
              </p>
              {currentStep.assignedTo && (
                <p className="text-xs text-gray-500">
                  Responsável: {currentStep.assignedTo}
                </p>
              )}
            </div>
          </div>
          
          <Separator />
          
          <div className="flex justify-between text-sm text-gray-500">
            <span>
              {completedSteps.length} de {workflow.steps.length} etapas
            </span>
            <span>
              {isLate ? (
                <span className="text-red-500 flex items-center">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Atrasado
                </span>
              ) : (
                <span>
                  Previsão: {new Date(workflow.estimatedEndDate).toLocaleDateString()}
                </span>
              )}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkflowsPage;
