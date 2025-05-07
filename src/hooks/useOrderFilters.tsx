
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export function useOrderFilters(orders: any[]) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [urgentOnly, setUrgentOnly] = useState(false);
  const [sortByDueDate, setSortByDueDate] = useState(true); // Inicialmente ordenado por data de vencimento
  const [filteredOrders, setFilteredOrders] = useState<any[]>(orders);

  // Verificar se há "urgent" na URL ao carregar
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urgentParam = urlParams.get('urgent');
    const sortByDueDateParam = urlParams.get('sortByDueDate');
    
    if (urgentParam === 'true') {
      setUrgentOnly(true);
    }
    
    if (sortByDueDateParam === 'false') {
      setSortByDueDate(false);
    }
  }, []);

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
      
      // Filtro de urgência
      if (urgentOnly) {
        filtered = filtered.filter(order => order.isUrgent === true);
      }
      
      // Ordenar por data de vencimento se ativado
      if (sortByDueDate) {
        filtered = filtered.sort((a, b) => {
          // Verificar se ambos têm data de vencimento
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1; // Colocar os sem data no final
          if (!b.dueDate) return -1; // Colocar os sem data no final
          
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        });
      }
      
      setFilteredOrders(filtered);
    };
    
    applyFilters();
  }, [orders, searchTerm, statusFilter, startDate, endDate, urgentOnly, sortByDueDate]);

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
    urgentOnly,
    setUrgentOnly,
    sortByDueDate,
    setSortByDueDate,
    filteredOrders,
    handleFilter
  };
}
