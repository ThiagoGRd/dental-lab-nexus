
import React from 'react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { TableRow, TableCell } from '@/components/ui/table';
import { extractServiceName } from '@/utils/serviceNameExtractor';

interface FinancialAccountItemProps {
  account: any;
  type: 'payable' | 'receivable';
  onPayOrReceive: (id: string) => void;
  onView: (account: any) => void;
  onEdit: (account: any) => void;
}

export default function FinancialAccountItem({ 
  account, 
  type, 
  onPayOrReceive, 
  onView,
  onEdit 
}: FinancialAccountItemProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'yyyy-MM-dd');
    } catch (e) {
      console.error('Error formatting date:', e);
      return 'Data inválida';
    }
  };

  const isPayable = type === 'payable';
  const isPending = account.status === 'pending';
  
  // Extract service name using the utility function
  const serviceInfo = account.originalData?.notes;
  const serviceName = extractServiceName(serviceInfo);

  return (
    <TableRow className="hover:bg-muted/50">
      <TableCell className="p-4">
        <div className="flex flex-col">
          <span className="font-medium">
            {isPayable ? account.description : account.client}
          </span>
          {isPayable ? (
            <span className="text-sm text-muted-foreground">{account.category}</span>
          ) : (
            <>
              <span className="text-sm text-muted-foreground">#{account.orderNumber}</span>
              {serviceName && (
                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 mt-1 inline-block">
                  {serviceName}
                </span>
              )}
            </>
          )}
        </div>
      </TableCell>
      <TableCell className="p-4">
        <span className="font-medium">{formatCurrency(account.value)}</span>
      </TableCell>
      <TableCell className="p-4">
        <span>{account.dueDate ? formatDate(account.dueDate) : 'Sem data'}</span>
      </TableCell>
      <TableCell className="p-4">
        <span className={`rounded-full border px-2 py-1 text-xs font-medium ${
          (account.status === 'paid' || account.status === 'received') 
            ? 'bg-green-100 text-green-800 border-green-300' 
            : 'bg-yellow-100 text-yellow-800 border-yellow-300'
        }`}>
          {isPayable 
            ? (account.status === 'paid' ? 'Pago' : 'Pendente') 
            : (account.status === 'received' ? 'Recebido' : 'Pendente')}
        </span>
      </TableCell>
      <TableCell className="p-4">
        <div className="flex space-x-1">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onView(account)}
          >
            Ver
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onEdit(account)}
          >
            Editar
          </Button>
          {isPending && (
            <Button 
              variant="outline" 
              size="sm"
              className={`ml-1 ${isPayable 
                ? 'text-blue-600 border-blue-200 hover:bg-blue-50' 
                : 'text-green-600 border-green-200 hover:bg-green-50'}`}
              onClick={() => onPayOrReceive(account.id)}
            >
              {isPayable ? 'Pagar' : 'Receber'}
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
