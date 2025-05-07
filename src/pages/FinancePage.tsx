
import React, { useState, useEffect, useCallback, memo, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead } from "@/components/ui/table";
import { useFinanceData } from "@/hooks/useFinanceData";
import FinancialSummary from "@/components/finance/FinancialSummary";
import FinancialAccountItem from "@/components/finance/FinancialAccountItem";
import ViewAccountDialog from "@/components/finance/ViewAccountDialog";
import EditAccountDialog from "@/components/finance/EditAccountDialog";
import NewFinancialEntryForm from "@/components/finance/NewFinancialEntryForm";
import UpdateZeroReceivables from "@/components/finance/UpdateZeroReceivables";
import FilterFinances from "@/components/finance/FilterFinances";
import { RefreshCw, FileText } from "lucide-react";
import { toast } from "sonner";

// Memoized components for better performance
const MemoizedFinancialAccountItem = memo(FinancialAccountItem);
const MemoizedFinancialSummary = memo(FinancialSummary);

export default function FinancePage() {
  const [activeTab, setActiveTab] = useState<'receivable' | 'payable'>('receivable');
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
    // Advanced filters
    statusFilter,
    setStatusFilter,
    dateFilter,
    setDateFilter,
    categoryFilter,
    setCategoryFilter,
    sortOrder,
    setSortOrder,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    clearFilters,
    categories,
    // Functions
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

  // Limpar os filtros quando o componente montar
  useEffect(() => {
    clearFilters();
  }, [clearFilters]);

  // Mostrar toast de erro se ocorrer algum problema
  useEffect(() => {
    if (error) {
      toast.error(`Erro ao carregar dados financeiros: ${error.message || 'Erro desconhecido'}`);
    }
  }, [error]);

  // Handler para mudar as tabs e limpar filtros com debounce
  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value as 'receivable' | 'payable');
  }, []);

  // Memoizar a renderização da tabela para melhorar a performance
  const renderTableContent = useCallback((type: 'payable' | 'receivable') => {
    try {
      const accounts = type === 'payable' ? filteredPayables : filteredReceivables;
      const handleAction = type === 'payable' ? handlePayment : handleReceive;
      const emptyMessage = type === 'payable' 
        ? 'Nenhuma conta a pagar encontrada.' 
        : 'Nenhuma conta a receber encontrada.';
      const loadingMessage = type === 'payable'
        ? 'Carregando contas a pagar...'
        : 'Carregando contas a receber...';

      if (loading) {
        return (
          <TableRow>
            <td colSpan={5} className="text-center py-4">
              {loadingMessage}
            </td>
          </TableRow>
        );
      }

      if (error) {
        return (
          <TableRow>
            <td colSpan={5} className="text-center py-4 text-red-500">
              Erro: {error.message || 'Ocorreu um erro ao carregar os dados'}
            </td>
          </TableRow>
        );
      }

      if (!accounts || accounts.length === 0) {
        return (
          <TableRow>
            <td colSpan={5} className="text-center py-4 text-gray-500">
              {emptyMessage}
            </td>
          </TableRow>
        );
      }

      return accounts.map(account => (
        <MemoizedFinancialAccountItem
          key={account.id}
          account={account}
          onPayOrReceive={handleAction}
          onView={handleViewAccount}
          onEdit={handleEditSetup}
          type={type}
        />
      ));
    } catch (error) {
      console.error("Erro ao renderizar conteúdo da tabela:", error);
      return (
        <TableRow>
          <td colSpan={5} className="text-center py-4 text-red-500">
            Erro ao renderizar dados. Por favor, atualize a página.
          </td>
        </TableRow>
      );
    }
  }, [filteredPayables, filteredReceivables, handlePayment, handleReceive, handleViewAccount, handleEditSetup, loading, error]);

  // Renderização segura do componente
  const renderSafely = useCallback((component: JSX.Element | null): JSX.Element => {
    try {
      return component || <></>;
    } catch (error) {
      console.error("Erro na renderização:", error);
      return <p className="text-red-500">Erro na renderização. Por favor, recarregue a página.</p>;
    }
  }, []);

  // Memoize the summary component to improve performance
  const summaryComponent = useMemo(() => (
    <MemoizedFinancialSummary 
      payableAccounts={payableAccounts}
      receivableAccounts={receivableAccounts}
    />
  ), [payableAccounts, receivableAccounts]);

  // Memoize dialog components to avoid unnecessary re-renders
  const viewDialogComponent = useMemo(() => (
    <ViewAccountDialog 
      open={viewDialogOpen}
      onOpenChange={setViewDialogOpen}
      account={currentAccount}
    />
  ), [viewDialogOpen, setViewDialogOpen, currentAccount]);

  const editDialogComponent = useMemo(() => (
    <EditAccountDialog 
      open={editDialogOpen}
      onOpenChange={setEditDialogOpen}
      currentAccount={currentAccount}
      formData={editFormData}
      onInputChange={handleInputChange}
      onSubmit={handleEditSubmit}
    />
  ), [editDialogOpen, setEditDialogOpen, currentAccount, editFormData, handleInputChange, handleEditSubmit]);

  // Tratamento de erros para toda a página
  try {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold text-dentalblue-800 dark:text-dentalblue-200">Gestão Financeira</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Controle de contas a pagar e a receber</p>
        
        {renderSafely(summaryComponent)}
        
        <Tabs 
          defaultValue={activeTab} 
          className="mt-8"
          onValueChange={handleTabChange}
          value={activeTab}
        >
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="receivable">Contas a Receber</TabsTrigger>
              <TabsTrigger value="payable">Contas a Pagar</TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-2">
              <Button 
                onClick={refreshData} 
                variant="outline" 
                size="icon"
                title="Atualizar dados"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center"
                title="Relatórios financeiros"
                onClick={() => window.location.href = '/reports'}
              >
                <FileText className="h-4 w-4 mr-2" />
                Relatórios
              </Button>
              <UpdateZeroReceivables onComplete={refreshData} />
            </div>
          </div>
          
          <div className="mb-4">
            <FilterFinances
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              dateFilter={dateFilter}
              onDateFilterChange={setDateFilter}
              categoryFilter={categoryFilter}
              onCategoryFilterChange={setCategoryFilter}
              sortOrder={sortOrder}
              onSortOrderChange={setSortOrder}
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
              onClearFilters={clearFilters}
              categories={categories}
            />
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
                  {renderTableContent('receivable')}
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
                  {renderTableContent('payable')}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Diálogos para visualizar e editar contas */}
        {renderSafely(viewDialogComponent)}
        {renderSafely(editDialogComponent)}
      </div>
    );
  } catch (error) {
    console.error("Erro fatal na renderização da página financeira:", error);
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold text-red-500">Erro</h1>
        <p>Ocorreu um erro ao carregar a página financeira. Por favor, recarregue a página ou entre em contato com o suporte.</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Recarregar Página
        </Button>
      </div>
    );
  }
}
