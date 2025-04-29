import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Search, FileUp, FileDown, Calendar, ArrowUp, ArrowDown, Filter, Download, Eye, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import NewFinancialEntryForm from '@/components/finance/NewFinancialEntryForm';

// Mock de dados para contas a pagar
const initialPayableAccounts = [
  { id: 1, description: 'Fornecedor XYZ - Material A', category: 'Fornecedores', value: 2500.00, dueDate: '2025-05-10', status: 'pending', notes: 'Pagamento mensal de materiais' },
  { id: 2, description: 'Aluguel do mês', category: 'Despesas Fixas', value: 3800.00, dueDate: '2025-05-05', status: 'pending', notes: 'Aluguel do espaço comercial' },
  { id: 3, description: 'Conta de Energia', category: 'Despesas Fixas', value: 650.00, dueDate: '2025-05-15', status: 'pending', notes: 'Consumo de energia elétrica' },
  { id: 4, description: 'Fornecedor ABC - Material B', category: 'Fornecedores', value: 1200.00, dueDate: '2025-04-28', status: 'paid', notes: 'Pagamento de insumos' },
  { id: 5, description: 'Manutenção de Equipamentos', category: 'Serviços', value: 850.00, dueDate: '2025-05-20', status: 'pending', notes: 'Manutenção preventiva' },
];

// Mock de dados para contas a receber
const initialReceivableAccounts = [
  { id: 101, client: 'Clínica Dental Care', orderNumber: 'ORD001', value: 3450.00, dueDate: '2025-05-08', status: 'pending', notes: 'Prótese + facetas' },
  { id: 102, client: 'Dr. Roberto Alves', orderNumber: 'ORD005', value: 1200.00, dueDate: '2025-05-15', status: 'pending', notes: 'Coroas unitárias 3 unidades' },
  { id: 103, client: 'Odontologia Sorriso', orderNumber: 'ORD003', value: 2800.00, dueDate: '2025-04-30', status: 'received', notes: 'Trabalho completo' },
  { id: 104, client: 'Dra. Márcia Santos', orderNumber: 'ORD006', value: 980.00, dueDate: '2025-05-20', status: 'pending', notes: 'Moldagem digital' },
  { id: 105, client: 'Centro Odontológico Bem Estar', orderNumber: 'ORD002', value: 3200.00, dueDate: '2025-05-10', status: 'pending', notes: 'Prótese total' },
];

