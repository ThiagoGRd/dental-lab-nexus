
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead } from "@/components/ui/table";
import { useFinanceData } from "@/hooks/useFinanceData";
import FinancialSummary from "@/components/finance/FinancialSummary";
import FinancialAccountItem from "@/components/finance/FinancialAccountItem";
import ViewAccountDialog from "@/components/finance/ViewAccountDialog";
import EditAccountDialog from "@/components/finance/EditAccountDialog";
import NewFinancialEntryForm from "@/components/finance/NewFinancialEntryForm";
import UpdateZeroReceivables from "@/components/finance/UpdateZeroReceivables";
import { RefreshCw } from "lucide-react";

export default function FinancePage() {
  const [showNewForm, setShowNewForm] = useState(false);
  const [newAccountType, setNewAccountType] = useState<'payable' | 'receivable'>('payable');
  const {
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
    handlePayment,
    handleReceive,
    handleViewAccount,
    handleEditSetup,
    handleInputChange,
    handleEditSubmit,
    handleAddPayable,
    handleAddReceivable,
    refreshData
  } = useFinanceData();

  const handleNewPayableClick = () => {
    setNewAccountType('payable');
    setShowNewForm(true);
  };

  const handleNewReceivableClick = () => {
    setNewAccountType('receivable');
    setShowNewForm(true);
  };

  const handleNewFormSubmit = (data: any) => {
    if (newAccountType === 'payable') {
      handleAddPayable(data);
    } else {
      handleAddReceivable(data);
    }
    setShowNewForm(false);
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-dentalblue-800">Gestão Financeira</h1>
      <p className="text-gray-600 mb-6">Controle de contas a pagar e a receber</p>
      
      <FinancialSummary 
        payableAccounts={payableAccounts}
        receivableAccounts={receivableAccounts}
      />
      
      {showNewForm ? (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Nova Conta a {newAccountType === 'payable' ? 'Pagar' : 'Receber'}</h2>
            <Button variant="ghost" onClick={() => setShowNewForm(false)}>Cancelar</Button>
          </div>
          <NewFinancialEntryForm 
            type={newAccountType} 
            onSubmit={handleNewFormSubmit}
          >
            {/* Empty placeholder to satisfy children prop */}
            <div style={{ display: 'none' }}></div>
          </NewFinancialEntryForm>
        </div>
      ) : (
        <Tabs defaultValue="receivable" className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="receivable">Contas a Receber</TabsTrigger>
              <TabsTrigger value="payable">Contas a Pagar</TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-2">
              <Input
                placeholder="Buscar conta..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
              <Button 
                onClick={refreshData} 
                variant="outline" 
                size="icon"
                title="Atualizar dados"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <UpdateZeroReceivables onComplete={refreshData} />
            </div>
          </div>
          
          <TabsContent value="receivable" className="mt-4">
            <div className="flex justify-end mb-4">
              <NewFinancialEntryForm 
                type="receivable" 
                onSubmit={handleAddReceivable}
              >
                <Button>Nova Conta a Receber</Button>
              </NewFinancialEntryForm>
            </div>
            
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente / Serviço</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Data de Vencimento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <td colSpan={5} className="text-center py-4">
                        Carregando contas a receber...
                      </td>
                    </TableRow>
                  ) : error ? (
                    <TableRow>
                      <td colSpan={5} className="text-center py-4 text-red-500">
                        Erro: {error.message || 'Ocorreu um erro ao carregar os dados'}
                      </td>
                    </TableRow>
                  ) : filteredReceivables.length === 0 ? (
                    <TableRow>
                      <td colSpan={5} className="text-center py-4 text-gray-500">
                        Nenhuma conta a receber encontrada.
                      </td>
                    </TableRow>
                  ) : (
                    filteredReceivables.map(account => (
                      <FinancialAccountItem
                        key={account.id}
                        account={account}
                        onPayOrReceive={handleReceive}
                        onView={handleViewAccount}
                        onEdit={handleEditSetup}
                        type="receivable"
                      />
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
          
          <TabsContent value="payable" className="mt-4">
            <div className="flex justify-end mb-4">
              <NewFinancialEntryForm 
                type="payable" 
                onSubmit={handleAddPayable}
              >
                <Button>Nova Conta a Pagar</Button>
              </NewFinancialEntryForm>
            </div>
            
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descrição / Categoria</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Data de Vencimento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <td colSpan={5} className="text-center py-4">
                        Carregando contas a pagar...
                      </td>
                    </TableRow>
                  ) : error ? (
                    <TableRow>
                      <td colSpan={5} className="text-center py-4 text-red-500">
                        Erro: {error.message || 'Ocorreu um erro ao carregar os dados'}
                      </td>
                    </TableRow>
                  ) : filteredPayables.length === 0 ? (
                    <TableRow>
                      <td colSpan={5} className="text-center py-4 text-gray-500">
                        Nenhuma conta a pagar encontrada.
                      </td>
                    </TableRow>
                  ) : (
                    filteredPayables.map(account => (
                      <FinancialAccountItem
                        key={account.id}
                        account={account}
                        onPayOrReceive={handlePayment}
                        onView={handleViewAccount}
                        onEdit={handleEditSetup}
                        type="payable"
                      />
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      )}
      
      {/* Diálogos para visualizar e editar contas */}
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
