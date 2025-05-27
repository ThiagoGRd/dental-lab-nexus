
import { useState, useEffect, useMemo } from 'react';
import { useFetchOrders } from './useFetchOrders';
import { useOrderFilters } from './useOrderFilters';
import { useUpdateOrder } from './useUpdateOrder';

export function useOrdersData() {
  const { loading, orders: fetchedOrders, error, refetch } = useFetchOrders();
  const [orders, setOrders] = useState<any[]>([]);
  
  // Atualizar ordens locais quando fetchedOrders mudar
  useEffect(() => {
    if (fetchedOrders && Array.isArray(fetchedOrders)) {
      console.log('📋 Atualizando ordens locais:', fetchedOrders.length);
      setOrders(fetchedOrders);
    }
  }, [fetchedOrders]);
  
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
    filteredOrders,
    handleFilter
  } = useOrderFilters(orders);
  
  const { handleUpdateOrder } = useUpdateOrder(orders, setOrders);

  // Memoizar o retorno para evitar re-renderizações
  const memoizedResult = useMemo(() => ({
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
    refetch,
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.status === 'pending').length,
    completedOrders: orders.filter(o => o.status === 'completed').length,
    urgentOrders: orders.filter(o => o.isUrgent).length,
  }), [
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
    refetch,
    orders
  ]);

  return memoizedResult;
}
