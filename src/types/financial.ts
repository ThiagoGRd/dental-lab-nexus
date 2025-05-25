// Definição de tipos para o sistema financeiro com suporte a parcelamentos

// Enum para tipos de transação financeira
export enum TransactionType {
  INCOME = 'INCOME',       // Receita
  EXPENSE = 'EXPENSE',     // Despesa
  RECEIVABLE = 'RECEIVABLE', // Conta a receber
  PAYABLE = 'PAYABLE'      // Conta a pagar
}

// Enum para status de pagamento
export enum PaymentStatus {
  PENDING = 'PENDING',     // Pendente
  PARTIAL = 'PARTIAL',     // Parcialmente pago
  PAID = 'PAID',           // Pago
  OVERDUE = 'OVERDUE',     // Atrasado
  CANCELLED = 'CANCELLED'  // Cancelado
}

// Enum para métodos de pagamento
export enum PaymentMethod {
  CASH = 'CASH',           // Dinheiro
  CREDIT_CARD = 'CREDIT_CARD', // Cartão de crédito
  DEBIT_CARD = 'DEBIT_CARD',   // Cartão de débito
  BANK_TRANSFER = 'BANK_TRANSFER', // Transferência bancária
  PIX = 'PIX',             // PIX
  CHECK = 'CHECK',         // Cheque
  BILLET = 'BILLET',       // Boleto
  OTHER = 'OTHER'          // Outro
}

// Enum para categorias de transação
export enum TransactionCategory {
  // Receitas
  SERVICE = 'SERVICE',     // Serviços prestados
  PRODUCT = 'PRODUCT',     // Venda de produtos
  
  // Despesas
  MATERIAL = 'MATERIAL',   // Materiais
  EQUIPMENT = 'EQUIPMENT', // Equipamentos
  RENT = 'RENT',           // Aluguel
  UTILITIES = 'UTILITIES', // Utilidades (água, luz, etc)
  SALARY = 'SALARY',       // Salários
  TAX = 'TAX',             // Impostos
  MAINTENANCE = 'MAINTENANCE', // Manutenção
  MARKETING = 'MARKETING', // Marketing
  OTHER_EXPENSE = 'OTHER_EXPENSE', // Outras despesas
  OTHER_INCOME = 'OTHER_INCOME'    // Outras receitas
}

// Interface para transação financeira
export interface FinancialTransaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  date: Date;
  category: TransactionCategory;
  paymentMethod?: PaymentMethod;
  status: PaymentStatus;
  notes?: string;
  attachments?: string[];  // URLs para comprovantes
  createdBy: string;
  createdAt: Date;
  updatedAt?: Date;
  
  // Campos específicos para contas a receber/pagar
  dueDate?: Date;
  clientId?: string;      // Para contas a receber
  supplierId?: string;    // Para contas a pagar
  orderId?: string;       // Referência à ordem de serviço
  
  // Campos para parcelamento
  isInstallment: boolean;
  installmentPlan?: InstallmentPlan;
}

// Interface para plano de parcelamento
export interface InstallmentPlan {
  id: string;
  totalAmount: number;
  numberOfInstallments: number;
  installments: Installment[];
  createdAt: Date;
  updatedAt?: Date;
}

// Interface para parcela
export interface Installment {
  id: string;
  installmentNumber: number;
  amount: number;
  dueDate: Date;
  status: PaymentStatus;
  paymentDate?: Date;
  paymentMethod?: PaymentMethod;
  notes?: string;
  
  // Campos para juros e multas
  hasInterest: boolean;
  interestAmount?: number;
  hasFine: boolean;
  fineAmount?: number;
  
  // Valor total (parcela + juros + multa)
  totalAmount: number;
}

// Interface para relatório financeiro
export interface FinancialReport {
  id: string;
  type: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM';
  startDate: Date;
  endDate: Date;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  transactions: FinancialTransaction[];
  generatedAt: Date;
  generatedBy: string;
}

// Interface para fluxo de caixa
export interface CashFlow {
  date: Date;
  openingBalance: number;
  closingBalance: number;
  incomes: FinancialTransaction[];
  expenses: FinancialTransaction[];
  totalIncome: number;
  totalExpense: number;
  dailyBalance: number;
}

// Interface para previsão financeira
export interface FinancialForecast {
  period: 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  startDate: Date;
  endDate: Date;
  projectedIncome: number;
  projectedExpense: number;
  projectedBalance: number;
  
  // Detalhes por categoria
  incomeByCategory: {
    category: TransactionCategory;
    amount: number;
  }[];
  
  expenseByCategory: {
    category: TransactionCategory;
    amount: number;
  }[];
  
  // Detalhes por período (semanas, meses, etc)
  detailsByPeriod: {
    periodStart: Date;
    periodEnd: Date;
    income: number;
    expense: number;
    balance: number;
  }[];
}

// Interface para comissão de técnico
export interface TechnicianCommission {
  id: string;
  technicianId: string;
  period: {
    startDate: Date;
    endDate: Date;
  };
  orders: {
    orderId: string;
    orderAmount: number;
    commissionAmount: number;
    commissionRate: number;
  }[];
  totalOrdersAmount: number;
  totalCommissionAmount: number;
  status: 'PENDING' | 'PAID' | 'CANCELLED';
  paymentDate?: Date;
  paymentMethod?: PaymentMethod;
  notes?: string;
}

// Interface para integração com ordem de serviço
export interface OrderFinancialDetails {
  orderId: string;
  totalAmount: number;
  costDetails: {
    materials: number;
    labor: number;
    overhead: number;
    other: number;
  };
  profitMargin: number;
  paymentPlan: InstallmentPlan;
  status: PaymentStatus;
  transactions: FinancialTransaction[];
}
