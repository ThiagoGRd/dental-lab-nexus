import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search, Filter, Download, Plus } from 'lucide-react';
import NewFinancialEntryForm from '@/components/finance/NewFinancialEntryForm';
import FinancialAccountItem from '@/components/finance/FinancialAccountItem';
import FinancialSummary from '@/components/finance/FinancialSummary';
import ViewAccountDialog from '@/components/finance/ViewAccountDialog';
import EditAccountDialog from '@/components/finance/EditAccountDialog';
import { useFinanceData } from '@/hooks/useFinanceData';

export default function FinancePage() {
  const [activeTab, setActiveTab] = useState('receivable');
  const {
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
    handlePayment,
    handleReceive,
    handleViewAccount,
    handleEditSetup,
    handleInputChange,
    handleEditSubmit,
    handleAddPayable,
    handleAddReceivable,
    payableAccounts,
    receivableAccounts,
    refreshData
  } = useFinanceData();

  // Refresh data when the component is mounted to ensure we have the latest data
  useEffect(() => {
    refreshData();
  }, [refreshData]);

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
                    <FinancialAccountItem 
                      key={account.id}
                      account={account}
                      type="receivable"
                      onPayOrReceive={handleReceive}
                      onView={handleViewAccount}
                      onEdit={handleEditSetup}
                    />
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
                    <FinancialAccountItem 
                      key={account.id}
                      account={account}
                      type="payable"
                      onPayOrReceive={handlePayment}
                      onView={handleViewAccount}
                      onEdit={handleEditSetup}
                    />
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <FinancialSummary 
        payableAccounts={payableAccounts} 
        receivableAccounts={receivableAccounts} 
      />

      {/* View and Edit Dialogs */}
      <ViewAccountDialog 
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        account={currentAccount}
      />

      <EditAccountDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        currentAccount={currentAccount}
        formData={editFormData}
        onInputChange={handleInputChange}
        onSubmit={handleEditSubmit}
      />
    </div>
  );
}
