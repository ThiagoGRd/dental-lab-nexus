
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription,
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Plus, Search } from 'lucide-react';
import NewOrderDialog from '@/components/orders/NewOrderDialog';
import OrderDetailsDialog from '@/components/orders/OrderDetailsDialog';
import OrderEditDialog from '@/components/orders/OrderEditDialog';
import { toast } from 'sonner';
import { supabase } from "@/integrations/supabase/client";
import { format } from 'date-fns';
import { statusLabels, OrderStatus } from '@/data/mockData';

export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
  
  // Carregar ordens do banco de dados
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select(`
            id, 
            status, 
            priority, 
            created_at, 
            deadline, 
            notes,
            client_id
          `)
          .order('created_at', { ascending: false });
          
        if (ordersError) {
          console.error('Erro ao buscar ordens:', ordersError);
          toast.error('Erro ao carregar as ordens de serviço.');
          return;
        }
        
        // Buscar todos os clientes para associar às ordens
        const { data: clientsData, error: clientsError } = await supabase
          .from('clients')
          .select('id, name');
          
        if (clientsError) {
          console.error('Erro ao buscar clientes:', clientsError);
          toast.error('Erro ao carregar dados dos clientes.');
          return;
        }

        // Buscar itens de serviço para cada ordem
        const { data: orderItemsData, error: orderItemsError } = await supabase
          .from('order_items')
          .select(`
            order_id,
            service_id,
            notes
          `);

        if (orderItemsError) {
          console.error('Erro ao buscar itens de ordem:', orderItemsError);
        }

        // Buscar serviços para associar aos itens
        const { data: servicesData, error: servicesError } = await supabase
          .from('services')
          .select('id, name');

        if (servicesError) {
          console.error('Erro ao buscar serviços:', servicesError);
        }

        // Formatar dados das ordens
        const formattedOrders = ordersData.map(order => {
          const client = clientsData?.find(c => c.id === order.client_id);
          const orderItem = orderItemsData?.find(item => item.order_id === order.id);
          const service = orderItem 
            ? servicesData?.find(s => s.id === orderItem.service_id)
            : null;
            
          // Extrair o nome do paciente das notas, se disponível
          let patientName = '';
          if (order.notes && order.notes.includes('Paciente:')) {
            const patientMatch = order.notes.match(/Paciente:\s*([^,\-]+)/);
            if (patientMatch && patientMatch[1]) {
              patientName = patientMatch[1].trim();
            }
          }
          
          // Extrair possíveis notas adicionais
          let cleanNotes = order.notes || '';
          if (cleanNotes.includes('Paciente:')) {
            cleanNotes = cleanNotes.replace(/Paciente:\s*[^,\-]+(,|\s*-\s*|$)/, '').trim();
          }
            
          return {
            id: order.id,
            client: client?.name || 'Cliente não encontrado',
            patientName: patientName,
            service: service?.name || 'Serviço não especificado',
            createdAt: format(new Date(order.created_at), 'yyyy-MM-dd'),
            dueDate: order.deadline ? format(new Date(order.deadline), 'yyyy-MM-dd') : '',
            status: order.status as OrderStatus,
            isUrgent: order.priority === 'urgent',
            notes: cleanNotes,
            // Mantenha os IDs originais para uso em atualizações
            originalData: {
              clientId: order.client_id,
              orderId: order.id
            }
          };
        });

        setOrders(formattedOrders);
        setFilteredOrders(formattedOrders);
      } catch (error) {
        console.error('Erro inesperado:', error);
        toast.error('Ocorreu um erro inesperado ao carregar os dados.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, []);

  // Aplicar filtros
  useEffect(() => {
    const applyFilters = () => {
      let filtered = [...orders];
      
      // Filtro de texto (busca)
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(order => 
          order.client.toLowerCase().includes(term) || 
          order.id.toLowerCase().includes(term) ||
          order.service.toLowerCase().includes(term) ||
          (order.patientName && order.patientName.toLowerCase().includes(term))
        );
      }
      
      // Filtro de status
      if (statusFilter !== 'all') {
        filtered = filtered.filter(order => order.status === statusFilter);
      }
      
      // Filtro de datas
      if (startDate) {
        filtered = filtered.filter(order => 
          new Date(order.dueDate) >= new Date(startDate)
        );
      }
      
      if (endDate) {
        filtered = filtered.filter(order => 
          new Date(order.dueDate) <= new Date(endDate)
        );
      }
      
      setFilteredOrders(filtered);
    };
    
    applyFilters();
  }, [orders, searchTerm, statusFilter, startDate, endDate]);

  const handleViewOrder = (order: any) => {
    setSelectedOrder(order);
    setIsViewDialogOpen(true);
  };

  const handleEditOrder = (order: any) => {
    setSelectedOrder(order);
    setIsEditDialogOpen(true);
  };

  const handleUpdateOrder = async (updatedOrder: any) => {
    try {
      // Preparar notas com o nome do paciente
      const notes = updatedOrder.patientName 
        ? `Paciente: ${updatedOrder.patientName}${updatedOrder.notes ? ' - ' + updatedOrder.notes : ''}`
        : updatedOrder.notes;
      
      // Atualizar no Supabase
      const { error } = await supabase
        .from('orders')
        .update({
          status: updatedOrder.status,
          deadline: updatedOrder.dueDate ? new Date(updatedOrder.dueDate).toISOString() : null,
          priority: updatedOrder.isUrgent ? 'urgent' : 'normal',
          notes: notes
        })
        .eq('id', updatedOrder.originalData?.orderId || updatedOrder.id);
        
      if (error) {
        console.error('Erro ao atualizar ordem:', error);
        toast.error('Erro ao atualizar ordem de serviço.');
        return;
      }
      
      // Atualizar a lista de ordens localmente
      const updatedOrders = orders.map(order => 
        (order.id === updatedOrder.id) ? { ...order, ...updatedOrder } : order
      );
      setOrders(updatedOrders);
      setIsEditDialogOpen(false);
      toast.success('Ordem atualizada com sucesso!');
    } catch (error) {
      console.error('Erro ao processar atualização:', error);
      toast.error('Ocorreu um erro ao atualizar a ordem.');
    }
  };

  const handleFilter = () => {
    // Já está sendo feito pelo useEffect
    toast.success('Filtros aplicados');
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dentalblue-800">Ordens de Serviço</h1>
          <p className="text-gray-600">Gerencie todas as ordens do laboratório</p>
        </div>
        <NewOrderDialog>
          <Button className="bg-dentalblue-600 hover:bg-dentalblue-700">
            <Plus className="mr-2 h-4 w-4" /> Nova Ordem
          </Button>
        </NewOrderDialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtrar Ordens</CardTitle>
          <CardDescription>Use os campos abaixo para filtrar as ordens de serviço</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <Input
                placeholder="Buscar por cliente, paciente ou ID..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select 
              value={statusFilter} 
              onValueChange={setStatusFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="production">Em Produção</SelectItem>
                <SelectItem value="waiting">Aguardando Material</SelectItem>
                <SelectItem value="completed">Finalizado</SelectItem>
                <SelectItem value="delivered">Entregue</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-4">
              <Input
                type="date"
                className="flex-1"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <Input
                type="date"
                className="flex-1"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div>
              <Button className="w-full" onClick={handleFilter}>Filtrar</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6">
        <Card>
          <CardContent className="p-0">
            <div className="rounded-md border">
              <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 bg-muted/50 p-4 font-medium">
                <div>Cliente / Paciente / Serviço</div>
                <div className="hidden sm:block">Data de Entrega</div>
                <div>Status</div>
                <div>Ações</div>
              </div>
              <div className="divide-y">
                {loading ? (
                  <div className="p-8 text-center">
                    Carregando ordens de serviço...
                  </div>
                ) : filteredOrders.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    Nenhuma ordem de serviço encontrada.
                  </div>
                ) : (
                  filteredOrders.map((order) => (
                    <div key={order.id} className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 p-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{order.client}</span>
                          {order.isUrgent && (
                            <Badge variant="destructive" className="text-xs">Urgente</Badge>
                          )}
                        </div>
                        {order.patientName && (
                          <div className="text-sm text-muted-foreground">
                            Paciente: {order.patientName}
                          </div>
                        )}
                        <div className="text-sm text-muted-foreground">{order.service}</div>
                        <div className="text-xs text-muted-foreground">#{order.id.substring(0, 8)}</div>
                      </div>
                      <div className="hidden sm:block text-sm">
                        {order.dueDate || 'Não definida'}
                      </div>
                      <div>
                        <span className={cn(
                          "rounded-full border px-2 py-1 text-xs font-medium",
                          statusLabels[order.status]?.className || 'bg-gray-100 text-gray-800 border-gray-300'
                        )}>
                          {statusLabels[order.status]?.label || 'Desconhecido'}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => handleViewOrder(order)}>
                          Ver
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleEditOrder(order)}>
                          Editar
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Diálogos para visualizar e editar ordens */}
      <OrderDetailsDialog 
        open={isViewDialogOpen} 
        onOpenChange={setIsViewDialogOpen}
        order={selectedOrder}
      />
      
      <OrderEditDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        order={selectedOrder}
        onSave={handleUpdateOrder}
      />
    </div>
  );
}
