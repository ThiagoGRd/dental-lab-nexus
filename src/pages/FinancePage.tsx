
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Plus, Search, FileUp, FileDown, Calendar, ArrowUp, ArrowDown, Filter, Download } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

// Mock de dados para contas a pagar
const payableAccounts = [
  { id: 1, description: 'Fornecedor XYZ - Material A', category: 'Fornecedores', value: 2500.00, dueDate: '2025-05-10', status: 'pending' },
  { id: 2, description: 'Aluguel do mês', category: 'Despesas Fixas', value: 3800.00, dueDate: '2025-05-05', status: 'pending' },
  { id: 3, description: 'Conta de Energia', category: 'Despesas Fixas', value: 650.00, dueDate: '2025-05-15', status: 'pending' },
  { id: 4, description: 'Fornecedor ABC - Material B', category: 'Fornecedores', value: 1200.00, dueDate: '2025-04-28', status: 'paid' },
  { id: 5, description: 'Manutenção de Equipamentos', category: 'Serviços', value: 850.00, dueDate: '2025-05-20', status: 'pending' },
];

// Mock de dados para contas a receber
const receivableAccounts = [
  { id: 101, client: 'Clínica Dental Care', orderNumber: 'ORD001', value: 3450.00, dueDate: '2025-05-08', status: 'pending' },
  { id: 102, client: 'Dr. Roberto Alves', orderNumber: 'ORD005', value: 1200.00, dueDate: '2025-05-15', status: 'pending' },
  { id: 103, client: 'Odontologia Sorriso', orderNumber: 'ORD003', value: 2800.00, dueDate: '2025-04-30', status: 'received' },
  { id: 104, client: 'Dra. Márcia Santos', orderNumber: 'ORD006', value: 980.00, dueDate: '2025-05-20', status: 'pending' },
  { id: 105, client: 'Centro Odontológico Bem Estar', orderNumber: 'ORD002', value: 3200.00, dueDate: '2025-05-10', status: 'pending' },
];

export default function FinancePage() {
  const [activeTab, setActiveTab] = useState('receivable');
  
  const handlePayment = (id: number) => {
    toast.success(`Pagamento da conta #${id} registrado com sucesso!`);
  };
  
  const handleReceive = (id: number) => {
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
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtros
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
                <Button size="sm" className="bg-dentalblue-600 hover:bg-dentalblue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova {activeTab === 'receivable' ? 'Cobrança' : 'Despesa'}
                </Button>
              </div>
            </div>

            <TabsContent value="receivable">
              <div className="rounded-md border">
                <div className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-4 bg-muted/50 p-4 font-medium">
                  <div>Cliente / Ordem</div>
                  <div>Valor</div>
                  <div>Vencimento</div>
                  <div>Status</div>
                  <div></div>
                </div>
                <div className="divide-y">
                  {receivableAccounts.map((account) => (
                    <div key={account.id} className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-4 p-4">
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
                <div className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-4 bg-muted/50 p-4 font-medium">
                  <div>Descrição / Categoria</div>
                  <div>Valor</div>
                  <div>Vencimento</div>
                  <div>Status</div>
                  <div></div>
                </div>
                <div className="divide-y">
                  {payableAccounts.map((account) => (
                    <div key={account.id} className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-4 p-4">
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
                  <p className="text-xl font-bold text-dentalblue-700">R$ 8.430,00</p>
                </div>
                <FileDown className="h-8 w-8 text-dentalblue-500" />
              </div>
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-md">
                <div>
                  <p className="text-sm text-gray-600">Total a Pagar</p>
                  <p className="text-xl font-bold text-red-700">R$ 9.000,00</p>
                </div>
                <FileUp className="h-8 w-8 text-red-500" />
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-md">
                <div>
                  <p className="text-sm text-gray-600">Saldo Previsto</p>
                  <p className="text-xl font-bold text-green-700">R$ 2.430,00</p>
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
                .filter(item => 'status' in item && item.status === 'pending')
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
    </div>
  );
}
