
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../integrations/supabase/client';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { 
  FinancialTransaction, 
  TransactionType, 
  PaymentStatus,
  PaymentMethod,
  TransactionCategory,
  InstallmentPlan,
  Installment,
  FinancialReport,
  CashFlow
} from '../types/financial';

export const useFinancial = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [receivables, setReceivables] = useState<FinancialTransaction[]>([]);
  const [payables, setPayables] = useState<FinancialTransaction[]>([]);
  const [installmentPlans, setInstallmentPlans] = useState<InstallmentPlan[]>([]);
  const [cashFlow, setCashFlow] = useState<CashFlow[]>([]);

  // Carregar todas as transações da tabela 'finances'
  const fetchTransactions = useCallback(async (
    startDate?: Date,
    endDate?: Date,
    type?: TransactionType
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      let query = supabase
        .from('finances')
        .select('*');
      
      if (startDate) {
        query = query.gte('created_at', startDate.toISOString());
      }
      
      if (endDate) {
        query = query.lte('created_at', endDate.toISOString());
      }
      
      if (type) {
        query = query.eq('type', type);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) {
        console.error('Erro ao buscar transações:', error);
        setError('Não foi possível carregar as transações financeiras.');
        return;
      }
      
      if (data) {
        // Mapear dados da tabela 'finances' para o tipo FinancialTransaction
        const mappedTransactions: FinancialTransaction[] = data.map(item => ({
          id: item.id,
          type: item.type as TransactionType,
          amount: item.amount,
          description: item.description,
          date: new Date(item.created_at),
          category: (item.category as TransactionCategory) || 'other' as TransactionCategory,
          status: (item.status as PaymentStatus) || PaymentStatus.PENDING,
          createdBy: 'system',
          createdAt: new Date(item.created_at),
          dueDate: item.due_date ? new Date(item.due_date) : undefined,
          notes: item.notes || undefined,
          isInstallment: false
        }));
        
        setTransactions(mappedTransactions);
        
        const receivables = mappedTransactions.filter(
          t => t.type === TransactionType.RECEIVABLE
        );
        
        const payables = mappedTransactions.filter(
          t => t.type === TransactionType.PAYABLE
        );
        
        setReceivables(receivables);
        setPayables(payables);
      }
    } catch (err) {
      console.error('Erro inesperado:', err);
      setError('Ocorreu um erro ao processar as transações financeiras.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchInstallmentPlans = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      setInstallmentPlans([]);
    } catch (err) {
      console.error('Erro inesperado:', err);
      setError('Ocorreu um erro ao processar os planos de parcelamento.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCashFlow = useCallback(async (
    startDate: Date,
    endDate: Date
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('finances')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('Erro ao buscar fluxo de caixa:', error);
        setError('Não foi possível carregar o fluxo de caixa.');
        return;
      }
      
      if (data) {
        // Mapear dados para CashFlow completo
        const cashFlowData: CashFlow[] = data.map(item => ({
          id: item.id,
          date: new Date(item.created_at),
          openingBalance: 0,
          closingBalance: 0,
          dailyBalance: 0,
          incomes: item.type === 'income' ? [item] : [],
          expenses: item.type === 'expense' ? [item] : [],
          totalIncome: item.type === 'income' ? item.amount : 0,
          totalExpense: item.type === 'expense' ? item.amount : 0,
          netFlow: item.type === 'income' ? item.amount : -item.amount
        }));
        
        setCashFlow(cashFlowData);
      }
    } catch (err) {
      console.error('Erro inesperado:', err);
      setError('Ocorreu um erro ao processar o fluxo de caixa.');
    } finally {
      setLoading(false);
    }
  }, []);

  const addTransaction = useCallback(async (
    transaction: Omit<FinancialTransaction, 'id' | 'createdAt' | 'isInstallment'>
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const newFinanceRecord = {
        type: transaction.type,
        amount: transaction.amount,
        description: transaction.description,
        category: transaction.category,
        status: transaction.status || PaymentStatus.PENDING,
        due_date: transaction.dueDate?.toISOString(),
        notes: transaction.notes,
        related_order_id: undefined // Removendo propriedade que não existe
      };
      
      const { data, error } = await supabase
        .from('finances')
        .insert(newFinanceRecord)
        .select()
        .single();
      
      if (error) {
        console.error('Erro ao adicionar transação:', error);
        setError('Não foi possível adicionar a transação.');
        return null;
      }
      
      const newTransaction: FinancialTransaction = {
        id: data.id,
        type: data.type as TransactionType,
        amount: data.amount,
        description: data.description,
        date: new Date(data.created_at),
        category: (data.category as TransactionCategory) || 'other' as TransactionCategory,
        status: (data.status as PaymentStatus) || PaymentStatus.PENDING,
        createdBy: 'system',
        createdAt: new Date(data.created_at),
        dueDate: data.due_date ? new Date(data.due_date) : undefined,
        notes: data.notes || undefined,
        isInstallment: false
      };
      
      setTransactions(prev => [newTransaction, ...prev]);
      
      if (transaction.type === TransactionType.RECEIVABLE) {
        setReceivables(prev => [newTransaction, ...prev]);
      } else if (transaction.type === TransactionType.PAYABLE) {
        setPayables(prev => [newTransaction, ...prev]);
      }
      
      toast.success('Transação adicionada com sucesso!');
      return newTransaction;
    } catch (err) {
      console.error('Erro inesperado:', err);
      setError('Ocorreu um erro ao adicionar a transação.');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTransaction = useCallback(async (
    id: string,
    updates: Partial<FinancialTransaction>
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const updateData: any = {};
      
      if (updates.amount !== undefined) updateData.amount = updates.amount;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.category !== undefined) updateData.category = updates.category;
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.dueDate !== undefined) updateData.due_date = updates.dueDate?.toISOString();
      if (updates.notes !== undefined) updateData.notes = updates.notes;
      
      const { error } = await supabase
        .from('finances')
        .update(updateData)
        .eq('id', id);
      
      if (error) {
        console.error('Erro ao atualizar transação:', error);
        setError('Não foi possível atualizar a transação.');
        return false;
      }
      
      setTransactions(prev => 
        prev.map(t => t.id === id ? { ...t, ...updates } : t)
      );
      
      const transaction = transactions.find(t => t.id === id);
      if (transaction) {
        if (transaction.type === TransactionType.RECEIVABLE) {
          setReceivables(prev => 
            prev.map(t => t.id === id ? { ...t, ...updates } : t)
          );
        } else if (transaction.type === TransactionType.PAYABLE) {
          setPayables(prev => 
            prev.map(t => t.id === id ? { ...t, ...updates } : t)
          );
        }
      }
      
      toast.success('Transação atualizada com sucesso!');
      return true;
    } catch (err) {
      console.error('Erro inesperado:', err);
      setError('Ocorreu um erro ao atualizar a transação.');
      return false;
    } finally {
      setLoading(false);
    }
  }, [transactions]);

  const createInstallmentPlan = useCallback(async (
    totalAmount: number,
    numberOfInstallments: number,
    firstDueDate: Date,
    installmentType: TransactionType,
    description: string,
    category: TransactionCategory,
    clientId?: string,
    supplierId?: string,
    orderId?: string
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const installmentAmount = parseFloat((totalAmount / numberOfInstallments).toFixed(2));
      
      for (let i = 0; i < numberOfInstallments; i++) {
        const dueDate = new Date(firstDueDate);
        dueDate.setMonth(dueDate.getMonth() + i);
        
        const transaction: Omit<FinancialTransaction, 'id' | 'createdAt' | 'isInstallment'> = {
          type: installmentType,
          amount: installmentAmount,
          description: `${description} - Parcela ${i + 1}/${numberOfInstallments}`,
          date: new Date(),
          category,
          status: PaymentStatus.PENDING,
          createdBy: 'system',
          dueDate
        };
        
        await addTransaction(transaction);
      }
      
      toast.success('Plano de parcelamento criado com sucesso!');
      return { id: uuidv4(), totalAmount, numberOfInstallments, installments: [], createdAt: new Date() };
    } catch (err) {
      console.error('Erro inesperado:', err);
      setError('Ocorreu um erro ao criar o plano de parcelamento.');
      return null;
    } finally {
      setLoading(false);
    }
  }, [addTransaction]);

  const registerInstallmentPayment = useCallback(async (
    transactionId: string,
    installmentNumber: number,
    paymentMethod: PaymentMethod,
    paymentDate: Date = new Date(),
    paidAmount?: number,
    hasInterest: boolean = false,
    interestAmount: number = 0,
    hasFine: boolean = false,
    fineAmount: number = 0,
    notes?: string
  ) => {
    return await updateTransaction(transactionId, {
      status: PaymentStatus.PAID,
      notes
    });
  }, [updateTransaction]);

  const generateFinancialReport = useCallback(async (
    startDate: Date,
    endDate: Date,
    type: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM' = 'CUSTOM'
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('finances')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());
      
      if (error) {
        console.error('Erro ao buscar transações para relatório:', error);
        setError('Não foi possível gerar o relatório financeiro.');
        return null;
      }
      
      if (!data) {
        setError('Nenhuma transação encontrada no período.');
        return null;
      }
      
      const reportTransactions: FinancialTransaction[] = data.map(item => ({
        id: item.id,
        type: item.type as TransactionType,
        amount: item.amount,
        description: item.description,
        date: new Date(item.created_at),
        category: (item.category as TransactionCategory) || 'other' as TransactionCategory,
        status: (item.status as PaymentStatus) || PaymentStatus.PENDING,
        createdBy: 'system',
        createdAt: new Date(item.created_at),
        dueDate: item.due_date ? new Date(item.due_date) : undefined,
        notes: item.notes || undefined,
        isInstallment: false
      }));
      
      const incomes = reportTransactions.filter(
        t => (t.type === TransactionType.RECEIVABLE) && t.status === PaymentStatus.PAID
      );
      
      const expenses = reportTransactions.filter(
        t => (t.type === TransactionType.PAYABLE) && t.status === PaymentStatus.PAID
      );
      
      const totalIncome = incomes.reduce((sum, t) => sum + t.amount, 0);
      const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);
      const balance = totalIncome - totalExpense;
      
      const report: FinancialReport = {
        id: uuidv4(),
        type,
        startDate,
        endDate,
        totalIncome,
        totalExpense,
        balance,
        transactions: reportTransactions,
        generatedAt: new Date(),
        generatedBy: 'system'
      };
      
      toast.success('Relatório financeiro gerado com sucesso!');
      return report;
    } catch (err) {
      console.error('Erro inesperado:', err);
      setError('Ocorreu um erro ao gerar o relatório financeiro.');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createTransactionFromOrder = useCallback(async (
    orderId: string,
    amount: number,
    clientId: string,
    description: string,
    dueDate: Date,
    installments: number = 1,
    category: TransactionCategory = 'service' as TransactionCategory
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      if (installments <= 1) {
        const transaction: Omit<FinancialTransaction, 'id' | 'createdAt' | 'isInstallment'> = {
          type: TransactionType.RECEIVABLE,
          amount,
          description,
          date: new Date(),
          category,
          status: PaymentStatus.PENDING,
          dueDate,
          createdBy: 'system'
        };
        
        const result = await addTransaction(transaction);
        return result;
      } else {
        const result = await createInstallmentPlan(
          amount,
          installments,
          dueDate,
          TransactionType.RECEIVABLE,
          description,
          category,
          clientId,
          undefined,
          orderId
        );
        
        return result;
      }
    } catch (err) {
      console.error('Erro inesperado:', err);
      setError('Ocorreu um erro ao criar a transação a partir da ordem de serviço.');
      return null;
    } finally {
      setLoading(false);
    }
  }, [addTransaction, createInstallmentPlan]);

  useEffect(() => {
    fetchTransactions();
    fetchInstallmentPlans();
  }, [fetchTransactions, fetchInstallmentPlans]);

  return {
    loading,
    error,
    transactions,
    receivables,
    payables,
    installmentPlans,
    cashFlow,
    addTransaction,
    updateTransaction,
    createInstallmentPlan,
    registerInstallmentPayment,
    generateFinancialReport,
    createTransactionFromOrder,
    fetchTransactions,
    fetchInstallmentPlans,
    fetchCashFlow
  };
};

export default useFinancial;
