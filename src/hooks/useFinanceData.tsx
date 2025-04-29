
import { useState } from 'react';
import { toast } from 'sonner';

// Mock data
const initialPayableAccounts = [
  { id: 1, description: 'Fornecedor XYZ - Material A', category: 'Fornecedores', value: 2500.00, dueDate: '2025-05-10', status: 'pending', notes: 'Pagamento mensal de materiais' },
  { id: 2, description: 'Aluguel do mês', category: 'Despesas Fixas', value: 3800.00, dueDate: '2025-05-05', status: 'pending', notes: 'Aluguel do espaço comercial' },
  { id: 3, description: 'Conta de Energia', category: 'Despesas Fixas', value: 650.00, dueDate: '2025-05-15', status: 'pending', notes: 'Consumo de energia elétrica' },
  { id: 4, description: 'Fornecedor ABC - Material B', category: 'Fornecedores', value: 1200.00, dueDate: '2025-04-28', status: 'paid', notes: 'Pagamento de insumos' },
  { id: 5, description: 'Manutenção de Equipamentos', category: 'Serviços', value: 850.00, dueDate: '2025-05-20', status: 'pending', notes: 'Manutenção preventiva' },
];

const initialReceivableAccounts = [
  { id: 101, client: 'Clínica Dental Care', orderNumber: 'ORD001', value: 3450.00, dueDate: '2025-05-08', status: 'pending', notes: 'Prótese + facetas' },
  { id: 102, client: 'Dr. Roberto Alves', orderNumber: 'ORD005', value: 1200.00, dueDate: '2025-05-15', status: 'pending', notes: 'Coroas unitárias 3 unidades' },
  { id: 103, client: 'Odontologia Sorriso', orderNumber: 'ORD003', value: 2800.00, dueDate: '2025-04-30', status: 'received', notes: 'Trabalho completo' },
  { id: 104, client: 'Dra. Márcia Santos', orderNumber: 'ORD006', value: 980.00, dueDate: '2025-05-20', status: 'pending', notes: 'Moldagem digital' },
  { id: 105, client: 'Centro Odontológico Bem Estar', orderNumber: 'ORD002', value: 3200.00, dueDate: '2025-05-10', status: 'pending', notes: 'Prótese total' },
];

export function useFinanceData() {
  const [payableAccounts, setPayableAccounts] = useState(initialPayableAccounts);
  const [receivableAccounts, setReceivableAccounts] = useState(initialReceivableAccounts);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentAccount, setCurrentAccount] = useState<any>(null);
  const [editFormData, setEditFormData] = useState<any>({});

  // Filtered data based on search term
  const filteredPayables = payableAccounts.filter(acc => 
    acc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    acc.category.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredReceivables = receivableAccounts.filter(acc => 
    acc.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
    acc.orderNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle payment of an account
  const handlePayment = (id: number) => {
    setPayableAccounts(payableAccounts.map(account => 
      account.id === id ? { ...account, status: 'paid' } : account
    ));
    toast.success(`Pagamento da conta #${id} registrado com sucesso!`);
  };
  
  // Handle receiving of an account
  const handleReceive = (id: number) => {
    setReceivableAccounts(receivableAccounts.map(account => 
      account.id === id ? { ...account, status: 'received' } : account
    ));
    toast.success(`Recebimento da conta #${id} registrado com sucesso!`);
  };

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

  // Add new payable account
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

  // Add new receivable account
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

  return {
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
    handlePayment,
    handleReceive,
    handleViewAccount,
    handleEditSetup,
    handleInputChange,
    handleEditSubmit,
    handleAddPayable,
    handleAddReceivable
  };
}
