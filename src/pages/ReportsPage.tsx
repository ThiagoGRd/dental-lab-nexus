
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, BarChart2, Calendar, Download, FileText, Printer, Users } from 'lucide-react';
import { BarChart as ReBarChart, LineChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Dados para os gráficos
const productionData = [
  { month: 'Jan', total: 32, urgent: 5 },
  { month: 'Fev', total: 40, urgent: 8 },
  { month: 'Mar', total: 45, urgent: 10 },
  { month: 'Abr', total: 55, urgent: 7 },
  { month: 'Mai', total: 65, urgent: 12 },
  { month: 'Jun', total: 60, urgent: 10 },
];

const financialData = [
  { month: 'Jan', receita: 25000, despesa: 18000 },
  { month: 'Fev', receita: 30000, despesa: 22000 },
  { month: 'Mar', receita: 32000, despesa: 21000 },
  { month: 'Abr', receita: 38000, despesa: 25000 },
  { month: 'Mai', receita: 40000, despesa: 28000 },
  { month: 'Jun', receita: 45000, despesa: 30000 },
];

const clientData = [
  { name: 'Clínica Dental Care', orders: 24 },
  { name: 'Dr. Roberto Alves', orders: 18 },
  { name: 'Odontologia Sorriso', orders: 32 },
  { name: 'Dra. Márcia Santos', orders: 15 },
  { name: 'Centro Odontológico Bem Estar', orders: 27 },
];

export default function ReportsPage() {
  const [startDate, setStartDate] = useState('2025-01-01');
  const [endDate, setEndDate] = useState('2025-06-30');

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-dentalblue-800">Relatórios</h1>
        <p className="text-gray-600">Visualize e exporte relatórios do laboratório</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filtros de Relatórios</CardTitle>
          <CardDescription>Selecione o período para visualização dos dados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex gap-2 items-center">
              <label className="text-sm font-medium">De:</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-40"
              />
            </div>
            <div className="flex gap-2 items-center">
              <label className="text-sm font-medium">Até:</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-40"
              />
            </div>
            <Select defaultValue="month">
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Agrupamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Por Dia</SelectItem>
                <SelectItem value="week">Por Semana</SelectItem>
                <SelectItem value="month">Por Mês</SelectItem>
                <SelectItem value="quarter">Por Trimestre</SelectItem>
                <SelectItem value="year">Por Ano</SelectItem>
              </SelectContent>
            </Select>
            <Button className="bg-dentalblue-600 hover:bg-dentalblue-700">
              Aplicar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="production">
        <TabsList className="mb-6 w-full max-w-2xl">
          <TabsTrigger value="production" className="flex items-center">
            <BarChart2 className="h-4 w-4 mr-2" />
            Produção
          </TabsTrigger>
          <TabsTrigger value="financial" className="flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            Financeiro
          </TabsTrigger>
          <TabsTrigger value="clients" className="flex items-center">
            <Users className="h-4 w-4 mr-2" />
            Clientes
          </TabsTrigger>
          <TabsTrigger value="stock" className="flex items-center">
            <BarChart className="h-4 w-4 mr-2" />
            Estoque
          </TabsTrigger>
        </TabsList>

        <div className="flex justify-end mb-4">
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar PDF
            </Button>
          </div>
        </div>

        <TabsContent value="production">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Produção Mensal</CardTitle>
                <CardDescription>Ordens de serviço por mês</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={productionData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="total" name="Total de Ordens" fill="#0D82E0" />
                      <Bar dataKey="urgent" name="Ordens Urgentes" fill="#ea384c" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status das Ordens</CardTitle>
                <CardDescription>Distribuição de status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-md border p-4">
                    <div className="text-2xl font-bold text-dentalblue-700">297</div>
                    <div className="text-xs text-gray-500">Total de Ordens</div>
                  </div>
                  <div className="rounded-md border p-4">
                    <div className="text-2xl font-bold text-yellow-600">18</div>
                    <div className="text-xs text-gray-500">Pendentes</div>
                  </div>
                  <div className="rounded-md border p-4">
                    <div className="text-2xl font-bold text-blue-600">42</div>
                    <div className="text-xs text-gray-500">Em Produção</div>
                  </div>
                  <div className="rounded-md border p-4">
                    <div className="text-2xl font-bold text-green-600">237</div>
                    <div className="text-xs text-gray-500">Finalizadas</div>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="mb-3 font-medium">Top Serviços</h4>
                  <div className="space-y-2">
                    {[
                      { name: 'Coroas em Zircônia', quantity: 85, percentage: '28.6%' },
                      { name: 'Próteses Fixas', quantity: 64, percentage: '21.5%' },
                      { name: 'Facetas', quantity: 43, percentage: '14.5%' },
                      { name: 'Implantes', quantity: 38, percentage: '12.8%' },
                      { name: 'Outros', quantity: 67, percentage: '22.6%' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="text-sm">{item.name}</div>
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-medium">{item.quantity}</div>
                          <div className="text-xs text-gray-500">{item.percentage}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="financial">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Receita vs Despesas</CardTitle>
                <CardDescription>Comparativo financeiro mensal</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={financialData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`R$ ${value}`, undefined]} />
                      <Legend />
                      <Line type="monotone" dataKey="receita" name="Receita" stroke="#0D82E0" strokeWidth={2} />
                      <Line type="monotone" dataKey="despesa" name="Despesa" stroke="#ea384c" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resumo Financeiro</CardTitle>
                <CardDescription>Indicadores do período</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-md bg-blue-50 p-4">
                      <div className="text-sm text-gray-500">Receita Total</div>
                      <div className="text-2xl font-bold text-dentalblue-700">R$ 210.000,00</div>
                      <div className="mt-1 text-xs text-green-600">+12% vs período anterior</div>
                    </div>
                    <div className="rounded-md bg-red-50 p-4">
                      <div className="text-sm text-gray-500">Despesas Totais</div>
                      <div className="text-2xl font-bold text-red-600">R$ 144.000,00</div>
                      <div className="mt-1 text-xs text-red-600">+8% vs período anterior</div>
                    </div>
                  </div>
                  
                  <div className="rounded-md bg-green-50 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-gray-500">Lucro do Período</div>
                        <div className="text-2xl font-bold text-green-700">R$ 66.000,00</div>
                      </div>
                      <div className="text-4xl font-bold text-green-600">31.4%</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="mb-3 font-medium">Detalhamento de Despesas</h4>
                    <div className="space-y-2">
                      {[
                        { name: 'Materiais', value: 'R$ 72.000,00', percentage: '50%' },
                        { name: 'Salários', value: 'R$ 45.000,00', percentage: '31%' },
                        { name: 'Aluguel', value: 'R$ 18.000,00', percentage: '12.5%' },
                        { name: 'Outros', value: 'R$ 9.000,00', percentage: '6.5%' },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <div className="text-sm">{item.name}</div>
                          <div className="flex items-center gap-2">
                            <div className="text-sm font-medium">{item.value}</div>
                            <div className="text-xs text-gray-500">{item.percentage}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="clients">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Volume de Pedidos por Cliente</CardTitle>
                <CardDescription>Top clientes por número de ordens</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={clientData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={150} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="orders" name="Ordens" fill="#0D82E0" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Estatísticas de Clientes</CardTitle>
                <CardDescription>Informações consolidadas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-md border p-4">
                    <div className="text-2xl font-bold text-dentalblue-700">32</div>
                    <div className="text-xs text-gray-500">Total de Clientes</div>
                  </div>
                  <div className="rounded-md border p-4">
                    <div className="text-2xl font-bold text-green-600">12</div>
                    <div className="text-xs text-gray-500">Clientes Ativos</div>
                  </div>
                  <div className="rounded-md border p-4">
                    <div className="text-2xl font-bold text-blue-600">9.3</div>
                    <div className="text-xs text-gray-500">Média de Pedidos</div>
                  </div>
                  <div className="rounded-md border p-4">
                    <div className="text-2xl font-bold text-purple-600">R$ 6.550</div>
                    <div className="text-xs text-gray-500">Ticket Médio</div>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="mb-3 font-medium">Top Clientes por Valor</h4>
                  <div className="space-y-3">
                    {[
                      { name: 'Clínica Dental Care', value: 'R$ 45.750,00' },
                      { name: 'Odontologia Sorriso', value: 'R$ 38.600,00' },
                      { name: 'Centro Odontológico Bem Estar', value: 'R$ 35.980,00' },
                      { name: 'Dr. Roberto Alves', value: 'R$ 28.450,00' },
                      { name: 'Dra. Márcia Santos', value: 'R$ 22.800,00' },
                    ].map((client, i) => (
                      <div key={i} className="flex items-center justify-between rounded-md border p-2">
                        <div className="font-medium">{client.name}</div>
                        <div className="text-sm text-dentalblue-700 font-bold">{client.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="stock">
          <Card>
            <CardHeader>
              <CardTitle>Relatório de Estoque</CardTitle>
              <CardDescription>Consumo e alertas de materiais</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-4 bg-muted/50 p-4 font-medium">
                  <div>Material</div>
                  <div>Estoque Atual</div>
                  <div>Est. Mínimo</div>
                  <div>Consumo Mensal</div>
                  <div>Status</div>
                </div>
                <div className="divide-y">
                  {[
                    { name: 'Zircônia Multicamada', current: 15, minimum: 10, monthly: 22, status: 'ok' },
                    { name: 'Resina Z350', current: 5, minimum: 8, monthly: 12, status: 'low' },
                    { name: 'Gesso Tipo IV', current: 25, minimum: 20, monthly: 35, status: 'ok' },
                    { name: 'Dissilicato de Lítio', current: 3, minimum: 10, monthly: 18, status: 'critical' },
                    { name: 'Metal para Infraestrutura', current: 40, minimum: 30, monthly: 25, status: 'ok' },
                  ].map((item, i) => (
                    <div key={i} className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-4 p-4">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-center">{item.current} un</div>
                      <div className="text-sm text-center">{item.minimum} un</div>
                      <div className="text-sm text-center">{item.monthly} un</div>
                      <div>
                        <span className={`rounded-full border px-2 py-1 text-xs font-medium ${
                          item.status === 'ok' 
                            ? 'bg-green-100 text-green-800 border-green-300' 
                            : item.status === 'low' 
                              ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                              : 'bg-red-100 text-red-800 border-red-300'
                        }`}>
                          {item.status === 'ok' ? 'OK' : item.status === 'low' ? 'Baixo' : 'Crítico'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
