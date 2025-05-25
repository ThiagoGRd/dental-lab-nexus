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

  // Carregar todas as transações
  const fetchTransactions = useCallback(async (
    startDate?: Date,
    endDate?: Date,
    type?: TransactionType
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      let query = supabase
        .from('financial_transactions')
        .select('*');
      
      if (startDate) {
        query = query.gte('date', startDate.toISOString());
      }
      
      if (endDate) {
        query = query.lte('date', endDate.toISOString());
      }
      
      if (type) {
        query = query.eq('type', type);
      }
      
      const { data, error } = await query.order('date', { ascending: false });
      
      if (error) {
        console.error('Erro ao buscar transações:', error);
        setError('Não foi possível carregar as transações financeiras.');
        return;
      }
      
      if (data) {
        setTransactions(data as unknown as FinancialTransaction[]);
        
        // Filtrar contas a receber e a pagar
        const receivables = data.filter(
          t => t.type === TransactionType.RECEIVABLE
        ) as unknown as FinancialTransaction[];
        
        const payables = data.filter(
          t => t.type === TransactionType.PAYABLE
        ) as unknown as FinancialTransaction[];
        
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

  // Carregar planos de parcelamento
  const fetchInstallmentPlans = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('installment_plans')
        .select('*');
      
      if (error) {
        console.error('Erro ao buscar planos de parcelamento:', error);
        setError('Não foi possível carregar os planos de parcelamento.');
        return;
      }
      
      if (data) {
        setInstallmentPlans(data as unknown as InstallmentPlan[]);
      }
    } catch (err) {
      console.error('Erro inesperado:', err);
      setError('Ocorreu um erro ao processar os planos de parcelamento.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregar fluxo de caixa
  const fetchCashFlow = useCallback(async (
    startDate: Date,
    endDate: Date
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('cash_flow')
        .select('*')
        .gte('date', startDate.toISOString())
        .lte('date', endDate.toISOString())
        .order('date', { ascending: true });
      
      if (error) {
        console.error('Erro ao buscar fluxo de caixa:', error);
        setError('Não foi possível carregar o fluxo de caixa.');
        return;
      }
      
      if (data) {
        setCashFlow(data as unknown as CashFlow[]);
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
      const newTransaction: FinancialTransaction = {
        ...transaction,
        id: uuidv4(),
        createdAt: new Date(),
        isInstallment: false
      };
      
      const { error } = await supabase
        .from('financial_transactions')
        .insert(newTransaction);
      
      if (error) {
        console.error('Erro ao adicionar transação:', error);
        setError('Não foi possível adicionar a transação.');
        return null;
      }
      
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
      const { error } = await supabase
        .from('financial_transactions')
        .update({
          ...updates,
          updatedAt: new Date()
        })
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

  // Criar plano de parcelamento
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
      const installments: Installment[] = [];
      
      // Criar parcelas
      for (let i = 0; i < numberOfInstallments; i++) {
        const dueDate = new Date(firstDueDate);
        dueDate.setMonth(dueDate.getMonth() + i);
        
        installments.push({
          id: uuidv4(),
          installmentNumber: i + 1,
          amount: installmentAmount,
          dueDate,
          status: PaymentStatus.PENDING,
          hasInterest: false,
          hasFine: false,
          totalAmount: installmentAmount
        });
      }
      
      // Ajustar última parcela para garantir soma exata
      const sumInstallments = installmentAmount * numberOfInstallments;
      const difference = totalAmount - sumInstallments;
      
      if (difference !== 0) {
        const lastInstallment = installments[installments.length - 1];
        lastInstallment.amount = parseFloat((lastInstallment.amount + difference).toFixed(2));
        lastInstallment.totalAmount = lastInstallment.amount;
      }
      
      // Criar plano de parcelamento
      const installmentPlan: InstallmentPlan = {
        id: uuidv4(),
        totalAmount,
        numberOfInstallments,
        installments,
        createdAt: new Date()
      };
      
      // Salvar plano de parcelamento
      const { error: planError } = await supabase
        .from('installment_plans')
        .insert(installmentPlan);
      
      if (planError) {
        console.error('Erro ao criar plano de parcelamento:', planError);
        setError('Não foi possível criar o plano de parcelamento.');
        return null;
      }
      
      // Criar transações para cada parcela
      for (const installment of installments) {
        const transaction: Omit<FinancialTransaction, 'id' | 'createdAt' | 'isInstallment'> = {
          type: installmentType,
          amount: installment.amount,
          description: `${description} - Parcela ${installment.installmentNumber}/${numberOfInstallments}`,
          date: new Date(),
          category,
          status: PaymentStatus.PENDING,
          createdBy: 'system',
          dueDate: installment.dueDate,
          clientId,
          supplierId,
          orderId,
          installmentPlan: {
            ...installmentPlan,
            installments: [installment]
          }
        };
        
        await addTransaction(transaction);
      }
      
      setInstallmentPlans(prev => [...prev, installmentPlan]);
      
      toast.success('Plano de parcelamento criado com sucesso!');
      return installmentPlan;
    } catch (err) {
      console.error('Erro inesperado:', err);
      setError('Ocorreu um erro ao criar o plano de parcelamento.');
      return null;
    } finally {
      setLoading(false);
    }
  }, [addTransaction]);

  // Registrar pagamento de parcela
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
    setLoading(true);
    setError(null);
    
    try {
      // Buscar transação
      const transaction = transactions.find(t => t.id === transactionId);
      
      if (!transaction || !transaction.installmentPlan) {
        setError('Transação ou plano de parcelamento não encontrado.');
        return false;
      }
      
      // Encontrar parcela específica
      const installmentPlan = { ...transaction.installmentPlan };
      const installmentIndex = installmentPlan.installments.findIndex(
        i => i.installmentNumber === installmentNumber
      );
      
      if (installmentIndex === -1) {
        setError('Parcela não encontrada.');
        return false;
      }
      
      // Atualizar parcela
      const installment = { ...installmentPlan.installments[installmentIndex] };
      installment.status = PaymentStatus.PAID;
      installment.paymentDate = paymentDate;
      installment.paymentMethod = paymentMethod;
      installment.notes = notes;
      installment.hasInterest = hasInterest;
      installment.interestAmount = interestAmount;
      installment.hasFine = hasFine;
      installment.fineAmount = fineAmount;
      
      // Calcular valor total pago
      const baseAmount = paidAmount !== undefined ? paidAmount : installment.amount;
      installment.totalAmount = baseAmount + (interestAmount || 0) + (fineAmount || 0);
      
      // Atualizar plano de parcelamento
      const updatedInstallments = [...installmentPlan.installments];
      updatedInstallments[installmentIndex] = installment;
      
      const updatedPlan = {
        ...installmentPlan,
        installments: updatedInstallments,
        updatedAt: new Date()
      };
      
      // Atualizar transação
      const updatedTransaction: Partial<FinancialTransaction> = {
        status: PaymentStatus.PAID,
        paymentMethod,
        updatedAt: new Date(),
        notes: notes ? `${transaction.notes || ''} ${notes}` : transaction.notes,
        installmentPlan: {
          ...updatedPlan,
          installments: [installment]
        }
      };
      
      // Salvar alterações
      const { error } = await supabase
        .from('financial_transactions')
        .update(updatedTransaction)
        .eq('id', transactionId);
      
      if (error) {
        console.error('Erro ao registrar pagamento:', error);
        setError('Não foi possível registrar o pagamento da parcela.');
        return false;
      }
      
      // Atualizar plano de parcelamento completo
      const { error: planError } = await supabase
        .from('installment_plans')
        .update({
          installments: updatedInstallments,
          updatedAt: new Date()
        })
        .eq('id', installmentPlan.id);
      
      if (planError) {
        console.error('Erro ao atualizar plano de parcelamento:', planError);
        // Não falhar completamente, já que o pagamento foi registrado
      }
      
      // Atualizar estados locais
      setTransactions(prev => 
        prev.map(t => t.id === transactionId ? { ...t, ...updatedTransaction } : t)
      );
      
      setInstallmentPlans(prev => 
        prev.map(p => p.id === installmentPlan.id ? updatedPlan : p)
      );
      
      // Atualizar contas a receber ou a pagar
      if (transaction.type === TransactionType.RECEIVABLE) {
        setReceivables(prev => 
          prev.map(t => t.id === transactionId ? { ...t, ...updatedTransaction } : t)
        );
      } else if (transaction.type === TransactionType.PAYABLE) {
        setPayables(prev => 
          prev.map(t => t.id === transactionId ? { ...t, ...updatedTransaction } : t)
        );
      }
      
      toast.success('Pagamento registrado com sucesso!');
      return true;
    } catch (err) {
      console.error('Erro inesperado:', err);
      setError('Ocorreu um erro ao registrar o pagamento da parcela.');
      return false;
    } finally {
      setLoading(false);
    }
  }, [transactions]);

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
        .from('financial_transactions')
        .select('*')
        .gte('date', startDate.toISOString())
        .lte('date', endDate.toISOString());
      
      if (error) {
        console.error('Erro ao buscar transações para relatório:', error);
        setError('Não foi possível gerar o relatório financeiro.');
        return null;
      }
      
      if (!data) {
        setError('Nenhuma transação encontrada no período.');
        return null;
      }
      
      const reportTransactions = data as unknown as FinancialTransaction[];
      
      // Calcular totais
      const incomes = reportTransactions.filter(
        t => t.type === TransactionType.INCOME || 
             (t.type === TransactionType.RECEIVABLE && t.status === PaymentStatus.PAID)
      );
      
      const expenses = reportTransactions.filter(
        t => t.type === TransactionType.EXPENSE || 
             (t.type === TransactionType.PAYABLE && t.status === PaymentStatus.PAID)
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
      
      // Em um cenário real, salvaríamos o relatório
      
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
          clientId,
          orderId,
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
