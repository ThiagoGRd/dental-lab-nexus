
// Mock data for the dashboard
export const mockStatusData = [
  { name: 'Pendente', value: 12, color: '#FCD34D' },
  { name: 'Em Produção', value: 18, color: '#60A5FA' },
  { name: 'Aguardando Material', value: 5, color: '#C084FC' },
  { name: 'Finalizado', value: 8, color: '#4ADE80' },
  { name: 'Entregue', value: 22, color: '#9CA3AF' },
];

export const mockRecentOrders = [
  {
    id: 'ORD001',
    client: 'Clínica Dental Care',
    service: 'Prótese Total Superior',
    createdAt: '2025-04-25',
    dueDate: '2025-05-02',
    status: 'pending' as const,
    isUrgent: true,
  },
  {
    id: 'ORD002',
    client: 'Dr. Roberto Alves',
    service: 'Coroa de Porcelana',
    createdAt: '2025-04-24',
    dueDate: '2025-05-04',
    status: 'production' as const,
  },
  {
    id: 'ORD003',
    client: 'Odontologia Sorriso',
    service: 'Aparelho Ortodôntico',
    createdAt: '2025-04-23',
    dueDate: '2025-05-03',
    status: 'waiting' as const,
  },
  {
    id: 'ORD004',
    client: 'Dra. Márcia Santos',
    service: 'Faceta de Porcelana',
    createdAt: '2025-04-22',
    dueDate: '2025-04-29',
    status: 'completed' as const,
  },
  {
    id: 'ORD005',
    client: 'Centro Odontológico Bem Estar',
    service: 'Prótese Parcial Removível',
    createdAt: '2025-04-21',
    dueDate: '2025-04-28',
    status: 'delivered' as const,
  },
];
