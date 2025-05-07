
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

type StatusChartProps = {
  data: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  onStatusClick?: (status: string) => void;
}

export default function StatusChart({ data, onStatusClick }: StatusChartProps) {
  // Verificar se temos dados válidos antes de renderizar o gráfico
  const hasValidData = data && data.length > 0 && data.some(item => item && typeof item.value === 'number' && item.value > 0);
  
  if (!hasValidData) {
    return (
      <Card className="h-full card-modern">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold text-slate-800 flex items-center">
            <div className="w-1.5 h-6 bg-gradient-to-b from-modern-primary to-modern-tertiary rounded-full mr-2"></div>
            Status das Ordens
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-[250px]">
          <p className="text-gray-500">Nenhum dado de status disponível</p>
        </CardContent>
      </Card>
    );
  }
  
  // Filtrar dados com valores maiores que zero para evitar problemas no gráfico
  const filteredData = data.filter(item => item && typeof item.value === 'number' && item.value > 0);

  // Função para lidar com cliques nas fatias do gráfico
  const handlePieClick = (data: any, index: number) => {
    if (onStatusClick && data && data.name) {
      // Converter o nome do status para o valor usado no filtro
      const statusMap: Record<string, string> = {
        'Pendente': 'pending',
        'Em Produção': 'production',
        'Aguardando Material': 'waiting',
        'Finalizado': 'completed',
        'Entregue': 'delivered'
      };
      
      const statusValue = statusMap[data.name] || '';
      if (statusValue) {
        onStatusClick(statusValue);
      }
    }
  };

  return (
    <Card className="h-full card-modern">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-slate-800 flex items-center">
          <div className="w-1.5 h-6 bg-gradient-to-b from-modern-primary to-modern-tertiary rounded-full mr-2"></div>
          Status das Ordens
        </CardTitle>
      </CardHeader>
      <CardContent className="flex justify-center">
        <div className="w-full h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={filteredData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                strokeWidth={1}
                onClick={handlePieClick}
                cursor="pointer"
              >
                {filteredData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color} 
                    stroke="#ffffff" 
                    strokeWidth={2} 
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [`${value} ordens`, '']} 
                contentStyle={{ 
                  borderRadius: '10px', 
                  boxShadow: '0 5px 15px rgba(0, 0, 0, 0.05)',
                  border: 'none',
                  backgroundColor: 'rgba(255, 255, 255, 0.98)',
                  padding: '10px 14px'
                }}
              />
              <Legend
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="circle"
                onClick={(data) => {
                  if (onStatusClick && data) {
                    // Converter o nome do status para o valor usado no filtro
                    const statusMap: Record<string, string> = {
                      'Pendente': 'pending',
                      'Em Produção': 'production',
                      'Aguardando Material': 'waiting',
                      'Finalizado': 'completed',
                      'Entregue': 'delivered'
                    };
                    
                    const statusValue = statusMap[data.value] || '';
                    if (statusValue) {
                      onStatusClick(statusValue);
                    }
                  }
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
