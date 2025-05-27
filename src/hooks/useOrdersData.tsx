
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useFetchOrders } from './useFetchOrders';
import { useOrderFilters } from './useOrderFilters';
import { useUpdateOrder } from './useUpdateOrder';

export function useOrdersData() {
  const { loading, orders: fetchedOrders, error, refetch } = useFetchOrders();
  const [orders, setOrders] = useState<any[]>([]);
  
  // Atualizar ordens locais quando fetchedOrders mudar
  useEffect(() => {
    if (fetchedOrders && Array.isArray(fetchedOrders)) {
      // Verificar se realmente mudou para evitar atualizações desnecessárias
      if (JSON.stringify(orders) !== JSON.stringify(fetchedOrders)) {
        console.log('Atualizando ordens locais:', fetchedOrders.length);
        setOrders(fetchedOrders);
      }
    }
  }, [fetchedOrders]); // Removido 'orders' da dependência para evitar loop
  
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
  return useMemo(() => ({
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
  }), [
    searchTerm,
    statusFilter,
    startDate,
    endDate,
    urgentOnly,
    sortByDueDate,
    loading,
    filteredOrders,
    handleUpdateOrder,
    handleFilter,
    error,
    refetch
  ]);
}
