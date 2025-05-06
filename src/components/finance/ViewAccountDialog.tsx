
import React from 'react';
import { format } from 'date-fns';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ViewAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account: any | null;
}

export default function ViewAccountDialog({ open, onOpenChange, account }: ViewAccountDialogProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy');
  };

  if (!account) return null;

  const isPayable = 'description' in account;
  
  // Extract service information
  const serviceInfo = account.originalData?.notes;
  
  // Parse the service name from the notes if available
  let serviceName = null;
  if (serviceInfo) {
    // First try - look for common service identifiers
    if (serviceInfo.includes('prótese')) {
      serviceName = 'Prótese';
      
      // Check for additional qualifiers
      if (serviceInfo.includes('provisória') || serviceInfo.includes('provisoria')) {
        serviceName = 'Prótese Provisória';
      } else if (serviceInfo.includes('definitiva')) {
        serviceName = 'Prótese Definitiva';
      }
    } else if (serviceInfo.includes('guia cirúrgico') || serviceInfo.includes('guia cirurgico')) {
      serviceName = 'Guia Cirúrgico';
    } else if (serviceInfo.includes('implante')) {
      serviceName = 'Implante Dentário';
    } else {
      // Second try - extract from "serviço: X" pattern
      const serviceMatch = serviceInfo?.match(/serviço:\s*([^()\n]+?)(?:\s*\(|$)/i);
      if (serviceMatch && serviceMatch[1]) {
        serviceName = serviceMatch[1].trim();
      } else {
        // Third try - extract service name after "finalizada:" or similar markers
        const finalizedMatch = serviceInfo?.match(/finalizada:?\s*([^.\n]+)/i);
        if (finalizedMatch && finalizedMatch[1]) {
          serviceName = finalizedMatch[1].trim();
        }
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Detalhes da Conta</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {isPayable ? (
            // Payable account details
            <>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Descrição</h4>
                <p className="text-lg font-semibold">{account.description}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Categoria</h4>
                <p>{account.category}</p>
              </div>
            </>
          ) : (
            // Receivable account details
            <>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Cliente</h4>
                <p className="text-lg font-semibold">{account.client}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Número da Ordem</h4>
                <p>#{account.orderNumber}</p>
              </div>
              {serviceName && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Serviço</h4>
                  <p className="text-blue-600">{serviceName}</p>
                </div>
              )}
            </>
          )}
          <div>
            <h4 className="text-sm font-medium text-gray-500">Valor</h4>
            <p className="text-lg font-semibold text-green-600">{formatCurrency(account.value)}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500">Data de Vencimento</h4>
            <p>{formatDate(account.dueDate)}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500">Status</h4>
            <span className={`rounded-full border px-2 py-1 text-xs font-medium ${
              (account.status === 'paid' || account.status === 'received')
                ? 'bg-green-100 text-green-800 border-green-300' 
                : 'bg-yellow-100 text-yellow-800 border-yellow-300'
            }`}>
              {account.status === 'paid' 
                ? 'Pago' 
                : account.status === 'received' 
                  ? 'Recebido' 
                  : 'Pendente'}
            </span>
          </div>
          {account.notes && !serviceName && (
            <div>
              <h4 className="text-sm font-medium text-gray-500">Observações</h4>
              <p>{account.notes}</p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
