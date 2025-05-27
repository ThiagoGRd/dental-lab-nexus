
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useFetchOrders } from './useFetchOrders';
import { useOrderFilters } from './useOrderFilters';
import { useUpdateOrder } from './useUpdateOrder';

export function useOrdersData() {
  const { loading, orders: fetchedOrders, error, refetch } = useFetchOrders();
  const [orders, setOrders] = useState<any[]>([]);
  
  // Memoize orders update para evitar loops
  const updateOrders = useCallback((newOrders: any[]) => {
    if (newOrders && Array.isArray(newOrders) && newOrders.length >= 0) {
      setOrders(prevOrders => {
        const ordersChanged = JSON.stringify(prevOrders) !== JSON.stringify(newOrders);
        return ordersChanged ? newOrders : prevOrders;
      });
    }
  }, []);
  
  useEffect(() => {
    updateOrders(fetchedOrders || []);
  }, [fetchedOrders, updateOrders]);
  
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
  ]);
}
