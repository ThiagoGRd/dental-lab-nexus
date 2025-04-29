import React, { useState } from 'react';
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
import { mockRecentOrders } from '@/data/mockData';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Plus, Search } from 'lucide-react';
import NewOrderDialog from '@/components/orders/NewOrderDialog';
import OrderDetailsDialog from '@/components/orders/OrderDetailsDialog';
import OrderEditDialog from '@/components/orders/OrderEditDialog';
import { toast } from 'sonner';

export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  const statuses = {
    'pending': { label: 'Pendente', className: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
    'production': { label: 'Em Produção', className: 'bg-blue-100 text-blue-800 border-blue-300' },
    'waiting': { label: 'Aguardando Material', className: 'bg-orange-100 text-orange-800 border-orange-300' },
    'completed': { label: 'Finalizado', className: 'bg-green-100 text-green-800 border-green-300' },
    'delivered': { label: 'Entregue', className: 'bg-purple-100 text-purple-800 border-purple-300' },
  };

  // Simulating more orders by duplicating the mock data
  const allOrders = [...mockRecentOrders, ...mockRecentOrders].map((order, index) => ({
    ...order,
    id: `ORD${String(index + 1).padStart(3, '0')}`,
  }));
  
  // Filter orders based on search term and status filter
  const filteredOrders = allOrders.filter(order => {
    const matchesSearch = 
      order.client.toLowerCase().includes(searchTerm.toLowerCase()) || 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.service.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleViewOrder = (order: any) => {
    setSelectedOrder(order);
    setIsViewDialogOpen(true);
  };

  const handleEditOrder = (order: any) => {
    setSelectedOrder(order);
    setIsEditDialogOpen(true);
  };

  const handleUpdateOrder = (updatedOrder: any) => {
    // In a real app, this would update the order in the database
    // For now, we'll just close the dialog
    setIsEditDialogOpen(false);
    toast.success('Ordem atualizada com sucesso!');
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
                placeholder="Buscar por cliente ou ID..."
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
              />
              <Input
                type="date"
                className="flex-1"
              />
            </div>
            <div>
              <Button className="w-full">Filtrar</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6">
        <Card>
          <CardContent className="p-0">
            <div className="rounded-md border">
              <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 bg-muted/50 p-4 font-medium">
                <div>Cliente / Serviço</div>
                <div className="hidden sm:block">Data de Entrega</div>
                <div>Status</div>
                <div>Ações</div>
              </div>
              <div className="divide-y">
                {filteredOrders.map((order) => (
                  <div key={order.id} className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 p-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{order.client}</span>
                        {order.isUrgent && (
                          <Badge variant="destructive" className="text-xs">Urgente</Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">{order.service}</div>
                      <div className="text-xs text-muted-foreground">#{order.id}</div>
                    </div>
                    <div className="hidden sm:block text-sm">
                      {order.dueDate}
                    </div>
                    <div>
                      <span className={cn(
                        "rounded-full border px-2 py-1 text-xs font-medium",
                        statuses[order.status as keyof typeof statuses].className
                      )}>
                        {statuses[order.status as keyof typeof statuses].label}
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
                ))}
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
