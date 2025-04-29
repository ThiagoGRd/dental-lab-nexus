import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from "@/integrations/supabase/client";
import { format } from 'date-fns';

export function useFinanceData() {
  const [payableAccounts, setPayableAccounts] = useState<any[]>([]);
  const [receivableAccounts, setReceivableAccounts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentAccount, setCurrentAccount] = useState<any>(null);
  const [editFormData, setEditFormData] = useState<any>({});
  const [loading, setLoading] = useState(true);

  // Use useCallback to make refreshData available as dependency
  const fetchFinanceData = useCallback(async () => {
    try {
      setLoading(true);

      // Buscar contas a pagar (despesas)
      const { data: expensesData, error: expensesError } = await supabase
        .from('finances')
        .select('*')
        .eq('type', 'expense')
        .order('due_date', { ascending: true });
        
      if (expensesError) {
        console.error('Erro ao buscar despesas:', expensesError);
        toast.error('Erro ao carregar dados financeiros.');
        return;
      }

      // Buscar contas a receber (receitas)
      const { data: revenuesData, error: revenuesError } = await supabase
        .from('finances')
        .select('*')
        .eq('type', 'revenue')
        .order('due_date', { ascending: true });
        
      if (revenuesError) {
        console.error('Erro ao buscar receitas:', revenuesError);
        toast.error('Erro ao carregar dados financeiros.');
        return;
      }

      // Buscar ordens relacionadas às receitas que têm related_order_id
      const orderIds = revenuesData
        .filter(rev => rev.related_order_id)
        .map(rev => rev.related_order_id);

      let clientsMap: Record<string, string> = {};

      if (orderIds.length > 0) {
        // Buscar ordens
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('id, client_id')
          .in('id', orderIds);
          
        if (!ordersError && ordersData) {
          // Buscar clientes
          const clientIds = ordersData.map(order => order.client_id);
          const { data: clientsData, error: clientsError } = await supabase
            .from('clients')
            .select('id, name')
            .in('id', clientIds);
            
          if (!clientsError && clientsData) {
            // Criar mapa de ordens para clientes
            const orderClientMap: Record<string, string> = {};
            ordersData.forEach(order => {
              const client = clientsData.find(c => c.id === order.client_id);
              if (client) {
                orderClientMap[order.id] = client.name;
              }
            });

            clientsMap = orderClientMap;
          }
        }
      }

      // Formatar contas a pagar
      const formattedPayables = expensesData.map(expense => ({
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
      const formattedReceivables = revenuesData.map(revenue => {
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

      setPayableAccounts(formattedPayables);
      setReceivableAccounts(formattedReceivables);
      
    } catch (error) {
      console.error('Erro ao buscar dados financeiros:', error);
      toast.error('Ocorreu um erro inesperado ao carregar os dados financeiros.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFinanceData();
  }, [fetchFinanceData]);

  // Filtered data based on search term
  const filteredPayables = payableAccounts.filter(acc => 
    acc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    acc.category.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredReceivables = receivableAccounts.filter(acc => 
    acc.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
    acc.orderNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle payment of an account
  const handlePayment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('finances')
        .update({
          status: 'paid',
          payment_date: new Date().toISOString()
        })
        .eq('id', id);
        
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
      const { error } = await supabase
        .from('finances')
        .update({
          status: 'received',
          payment_date: new Date().toISOString()
        })
        .eq('id', id);
        
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
      
      const { error } = await supabase
        .from('finances')
        .update(updateData)
        .eq('id', currentAccount.id);
        
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

  // Add new payable account
  const handleAddPayable = async (data: any) => {
    try {
      const newPayableData = {
        description: data.description,
        category: data.category,
        amount: data.value,
        due_date: data.dueDate,
        status: 'pending',
        notes: data.notes || '',
        type: 'expense'
      };
      
      const { data: insertedData, error } = await supabase
        .from('finances')
        .insert(newPayableData)
        .select()
        .single();
        
      if (error) {
        console.error('Erro ao adicionar conta a pagar:', error);
        toast.error('Erro ao adicionar conta a pagar.');
        return;
      }
      
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
      
    } catch (error) {
      console.error('Erro ao adicionar conta a pagar:', error);
      toast.error('Ocorreu um erro ao adicionar a conta a pagar.');
    }
  };

  // Add new receivable account
  const handleAddReceivable = async (data: any) => {
    try {
      // Busca o ID do cliente pelo nome (se for necessário)
      let orderId = null;
      
      // Se o orderNumber for fornecido e não for N/A, tentamos buscar a ordem
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
      
      const { data: insertedData, error } = await supabase
        .from('finances')
        .insert(newReceivableData)
        .select()
        .single();
        
      if (error) {
        console.error('Erro ao adicionar conta a receber:', error);
        toast.error('Erro ao adicionar conta a receber.');
        return;
      }
      
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
