
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardHeader,
  CardTitle,
  CardDescription, 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Workflow, Check, Pencil, Plus, Settings, Users, ArrowLeftRight } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Tipo para representar um template de fluxo de trabalho
interface WorkflowTemplate {
  id: string;
  name: string;
  description: string | null;
  steps: WorkflowStep[];
  created_at: string;
  updated_at: string;
}

// Tipo para uma etapa do fluxo de trabalho
interface WorkflowStep {
  name: string;
  description: string;
  responsible: 'dentist' | 'lab';
}

// Tipo para ordens de serviço com workflow
interface OrderWithWorkflow {
  id: string;
  client: string;
  service: string;
  patientName: string | null;
  dueDate: string | null;
  currentStep: number;
  status: string;
  workflowName: string;
  totalSteps: number;
  isUrgent: boolean;
}

export default function WorkflowsPage() {
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [activeOrders, setActiveOrders] = useState<OrderWithWorkflow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Carregar templates de workflow
      const { data: templatesData, error: templatesError } = await supabase
        .from('workflow_templates')
        .select('*')
        .order('name');

      if (templatesError) {
        console.error('Erro ao carregar templates:', templatesError);
        toast.error('Não foi possível carregar os templates de fluxo de trabalho.');
      } else if (templatesData) {
        // Corrigi o tipo dos steps no template
        const formattedTemplates = templatesData.map(template => ({
          ...template,
          steps: template.steps as unknown as WorkflowStep[]
        }));
        setTemplates(formattedTemplates);
      }

      // Carregar ordens com workflows ativos
      const { data: workflowsData, error: workflowsError } = await supabase
        .from('order_workflows')
        .select(`
          id,
          current_step,
          order_id,
          workflow_templates:template_id (name, steps)
        `)
        .order('updated_at', { ascending: false })
        .limit(50);

      if (workflowsError) {
        console.error('Erro ao carregar workflows:', workflowsError);
        toast.error('Não foi possível carregar os workflows ativos.');
        setLoading(false);
        return;
      }

      if (!workflowsData || workflowsData.length === 0) {
        setActiveOrders([]);
        setLoading(false);
        return;
      }

      // Extrair IDs de ordem para busca
      const orderIds = workflowsData.map(wf => wf.order_id);

      // Buscar detalhes das ordens
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id,
          client_id,
          deadline,
          status,
          priority,
          notes
        `)
        .in('id', orderIds);

      if (ordersError) {
        console.error('Erro ao carregar ordens:', ordersError);
        toast.error('Não foi possível carregar detalhes das ordens.');
        setLoading(false);
        return;
      }

      // Buscar clientes e serviços para completar informações
      const clientIds = ordersData?.map(order => order.client_id) || [];

      const { data: clientsData } = await supabase
        .from('clients')
        .select('id, name')
        .in('id', clientIds);

      const { data: orderItemsData } = await supabase
        .from('order_items')
        .select('order_id, service_id')
        .in('order_id', orderIds);

      const serviceIds = orderItemsData?.map(item => item.service_id) || [];

      const { data: servicesData } = await supabase
        .from('services')
        .select('id, name')
        .in('id', serviceIds);

      // Combinar todos os dados
      const formattedOrders = workflowsData.map(workflow => {
        const order = ordersData?.find(o => o.id === workflow.order_id);
        if (!order) return null;

        const client = clientsData?.find(c => c.id === order.client_id);
        const orderItem = orderItemsData?.find(item => item.order_id === order.id);
        const service = orderItem ? servicesData?.find(s => s.id === orderItem.service_id) : null;

        // Extrair nome do paciente das notas
        let patientName = null;
        if (order.notes?.includes('Paciente:')) {
          const patientMatch = order.notes.match(/Paciente:\s*([^,\-]+)/);
          if (patientMatch && patientMatch[1]) {
            patientName = patientMatch[1].trim();
          }
        }

        // Fix for the total steps calculation
        const steps = workflow.workflow_templates?.steps;
        const totalSteps = Array.isArray(steps) ? steps.length : 0;

        return {
          id: order.id,
          client: client?.name || 'Cliente não encontrado',
          service: service?.name || 'Serviço não especificado',
          patientName,
          dueDate: order.deadline ? new Date(order.deadline).toLocaleDateString() : null,
          currentStep: workflow.current_step,
          status: order.status,
          workflowName: workflow.workflow_templates?.name || 'Fluxo indefinido',
          totalSteps,
          isUrgent: order.priority === 'urgent'
        };
      }).filter(Boolean) as OrderWithWorkflow[];

      setActiveOrders(formattedOrders);

    } catch (error) {
      console.error('Erro inesperado:', error);
      toast.error('Ocorreu um erro ao carregar os dados.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dentalblue-800">Fluxos de Trabalho</h1>
          <p className="text-gray-600">Gerenciar processos e fluxos das próteses</p>
        </div>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="active" className="flex items-center gap-1">
            <ArrowLeftRight className="h-4 w-4" /> Fluxos Ativos ({activeOrders.length})
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-1">
            <Settings className="h-4 w-4" /> Templates de Fluxo ({templates.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ordens com Fluxo de Trabalho Ativo</CardTitle>
              <CardDescription>
                Acompanhe o progresso das ordens que estão seguindo um fluxo de trabalho específico
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Carregando fluxos ativos...</div>
              ) : activeOrders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Não há ordens com fluxo de trabalho ativo no momento.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente / Paciente</TableHead>
                      <TableHead>Serviço</TableHead>
                      <TableHead>Fluxo</TableHead>
                      <TableHead>Progresso</TableHead>
                      <TableHead>Entrega</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>
                          <div className="font-medium">{order.client}</div>
                          {order.patientName && (
                            <div className="text-sm text-gray-500">{order.patientName}</div>
                          )}
                          {order.isUrgent && <Badge variant="destructive" className="mt-1">Urgente</Badge>}
                        </TableCell>
                        <TableCell>{order.service}</TableCell>
                        <TableCell>{order.workflowName}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-dentalblue-600 rounded-full"
                                style={{ width: `${(order.currentStep / (order.totalSteps - 1)) * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-sm">
                              {order.currentStep + 1}/{order.totalSteps}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {order.dueDate || 'Não definida'}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              // Navegar para a página de detalhes da ordem
                              window.location.href = `/orders#${order.id}`;
                            }}
                          >
                            Ver Detalhes
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Templates de Fluxo de Trabalho</CardTitle>
                <CardDescription>
                  Modelos de fluxo para diferentes tipos de próteses
                </CardDescription>
              </div>
              <Button className="bg-dentalblue-600 hover:bg-dentalblue-700" disabled>
                <Plus className="mr-2 h-4 w-4" /> Novo Template
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Carregando templates...</div>
              ) : templates.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Não há templates de fluxo cadastrados.
                </div>
              ) : (
                <div className="space-y-4">
                  {templates.map((template) => (
                    <Card key={template.id} className="border-gray-200">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-lg">{template.name}</CardTitle>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </div>
                        {template.description && (
                          <CardDescription>{template.description}</CardDescription>
                        )}
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-col gap-2">
                          {template.steps.map((step, index) => (
                            <div key={index} className="flex items-center p-2 rounded-md bg-gray-50 border border-gray-100">
                              <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center text-xs mr-3">
                                {index + 1}
                              </div>
                              <div className="flex-grow">
                                <div className="font-medium">{step.name}</div>
                                <div className="text-xs text-gray-500">{step.description}</div>
                              </div>
                              <Badge variant={step.responsible === 'dentist' ? 'outline' : 'secondary'}>
                                {step.responsible === 'dentist' ? 'Dentista' : 'Laboratório'}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
