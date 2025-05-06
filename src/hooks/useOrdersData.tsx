
import { useState, useEffect, useMemo } from 'react';
import { useFetchOrders } from './useFetchOrders';
import { useOrderFilters } from './useOrderFilters';
import { useUpdateOrder } from './useUpdateOrder';

export function useOrdersData() {
  const { loading, orders: fetchedOrders, error, refetch } = useFetchOrders();
  const [orders, setOrders] = useState<any[]>([]);
  
  // Update orders only when fetchedOrders change
  useEffect(() => {
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
    loading,
    filteredOrders,
    handleUpdateOrder,
    handleFilter,
    error,
    refetch
  ]);

  return returnValue;
}
