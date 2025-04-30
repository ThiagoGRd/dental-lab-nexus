
import { useState } from 'react';
import { useFetchOrders } from './useFetchOrders';
import { useOrderFilters } from './useOrderFilters';
import { useUpdateOrder } from './useUpdateOrder';

export function useOrdersData() {
  const { loading, orders: fetchedOrders } = useFetchOrders();
  const [orders, setOrders] = useState<any[]>([]);
  
  // Atualizar os orders quando os dados forem carregados
  if (fetchedOrders.length > 0 && orders.length === 0) {
    setOrders(fetchedOrders);
  }
  
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

  return {
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
  };
}
