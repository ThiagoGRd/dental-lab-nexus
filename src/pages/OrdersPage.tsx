
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { OrderFilters } from '@/components/orders/OrderFilters';
import { OrderList } from '@/components/orders/OrderList';
import { useOrdersData } from '@/hooks/useOrdersData';
import NewOrderDialog from '@/components/orders/NewOrderDialog';
import OrderDetailsDialog from '@/components/orders/OrderDetailsDialog';
import OrderEditDialog from '@/components/orders/OrderEditDialog';

export default function OrdersPage() {
  const {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    loading,
    filteredOrders,
    handleUpdateOrder,
    handleFilter
  } = useOrdersData();

  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleViewOrder = (order: any) => {
    setSelectedOrder(order);
    setIsViewDialogOpen(true);
  };

  const handleEditOrder = (order: any) => {
    setSelectedOrder(order);
    setIsEditDialogOpen(true);
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

      <OrderFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        handleFilter={handleFilter}
      />

      <div className="mt-6">
        <OrderList
          orders={filteredOrders}
          loading={loading}
          onViewOrder={handleViewOrder}
          onEditOrder={handleEditOrder}
        />
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
