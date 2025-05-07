
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { extractServiceName } from '@/utils/serviceNameExtractor';
import { toast } from 'sonner';

// Lista fixa de categorias para contas a pagar
const EXPENSE_CATEGORIES = [
  { value: 'Fornecedores', label: 'Fornecedores' },
  { value: 'Despesas Fixas', label: 'Despesas Fixas' },
  { value: 'Serviços', label: 'Serviços' },
  { value: 'Impostos', label: 'Impostos' },
  { value: 'Outros', label: 'Outros' },
];

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
  
  // Extract service name using the improved utility function
  const serviceInfo = currentAccount.originalData?.notes || '';
  const serviceName = extractServiceName(serviceInfo);

  // Função para lidar com alterações em select fields
  const handleSelectChange = (name: string, value: string) => {
    try {
      const event = {
        target: {
          name,
          value
        }
      } as React.ChangeEvent<HTMLInputElement>;
      
      onInputChange(event);
    } catch (error) {
      console.error("Erro ao processar alteração do select:", error);
      toast.error("Erro ao selecionar categoria. Por favor, tente novamente.");
    }
  };

  // Função para fechar o diálogo de forma segura
  const handleClose = () => {
    try {
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao fechar diálogo:", error);
    }
  };

  // Função para enviar o formulário de forma segura
  const handleSubmit = () => {
    try {
      onSubmit();
    } catch (error) {
      console.error("Erro ao salvar alterações:", error);
      toast.error("Erro ao salvar. Por favor, tente novamente.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
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
                  value={formData.description || ''}
                  onChange={onInputChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Categoria</Label>
                <Select 
                  value={formData.category || ''}
                  onValueChange={(value) => handleSelectChange('category', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPENSE_CATEGORIES.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                  value={formData.client || ''}
                  onChange={onInputChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="orderNumber">Número da Ordem</Label>
                <Input
                  id="orderNumber"
                  name="orderNumber"
                  value={formData.orderNumber || ''}
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
              value={formData.value || 0}
              onChange={onInputChange}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="dueDate">Data de Vencimento</Label>
            <Input
              id="dueDate"
              name="dueDate"
              type="date"
              value={formData.dueDate || ''}
              onChange={onInputChange}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes || ''}
              onChange={onInputChange}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>Salvar Alterações</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
