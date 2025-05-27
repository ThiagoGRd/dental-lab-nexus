
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft,
  Plus,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Workflow,
  PlayCircle,
  PauseCircle,
  Settings
} from 'lucide-react';
import { ModernCard } from '@/components/ui/modern-card';
import { StatCard } from '@/components/ui/stat-card';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface WorkflowData {
  id: string;
  order_id: string;
  template_id: string;
  current_step: number;
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  notes: string | null;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  estimated_completion: string | null;
  actual_completion: string | null;
  order?: {
    id: string;
    status: string;
    priority: string;
    clients: {
      name: string;
    };
  };
}

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  steps: string[];
  estimated_duration: number;
}

const defaultTemplates: WorkflowTemplate[] = [
  {
    id: 'template-1',
    name: 'Prótese Total',
    description: 'Fluxo completo para prótese total',
    steps: ['Recepção', 'Modelagem', 'Montagem de Dentes', 'Teste', 'Acrilização', 'Acabamento', 'Controle de Qualidade', 'Expedição'],
    estimated_duration: 5
  },
  {
    id: 'template-2',
    name: 'Prótese Parcial',
    description: 'Fluxo para prótese parcial removível',
    steps: ['Recepção', 'Modelagem', 'Fundição', 'Teste', 'Montagem', 'Acabamento', 'Controle de Qualidade', 'Expedição'],
    estimated_duration: 7
  },
  {
    id: 'template-3',
    name: 'Protocolo de Implantes',
    description: 'Fluxo para protocolo sobre implantes',
    steps: ['Recepção', 'Modelagem', 'Fundição da Barra', 'Teste', 'Montagem', 'Acabamento', 'Controle de Qualidade', 'Expedição'],
    estimated_duration: 10
  }
];

