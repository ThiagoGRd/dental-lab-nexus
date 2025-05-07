import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { format, parseISO, isAfter, isBefore, isToday, addDays, isSameDay, compareAsc, compareDesc, addMonths } from 'date-fns';
import { safeFinanceOperations, safeExtract } from '@/utils/supabaseHelpers';
import { supabase } from '@/integrations/supabase/client';

export function useFinanceData() {
  const [payableAccounts, setPayableAccounts] = useState<any[]>([]);
  const [receivableAccounts, setReceivableAccounts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentAccount, setCurrentAccount] = useState<any>(null);
  const [editFormData, setEditFormData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  
  // Advanced filter states - defaults changed to show all accounts
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('due-asc');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  // Extract unique categories for the filter dropdown
  const categories = useMemo(() => {
    const categorySet = new Set<string>();
    payableAccounts.forEach(account => {
      if (account.category) categorySet.add(account.category);
    });
    return Array.from(categorySet).sort();
  }, [payableAccounts]);

  // Clear all filters
  const clearFilters = () => {
    setStatusFilter('all');
    setDateFilter('all');
    setCategoryFilter('all');
    setSortOrder('due-asc');
    setStartDate(undefined);
    setEndDate(undefined);
    setSearchTerm('');
  };

  // Use useCallback to make refreshData available as dependency
  const fetchFinanceData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Iniciando busca de dados financeiros...");

      const financeOps = await safeFinanceOperations();
      
      // Buscar contas a pagar (despesas)
      const expensesResponse = await financeOps.getByType('expense');
      
      if (expensesResponse.error) {
        console.error('Erro ao buscar despesas:', expensesResponse.error);
        setError('Erro ao buscar despesas: ' + (expensesResponse.error.message || 'Erro desconhecido'));
        setLoading(false);
        return;
      }

      // Buscar contas a receber (receitas)
      const revenuesResponse = await financeOps.getByType('revenue');
      
      if (revenuesResponse.error) {
        console.error('Erro ao buscar receitas:', revenuesResponse.error);
        setError('Erro ao buscar receitas: ' + (revenuesResponse.error.message || 'Erro desconhecido'));
        setLoading(false);
        return;
      }

      // Extrair valores - usando acesso direto para garantir que estamos pegando os dados corretos
      const expenses = expensesResponse.finances || [];
      const revenues = revenuesResponse.finances || [];
      
      console.log("Despesas obtidas:", expenses.length);
      console.log("Receitas obtidas:", revenues.length);

      // Buscar ordens relacionadas às receitas que têm related_order_id
      const orderIds = revenues
        .filter(rev => rev.related_order_id)
        .map(rev => rev.related_order_id);

      let clientsMap: Record<string, string> = {};

      if (orderIds.length > 0) {
        // Buscar ordens
        const ordersResponse = await financeOps.getRelatedOrders(orderIds);
        
        if (ordersResponse.error) {
          console.error('Erro ao buscar ordens relacionadas:', ordersResponse.error);
          // Continue anyway with empty orders
        }
        
        const orders = ordersResponse.orders || [];
          
        if (orders.length > 0) {
          // Buscar clientes
          const clientIds = orders.map(order => order.client_id);
          const clientsResponse = await financeOps.getClientsByIds(clientIds);
          
          if (clientsResponse.error) {
            console.error('Erro ao buscar clientes:', clientsResponse.error);
            // Continue anyway with empty clients
          }
          
          const clients = clientsResponse.clients || [];
            
          if (clients.length > 0) {
            // Criar mapa de ordens para clientes
            const orderClientMap: Record<string, string> = {};
            orders.forEach(order => {
              const client = clients.find(c => c.id === order.client_id);
              if (client) {
                orderClientMap[order.id] = client.name;
              }
            });

            clientsMap = orderClientMap;
          }
        }
      }

      // Formatar contas a pagar
      const formattedPayables = expenses.map(expense => ({
        id: expense.id,
        description: expense.description,
        category: expense.category || 'Não categorizado',
        value: expense.amount,
        dueDate: expense.due_date ? format(new Date(expense.due_date), 'yyyy-MM-dd') : '',
        status: expense.status || 'pending',
        notes: expense.notes || '',
        originalData: expense
      }));

      // Formatar contas a receber
      const formattedReceivables = revenues.map(revenue => {
        let clientName = 'Cliente não especificado';
        let orderNumber = 'N/A';
        
        if (revenue.related_order_id) {
          clientName = clientsMap[revenue.related_order_id] || 'Cliente não encontrado';
          orderNumber = revenue.related_order_id.substring(0, 8);
        }
        
        return {
          id: revenue.id,
          client: clientName,
          orderNumber: orderNumber,
          value: revenue.amount,
          dueDate: revenue.due_date ? format(new Date(revenue.due_date), 'yyyy-MM-dd') : '',
          status: revenue.status || 'pending',
          notes: revenue.notes || '',
          originalData: revenue
        };
      });
      
      console.log("Dados formatados - Payables:", formattedPayables.length);
      console.log("Dados formatados - Receivables:", formattedReceivables.length);

      setPayableAccounts(formattedPayables);
      setReceivableAccounts(formattedReceivables);
      
    } catch (error) {
      console.error('Erro ao buscar dados financeiros:', error);
      setError(error);
      toast.error('Ocorreu um erro inesperado ao carregar os dados financeiros.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch data on component mount
  useEffect(() => {
    console.log("useEffect em useFinanceData sendo chamado");
    fetchFinanceData();
  }, [fetchFinanceData]);

  // Apply filters to accounts - Modified to ensure all accounts are shown when filters are not set
  const applyFilters = useCallback((accounts: any[]) => {
    return accounts.filter(account => {
      // Search term filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const hasSearchTerm = 'description' in account 
          ? account.description.toLowerCase().includes(searchLower) || account.category.toLowerCase().includes(searchLower)
          : account.client.toLowerCase().includes(searchLower) || account.orderNumber.toLowerCase().includes(searchLower);
        
        if (!hasSearchTerm) return false;
      }

      // Status filter
      if (statusFilter !== 'all') {
        if (statusFilter === 'pending' && account.status !== 'pending') return false;
        if (statusFilter === 'paid' && (account.status !== 'paid' && account.status !== 'received')) return false;
      }

      // Category filter for payable accounts only
      if ('category' in account && categoryFilter !== 'all' && account.category !== categoryFilter) {
        return false;
      }

      // Date filter
      if (dateFilter !== 'all' && account.dueDate) {
        const dueDate = parseISO(account.dueDate);
        const today = new Date();
        
        switch (dateFilter) {
          case 'overdue':
            if (!isBefore(dueDate, today)) return false;
            break;
          case 'today':
            if (!isToday(dueDate)) return false;
            break;
          case 'week':
            if (isBefore(dueDate, today) || isAfter(dueDate, addDays(today, 7))) return false;
            break;
          case 'month':
            if (isBefore(dueDate, today) || isAfter(dueDate, addDays(today, 30))) return false;
            break;
          case 'custom':
            if (startDate && isBefore(dueDate, startDate)) return false;
            if (endDate && isAfter(dueDate, endDate)) return false;
            break;
        }
      }

      return true;
    });
  }, [searchTerm, statusFilter, categoryFilter, dateFilter, startDate, endDate]);

  // Apply sorting
  const applySorting = useCallback((accounts: any[]) => {
    return [...accounts].sort((a, b) => {
      switch (sortOrder) {
        case 'due-asc':
          return a.dueDate && b.dueDate ? compareAsc(parseISO(a.dueDate), parseISO(b.dueDate)) : 0;
        case 'due-desc':
          return a.dueDate && b.dueDate ? compareDesc(parseISO(a.dueDate), parseISO(b.dueDate)) : 0;
        case 'value-asc':
          return a.value - b.value;
        case 'value-desc':
          return b.value - a.value;
        case 'alpha-asc':
          const aText = 'description' in a ? a.description : a.client;
          const bText = 'description' in b ? b.description : b.client;
          return aText.localeCompare(bText);
        case 'alpha-desc':
          const aText2 = 'description' in a ? a.description : a.client;
          const bText2 = 'description' in b ? b.description : b.client;
          return bText2.localeCompare(aText2);
        default:
          return 0;
      }
    });
  }, [sortOrder]);

  // Filtered and sorted data
  const filteredPayables = useMemo(() => {
    const filtered = applyFilters(payableAccounts);
    return applySorting(filtered);
  }, [payableAccounts, applyFilters, applySorting]);
  
  const filteredReceivables = useMemo(() => {
    const filtered = applyFilters(receivableAccounts);
    return applySorting(filtered);
  }, [receivableAccounts, applyFilters, applySorting]);

  // Handle payment of an account
  const handlePayment = async (id: string) => {
    try {
      const financeOps = await safeFinanceOperations();
      const { error } = await financeOps.updateStatus(id, 'paid');
        
      if (error) {
        console.error('Erro ao registrar pagamento:', error);
        toast.error('Erro ao registrar pagamento.');
        return;
      }
      
      setPayableAccounts(payableAccounts.map(account => 
        account.id === id ? { ...account, status: 'paid' } : account
      ));
      
      toast.success(`Pagamento da conta registrado com sucesso!`);
      
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      toast.error('Ocorreu um erro ao registrar o pagamento.');
    }
  };
  
  // Handle receiving of an account
  const handleReceive = async (id: string) => {
    try {
      const financeOps = await safeFinanceOperations();
      const { error } = await financeOps.updateStatus(id, 'received');
        
      if (error) {
        console.error('Erro ao registrar recebimento:', error);
        toast.error('Erro ao registrar recebimento.');
        return;
      }
      
      setReceivableAccounts(receivableAccounts.map(account => 
        account.id === id ? { ...account, status: 'received' } : account
      ));
      
      toast.success(`Recebimento registrado com sucesso!`);
      
    } catch (error) {
      console.error('Erro ao processar recebimento:', error);
      toast.error('Ocorreu um erro ao registrar o recebimento.');
    }
  };

  // View account details
  const handleViewAccount = (account: any) => {
    setCurrentAccount(account);
    setViewDialogOpen(true);
  };

  // Setup edit account
  const handleEditSetup = (account: any) => {
    setCurrentAccount(account);
    
    // Initialize the form data based on account type
    if ('description' in account) {
      // Payable account
      setEditFormData({
        description: account.description,
        category: account.category,
        value: account.value,
        dueDate: account.dueDate,
        notes: account.notes || ''
      });
    } else {
      // Receivable account
      setEditFormData({
        client: account.client,
        orderNumber: account.orderNumber,
        value: account.value,
        dueDate: account.dueDate,
        notes: account.notes || ''
      });
    }
    
    setEditDialogOpen(true);
  };

  // Handle form input changes for edit
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: name === 'value' ? parseFloat(value) : value,
    });
  };

  // Submit edit account
  const handleEditSubmit = async () => {
    if (!currentAccount) return;
    
    try {
      const financeOps = await safeFinanceOperations();
      
      // Preparar dados para atualização
      const updateData = {
        description: 'description' in editFormData ? editFormData.description : undefined,
        category: 'category' in editFormData ? editFormData.category : undefined,
        amount: editFormData.value,
        due_date: editFormData.dueDate,
        notes: editFormData.notes
      };
      
      // Remover campos undefined
      Object.keys(updateData).forEach(key => {
        if (updateData[key as keyof typeof updateData] === undefined) {
          delete updateData[key as keyof typeof updateData];
        }
      });
      
      const { error } = await financeOps.update(currentAccount.id, updateData);
        
      if (error) {
        console.error('Erro ao atualizar conta:', error);
        toast.error('Erro ao atualizar conta.');
        return;
      }
      
      if ('description' in currentAccount) {
        // Update payable account
        setPayableAccounts(payableAccounts.map(acc => 
          acc.id === currentAccount.id ? { 
            ...acc, 
            description: editFormData.description || acc.description,
            category: editFormData.category || acc.category,
            value: editFormData.value,
            dueDate: editFormData.dueDate,
            notes: editFormData.notes
          } : acc
        ));
      } else {
        // Update receivable account
        setReceivableAccounts(receivableAccounts.map(acc => 
          acc.id === currentAccount.id ? { 
            ...acc, 
            value: editFormData.value,
            dueDate: editFormData.dueDate,
            notes: editFormData.notes
          } : acc
        ));
      }
      
      setEditDialogOpen(false);
      toast.success('Conta atualizada com sucesso!');
      
    } catch (error) {
      console.error('Erro ao processar atualização:', error);
      toast.error('Ocorreu um erro ao atualizar a conta.');
    }
  };

  // Helper function to create multiple installments
  const createInstallments = async (baseData: any, installmentCount: number, type: 'payable' | 'receivable') => {
    const totalAmount = baseData.value;
    const installmentAmount = parseFloat((totalAmount / installmentCount).toFixed(2));
    let remainderAmount = parseFloat((totalAmount - (installmentAmount * installmentCount)).toFixed(2));
    
    const baseDate = parseISO(baseData.dueDate);
    const installments = [];
    
    try {
      const financeOps = await safeFinanceOperations();
      
      for (let i = 0; i < installmentCount; i++) {
        // Calculate due date for this installment (1 month apart)
        const dueDate = addMonths(baseDate, i);
        
        // Add remainder to first installment to account for rounding
        let thisAmount = installmentAmount;
        if (i === 0 && remainderAmount !== 0) {
          thisAmount = parseFloat((thisAmount + remainderAmount).toFixed(2));
        }
        
        // Create installment description
        const installmentLabel = `${i+1}/${installmentCount}`;
        let description = '';
        
        if (type === 'payable') {
          description = `${baseData.description} - Parcela ${installmentLabel}`;
        } else {
          description = `Receita: ${baseData.client} - Parcela ${installmentLabel}`;
        }
        
        // Create the data object for this installment
        const installmentData = {
          description: description,
          category: type === 'payable' ? baseData.category : undefined,
          amount: thisAmount,
          due_date: format(dueDate, 'yyyy-MM-dd'),
          status: 'pending',
          notes: baseData.notes ? `${baseData.notes} | Parcela ${installmentLabel}` : `Parcela ${installmentLabel}`,
          type: type === 'payable' ? 'expense' : 'revenue',
          related_order_id: type === 'receivable' && baseData.orderNumber && baseData.orderNumber !== 'N/A' ? baseData.orderNumber : null
        };
        
        // Add to list of installments to create
        installments.push(installmentData);
      }
      
      // Insert all installments and return their data
      const createdInstallments = [];
      
      for (const installment of installments) {
        const { finance, error } = await financeOps.add(installment);
        
        if (error) {
          console.error('Erro ao adicionar parcela:', error);
          throw error;
        }
        
        if (finance) {
          createdInstallments.push(finance);
        }
      }
      
      return { installments: createdInstallments, error: null };
    } catch (error) {
      console.error('Erro ao criar parcelas:', error);
      return { installments: null, error };
    }
  };

  // Add new payable account
  const handleAddPayable = async (data: any) => {
    try {
      // Check if this is an installment payment
      if (data.isInstallment && data.installmentCount >= 2) {
        const { installments, error } = await createInstallments(data, data.installmentCount, 'payable');
        
        if (error) {
          console.error('Erro ao criar parcelas:', error);
          toast.error('Erro ao criar parcelas de pagamento.');
          return;
        }
        
        if (installments) {
          // Format the installments for display and add to state
          const formattedInstallments = installments.map((item: any) => ({
            id: item.id,
            description: item.description,
            category: item.category || 'Não categorizado',
            value: item.amount,
            dueDate: item.due_date ? format(new Date(item.due_date), 'yyyy-MM-dd') : '',
            status: 'pending',
            notes: item.notes || '',
            originalData: item
          }));
          
          setPayableAccounts([...payableAccounts, ...formattedInstallments]);
          toast.success(`${data.installmentCount} parcelas de pagamento criadas com sucesso!`);
        }
      } else {
        // Handle single payment (original code)
        const financeOps = await safeFinanceOperations();
        const newPayableData = {
          description: data.description,
          category: data.category,
          amount: data.value,
          due_date: data.dueDate,
          status: 'pending',
          notes: data.notes || '',
          type: 'expense'
        };
        
        const { finance: insertedData, error } = await financeOps.add(newPayableData);
          
        if (error) {
          console.error('Erro ao adicionar conta a pagar:', error);
          toast.error('Erro ao adicionar conta a pagar.');
          return;
        }
        
        if (insertedData) {
          // Formatar nova conta para exibição
          const newPayable = {
            id: insertedData.id,
            description: insertedData.description,
            category: insertedData.category || 'Não categorizado',
            value: insertedData.amount,
            dueDate: insertedData.due_date ? format(new Date(insertedData.due_date), 'yyyy-MM-dd') : '',
            status: 'pending',
            notes: insertedData.notes || '',
            originalData: insertedData
          };
          
          setPayableAccounts([...payableAccounts, newPayable]);
          toast.success('Nova conta a pagar adicionada com sucesso!');
        }
      }
    } catch (error) {
      console.error('Erro ao adicionar conta a pagar:', error);
      toast.error('Ocorreu um erro ao adicionar a conta a pagar.');
    }
  };

  // Add new receivable account
  const handleAddReceivable = async (data: any) => {
    try {
      // Check if this is an installment payment
      if (data.isInstallment && data.installmentCount >= 2) {
        const { installments, error } = await createInstallments(data, data.installmentCount, 'receivable');
        
        if (error) {
          console.error('Erro ao criar parcelas:', error);
          toast.error('Erro ao criar parcelas de recebimento.');
          return;
        }
        
        if (installments) {
          // Format the installments for display and add to state
          const formattedInstallments = installments.map((item: any) => ({
            id: item.id,
            client: data.client,
            orderNumber: data.orderNumber || 'N/A',
            value: item.amount,
            dueDate: item.due_date ? format(new Date(item.due_date), 'yyyy-MM-dd') : '',
            status: 'pending',
            notes: item.notes || '',
            originalData: item
          }));
          
          setReceivableAccounts([...receivableAccounts, ...formattedInstallments]);
          toast.success(`${data.installmentCount} parcelas de recebimento criadas com sucesso!`);
        }
      } else {
        // Handle single payment (original code)
        const financeOps = await safeFinanceOperations();
        // Se o orderNumber for fornecido e não for N/A, tentamos buscar a ordem
        let orderId = null;
        if (data.orderNumber && data.orderNumber !== 'N/A') {
          // Tenta buscar a ordem pelo número - isso pode precisar ser ajustado dependendo de como as ordens são armazenadas
        }
        
        const newReceivableData = {
          description: `Receita: ${data.client}`,
          amount: data.value,
          due_date: data.dueDate,
          status: 'pending',
          notes: data.notes || '',
          type: 'revenue',
          related_order_id: orderId
        };
        
        const { finance: insertedData, error } = await financeOps.add(newReceivableData);
          
        if (error) {
          console.error('Erro ao adicionar conta a receber:', error);
          toast.error('Erro ao adicionar conta a receber.');
          return;
        }
        
        if (insertedData) {
          // Formatar nova conta para exibição
          const newReceivable = {
            id: insertedData.id,
            client: data.client,
            orderNumber: data.orderNumber || 'N/A',
            value: insertedData.amount,
            dueDate: insertedData.due_date ? format(new Date(insertedData.due_date), 'yyyy-MM-dd') : '',
            status: 'pending',
            notes: insertedData.notes || '',
            originalData: insertedData
          };
          
          setReceivableAccounts([...receivableAccounts, newReceivable]);
          toast.success('Nova conta a receber adicionada com sucesso!');
        }
      }
    } catch (error) {
      console.error('Erro ao adicionar conta a receber:', error);
      toast.error('Ocorreu um erro ao adicionar a conta a receber.');
    }
  };

  return {
    payableAccounts,
    receivableAccounts,
    filteredPayables,
    filteredReceivables,
    searchTerm,
    setSearchTerm,
    viewDialogOpen,
    setViewDialogOpen,
    editDialogOpen,
    setEditDialogOpen,
    currentAccount,
    editFormData,
    loading,
    error,
    // Advanced filters
    statusFilter,
    setStatusFilter,
    dateFilter,
    setDateFilter,
    categoryFilter,
    setCategoryFilter,
    sortOrder,
    setSortOrder,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    clearFilters,
    categories,
    // Functions
    handlePayment,
    handleReceive,
    handleViewAccount,
    handleEditSetup,
    handleInputChange,
    handleEditSubmit,
    handleAddPayable,
    handleAddReceivable,
    refreshData: fetchFinanceData
  };
}
