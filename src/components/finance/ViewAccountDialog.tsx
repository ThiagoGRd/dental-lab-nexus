
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
import { extractServiceName } from '@/utils/serviceNameExtractor';
import { Calendar, FileText } from 'lucide-react';

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
  
  // Extract service name using the utility function
  const serviceInfo = account.originalData?.notes || '';
  const serviceName = extractServiceName(serviceInfo);

  // Calculate days overdue or remaining
  const calculateDaysStatus = (dueDateString: string) => {
    if (!dueDateString) return null;
    
    const dueDate = new Date(dueDateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day
    
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return {
        text: `Vencido há ${Math.abs(diffDays)} ${Math.abs(diffDays) === 1 ? 'dia' : 'dias'}`,
        overdue: true
      };
    } else if (diffDays === 0) {
      return {
        text: 'Vence hoje',
        overdue: false
      };
    } else {
      return {
        text: `Vence em ${diffDays} ${diffDays === 1 ? 'dia' : 'dias'}`,
        overdue: false
      };
    }
  };
  
  const daysStatus = account.dueDate ? calculateDaysStatus(account.dueDate) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Detalhes da Conta</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div>
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
                      <p className="text-blue-600 font-medium">{serviceName}</p>
                    </div>
                  )}
                </>
              )}
            </div>
            
            <div className="text-right">
              <h4 className="text-sm font-medium text-gray-500">Valor</h4>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(account.value)}</p>
              {account.status === 'pending' ? (
                <span className="inline-block rounded-full bg-yellow-100 border border-yellow-300 px-2 py-1 text-xs font-medium text-yellow-800 mt-2">
                  Pendente
                </span>
              ) : (
                <span className="inline-block rounded-full bg-green-100 border border-green-300 px-2 py-1 text-xs font-medium text-green-800 mt-2">
                  {isPayable ? 'Pago' : 'Recebido'}
                </span>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="rounded-md border p-3">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                <h4 className="text-sm font-medium text-gray-500">Vencimento</h4>
              </div>
              <div className="mt-1">
                <p>{account.dueDate ? formatDate(account.dueDate) : 'Sem data'}</p>
                {daysStatus && (
                  <p className={`text-sm ${daysStatus.overdue ? 'text-red-600' : 'text-gray-600'}`}>
                    {daysStatus.text}
                  </p>
                )}
              </div>
            </div>
            
            <div className="rounded-md border p-3">
              <div className="flex items-center">
                <FileText className="h-4 w-4 mr-2 text-gray-500" />
                <h4 className="text-sm font-medium text-gray-500">Informações adicionais</h4>
              </div>
              <p className="text-sm mt-1">
                {account.notes || 'Sem informações adicionais'}
              </p>
            </div>
          </div>
          
          {account.originalData && (
            <div className="rounded-md border p-3 bg-gray-50 mt-4">
              <h4 className="text-sm font-medium text-gray-500 mb-2">Histórico</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Criado em:</span>
                  <span>{account.originalData.created_at ? format(new Date(account.originalData.created_at), 'dd/MM/yyyy HH:mm') : '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Última atualização:</span>
                  <span>{account.originalData.updated_at ? format(new Date(account.originalData.updated_at), 'dd/MM/yyyy HH:mm') : '-'}</span>
                </div>
                {account.originalData.payment_date && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Data do pagamento:</span>
                    <span>{format(new Date(account.originalData.payment_date), 'dd/MM/yyyy')}</span>
                  </div>
                )}
              </div>
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
