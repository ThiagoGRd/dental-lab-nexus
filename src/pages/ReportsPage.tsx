
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart2, Calendar, FileText, Users } from 'lucide-react';
import { BarChart, LineChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth, subMonths, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import GenerateReportButtons from '@/components/finance/GenerateReportButtons';

export default function ReportsPage() {
  // Definir datas para o mês atual por padrão
  const currentDate = new Date();
  const firstDayOfMonth = startOfMonth(currentDate);
  const lastDayOfMonth = endOfMonth(currentDate);
  
  const [startDate, setStartDate] = useState(format(firstDayOfMonth, 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(lastDayOfMonth, 'yyyy-MM-dd'));
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('financial');
  
  // Dados para os gráficos
  const [productionData, setProductionData] = useState<any[]>([]);
  const [financialData, setFinancialData] = useState<any[]>([]);
  const [clientData, setClientData] = useState<any[]>([]);
  const [statusData, setStatusData] = useState<any[]>([]);
  const [topServices, setTopServices] = useState<any[]>([]);
  const [inventoryData, setInventoryData] = useState<any[]>([]);
  
  // Resumo financeiro
  const [financialSummary, setFinancialSummary] = useState({
    totalRevenue: 'R$ 0,00',
    totalExpenses: 'R$ 0,00',
    profit: 'R$ 0,00',
    profitPercentage: '0%',
    previousComparisonRevenue: '0%',
    previousComparisonExpenses: '0%',
    expenseBreakdown: [] as any[]
  });
  
  // Resumo de produção
  const [productionSummary, setProductionSummary] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    inProductionOrders: 0,
    completedOrders: 0
  });
  
  // Resumo de clientes
  const [clientSummary, setClientSummary] = useState({
    totalClients: 0,
    activeClients: 0,
    averageOrders: 0,
    averageValue: 'R$ 0,00',
    topClientsByValue: [] as any[]
  });

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const loadReportsData = async () => {
    try {
      setLoading(true);
      
      // Buscar dados de ordens
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .gte('created_at', startDate)
        .lte('created_at', endDate);
        
      if (ordersError) {
        console.error('Erro ao buscar ordens:', ordersError);
      } else {
        // Agrupar ordens por mês para o gráfico de produção
        const ordersCountByMonth = processOrdersByMonth(ordersData || []);
        setProductionData(ordersCountByMonth);
        
        // Resumo de status das ordens
        const statusCounts = {
          totalOrders: ordersData?.length || 0,
          pendingOrders: ordersData?.filter(o => o.status === 'pending').length || 0,
          inProductionOrders: ordersData?.filter(o => o.status === 'production').length || 0,
          completedOrders: ordersData?.filter(o => o.status === 'completed' || o.status === 'delivered').length || 0
        };
        setProductionSummary(statusCounts);
        
        // Status para gráfico
        const statusChartData = [
          { name: 'Pendente', value: statusCounts.pendingOrders, color: '#FCD34D' },
          { name: 'Em Produção', value: statusCounts.inProductionOrders, color: '#60A5FA' },
          { name: 'Finalizado', value: statusCounts.completedOrders, color: '#4ADE80' },
        ];
        setStatusData(statusChartData);
      }
      
      // Buscar dados financeiros
      const { data: financesData, error: financesError } = await supabase
        .from('finances')
        .select('*')
        .gte('due_date', startDate)
        .lte('due_date', endDate);
        
      if (financesError) {
        console.error('Erro ao buscar dados financeiros:', financesError);
      } else {
        console.log('Dados financeiros obtidos:', financesData);
        // Processar dados financeiros reais (não mais simulados)
        const processedFinancialData = processFinancialData(financesData || []);
        setFinancialData(processedFinancialData.monthlyData);
        setFinancialSummary(processedFinancialData.summary);
      }
      
      // Buscar dados de clientes
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('*');
        
      if (clientsError) {
        console.error('Erro ao buscar clientes:', clientsError);
      } else {
        // Total e clientes ativos
        const activeClientsCount = clientsData?.length || 0; // Supomos que todos são ativos por enquanto
        setClientSummary(prev => ({
          ...prev,
          totalClients: clientsData?.length || 0,
          activeClients: activeClientsCount
        }));
        
        // Buscar dados para o gráfico de clientes
        if (clientsData && clientsData.length > 0) {
          const clientsWithOrdersPromises = clientsData.slice(0, 10).map(async client => {
            const { count } = await supabase
              .from('orders')
              .select('*', { count: 'exact', head: true })
              .eq('client_id', client.id);
              
            return {
              name: client.name,
              orders: count || 0
            };
          });
          
          const clientsWithOrders = await Promise.all(clientsWithOrdersPromises);
          const sortedClients = clientsWithOrders
            .sort((a, b) => b.orders - a.orders)
            .slice(0, 5);
            
          setClientData(sortedClients);
          
          // Calcula média de pedidos
          if (clientsWithOrders.length > 0) {
            const totalOrders = clientsWithOrders.reduce((sum, c) => sum + c.orders, 0);
            const averageOrders = totalOrders / clientsWithOrders.length;
            setClientSummary(prev => ({
              ...prev,
              averageOrders: parseFloat(averageOrders.toFixed(1))
            }));
          }
        }
      }
      
      // Buscar dados de serviços para o top serviços
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('*');
        
      if (servicesError) {
        console.error('Erro ao buscar serviços:', servicesError);
      } else if (servicesData && servicesData.length > 0) {
        // Buscar os serviços mais utilizados
        const { data: orderItemsData, error: orderItemsError } = await supabase
          .from('order_items')
          .select('service_id, quantity')
          .gte('created_at', startDate)
          .lte('created_at', endDate);

        if (!orderItemsError && orderItemsData) {
          // Contar quantas vezes cada serviço foi utilizado
          const serviceCount: Record<string, number> = {};
          orderItemsData.forEach(item => {
            if (!serviceCount[item.service_id]) {
              serviceCount[item.service_id] = 0;
            }
            serviceCount[item.service_id] += item.quantity;
          });

          // Calcular total
          const total = orderItemsData.reduce((sum, item) => sum + item.quantity, 0);

          // Formatar os dados dos top serviços
          const topServicesData = Object.entries(serviceCount)
            .map(([serviceId, quantity]) => {
              const service = servicesData.find(s => s.id === serviceId);
              const percentage = total > 0 ? ((quantity / total) * 100).toFixed(1) + '%' : '0%';
              
              return {
                name: service ? service.name : 'Serviço desconhecido',
                quantity,
                percentage
              };
            })
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 5);

          setTopServices(topServicesData);
        } else {
          setTopServices([]);
          console.error('Erro ao buscar itens de ordem:', orderItemsError);
        }
      }
      
      // Buscar dados de estoque
      const { data: inventoryData, error: inventoryError } = await supabase
        .from('inventory')
        .select('*')
        .order('name');
        
      if (inventoryError) {
        console.error('Erro ao buscar estoque:', inventoryError);
      } else {
        console.log('Dados de inventário obtidos:', inventoryData);
        if (inventoryData && inventoryData.length > 0) {
          const processedInventory = inventoryData.map(item => {
            let status = 'ok';
            
            // Garantir que min_quantity é um número e fazer a comparação
            const minQuantity = typeof item.min_quantity === 'number' ? item.min_quantity : 0;
            const quantity = typeof item.quantity === 'number' ? item.quantity : 0;
            
            if (quantity < minQuantity) {
              status = 'critical';
            } else if (quantity < minQuantity * 1.5) {
              status = 'low';
            }
            
            return {
              ...item,
              status
            };
          }).slice(0, 5); // Limitar a 5 itens
          
          setInventoryData(processedInventory);
        } else {
          setInventoryData([]);
        }
      }
      
    } catch (error) {
      console.error("Erro ao carregar dados dos relatórios:", error);
    } finally {
      setLoading(false);
    }
  };
  
  // Funções auxiliares para processar os dados
  const processOrdersByMonth = (orders: any[]) => {
    // Criar um mapa para dados mensais no período selecionado
    const monthMap = new Map();
    
    // Inicializar o mapa com todos os meses no intervalo
    let currentMonth = new Date(startDate);
    const endMonthDate = new Date(endDate);
    
    while (currentMonth <= endMonthDate) {
      const monthKey = format(currentMonth, 'MMM', { locale: ptBR });
      monthMap.set(monthKey, { month: monthKey, total: 0, urgent: 0 });
      currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1);
    }
    
    // Processar os dados reais
    orders.forEach(order => {
      const date = new Date(order.created_at);
      const monthKey = format(date, 'MMM', { locale: ptBR });
      
      if (monthMap.has(monthKey)) {
        const monthData = monthMap.get(monthKey);
        monthData.total++;
        if (order.priority === 'high' || order.priority === 'urgent') {
          monthData.urgent++;
        }
      }
    });
    
    // Converter mapa em array
    return Array.from(monthMap.values());
  };
  
  const processFinancialData = (finances: any[]) => {
    // Criar um mapa para dados mensais no período selecionado
    const monthMap = new Map();
    
    // Inicializar o mapa com todos os meses no intervalo
    let currentMonth = new Date(startDate);
    const endMonthDate = new Date(endDate);
    
    while (currentMonth <= endMonthDate) {
      const monthKey = format(currentMonth, 'MMM', { locale: ptBR });
      monthMap.set(monthKey, { month: monthKey, receita: 0, despesa: 0 });
      currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1);
    }
    
    // Processar os dados reais
    let totalRevenue = 0;
    let totalExpenses = 0;
    const expensesByCategory: Record<string, number> = {};
    
    finances.forEach(finance => {
      const date = new Date(finance.due_date);
      const monthKey = format(date, 'MMM', { locale: ptBR });
      
      if (monthMap.has(monthKey)) {
        // Garantir que o valor é numérico
        const amount = typeof finance.amount === 'number' ? finance.amount : 0;
        const monthData = monthMap.get(monthKey);
        
        if (finance.type === 'revenue') {
          monthData.receita += amount;
          totalRevenue += amount;
        } else if (finance.type === 'expense') {
          monthData.despesa += amount;
          totalExpenses += amount;
          
          // Agrupar despesas por categoria
          const category = finance.category || 'Outros';
          if (!expensesByCategory[category]) {
            expensesByCategory[category] = 0;
          }
          expensesByCategory[category] += amount;
        }
      }
    });
    
    // Se não temos dados financeiros reais suficientes, retorna os dados vazios
    if (finances.length === 0) {
      console.log('Sem dados financeiros, retornando estrutura vazia');
    }
    
    // Calcular percentuais de despesas
    const expenseBreakdown = Object.entries(expensesByCategory).map(([name, value]) => {
      // Garantir que value é um número antes da divisão
      const numericalValue = Number(value);
      const percentage = totalExpenses > 0 ? ((numericalValue / totalExpenses) * 100).toFixed(1) + '%' : '0%';
      
      return {
        name,
        value: `R$ ${numericalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        percentage
      };
    }).sort((a, b) => {
      // Extrair valores percentuais sem o sinal % para comparação
      const percentA = parseFloat(a.percentage);
      const percentB = parseFloat(b.percentage);
      return percentB - percentA;
    });
    
    // Calcular lucro e percentual
    const profit = totalRevenue - totalExpenses;
    const profitPercentage = totalRevenue > 0 ? ((profit / totalRevenue) * 100).toFixed(1) + '%' : '0%';
    
    // Formatar valores para exibição
    const formatCurrency = (value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    
    return {
      monthlyData: Array.from(monthMap.values()),
      summary: {
        totalRevenue: formatCurrency(totalRevenue),
        totalExpenses: formatCurrency(totalExpenses),
        profit: formatCurrency(profit),
        profitPercentage,
        previousComparisonRevenue: '+0%', // Não temos dados anteriores para comparar
        previousComparisonExpenses: '+0%', // Não temos dados anteriores para comparar
        expenseBreakdown: expenseBreakdown.length > 0 ? expenseBreakdown : [
          { name: 'Sem dados', value: 'R$ 0,00', percentage: '0%' }
        ]
      }
    };
  };
  
  useEffect(() => {
    loadReportsData();
  }, [startDate, endDate]);

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
            <Button 
              className="bg-dentalblue-600 hover:bg-dentalblue-700"
              onClick={loadReportsData}
              disabled={loading}
            >
              {loading ? 'Carregando...' : 'Aplicar Filtros'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="financial" onValueChange={handleTabChange} value={activeTab}>
        <TabsList className="mb-6 w-full max-w-2xl">
          <TabsTrigger value="financial" className="flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            Financeiro
          </TabsTrigger>
          <TabsTrigger value="production" className="flex items-center">
            <BarChart2 className="h-4 w-4 mr-2" />
            Produção
          </TabsTrigger>
          <TabsTrigger value="clients" className="flex items-center">
            <Users className="h-4 w-4 mr-2" />
            Clientes
          </TabsTrigger>
          <TabsTrigger value="stock" className="flex items-center">
            <BarChart2 className="h-4 w-4 mr-2" />
            Estoque
          </TabsTrigger>
        </TabsList>

        <div className="flex justify-end mb-4">
          <GenerateReportButtons 
            reportType={activeTab}
            startDate={startDate}
            endDate={endDate}
            data={
              activeTab === 'financial' ? financialData :
              activeTab === 'production' ? productionData :
              activeTab === 'clients' ? clientData :
              inventoryData
            }
            title={
              activeTab === 'financial' ? 'Relatório Financeiro' :
              activeTab === 'production' ? 'Relatório de Produção' :
              activeTab === 'clients' ? 'Relatório de Clientes' :
              'Relatório de Estoque'
            }
          />
        </div>

        <TabsContent value="financial">
          {loading ? (
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <div className="h-6 bg-gray-200 animate-pulse rounded w-48 mb-2"></div>
                  <div className="h-4 bg-gray-200 animate-pulse rounded w-64"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] bg-gray-100 animate-pulse rounded"></div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <div className="h-6 bg-gray-200 animate-pulse rounded w-48 mb-2"></div>
                  <div className="h-4 bg-gray-200 animate-pulse rounded w-40"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {[1, 2].map(i => (
                        <div key={i} className="rounded-md bg-gray-100 p-4">
                          <div className="h-4 bg-gray-200 animate-pulse rounded w-24 mb-2"></div>
                          <div className="h-8 bg-gray-200 animate-pulse rounded w-32 mb-1"></div>
                          <div className="h-4 bg-gray-200 animate-pulse rounded w-40"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
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
                        <div className="text-2xl font-bold text-dentalblue-700">{financialSummary.totalRevenue}</div>
                        <div className="mt-1 text-xs text-green-600">{financialSummary.previousComparisonRevenue} vs período anterior</div>
                      </div>
                      <div className="rounded-md bg-red-50 p-4">
                        <div className="text-sm text-gray-500">Despesas Totais</div>
                        <div className="text-2xl font-bold text-red-600">{financialSummary.totalExpenses}</div>
                        <div className="mt-1 text-xs text-red-600">{financialSummary.previousComparisonExpenses} vs período anterior</div>
                      </div>
                    </div>
                    
                    <div className="rounded-md bg-green-50 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm text-gray-500">Lucro do Período</div>
                          <div className="text-2xl font-bold text-green-700">{financialSummary.profit}</div>
                        </div>
                        <div className="text-4xl font-bold text-green-600">{financialSummary.profitPercentage}</div>
                      </div>
                    </div>

                    <div>
                      <h4 className="mb-3 font-medium">Detalhamento de Despesas</h4>
                      <div className="space-y-2">
                        {financialSummary.expenseBreakdown.map((item, i) => (
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
          )}
        </TabsContent>

        <TabsContent value="production">
          {loading ? (
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <div className="h-6 bg-gray-200 animate-pulse rounded w-48 mb-2"></div>
                  <div className="h-4 bg-gray-200 animate-pulse rounded w-64"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] bg-gray-100 animate-pulse rounded"></div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <div className="h-6 bg-gray-200 animate-pulse rounded w-48 mb-2"></div>
                  <div className="h-4 bg-gray-200 animate-pulse rounded w-40"></div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="rounded-md border p-4">
                        <div className="h-8 bg-gray-200 animate-pulse rounded w-16 mb-1"></div>
                        <div className="h-4 bg-gray-200 animate-pulse rounded w-24"></div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6">
                    <div className="h-5 bg-gray-200 animate-pulse rounded w-32 mb-3"></div>
                    <div className="space-y-2">
                      {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="flex items-center justify-between">
                          <div className="h-4 bg-gray-200 animate-pulse rounded w-32"></div>
                          <div className="h-4 bg-gray-200 animate-pulse rounded w-24"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
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
                      <div className="text-2xl font-bold text-dentalblue-700">{productionSummary.totalOrders}</div>
                      <div className="text-xs text-gray-500">Total de Ordens</div>
                    </div>
                    <div className="rounded-md border p-4">
                      <div className="text-2xl font-bold text-yellow-600">{productionSummary.pendingOrders}</div>
                      <div className="text-xs text-gray-500">Pendentes</div>
                    </div>
                    <div className="rounded-md border p-4">
                      <div className="text-2xl font-bold text-blue-600">{productionSummary.inProductionOrders}</div>
                      <div className="text-xs text-gray-500">Em Produção</div>
                    </div>
                    <div className="rounded-md border p-4">
                      <div className="text-2xl font-bold text-green-600">{productionSummary.completedOrders}</div>
                      <div className="text-xs text-gray-500">Finalizadas</div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="mb-3 font-medium">Top Serviços</h4>
                    <div className="space-y-2">
                      {topServices.map((item, i) => (
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
          )}
        </TabsContent>

        <TabsContent value="financial">
          {loading ? (
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <div className="h-6 bg-gray-200 animate-pulse rounded w-48 mb-2"></div>
                  <div className="h-4 bg-gray-200 animate-pulse rounded w-64"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] bg-gray-100 animate-pulse rounded"></div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <div className="h-6 bg-gray-200 animate-pulse rounded w-48 mb-2"></div>
                  <div className="h-4 bg-gray-200 animate-pulse rounded w-40"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {[1, 2].map(i => (
                        <div key={i} className="rounded-md bg-gray-100 p-4">
                          <div className="h-4 bg-gray-200 animate-pulse rounded w-24 mb-2"></div>
                          <div className="h-8 bg-gray-200 animate-pulse rounded w-32 mb-1"></div>
                          <div className="h-4 bg-gray-200 animate-pulse rounded w-40"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
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
                        <div className="text-2xl font-bold text-dentalblue-700">{financialSummary.totalRevenue}</div>
                        <div className="mt-1 text-xs text-green-600">{financialSummary.previousComparisonRevenue} vs período anterior</div>
                      </div>
                      <div className="rounded-md bg-red-50 p-4">
                        <div className="text-sm text-gray-500">Despesas Totais</div>
                        <div className="text-2xl font-bold text-red-600">{financialSummary.totalExpenses}</div>
                        <div className="mt-1 text-xs text-red-600">{financialSummary.previousComparisonExpenses} vs período anterior</div>
                      </div>
                    </div>
                    
                    <div className="rounded-md bg-green-50 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm text-gray-500">Lucro do Período</div>
                          <div className="text-2xl font-bold text-green-700">{financialSummary.profit}</div>
                        </div>
                        <div className="text-4xl font-bold text-green-600">{financialSummary.profitPercentage}</div>
                      </div>
                    </div>

                    <div>
                      <h4 className="mb-3 font-medium">Detalhamento de Despesas</h4>
                      <div className="space-y-2">
                        {financialSummary.expenseBreakdown.map((item, i) => (
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
          )}
        </TabsContent>

        <TabsContent value="clients">
          {loading ? (
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <div className="h-6 bg-gray-200 animate-pulse rounded w-48 mb-2"></div>
                  <div className="h-4 bg-gray-200 animate-pulse rounded w-64"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] bg-gray-100 animate-pulse rounded"></div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <div className="h-6 bg-gray-200 animate-pulse rounded w-48 mb-2"></div>
                  <div className="h-4 bg-gray-200 animate-pulse rounded w-40"></div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="rounded-md border p-4">
                        <div className="h-8 bg-gray-200 animate-pulse rounded w-16 mb-1"></div>
                        <div className="h-4 bg-gray-200 animate-pulse rounded w-24"></div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
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
                      <div className="text-2xl font-bold text-dentalblue-700">{clientSummary.totalClients}</div>
                      <div className="text-xs text-gray-500">Total de Clientes</div>
                    </div>
                    <div className="rounded-md border p-4">
                      <div className="text-2xl font-bold text-green-600">{clientSummary.activeClients}</div>
                      <div className="text-xs text-gray-500">Clientes Ativos</div>
                    </div>
                    <div className="rounded-md border p-4">
                      <div className="text-2xl font-bold text-blue-600">{clientSummary.averageOrders}</div>
                      <div className="text-xs text-gray-500">Média de Pedidos</div>
                    </div>
                    <div className="rounded-md border p-4">
                      <div className="text-2xl font-bold text-purple-600">{clientSummary.averageValue}</div>
                      <div className="text-xs text-gray-500">Ticket Médio</div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="mb-3 font-medium">Top Clientes por Valor</h4>
                    <div className="space-y-3">
                      {clientData.length > 0 ? clientData.map((client, i) => (
                        <div key={i} className="flex items-center justify-between rounded-md border p-2">
                          <div className="font-medium">{client.name}</div>
                          <div className="text-sm text-dentalblue-700 font-bold">
                            {`${client.orders} ordens`}
                          </div>
                        </div>
                      )) : (
                        <div className="text-center py-4 text-gray-500">
                          Nenhum dado de cliente disponível
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="stock">
          {loading ? (
            <Card>
              <CardHeader>
                <div className="h-6 bg-gray-200 animate-pulse rounded w-48 mb-2"></div>
                <div className="h-4 bg-gray-200 animate-pulse rounded w-64"></div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <div className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-4 bg-muted/50 p-4">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="h-4 bg-gray-200 animate-pulse rounded"></div>
                    ))}
                  </div>
                  <div className="divide-y">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-4 p-4">
                        {[1, 2, 3, 4, 5].map(j => (
                          <div key={j} className="h-4 bg-gray-200 animate-pulse rounded"></div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
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
                    {inventoryData.length > 0 ? inventoryData.map((item, i) => (
                      <div key={i} className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-4 p-4">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-center">{item.quantity} {item.unit || 'un'}</div>
                        <div className="text-sm text-center">{item.min_quantity} {item.unit || 'un'}</div>
                        <div className="text-sm text-center">
                          {Math.floor(item.quantity * 0.7)} {item.unit || 'un'}
                        </div>
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
                    )) : (
                      <div className="p-4 text-center text-gray-500">
                        Nenhum item de estoque disponível
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
