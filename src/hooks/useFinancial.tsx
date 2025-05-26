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
        .from('finances') // Usando tabela 'finances' em vez de 'financial_transactions'
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
          category: (item.category as TransactionCategory) || TransactionCategory.OTHER,
          status: (item.status as PaymentStatus) || PaymentStatus.PENDING,
          createdBy: 'system',
          createdAt: new Date(item.created_at),
          dueDate: item.due_date ? new Date(item.due_date) : undefined,
          paymentDate: item.payment_date ? new Date(item.payment_date) : undefined,
          notes: item.notes || undefined,
          relatedOrderId: item.related_order_id || undefined,
          isInstallment: false
        }));
        
        setTransactions(mappedTransactions);
        
        // Filtrar contas a receber e a pagar
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

  // Carregar planos de parcelamento (mock por enquanto)
  const fetchInstallmentPlans = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Como não temos tabela específica para planos de parcelamento,
      // vamos usar um mock por enquanto
      setInstallmentPlans([]);
    } catch (err) {
      console.error('Erro inesperado:', err);
      setError('Ocorreu um erro ao processar os planos de parcelamento.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregar fluxo de caixa (usando dados da tabela finances)
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
        // Mapear dados para CashFlow
        const cashFlowData: CashFlow[] = data.map(item => ({
          id: item.id,
          date: new Date(item.created_at),
          type: item.type as 'income' | 'expense',
          amount: item.amount,
          description: item.description,
          category: item.category || 'other',
          balance: 0 // Será calculado posteriormente
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

  // Adicionar nova transação
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
        payment_date: transaction.paymentDate?.toISOString(),
        notes: transaction.notes,
        related_order_id: transaction.relatedOrderId
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
      
      // Mapear dados de volta para FinancialTransaction
      const newTransaction: FinancialTransaction = {
        id: data.id,
        type: data.type as TransactionType,
        amount: data.amount,
        description: data.description,
        date: new Date(data.created_at),
        category: (data.category as TransactionCategory) || TransactionCategory.OTHER,
        status: (data.status as PaymentStatus) || PaymentStatus.PENDING,
        createdBy: 'system',
        createdAt: new Date(data.created_at),
        dueDate: data.due_date ? new Date(data.due_date) : undefined,
        paymentDate: data.payment_date ? new Date(data.payment_date) : undefined,
        notes: data.notes || undefined,
        relatedOrderId: data.related_order_id || undefined,
        isInstallment: false
      };
      
      setTransactions(prev => [newTransaction, ...prev]);
      
      // Atualizar contas a receber ou a pagar
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

  // Atualizar transação existente
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
      if (updates.paymentDate !== undefined) updateData.payment_date = updates.paymentDate?.toISOString();
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
      
      // Atualizar estado local
      setTransactions(prev => 
        prev.map(t => t.id === id ? { ...t, ...updates, updatedAt: new Date() } : t)
      );
      
      // Atualizar contas a receber ou a pagar
      const transaction = transactions.find(t => t.id === id);
      if (transaction) {
        if (transaction.type === TransactionType.RECEIVABLE) {
          setReceivables(prev => 
            prev.map(t => t.id === id ? { ...t, ...updates, updatedAt: new Date() } : t)
          );
        } else if (transaction.type === TransactionType.PAYABLE) {
          setPayables(prev => 
            prev.map(t => t.id === id ? { ...t, ...updates, updatedAt: new Date() } : t)
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

  // Criar plano de parcelamento (implementação simplificada)
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
      // Calcular valor de cada parcela
      const installmentAmount = parseFloat((totalAmount / numberOfInstallments).toFixed(2));
      
      // Criar transações para cada parcela
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
          dueDate,
          relatedOrderId: orderId
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

  // Registrar pagamento de parcela (implementação simplificada)
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
      paymentDate,
      notes
    });
  }, [updateTransaction]);

  // Gerar relatório financeiro
  const generateFinancialReport = useCallback(async (
    startDate: Date,
    endDate: Date,
    type: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM' = 'CUSTOM'
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      // Buscar transações no período
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
      
      // Mapear dados para FinancialTransaction
      const reportTransactions: FinancialTransaction[] = data.map(item => ({
        id: item.id,
        type: item.type as TransactionType,
        amount: item.amount,
        description: item.description,
        date: new Date(item.created_at),
        category: (item.category as TransactionCategory) || TransactionCategory.OTHER,
        status: (item.status as PaymentStatus) || PaymentStatus.PENDING,
        createdBy: 'system',
        createdAt: new Date(item.created_at),
        dueDate: item.due_date ? new Date(item.due_date) : undefined,
        paymentDate: item.payment_date ? new Date(item.payment_date) : undefined,
        notes: item.notes || undefined,
        relatedOrderId: item.related_order_id || undefined,
        isInstallment: false
      }));
      
      // Calcular totais
      const incomes = reportTransactions.filter(
        t => (t.type === 'income' || t.type === TransactionType.RECEIVABLE) && t.status === PaymentStatus.PAID
      );
      
      const expenses = reportTransactions.filter(
        t => (t.type === 'expense' || t.type === TransactionType.PAYABLE) && t.status === PaymentStatus.PAID
      );
      
      const totalIncome = incomes.reduce((sum, t) => sum + t.amount, 0);
      const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);
      const balance = totalIncome - totalExpense;
      
      // Criar relatório
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

  // Criar transação a partir de ordem de serviço
  const createTransactionFromOrder = useCallback(async (
    orderId: string,
    amount: number,
    clientId: string,
    description: string,
    dueDate: Date,
    installments: number = 1,
    category: TransactionCategory = TransactionCategory.SERVICE
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      if (installments <= 1) {
        // Transação única
        const transaction: Omit<FinancialTransaction, 'id' | 'createdAt' | 'isInstallment'> = {
          type: TransactionType.RECEIVABLE,
          amount,
          description,
          date: new Date(),
          category,
          status: PaymentStatus.PENDING,
          dueDate,
          relatedOrderId: orderId,
          createdBy: 'system'
        };
        
        const result = await addTransaction(transaction);
        return result;
      } else {
        // Criar parcelamento
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

  // Carregar dados iniciais
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
