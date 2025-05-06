
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
import { extractServiceName } from '@/utils/serviceNameExtractor';

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
  
  // Extract service name using the utility function
  const serviceInfo = currentAccount.originalData?.notes;
  const serviceName = extractServiceName(serviceInfo);

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
