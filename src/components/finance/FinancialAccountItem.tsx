
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowUp, ArrowDown, Eye, Pencil } from 'lucide-react';
import { format } from 'date-fns';

interface FinancialAccountItemProps {
  account: any;
  type: 'payable' | 'receivable';
  onPayOrReceive: (id: string) => void;  // Changed from number to string
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
    return format(new Date(dateString), 'dd/MM/yyyy');
  };

  const isPayable = type === 'payable';
  const isPending = isPayable 
    ? account.status === 'pending' 
    : account.status === 'pending';

  return (
    <div className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] items-center gap-4 p-4">
      <div>
        {isPayable ? (
          <>
            <div className="font-medium">{account.description}</div>
            <div className="text-sm text-muted-foreground">{account.category}</div>
          </>
        ) : (
          <>
            <div className="font-medium">{account.client}</div>
            <div className="text-sm text-muted-foreground">#{account.orderNumber}</div>
          </>
        )}
      </div>
      <div className="text-right font-medium">
        {formatCurrency(account.value)}
      </div>
      <div className="text-sm">
        {formatDate(account.dueDate)}
      </div>
      <div>
        <span className={`rounded-full border px-2 py-1 text-xs font-medium ${
          (account.status === 'paid' || account.status === 'received') 
            ? 'bg-green-100 text-green-800 border-green-300' 
            : 'bg-yellow-100 text-yellow-800 border-yellow-300'
        }`}>
          {isPayable 
            ? (account.status === 'paid' ? 'Pago' : 'Pendente') 
            : (account.status === 'received' ? 'Recebido' : 'Pendente')}
        </span>
      </div>
      <div className="flex gap-1">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => onView(account)}
        >
          <Eye className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => onEdit(account)}
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </div>
      <div>
        {isPending && (
          <Button 
            variant="outline" 
            size="sm" 
            className={`${isPayable 
              ? 'text-blue-600 border-blue-200 hover:bg-blue-50' 
              : 'text-green-600 border-green-200 hover:bg-green-50'}`}
            onClick={() => onPayOrReceive(account.id)}
          >
            {isPayable ? (
              <>
                <ArrowUp className="h-4 w-4 mr-1" />
                Pagar
              </>
            ) : (
              <>
                <ArrowDown className="h-4 w-4 mr-1" />
                Receber
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
