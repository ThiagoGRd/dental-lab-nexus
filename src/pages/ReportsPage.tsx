
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { ModernCard } from '@/components/ui/modern-card';
import { StatCard } from '@/components/ui/stat-card';
import { Button } from '@/components/ui/button';
import { Calendar, Download, TrendingUp, Users, Package, DollarSign } from 'lucide-react';

const mockOrdersData = [
  { month: 'Jan', orders: 45, revenue: 12000 },
  { month: 'Fev', orders: 52, revenue: 15600 },
  { month: 'Mar', orders: 48, revenue: 14400 },
  { month: 'Abr', orders: 61, revenue: 18300 },
  { month: 'Mai', orders: 55, revenue: 16500 },
  { month: 'Jun', orders: 67, revenue: 20100 },
];

const serviceDistribution = [
  { name: 'Próteses', value: 35, color: '#3B82F6' },
  { name: 'Implantes', value: 25, color: '#10B981' },
  { name: 'Ortodontia', value: 20, color: '#F59E0B' },
  { name: 'Outros', value: 20, color: '#EF4444' },
];

const ReportsPage = () => {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Relatórios</h1>
          <p className="text-muted-foreground">Análise completa do desempenho do laboratório</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Período
          </Button>
          <Button size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total de Pedidos"
          value="328"
          description="últimos 6 meses"
          icon={Package}
          variant="primary"
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Receita Total"
          value="R$ 97.200"
          description="últimos 6 meses"
          icon={DollarSign}
          variant="success"
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Clientes Ativos"
          value="45"
          description="este mês"
          icon={Users}
          variant="warning"
          trend={{ value: 3, isPositive: false }}
        />
        <StatCard
          title="Taxa de Crescimento"
          value="15.3%"
          description="comparado ao período anterior"
          icon={TrendingUp}
          variant="primary"
          trend={{ value: 4, isPositive: true }}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders Chart */}
        <ModernCard variant="elevated" className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-foreground">Pedidos por Mês</h3>
            <p className="text-sm text-muted-foreground">Evolução mensal dos pedidos</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mockOrdersData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="month" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="orders" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ModernCard>

        {/* Service Distribution */}
        <ModernCard variant="elevated" className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-foreground">Distribuição de Serviços</h3>
            <p className="text-sm text-muted-foreground">Participação por tipo de serviço</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={serviceDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {serviceDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ModernCard>
      </div>

      {/* Revenue Chart */}
      <ModernCard variant="elevated" className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-foreground">Receita Mensal</h3>
          <p className="text-sm text-muted-foreground">Evolução da receita ao longo do tempo</p>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={mockOrdersData}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="month" fontSize={12} />
            <YAxis fontSize={12} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
              formatter={(value) => [`R$ ${value.toLocaleString()}`, 'Receita']}
            />
            <Line 
              type="monotone" 
              dataKey="revenue" 
              stroke="hsl(var(--primary))" 
              strokeWidth={3}
              dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 6 }}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ModernCard>
    </div>
  );
};

export default ReportsPage;
