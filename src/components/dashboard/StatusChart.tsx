
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

type StatusChartProps = {
  data: Array<{
    name: string;
    value: number;
    color: string;
  }>;
}

export default function StatusChart({ data }: StatusChartProps) {
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
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                strokeWidth={1}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
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
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
