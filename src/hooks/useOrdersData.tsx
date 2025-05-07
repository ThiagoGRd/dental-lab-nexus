
import { useState, useEffect, useMemo } from 'react';
import { useFetchOrders } from './useFetchOrders';
import { useOrderFilters } from './useOrderFilters';
import { useUpdateOrder } from './useUpdateOrder';

export function useOrdersData() {
  const { loading, orders: fetchedOrders, error, refetch } = useFetchOrders();
  const [orders, setOrders] = useState<any[]>([]);
  
  // Update orders only when fetchedOrders change
  useEffect(() => {
    console.log('useOrdersData: fetchedOrders changed:', fetchedOrders?.length);
    if (fetchedOrders && fetchedOrders.length > 0) {
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

  // Memoize the return value to prevent unnecessary re-renders
  const returnValue = useMemo(() => ({
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

  return returnValue;
}
