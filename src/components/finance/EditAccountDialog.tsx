
import React from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface EditAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentAccount: any | null;
  formData: any;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSubmit: () => void;
}

export default function EditAccountDialog({ 
  open, 
  onOpenChange, 
  currentAccount, 
  formData, 
  onInputChange, 
  onSubmit 
}: EditAccountDialogProps) {
  if (!currentAccount || !formData) return null;

  const isPayable = 'description' in currentAccount;
  
  // Extract service information using the same enhanced logic from FinancialAccountItem
  const serviceInfo = currentAccount.originalData?.notes;
  
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Conta</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {isPayable ? (
            // Payable account edit form
            <>
              <div className="grid gap-2">
                <Label htmlFor="description">Descrição</Label>
                <Input
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={onInputChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Categoria</Label>
                <Input
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={onInputChange}
                />
              </div>
            </>
          ) : (
            // Receivable account edit form
            <>
              <div className="grid gap-2">
                <Label htmlFor="client">Cliente</Label>
                <Input
                  id="client"
                  name="client"
                  value={formData.client}
                  onChange={onInputChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="orderNumber">Número da Ordem</Label>
                <Input
                  id="orderNumber"
                  name="orderNumber"
                  value={formData.orderNumber}
                  onChange={onInputChange}
                />
              </div>
              {serviceName && (
                <div className="grid gap-2">
                  <Label>Serviço</Label>
                  <div className="text-blue-600 py-2 px-3 border rounded bg-blue-50 font-medium">
                    {serviceName}
                  </div>
                </div>
              )}
            </>
          )}
          <div className="grid gap-2">
            <Label htmlFor="value">Valor (R$)</Label>
            <Input
              id="value"
              name="value"
              type="number"
              step="0.01"
              value={formData.value}
              onChange={onInputChange}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="dueDate">Data de Vencimento</Label>
            <Input
              id="dueDate"
              name="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={onInputChange}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={onInputChange}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={onSubmit}>Salvar Alterações</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
