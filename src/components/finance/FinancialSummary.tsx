
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { FileUp, FileDown, Calendar } from 'lucide-react';

interface FinancialSummaryProps {
  payableAccounts: any[];
  receivableAccounts: any[];
}

export default function FinancialSummary({ payableAccounts, receivableAccounts }: FinancialSummaryProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const pendingPayables = payableAccounts.filter(acc => acc.status === 'pending');
  const pendingReceivables = receivableAccounts.filter(acc => acc.status === 'pending');
  
  const totalToPay = pendingPayables.reduce((sum, acc) => sum + acc.value, 0);
  const totalToReceive = pendingReceivables.reduce((sum, acc) => sum + acc.value, 0);
  const balance = totalToReceive - totalToPay;

  // Get upcoming due accounts (both payable and receivable) sorted by date
  const upcomingDueAccounts = [...pendingPayables, ...pendingReceivables]
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);

  return (
    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Resumo Financeiro</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-md">
              <div>
                <p className="text-sm text-gray-600">Total a Receber</p>
                <p className="text-xl font-bold text-dentalblue-700">
                  {formatCurrency(totalToReceive)}
                </p>
              </div>
              <FileDown className="h-8 w-8 text-dentalblue-500" />
            </div>
            <div className="flex justify-between items-center p-3 bg-red-50 rounded-md">
              <div>
                <p className="text-sm text-gray-600">Total a Pagar</p>
                <p className="text-xl font-bold text-red-700">
                  {formatCurrency(totalToPay)}
                </p>
              </div>
              <FileUp className="h-8 w-8 text-red-500" />
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-md">
              <div>
                <p className="text-sm text-gray-600">Saldo Previsto</p>
                <p className="text-xl font-bold text-green-700">
                  {formatCurrency(balance)}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-green-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Próximos Vencimentos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {upcomingDueAccounts.map((item, idx) => {
              const isPayable = 'category' in item;
              return (
                <div key={idx} className="flex justify-between items-center p-2 rounded-md border">
                  <div className="flex items-start gap-3">
                    <div className={`rounded-full p-2 ${isPayable ? 'bg-red-100' : 'bg-blue-100'}`}>
                      {isPayable ? 
                        <FileUp className="h-4 w-4 text-red-600" /> : 
                        <FileDown className="h-4 w-4 text-blue-600" />
                      }
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {isPayable ? item.description : item.client}
                      </p>
                      <p className="text-xs text-gray-500">
                        Vencimento: {formatDate(item.dueDate)}
                      </p>
                    </div>
                  </div>
                  <div className={`font-medium ${isPayable ? 'text-red-600' : 'text-blue-600'}`}>
                    {formatCurrency(item.value)}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