export default function WorkflowsPageNew() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [workflows, setWorkflows] = useState<WorkflowData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Carregar workflows
  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('order_workflows')
        .select(`
          *,
          orders!inner(
            id,
            status,
            priority,
            clients!inner(name)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar workflows:', error);
        toast.error('Erro ao carregar workflows');
        return;
      }

      setWorkflows(data || []);
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast.error('Erro inesperado ao carregar workflows');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, []);

  // Filtrar workflows
  const filteredWorkflows = workflows.filter(workflow => {
    const matchesSearch = searchTerm === '' || 
      workflow.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workflow.order?.clients?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || workflow.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || workflow.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Agrupar workflows por status
  const activeWorkflows = filteredWorkflows.filter(w => w.status === 'active');
  const pausedWorkflows = filteredWorkflows.filter(w => w.status === 'paused');
  const completedWorkflows = filteredWorkflows.filter(w => w.status === 'completed');
  const urgentWorkflows = filteredWorkflows.filter(w => w.priority === 'urgent' && w.status === 'active');

  // Calcular estatísticas
  const totalWorkflows = workflows.length;
  const completionRate = totalWorkflows > 0 ? Math.round((completedWorkflows.length / totalWorkflows) * 100) : 0;
  const averageSteps = workflows.length > 0 ? Math.round(workflows.reduce((acc, w) => acc + w.current_step, 0) / workflows.length) : 0;

  const handleCreateWorkflow = () => {
    toast.info('Funcionalidade de criação de workflow em desenvolvimento');
  };

  const handleViewWorkflow = (workflowId: string) => {
    navigate(`/workflows/${workflowId}`);
  };

  const handleRefresh = () => {
    fetchWorkflows();
    toast.success('Workflows atualizados!');
  };

  // Se estiver visualizando um workflow específico
  if (id) {
    const workflow = workflows.find(w => w.id === id);
    
    if (!workflow) {
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
            <h1 className="text-2xl font-bold">Workflow não encontrado</h1>
          </div>
          
          <ModernCard>
            <div className="p-6 text-center">
              <AlertTriangle className="mx-auto h-12 w-12 text-amber-500 mb-4" />
              <p className="text-gray-600">O workflow solicitado não foi encontrado.</p>
              <Button 
                className="mt-4" 
                onClick={() => navigate('/workflows')}
              >
                Voltar aos Workflows
              </Button>
            </div>
          </ModernCard>
        </div>
      );
    }

    return <WorkflowDetail workflow={workflow} onBack={() => navigate('/workflows')} />;
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-dentalblue-800 flex items-center gap-2">
            <Workflow className="h-8 w-8" />
            Fluxos de Trabalho
          </h1>
          <p className="text-gray-600">
            Gerencie e monitore todos os fluxos de trabalho do laboratório
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          
          <Button onClick={handleCreateWorkflow}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Workflow
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total de Workflows"
          value={totalWorkflows}
          icon={Workflow}
          variant="default"
        />
        <StatCard
          title="Ativos"
          value={activeWorkflows.length}
          icon={PlayCircle}
          variant="primary"
        />
        <StatCard
          title="Urgentes"
          value={urgentWorkflows.length}
          icon={AlertTriangle}
          variant="warning"
        />
        <StatCard
          title="Taxa de Conclusão"
          value={`${completionRate}%`}
          icon={CheckCircle2}
          variant="success"
        />
      </div>

      {/* Filtros */}
      <ModernCard padding="md">
        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Buscar por ID da ordem ou cliente..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Status</SelectItem>
              <SelectItem value="active">Ativo</SelectItem>
              <SelectItem value="paused">Pausado</SelectItem>
              <SelectItem value="completed">Concluído</SelectItem>
              <SelectItem value="cancelled">Cancelado</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Prioridade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Prioridades</SelectItem>
              <SelectItem value="low">Baixa</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="high">Alta</SelectItem>
              <SelectItem value="urgent">Urgente</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </ModernCard>

      {/* Lista de Workflows */}
      {loading ? (
        <ModernCard>
          <div className="p-12 text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-dentalblue-600" />
            <p>Carregando workflows...</p>
          </div>
        </ModernCard>
      ) : (
        <Tabs defaultValue="active" className="space-y-4">
          <TabsList>
            <TabsTrigger value="active">
              Ativos ({activeWorkflows.length})
            </TabsTrigger>
            <TabsTrigger value="urgent">
              Urgentes ({urgentWorkflows.length})
            </TabsTrigger>
            <TabsTrigger value="paused">
              Pausados ({pausedWorkflows.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Concluídos ({completedWorkflows.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="active">
            <WorkflowList workflows={activeWorkflows} onView={handleViewWorkflow} />
          </TabsContent>
          
          <TabsContent value="urgent">
            <WorkflowList workflows={urgentWorkflows} onView={handleViewWorkflow} />
          </TabsContent>
          
          <TabsContent value="paused">
            <WorkflowList workflows={pausedWorkflows} onView={handleViewWorkflow} />
          </TabsContent>
          
          <TabsContent value="completed">
            <WorkflowList workflows={completedWorkflows} onView={handleViewWorkflow} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

// Componente para lista de workflows
interface WorkflowListProps {
  workflows: WorkflowData[];
  onView: (id: string) => void;
}

function WorkflowList({ workflows, onView }: WorkflowListProps) {
  if (workflows.length === 0) {
    return (
      <ModernCard>
        <div className="p-12 text-center text-gray-500">
          <Workflow className="mx-auto h-12 w-12 mb-4 opacity-50" />
          <p>Nenhum workflow encontrado</p>
        </div>
      </ModernCard>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {workflows.map((workflow) => (
        <WorkflowCard key={workflow.id} workflow={workflow} onView={onView} />
      ))}
    </div>
  );
}

// Componente para card de workflow
interface WorkflowCardProps {
  workflow: WorkflowData;
  onView: (id: string) => void;
}

function WorkflowCard({ workflow, onView }: WorkflowCardProps) {
  const template = defaultTemplates.find(t => t.id === workflow.template_id) || defaultTemplates[0];
  const progress = Math.round((workflow.current_step / template.steps.length) * 100);
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'paused': return 'bg-yellow-100 text-yellow-700';
      case 'completed': return 'bg-blue-100 text-blue-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-700';
      case 'high': return 'bg-orange-100 text-orange-700';
      case 'normal': return 'bg-blue-100 text-blue-700';
      case 'low': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <ModernCard 
      variant="elevated" 
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => onView(workflow.id)}
    >
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-lg">Ordem #{workflow.order_id.substring(0, 8)}</h3>
            <p className="text-sm text-gray-600">{template.name}</p>
            <p className="text-xs text-gray-500">
              Cliente: {workflow.order?.clients?.name || 'N/A'}
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <Badge className={getStatusColor(workflow.status)}>
              {workflow.status === 'active' ? 'Ativo' : 
               workflow.status === 'paused' ? 'Pausado' :
               workflow.status === 'completed' ? 'Concluído' : 'Cancelado'}
            </Badge>
            <Badge className={getPriorityColor(workflow.priority)}>
              {workflow.priority === 'urgent' ? 'Urgente' :
               workflow.priority === 'high' ? 'Alta' :
               workflow.priority === 'normal' ? 'Normal' : 'Baixa'}
            </Badge>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Progresso</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-dentalblue-600 h-2 rounded-full transition-all" 
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Etapa {workflow.current_step} de {template.steps.length}</span>
            <span>{template.steps[workflow.current_step - 1] || 'Início'}</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Criado: {new Date(workflow.created_at).toLocaleDateString()}</span>
          <span className="flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            ~{template.estimated_duration} dias
          </span>
        </div>
      </div>
    </ModernCard>
  );
}

// Componente para detalhes do workflow
interface WorkflowDetailProps {
  workflow: WorkflowData;
  onBack: () => void;
}

function WorkflowDetail({ workflow, onBack }: WorkflowDetailProps) {
  const template = defaultTemplates.find(t => t.id === workflow.template_id) || defaultTemplates[0];
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center mb-6">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onBack}
          className="mr-4"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Voltar
        </Button>
        <h1 className="text-2xl font-bold">
          Workflow - Ordem #{workflow.order_id.substring(0, 8)}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ModernCard variant="elevated">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Etapas do Processo</h3>
                <div className="space-y-3">
                  {template.steps.map((step, index) => (
                    <div 
                      key={index}
                      className={`p-3 rounded-lg border ${
                        index < workflow.current_step 
                          ? 'bg-green-50 border-green-200' 
                          : index === workflow.current_step
                          ? 'bg-blue-50 border-blue-200'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {index < workflow.current_step ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : index === workflow.current_step ? (
                          <Clock className="h-5 w-5 text-blue-600" />
                        ) : (
                          <div className="h-5 w-5 rounded-full border border-gray-300 flex items-center justify-center text-xs">
                            {index + 1}
                          </div>
                        )}
                        <span className={`font-medium ${
                          index === workflow.current_step ? 'text-blue-800' : ''
                        }`}>
                          {step}
                        </span>
                        {index === workflow.current_step && (
                          <Badge className="bg-blue-100 text-blue-700 ml-auto">
                            Em Andamento
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ModernCard>
        </div>

        <div>
          <ModernCard variant="elevated">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Informações do Workflow</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">Template</label>
                  <p className="text-sm">{template.name}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Cliente</label>
                  <p className="text-sm">{workflow.order?.clients?.name || 'N/A'}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <Badge className="mt-1">
                    {workflow.status === 'active' ? 'Ativo' : 
                     workflow.status === 'paused' ? 'Pausado' :
                     workflow.status === 'completed' ? 'Concluído' : 'Cancelado'}
                  </Badge>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Prioridade</label>
                  <Badge className="mt-1">
                    {workflow.priority === 'urgent' ? 'Urgente' :
                     workflow.priority === 'high' ? 'Alta' :
                     workflow.priority === 'normal' ? 'Normal' : 'Baixa'}
                  </Badge>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Progresso</label>
                  <div className="mt-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span>{workflow.current_step} de {template.steps.length} etapas</span>
                      <span>{Math.round((workflow.current_step / template.steps.length) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-dentalblue-600 h-2 rounded-full" 
                        style={{ width: `${(workflow.current_step / template.steps.length) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Criado em</label>
                  <p className="text-sm">{new Date(workflow.created_at).toLocaleString()}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Última atualização</label>
                  <p className="text-sm">{new Date(workflow.updated_at).toLocaleString()}</p>
                </div>
              </div>

              <div className="pt-4 space-y-2">
                <Button className="w-full" disabled>
                  <PlayCircle className="mr-2 h-4 w-4" />
                  Avançar Etapa
                </Button>
                <Button variant="outline" className="w-full" disabled>
                  <PauseCircle className="mr-2 h-4 w-4" />
                  Pausar Workflow
                </Button>
                <Button variant="outline" className="w-full" disabled>
                  <Settings className="mr-2 h-4 w-4" />
                  Configurações
                </Button>
              </div>
              
              <p className="text-xs text-gray-500 text-center">
                Funcionalidades de controle em desenvolvimento
              </p>
            </div>
          </ModernCard>
        </div>
      </div>
    </div>
  );
}
