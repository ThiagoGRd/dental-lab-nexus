import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  CreditCard, 
  DollarSign, 
  Calendar, 
  ArrowDown, 
  ArrowUp, 
  FileText, 
  Filter,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Download,
  Printer,
  BarChart3
} from 'lucide-react';
import useFinancial from '@/hooks/useFinancial';
import { 
  TransactionType, 
  PaymentStatus, 
  PaymentMethod,
  TransactionCategory,
  FinancialTransaction,
  InstallmentPlan,
  Installment
} from '@/types/financial';

// Componente para exibir status de pagamento
const PaymentStatusBadge: React.FC<{ status: PaymentStatus }> = ({ status }) => {
  switch (status) {
    case PaymentStatus.PAID:
      return (
        <Badge className="bg-green-100 text-green-700">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Pago
        </Badge>
      );
    case PaymentStatus.PENDING:
      return (
        <Badge className="bg-blue-100 text-blue-700">
          <Clock className="h-3 w-3 mr-1" />
          Pendente
        </Badge>
      );
    case PaymentStatus.PARTIAL:
      return (
        <Badge className="bg-amber-100 text-amber-700">
          <Clock className="h-3 w-3 mr-1" />
          Parcial
        </Badge>
      );
    case PaymentStatus.OVERDUE:
      return (
        <Badge variant="destructive">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Atrasado
        </Badge>
      );
    case PaymentStatus.CANCELLED:
      return (
        <Badge variant="outline" className="text-gray-500">
          Cancelado
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

// Componente para exibir método de pagamento
const PaymentMethodBadge: React.FC<{ method: PaymentMethod }> = ({ method }) => {
  switch (method) {
    case PaymentMethod.CASH:
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <DollarSign className="h-3 w-3 mr-1" />
          Dinheiro
        </Badge>
      );
    case PaymentMethod.CREDIT_CARD:
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          <CreditCard className="h-3 w-3 mr-1" />
          Cartão de Crédito
        </Badge>
      );
    case PaymentMethod.DEBIT_CARD:
      return (
        <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
          <CreditCard className="h-3 w-3 mr-1" />
          Cartão de Débito
        </Badge>
      );
    case PaymentMethod.BANK_TRANSFER:
      return (
        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
          Transferência
        </Badge>
      );
    case PaymentMethod.PIX:
      return (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
          PIX
        </Badge>
      );
    case PaymentMethod.CHECK:
      return (
        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
          Cheque
        </Badge>
      );
    case PaymentMethod.BILLET:
      return (
        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
          Boleto
        </Badge>
      );
    default:
      return <Badge variant="outline">{method}</Badge>;
  }
};

// Componente para exibir tipo de transação
const TransactionTypeBadge: React.FC<{ type: TransactionType }> = ({ type }) => {
  switch (type) {
    case TransactionType.INCOME:
      return (
        <Badge className="bg-green-100 text-green-700">
          <ArrowUp className="h-3 w-3 mr-1" />
          Receita
        </Badge>
      );
    case TransactionType.EXPENSE:
      return (
        <Badge className="bg-red-100 text-red-700">
          <ArrowDown className="h-3 w-3 mr-1" />
          Despesa
        </Badge>
      );
    case TransactionType.RECEIVABLE:
      return (
        <Badge className="bg-blue-100 text-blue-700">
          <ArrowUp className="h-3 w-3 mr-1" />
          A Receber
        </Badge>
      );
    case TransactionType.PAYABLE:
      return (
        <Badge className="bg-amber-100 text-amber-700">
          <ArrowDown className="h-3 w-3 mr-1" />
          A Pagar
        </Badge>
      );
    default:
      return <Badge variant="outline">{type}</Badge>;
  }
};

// Componente para exibir parcelas
const InstallmentsList: React.FC<{ 
  installmentPlan: InstallmentPlan;
  onPayInstallment?: (installment: Installment) => void;
}> = ({ 
  installmentPlan,
  onPayInstallment
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h4 className="text-sm font-medium">Plano de Parcelamento</h4>
          <p className="text-xs text-gray-500">
            Total: R$ {installmentPlan.totalAmount.toFixed(2)} em {installmentPlan.numberOfInstallments} parcelas
          </p>
        </div>
        <Badge variant="outline">
          {installmentPlan.installments.filter(i => i.status === PaymentStatus.PAID).length} 
          /{installmentPlan.numberOfInstallments} pagas
        </Badge>
      </div>
      
      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {installmentPlan.installments.map((installment) => (
          <Card key={installment.id} className="p-0">
            <CardContent className="p-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium">
                    Parcela {installment.installmentNumber}/{installmentPlan.numberOfInstallments}
                  </p>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <Calendar className="h-3 w-3 mr-1" />
                    Vencimento: {new Date(installment.dueDate).toLocaleDateString()}
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-sm font-medium">
                    R$ {installment.amount.toFixed(2)}
                  </p>
                  <div className="mt-1">
                    <PaymentStatusBadge status={installment.status} />
                  </div>
                </div>
              </div>
              
              {installment.status === PaymentStatus.PAID && installment.paymentDate && (
                <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-500">
                  <div className="flex justify-between">
                    <span>Pago em: {new Date(installment.paymentDate).toLocaleDateString()}</span>
                    {installment.paymentMethod && (
                      <PaymentMethodBadge method={installment.paymentMethod} />
                    )}
                  </div>
                </div>
              )}
              
              {installment.status !== PaymentStatus.PAID && onPayInstallment && (
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => onPayInstallment(installment)}
                  >
                    <DollarSign className="h-3 w-3 mr-1" />
                    Registrar Pagamento
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Componente para diálogo de pagamento de parcela
const PayInstallmentDialog: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  installment: Installment | null;
  onConfirm: (
    installment: Installment,
    paymentMethod: PaymentMethod,
    paymentDate: Date,
    hasInterest: boolean,
    interestAmount: number,
    hasFine: boolean,
    fineAmount: number,
    notes?: string
  ) => void;
}> = ({
  open,
  onOpenChange,
  installment,
  onConfirm
}) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [paymentDate, setPaymentDate] = useState<Date>(new Date());
  const [hasInterest, setHasInterest] = useState<boolean>(false);
  const [interestAmount, setInterestAmount] = useState<number>(0);
  const [hasFine, setHasFine] = useState<boolean>(false);
  const [fineAmount, setFineAmount] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');
  
  if (!installment) return null;
  
  const totalAmount = installment.amount + interestAmount + fineAmount;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar Pagamento de Parcela</DialogTitle>
          <DialogDescription>
            Parcela {installment.installmentNumber} - Vencimento: {new Date(installment.dueDate).toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="payment-method">Forma de Pagamento</Label>
            <Select value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}>
              <SelectTrigger id="payment-method">
                <SelectValue placeholder="Selecione a forma de pagamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={PaymentMethod.CASH}>Dinheiro</SelectItem>
                <SelectItem value={PaymentMethod.CREDIT_CARD}>Cartão de Crédito</SelectItem>
                <SelectItem value={PaymentMethod.DEBIT_CARD}>Cartão de Débito</SelectItem>
                <SelectItem value={PaymentMethod.BANK_TRANSFER}>Transferência</SelectItem>
                <SelectItem value={PaymentMethod.PIX}>PIX</SelectItem>
                <SelectItem value={PaymentMethod.CHECK}>Cheque</SelectItem>
                <SelectItem value={PaymentMethod.BILLET}>Boleto</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="payment-date">Data de Pagamento</Label>
            <DatePicker
              date={paymentDate}
              setDate={setPaymentDate}
              className="w-full"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="has-interest"
              checked={hasInterest}
              onChange={(e) => setHasInterest(e.target.checked)}
              className="rounded border-gray-300"
            />
            <Label htmlFor="has-interest">Incluir juros</Label>
          </div>
          
          {hasInterest && (
            <div className="space-y-2 pl-6">
              <Label htmlFor="interest-amount">Valor dos Juros (R$)</Label>
              <Input
                id="interest-amount"
                type="number"
                step="0.01"
                min="0"
                value={interestAmount}
                onChange={(e) => setInterestAmount(parseFloat(e.target.value) || 0)}
              />
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="has-fine"
              checked={hasFine}
              onChange={(e) => setHasFine(e.target.checked)}
              className="rounded border-gray-300"
            />
            <Label htmlFor="has-fine">Incluir multa</Label>
          </div>
          
          {hasFine && (
            <div className="space-y-2 pl-6">
              <Label htmlFor="fine-amount">Valor da Multa (R$)</Label>
              <Input
                id="fine-amount"
                type="number"
                step="0.01"
                min="0"
                value={fineAmount}
                onChange={(e) => setFineAmount(parseFloat(e.target.value) || 0)}
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Input
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observações sobre o pagamento"
            />
          </div>
          
          <div className="bg-gray-50 p-3 rounded-md">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Valor da Parcela:</span>
              <span className="text-sm">R$ {installment.amount.toFixed(2)}</span>
            </div>
            
            {hasInterest && (
              <div className="flex justify-between items-center mt-1">
                <span className="text-sm">Juros:</span>
                <span className="text-sm">+ R$ {interestAmount.toFixed(2)}</span>
              </div>
            )}
            
            {hasFine && (
              <div className="flex justify-between items-center mt-1">
                <span className="text-sm">Multa:</span>
                <span className="text-sm">+ R$ {fineAmount.toFixed(2)}</span>
              </div>
            )}
            
            <Separator className="my-2" />
            
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Total a Pagar:</span>
              <span className="text-base font-bold">R$ {totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={() => onConfirm(
              installment,
              paymentMethod,
              paymentDate,
              hasInterest,
              interestAmount,
              hasFine,
              fineAmount,
              notes
            )}
          >
            Confirmar Pagamento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Componente principal da página financeira
const FinancePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [dateRange, setDateRange] = useState<{start: Date, end: Date}>({
    start: new Date(new Date().setDate(1)), // Primeiro dia do mês atual
    end: new Date()
  });
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedTransaction, setSelectedTransaction] = useState<FinancialTransaction | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState<boolean>(false);
  const [selectedInstallment, setSelectedInstallment] = useState<Installment | null>(null);
  
  const { 
    loading, 
    receivables, 
    payables, 
    registerInstallmentPayment,
    generateFinancialReport
  } = useFinancial();
  
  // Filtrar transações
  const filteredReceivables = receivables.filter(transaction => {
    const matchesSearch = searchTerm === '' || 
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'pending' && transaction.status === PaymentStatus.PENDING) ||
      (statusFilter === 'paid' && transaction.status === PaymentStatus.PAID) ||
      (statusFilter === 'overdue' && transaction.status === PaymentStatus.OVERDUE);
    
    return matchesSearch && matchesStatus;
  });
  
  const filteredPayables = payables.filter(transaction => {
    const matchesSearch = searchTerm === '' || 
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'pending' && transaction.status === PaymentStatus.PENDING) ||
      (statusFilter === 'paid' && transaction.status === PaymentStatus.PAID) ||
      (statusFilter === 'overdue' && transaction.status === PaymentStatus.OVERDUE);
    
    return matchesSearch && matchesStatus;
  });
  
  // Calcular totais
  const totalReceivables = receivables
    .filter(t => t.status === PaymentStatus.PENDING)
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalPayables = payables
    .filter(t => t.status === PaymentStatus.PENDING)
    .reduce((sum, t) => sum + t.amount, 0);
  
  const overdueReceivables = receivables
    .filter(t => t.status === PaymentStatus.OVERDUE)
    .reduce((sum, t) => sum + t.amount, 0);
  
  const overduePayables = payables
    .filter(t => t.status === PaymentStatus.OVERDUE)
    .reduce((sum, t) => sum + t.amount, 0);
  
  // Handlers
  const handleViewTransaction = (transaction: FinancialTransaction) => {
    setSelectedTransaction(transaction);
  };
  
  const handlePayInstallment = (installment: Installment) => {
    setSelectedInstallment(installment);
    setShowPaymentDialog(true);
  };
  
  const handleConfirmPayment = async (
    installment: Installment,
    paymentMethod: PaymentMethod,
    paymentDate: Date,
    hasInterest: boolean,
    interestAmount: number,
    hasFine: boolean,
    fineAmount: number,
    notes?: string
  ) => {
    if (!selectedTransaction) return;
    
    const result = await registerInstallmentPayment(
      selectedTransaction.id,
      installment.installmentNumber,
      paymentMethod,
      paymentDate,
      undefined,
      hasInterest,
      interestAmount,
      hasFine,
      fineAmount,
      notes
    );
    
    if (result) {
      setShowPaymentDialog(false);
      setSelectedInstallment(null);
    }
  };
  
  const handleGenerateReport = async () => {
    const report = await generateFinancialReport(
      dateRange.start,
      dateRange.end,
      'CUSTOM'
    );
    
    if (report) {
      // Em um cenário real, poderíamos exibir o relatório ou fazer download
      console.log('Relatório gerado:', report);
    }
  };
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Financeiro</h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleGenerateReport}>
            <FileText className="h-4 w-4 mr-2" />
            Gerar Relatório
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nova Transação
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="receivables">A Receber</TabsTrigger>
          <TabsTrigger value="payables">A Pagar</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">A Receber</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">R$ {totalReceivables.toFixed(2)}</div>
                <p className="text-xs text-gray-500 mt-1">
                  {receivables.filter(t => t.status === PaymentStatus.PENDING).length} transações pendentes
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">A Pagar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">R$ {totalPayables.toFixed(2)}</div>
                <p className="text-xs text-gray-500 mt-1">
                  {payables.filter(t => t.status === PaymentStatus.PENDING).length} transações pendentes
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-red-500">Recebíveis Atrasados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">R$ {overdueReceivables.toFixed(2)}</div>
                <p className="text-xs text-gray-500 mt-1">
                  {receivables.filter(t => t.status === PaymentStatus.OVERDUE).length} transações atrasadas
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-red-500">Pagamentos Atrasados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">R$ {overduePayables.toFixed(2)}</div>
                <p className="text-xs text-gray-500 mt-1">
                  {payables.filter(t => t.status === PaymentStatus.OVERDUE).length} transações atrasadas
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Próximos Recebimentos</CardTitle>
                <CardDescription>Contas a receber nos próximos 30 dias</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Vencimento</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {receivables
                      .filter(t => t.status === PaymentStatus.PENDING)
                      .slice(0, 5)
                      .map(transaction => (
                        <TableRow 
                          key={transaction.id}
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() => handleViewTransaction(transaction)}
                        >
                          <TableCell>{transaction.description}</TableCell>
                          <TableCell>
                            {transaction.dueDate && new Date(transaction.dueDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>R$ {transaction.amount.toFixed(2)}</TableCell>
                          <TableCell>
                            <PaymentStatusBadge status={transaction.status} />
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Próximos Pagamentos</CardTitle>
                <CardDescription>Contas a pagar nos próximos 30 dias</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Vencimento</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payables
                      .filter(t => t.status === PaymentStatus.PENDING)
                      .slice(0, 5)
                      .map(transaction => (
                        <TableRow 
                          key={transaction.id}
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() => handleViewTransaction(transaction)}
                        >
                          <TableCell>{transaction.description}</TableCell>
                          <TableCell>
                            {transaction.dueDate && new Date(transaction.dueDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>R$ {transaction.amount.toFixed(2)}</TableCell>
                          <TableCell>
                            <PaymentStatusBadge status={transaction.status} />
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="receivables" className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Buscar por descrição ou ID..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <div className="flex items-center">
                  <Filter className="mr-1 h-4 w-4" />
                  <SelectValue placeholder="Filtrar por status" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
                <SelectItem value="paid">Pagos</SelectItem>
                <SelectItem value="overdue">Atrasados</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Parcelas</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReceivables.map(transaction => (
                    <TableRow 
                      key={transaction.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleViewTransaction(transaction)}
                    >
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell>{transaction.clientId || '-'}</TableCell>
                      <TableCell>
                        {transaction.dueDate && new Date(transaction.dueDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>R$ {transaction.amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <PaymentStatusBadge status={transaction.status} />
                      </TableCell>
                      <TableCell>
                        {transaction.isInstallment && transaction.installmentPlan ? (
                          <Badge variant="outline">
                            {transaction.installmentPlan.installments.filter(i => i.status === PaymentStatus.PAID).length}/
                            {transaction.installmentPlan.numberOfInstallments}
                          </Badge>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="payables" className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Buscar por descrição ou ID..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <div className="flex items-center">
                  <Filter className="mr-1 h-4 w-4" />
                  <SelectValue placeholder="Filtrar por status" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
                <SelectItem value="paid">Pagos</SelectItem>
                <SelectItem value="overdue">Atrasados</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Fornecedor</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Parcelas</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayables.map(transaction => (
                    <TableRow 
                      key={transaction.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleViewTransaction(transaction)}
                    >
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell>{transaction.supplierId || '-'}</TableCell>
                      <TableCell>
                        {transaction.dueDate && new Date(transaction.dueDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>R$ {transaction.amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <PaymentStatusBadge status={transaction.status} />
                      </TableCell>
                      <TableCell>
                        {transaction.isInstallment && transaction.installmentPlan ? (
                          <Badge variant="outline">
                            {transaction.installmentPlan.installments.filter(i => i.status === PaymentStatus.PAID).length}/
                            {transaction.installmentPlan.numberOfInstallments}
                          </Badge>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios Financeiros</CardTitle>
              <CardDescription>Gere relatórios personalizados para análise financeira</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data Inicial</Label>
                  <DatePicker
                    date={dateRange.start}
                    setDate={(date) => setDateRange({ ...dateRange, start: date })}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Data Final</Label>
                  <DatePicker
                    date={dateRange.end}
                    setDate={(date) => setDateRange({ ...dateRange, end: date })}
                    className="w-full"
                  />
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={handleGenerateReport}>
                  <FileText className="h-4 w-4 mr-2" />
                  Gerar Relatório
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Excel
                </Button>
                <Button variant="outline">
                  <Printer className="h-4 w-4 mr-2" />
                  Imprimir
                </Button>
                <Button variant="outline">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Visualizar Gráficos
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Relatórios Disponíveis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Fluxo de Caixa
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Contas a Receber
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Contas a Pagar
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Faturamento por Cliente
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Despesas por Categoria
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Relatórios Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 border rounded-md">
                    <div>
                      <p className="font-medium">Fluxo de Caixa - Maio/2025</p>
                      <p className="text-xs text-gray-500">Gerado em 20/05/2025</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-2 border rounded-md">
                    <div>
                      <p className="font-medium">Contas a Receber - Abril/2025</p>
                      <p className="text-xs text-gray-500">Gerado em 30/04/2025</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-2 border rounded-md">
                    <div>
                      <p className="font-medium">Faturamento por Cliente - Q1 2025</p>
                      <p className="text-xs text-gray-500">Gerado em 05/04/2025</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Diálogo de detalhes da transação */}
      {selectedTransaction && (
        <Dialog open={!!selectedTransaction} onOpenChange={(open) => !open && setSelectedTransaction(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Detalhes da Transação</DialogTitle>
              <DialogDescription>
                {selectedTransaction.description}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Tipo</h4>
                  <div className="mt-1">
                    <TransactionTypeBadge type={selectedTransaction.type} />
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Status</h4>
                  <div className="mt-1">
                    <PaymentStatusBadge status={selectedTransaction.status} />
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Valor</h4>
                  <p className="text-lg font-bold">R$ {selectedTransaction.amount.toFixed(2)}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Data de Vencimento</h4>
                  <p>
                    {selectedTransaction.dueDate && new Date(selectedTransaction.dueDate).toLocaleDateString()}
                  </p>
                </div>
                
                {selectedTransaction.clientId && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Cliente</h4>
                    <p>{selectedTransaction.clientId}</p>
                  </div>
                )}
                
                {selectedTransaction.supplierId && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Fornecedor</h4>
                    <p>{selectedTransaction.supplierId}</p>
                  </div>
                )}
                
                {selectedTransaction.orderId && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Ordem de Serviço</h4>
                    <p>{selectedTransaction.orderId}</p>
                  </div>
                )}
                
                {selectedTransaction.paymentMethod && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Forma de Pagamento</h4>
                    <div className="mt-1">
                      <PaymentMethodBadge method={selectedTransaction.paymentMethod} />
                    </div>
                  </div>
                )}
              </div>
              
              {selectedTransaction.notes && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Observações</h4>
                  <p className="text-sm mt-1">{selectedTransaction.notes}</p>
                </div>
              )}
              
              {selectedTransaction.isInstallment && selectedTransaction.installmentPlan && (
                <div className="mt-4">
                  <Separator className="mb-4" />
                  <InstallmentsList 
                    installmentPlan={selectedTransaction.installmentPlan}
                    onPayInstallment={handlePayInstallment}
                  />
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedTransaction(null)}>
                Fechar
              </Button>
              {selectedTransaction.status === PaymentStatus.PENDING && (
                <Button>
                  <DollarSign className="h-4 w-4 mr-1" />
                  Registrar Pagamento
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Diálogo de pagamento de parcela */}
      <PayInstallmentDialog
        open={showPaymentDialog}
        onOpenChange={setShowPaymentDialog}
        installment={selectedInstallment}
        onConfirm={handleConfirmPayment}
      />
    </div>
  );
};

export default FinancePage;
