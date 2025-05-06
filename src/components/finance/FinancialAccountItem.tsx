
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowUp, ArrowDown, Eye, Pencil } from 'lucide-react';
import { format } from 'date-fns';
import { TableRow, TableCell } from '@/components/ui/table';

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
  
  // Extract service information
  const serviceInfo = account.originalData?.notes;
  
  // Enhanced service name extraction logic
  let serviceName = null;
  if (serviceInfo) {
    // First check for specifically mentioned service types with direct naming patterns
    if (serviceInfo.toLowerCase().includes('prótese')) {
      serviceName = 'Prótese';
      
      if (serviceInfo.toLowerCase().includes('provisória') || serviceInfo.toLowerCase().includes('provisoria')) {
        serviceName = 'Prótese Provisória';
      } else if (serviceInfo.toLowerCase().includes('definitiva')) {
        serviceName = 'Prótese Definitiva';
      }
    } else if (serviceInfo.toLowerCase().includes('guia cirúrgico') || serviceInfo.toLowerCase().includes('guia cirurgico')) {
      serviceName = 'Guia Cirúrgico';
    } else if (serviceInfo.toLowerCase().includes('implante')) {
      serviceName = 'Implante Dentário';
    } else {
      // Extract service name from common patterns
      let serviceMatch = null;
      
      // Pattern "serviço: X" or "serviço X" or "Service: X"
      serviceMatch = serviceInfo.match(/servi[çc]o:?\s*([^.,;()\n]+)/i);
      if (serviceMatch && serviceMatch[1]) {
        serviceName = serviceMatch[1].trim();
      } else {
        // Try to find service name in "tipo: X" pattern
        serviceMatch = serviceInfo.match(/tipo:?\s*([^.,;()\n]+)/i);
        if (serviceMatch && serviceMatch[1]) {
          serviceName = serviceMatch[1].trim();
        } else {
          // Look for common words that might indicate a service name
          const commonWords = ['coroa', 'aparelho', 'tratamento', 'exame', 'consulta', 'limpeza'];
          for (const word of commonWords) {
            if (serviceInfo.toLowerCase().includes(word)) {
              // Extract the full phrase containing this word
              const regex = new RegExp(`[\\w\\s]*(${word}[\\w\\s]*)[.,;:]?`, 'i');
              const match = serviceInfo.match(regex);
              if (match && match[1]) {
                serviceName = match[1].trim();
                break;
              }
            }
          }
          
          // If still no match, try to avoid using "finalizada" as the service name
          if (!serviceName && serviceInfo.toLowerCase().includes('finalizada')) {
            // Try to find what was finalized instead of using "finalizada" itself
            const beforeFinalizada = serviceInfo.split(/finalizada:?/i)[0].trim();
            if (beforeFinalizada && beforeFinalizada.length > 3) {
              // Use the last phrase before "finalizada" as the service name
              const phrases = beforeFinalizada.split(/[.,;:\n]/);
              if (phrases.length > 0) {
                serviceName = phrases[phrases.length - 1].trim();
              }
            }
          }
        }
      }
      
      // If we still haven't found anything meaningful, look for any capitalized words
      // that might indicate service names
      if (!serviceName || serviceName.toLowerCase().includes('finalizada')) {
        const capitalizedWords = serviceInfo.match(/\b[A-Z][a-zA-Z]{2,}\b/g);
        if (capitalizedWords && capitalizedWords.length) {
          // Use the first capitalized word that's not common
          const commonWords = ['Ordem', 'Servico', 'Serviço', 'Finalizada', 'Tipo', 'Status'];
          for (const word of capitalizedWords) {
            if (!commonWords.includes(word)) {
              serviceName = word;
              break;
            }
          }
        }
      }
    }
  }

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
