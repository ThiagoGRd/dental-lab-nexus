
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw, Package } from 'lucide-react';
import { OrderFilters } from '@/components/orders/OrderFilters';
import { OrderList } from '@/components/orders/OrderList';
import { useOrdersData } from '@/hooks/useOrdersData';
import NewOrderDialog from '@/components/orders/NewOrderDialog';
import OrderDetailsDialog from '@/components/orders/OrderDetailsDialog';
import OrderEditDialog from '@/components/orders/OrderEditDialog';
import { toast } from 'sonner';
import { useSearchParams, useNavigate } from 'react-router-dom';

export default function OrdersPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    urgentOnly,
    setUrgentOnly,
    sortByDueDate,
    setSortByDueDate,
    loading,
    filteredOrders,
    handleUpdateOrder,
    handleFilter,
    error,
    refetch
  } = useOrdersData();

  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  // Aplicar filtros da URL ao carregar a página
  useEffect(() => {
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    const urgent = searchParams.get('urgent');
    const sortByDueDateParam = searchParams.get('sortByDueDate');
    
    let filtersApplied = false;
    
    if (status) {
      setStatusFilter(status);
      filtersApplied = true;
    }
    
    if (search) {
      setSearchTerm(search);
      filtersApplied = true;
    }
    
    if (startDateParam) {
      setStartDate(startDateParam);
      filtersApplied = true;
    }
    
    if (endDateParam) {
      setEndDate(endDateParam);
      filtersApplied = true;
    }
    
    if (urgent === 'true') {
      setUrgentOnly(true);
      filtersApplied = true;
    }
    
    if (sortByDueDateParam === 'false') {
      setSortByDueDate(false);
      filtersApplied = true;
    }

    if (filtersApplied) {
      toast.info('Filtros aplicados de acordo com a seleção no dashboard');
      navigate('/orders', { replace: true });
    }
  }, [searchParams, setStatusFilter, setSearchTerm, setStartDate, setEndDate, setSortByDueDate, setUrgentOnly, navigate]);

  useEffect(() => {
    if (error) {
      console.error("Erro ao carregar ordens:", error);
      toast.error("Erro ao carregar ordens de serviço. Tente novamente com o botão abaixo.");
    }
  }, [error]);

  const handleViewOrder = (order: any) => {
    setSelectedOrder(order);
    setIsViewDialogOpen(true);
  };

  const handleEditOrder = (order: any) => {
    setSelectedOrder(order);
    setIsEditDialogOpen(true);
  };

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await refetch();
      toast.success("Dados atualizados com sucesso!");
    } catch (err) {
      console.error("Erro ao tentar novamente:", err);
      toast.error("Falha ao tentar recarregar. Tente novamente mais tarde.");
    } finally {
      setIsRetrying(false);
    }
  };

  const handleOrderCreated = () => {
    refetch();
    toast.success("Nova ordem criada! Recarregando lista...");
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-dentalblue-800 flex items-center gap-2">
            <Package className="h-8 w-8" />
            Ordens de Serviço
          </h1>
          <p className="text-gray-600">
            Gerencie todas as ordens do laboratório - {filteredOrders.length} ordem(ns) encontrada(s)
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={handleRetry}
            disabled={isRetrying || loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${(isRetrying || loading) ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          
          <NewOrderDialog onOrderCreated={handleOrderCreated}>
            <Button className="bg-dentalblue-600 hover:bg-dentalblue-700">
              <Plus className="mr-2 h-4 w-4" /> Nova Ordem
            </Button>
          </NewOrderDialog>
        </div>
      </div>

      {/* Filtros */}
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
        sortByDueDate={sortByDueDate}
        setSortByDueDate={setSortByDueDate}
        urgentOnly={urgentOnly}
        setUrgentOnly={setUrgentOnly}
      />

      {/* Lista de Ordens */}
      {error ? (
        <div className="p-6 text-center bg-white rounded-lg shadow border border-red-100">
          <Package className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-500 mb-4">
            Erro ao carregar dados: {typeof error === 'string' ? error : 'Erro desconhecido. Verifique o console para mais detalhes.'}
          </p>
          <Button 
            onClick={handleRetry} 
            variant="default" 
            className="bg-dentalblue-600 hover:bg-dentalblue-700"
            disabled={isRetrying}
          >
            {isRetrying ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> 
                Carregando...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" /> 
                Tentar novamente
              </>
            )}
          </Button>
        </div>
      ) : (
        <OrderList
          orders={filteredOrders}
          loading={loading}
          onViewOrder={handleViewOrder}
          onEditOrder={handleEditOrder}
        />
      )}

      {/* Diálogos */}
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
