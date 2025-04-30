
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export function useOrderFilters(orders: any[]) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filteredOrders, setFilteredOrders] = useState<any[]>(orders);

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

  const handleFilter = () => {
    toast.success('Filtros aplicados');
  };

  return {
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
  };
}