export default function FinancePage() {
  const [activeTab, setActiveTab] = useState('receivable');
  const [payableAccounts, setPayableAccounts] = useState(initialPayableAccounts);
  const [receivableAccounts, setReceivableAccounts] = useState(initialReceivableAccounts);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentAccount, setCurrentAccount] = useState<any>(null);
  const [editFormData, setEditFormData] = useState<any>({});
  
  const handlePayment = (id: number) => {
    setPayableAccounts(payableAccounts.map(account => 
      account.id === id ? { ...account, status: 'paid' } : account
    ));
    toast.success(`Pagamento da conta #${id} registrado com sucesso!`);
  };
  
  const handleReceive = (id: number) => {
    setReceivableAccounts(receivableAccounts.map(account => 
      account.id === id ? { ...account, status: 'received' } : account
    ));
    toast.success(`Recebimento da conta #${id} registrado com sucesso!`);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy');
  };

  const handleAddPayable = (data: any) => {
    const newId = Math.max(...payableAccounts.map(acc => acc.id), 0) + 1;
    const newPayable = {
      id: newId,
      description: data.description,
      category: data.category,
      value: data.value,
      dueDate: data.dueDate,
      status: 'pending',
      notes: data.notes || ''
    };
    setPayableAccounts([...payableAccounts, newPayable]);
    toast.success('Nova conta a pagar adicionada com sucesso!');
  };

  const handleAddReceivable = (data: any) => {
    const newId = Math.max(...receivableAccounts.map(acc => acc.id), 0) + 1;
    const newReceivable = {
      id: newId,
      client: data.client,
      orderNumber: data.orderNumber,
      value: data.value,
      dueDate: data.dueDate,
      status: 'pending',
      notes: data.notes || ''
    };
    setReceivableAccounts([...receivableAccounts, newReceivable]);
    toast.success('Nova conta a receber adicionada com sucesso!');
  };
  
  // Filtrar contas com base no termo de busca
  const filteredPayables = payableAccounts.filter(acc => 
    acc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    acc.category.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredReceivables = receivableAccounts.filter(acc => 
    acc.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
    acc.orderNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
  const handleEditSubmit = () => {
    if (!currentAccount) return;
    
    if ('description' in currentAccount) {
      // Update payable account
      setPayableAccounts(payableAccounts.map(acc => 
        acc.id === currentAccount.id ? { ...acc, ...editFormData } : acc
      ));
    } else {
      // Update receivable account
      setReceivableAccounts(receivableAccounts.map(acc => 
        acc.id === currentAccount.id ? { ...acc, ...editFormData } : acc
      ));
    }
    
    setEditDialogOpen(false);
    toast.success('Conta atualizada com sucesso!');
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-dentalblue-800">Finanças</h1>
        <p className="text-gray-600">Gerencie as contas a pagar e a receber do laboratório</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Gestão Financeira</CardTitle>
          <CardDescription>
            Controle de contas a pagar e a receber
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="receivable" onValueChange={setActiveTab}>
            <div className="flex justify-between items-center mb-6">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="receivable">Contas a Receber</TabsTrigger>
                <TabsTrigger value="payable">Contas a Pagar</TabsTrigger>
              </TabsList>
              
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  <Input
                    className="pl-9 w-64"
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtros
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
                
                {activeTab === 'receivable' ? (
                  <NewFinancialEntryForm 
                    type="receivable" 
                    onSubmit={handleAddReceivable}
                  >
                    <Button size="sm" className="bg-dentalblue-600 hover:bg-dentalblue-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Nova Cobrança
                    </Button>
                  </NewFinancialEntryForm>
                ) : (
                  <NewFinancialEntryForm 
                    type="payable" 
                    onSubmit={handleAddPayable}
                  >
                    <Button size="sm" className="bg-dentalblue-600 hover:bg-dentalblue-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Nova Despesa
                    </Button>
                  </NewFinancialEntryForm>
                )}
              </div>
            </div>

            <TabsContent value="receivable">
              <div className="rounded-md border">
                <div className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] items-center gap-4 bg-muted/50 p-4 font-medium">
                  <div>Cliente / Ordem</div>
                  <div>Valor</div>
                  <div>Vencimento</div>
                  <div>Status</div>
                  <div>Ações</div>
                  <div></div>
                </div>
                <div className="divide-y">
                  {filteredReceivables.map((account) => (
                    <div key={account.id} className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] items-center gap-4 p-4">
                      <div>
                        <div className="font-medium">{account.client}</div>
                        <div className="text-sm text-muted-foreground">#{account.orderNumber}</div>
                      </div>
                      <div className="text-right font-medium">
                        {formatCurrency(account.value)}
                      </div>
                      <div className="text-sm">
                        {formatDate(account.dueDate)}
                      </div>
                      <div>
                        <span className={`rounded-full border px-2 py-1 text-xs font-medium ${
                          account.status === 'received' 
                            ? 'bg-green-100 text-green-800 border-green-300' 
                            : 'bg-yellow-100 text-yellow-800 border-yellow-300'
                        }`}>
                          {account.status === 'received' ? 'Recebido' : 'Pendente'}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleViewAccount(account)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleEditSetup(account)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </div>
                      <div>
                        {account.status === 'pending' && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-green-600 border-green-200 hover:bg-green-50"
                            onClick={() => handleReceive(account.id)}
                          >
                            <ArrowDown className="h-4 w-4 mr-1" />
                            Receber
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="payable">
              <div className="rounded-md border">
                <div className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] items-center gap-4 bg-muted/50 p-4 font-medium">
                  <div>Descrição / Categoria</div>
                  <div>Valor</div>
                  <div>Vencimento</div>
                  <div>Status</div>
                  <div>Ações</div>
                  <div></div>
                </div>
                <div className="divide-y">
                  {filteredPayables.map((account) => (
                    <div key={account.id} className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] items-center gap-4 p-4">
                      <div>
                        <div className="font-medium">{account.description}</div>
                        <div className="text-sm text-muted-foreground">{account.category}</div>
                      </div>
                      <div className="text-right font-medium">
                        {formatCurrency(account.value)}
                      </div>
                      <div className="text-sm">
                        {formatDate(account.dueDate)}
                      </div>
                      <div>
                        <span className={`rounded-full border px-2 py-1 text-xs font-medium ${
                          account.status === 'paid' 
                            ? 'bg-green-100 text-green-800 border-green-300' 
                            : 'bg-yellow-100 text-yellow-800 border-yellow-300'
                        }`}>
                          {account.status === 'paid' ? 'Pago' : 'Pendente'}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleViewAccount(account)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleEditSetup(account)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </div>
                      <div>
                        {account.status === 'pending' && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-blue-600 border-blue-200 hover:bg-blue-50"
                            onClick={() => handlePayment(account.id)}
                          >
                            <ArrowUp className="h-4 w-4 mr-1" />
                            Pagar
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Resumo Financeiro</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-md">
                <div>
                  <p className="text-sm text-gray-600">Total a Receber</p>
                  <p className="text-xl font-bold text-dentalblue-700">
                    {formatCurrency(receivableAccounts
                      .filter(acc => acc.status === 'pending')
                      .reduce((sum, acc) => sum + acc.value, 0)
                    )}
                  </p>
                </div>
                <FileDown className="h-8 w-8 text-dentalblue-500" />
              </div>
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-md">
                <div>
                  <p className="text-sm text-gray-600">Total a Pagar</p>
                  <p className="text-xl font-bold text-red-700">
                    {formatCurrency(payableAccounts
                      .filter(acc => acc.status === 'pending')
                      .reduce((sum, acc) => sum + acc.value, 0)
                    )}
                  </p>
                </div>
                <FileUp className="h-8 w-8 text-red-500" />
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-md">
                <div>
                  <p className="text-sm text-gray-600">Saldo Previsto</p>
                  <p className="text-xl font-bold text-green-700">
                    {formatCurrency(
                      receivableAccounts.filter(acc => acc.status === 'pending').reduce((sum, acc) => sum + acc.value, 0) -
                      payableAccounts.filter(acc => acc.status === 'pending').reduce((sum, acc) => sum + acc.value, 0)
                    )}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Próximos Vencimentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...payableAccounts, ...receivableAccounts]
                .filter(item => 'status' in item && (item.status === 'pending' || item.status === 'pending'))
                .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                .slice(0, 5)
                .map((item, idx) => {
                  const isPayable = 'category' in item;
                  return (
                    <div key={idx} className="flex justify-between items-center p-2 rounded-md border">
                      <div className="flex items-start gap-3">
                        <div className={`rounded-full p-2 ${isPayable ? 'bg-red-100' : 'bg-blue-100'}`}>
                          {isPayable ? 
                            <ArrowUp className="h-4 w-4 text-red-600" /> : 
                            <ArrowDown className="h-4 w-4 text-blue-600" />
                          }
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {isPayable ? item.description : item.client}
                          </p>
                          <p className="text-xs text-gray-500">
                            Vencimento: {formatDate(item.dueDate)}
                          </p>
                        </div>
                      </div>
                      <div className={`font-medium ${isPayable ? 'text-red-600' : 'text-blue-600'}`}>
                        {formatCurrency(item.value)}
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* View Account Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes da Conta</DialogTitle>
          </DialogHeader>
          {currentAccount && (
            <div className="space-y-4">
              {'description' in currentAccount ? (
                // Payable account details
                <>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Descrição</h4>
                    <p className="text-lg font-semibold">{currentAccount.description}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Categoria</h4>
                    <p>{currentAccount.category}</p>
                  </div>
                </>
              ) : (
                // Receivable account details
                <>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Cliente</h4>
                    <p className="text-lg font-semibold">{currentAccount.client}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Número da Ordem</h4>
                    <p>#{currentAccount.orderNumber}</p>
                  </div>
                </>
              )}
              <div>
                <h4 className="text-sm font-medium text-gray-500">Valor</h4>
                <p className="text-lg font-semibold text-green-600">{formatCurrency(currentAccount.value)}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Data de Vencimento</h4>
                <p>{formatDate(currentAccount.dueDate)}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Status</h4>
                <span className={`rounded-full border px-2 py-1 text-xs font-medium ${
                  (currentAccount.status === 'paid' || currentAccount.status === 'received')
                    ? 'bg-green-100 text-green-800 border-green-300' 
                    : 'bg-yellow-100 text-yellow-800 border-yellow-300'
                }`}>
                  {currentAccount.status === 'paid' 
                    ? 'Pago' 
                    : currentAccount.status === 'received' 
                      ? 'Recebido' 
                      : 'Pendente'}
                </span>
              </div>
              {currentAccount.notes && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Observações</h4>
                  <p>{currentAccount.notes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setViewDialogOpen(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Account Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Conta</DialogTitle>
          </DialogHeader>
          {currentAccount && (
            <div className="grid gap-4 py-4">
              {'description' in currentAccount ? (
                // Payable account edit form
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Input
                      id="description"
                      name="description"
                      value={editFormData.description}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="category">Categoria</Label>
                    <Input
                      id="category"
                      name="category"
                      value={editFormData.category}
                      onChange={handleInputChange}
                    />
                  </div>
                </>
              ) : (
                // Receivable account edit form
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="client">Cliente</Label>
                    <Input
                      id="client"
                      name="client"
                      value={editFormData.client}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="orderNumber">Número da Ordem</Label>
                    <Input
                      id="orderNumber"
                      name="orderNumber"
                      value={editFormData.orderNumber}
                      onChange={handleInputChange}
                    />
                  </div>
                </>
              )}
              <div className="grid gap-2">
                <Label htmlFor="value">Valor (R$)</Label>
                <Input
                  id="value"
                  name="value"
                  type="number"
                  step="0.01"
                  value={editFormData.value}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dueDate">Data de Vencimento</Label>
                <Input
                  id="dueDate"
                  name="dueDate"
                  type="date"
                  value={editFormData.dueDate}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={editFormData.notes}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditSubmit}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
