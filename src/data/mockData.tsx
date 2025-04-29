
// Mock data para casos onde o banco de dados ainda não estiver disponível
// ou para testes de UI

// Status data para o gráfico de status
export const mockStatusData = [
  { name: 'Pendente', value: 12, color: '#FCD34D' },
  { name: 'Em Produção', value: 18, color: '#60A5FA' },
  { name: 'Aguardando Material', value: 5, color: '#C084FC' },
  { name: 'Finalizado', value: 8, color: '#4ADE80' },
  { name: 'Entregue', value: 22, color: '#9CA3AF' },
];

// Tipos de status para as ordens
export type OrderStatus = 'pending' | 'production' | 'waiting' | 'completed' | 'delivered';

// Mapeamento de status para exibição amigável
export const statusLabels: Record<OrderStatus, {label: string, className: string}> = {
  'pending': { label: 'Pendente', className: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  'production': { label: 'Em Produção', className: 'bg-blue-100 text-blue-800 border-blue-300' },
  'waiting': { label: 'Aguardando Material', className: 'bg-orange-100 text-orange-800 border-orange-300' },
  'completed': { label: 'Finalizado', className: 'bg-green-100 text-green-800 border-green-300' },
  'delivered': { label: 'Entregue', className: 'bg-purple-100 text-purple-800 border-purple-300' },
};

// Dados mockados de ordens para backup
export const mockRecentOrders = [
  {
    id: 'ORD001',
    client: 'Clínica Dental Care',
    service: 'Prótese Total Superior',
    createdAt: '2025-04-25',
    dueDate: '2025-05-02',
    status: 'pending' as OrderStatus,
    isUrgent: true,
  },
  {
    id: 'ORD002',
    client: 'Dr. Roberto Alves',
    service: 'Coroa de Porcelana',
    createdAt: '2025-04-24',
    dueDate: '2025-05-04',
    status: 'production' as OrderStatus,
  },
  {
    id: 'ORD003',
    client: 'Odontologia Sorriso',
    service: 'Aparelho Ortodôntico',
    createdAt: '2025-04-23',
    dueDate: '2025-05-03',
    status: 'waiting' as OrderStatus,
  },
  {
    id: 'ORD004',
    client: 'Dra. Márcia Santos',
    service: 'Faceta de Porcelana',
    createdAt: '2025-04-22',
    dueDate: '2025-04-29',
    status: 'completed' as OrderStatus,
  },
  {
    id: 'ORD005',
    client: 'Centro Odontológico Bem Estar',
    service: 'Prótese Parcial Removível',
    createdAt: '2025-04-21',
    dueDate: '2025-04-28',
    status: 'delivered' as OrderStatus,
  },
];

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  min_quantity: number | null;
  price: number | null;
  category: string | null;
  supplier: string | null;
  unit: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClientType {
  id: string;
  name: string;
  contact_name: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  document: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface FinanceEntry {
  id: string;
  type: 'revenue' | 'expense';
  description: string;
  amount: number;
  status: 'pending' | 'paid' | 'cancelled';
  category: string | null;
  due_date: string | null;
  payment_date: string | null;
  related_order_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// Status para finanças
export const financeStatusLabels: Record<string, { label: string, className: string }> = {
  'pending': { label: 'Pendente', className: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  'paid': { label: 'Pago', className: 'bg-green-100 text-green-800 border-green-300' },
  'cancelled': { label: 'Cancelado', className: 'bg-red-100 text-red-800 border-red-300' },
};

// Categorias comuns de finanças
export const financeCategories = [
  'Material',
  'Equipamento',
  'Folha de Pagamento',
  'Serviços',
  'Aluguel',
  'Manutenção',
  'Impostos',
  'Marketing',
  'Transporte',
  'Utilidades',
  'Outros',
];
