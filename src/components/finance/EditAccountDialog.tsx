
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
      <DialogContent className="max-w-lg dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
        <DialogHeader>
          <DialogTitle className="dark:text-gray-100">Editar Conta</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {isPayable ? (
            // Payable account edit form
            <>
              <div className="grid gap-2">
                <Label htmlFor="description" className="dark:text-gray-200">Descrição</Label>
                <Input
                  id="description"
                  name="description"
                  value={formData.description || ''}
                  onChange={onInputChange}
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category" className="dark:text-gray-200">Categoria</Label>
                <Select 
                  value={formData.category || ''}
                  onValueChange={(value) => handleSelectChange('category', value)}
                >
                  <SelectTrigger className="w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100">
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
                <Label htmlFor="client" className="dark:text-gray-200">Cliente</Label>
                <Input
                  id="client"
                  name="client"
                  value={formData.client || ''}
                  onChange={onInputChange}
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="orderNumber" className="dark:text-gray-200">Número da Ordem</Label>
                <Input
                  id="orderNumber"
                  name="orderNumber"
                  value={formData.orderNumber || ''}
                  onChange={onInputChange}
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                />
              </div>
              {serviceName && (
                <div className="grid gap-2">
                  <Label className="dark:text-gray-200">Serviço</Label>
                  <div className="text-blue-600 py-2 px-3 border rounded bg-blue-50 font-medium dark:bg-gray-700 dark:border-blue-500 dark:text-blue-400 dark:bg-opacity-20">
                    {serviceName}
                  </div>
                </div>
              )}
            </>
          )}
          <div className="grid gap-2">
            <Label htmlFor="value" className="dark:text-gray-200">Valor (R$)</Label>
            <Input
              id="value"
              name="value"
              type="number"
              step="0.01"
              value={formData.value || 0}
              onChange={onInputChange}
              className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="dueDate" className="dark:text-gray-200">Data de Vencimento</Label>
            <Input
              id="dueDate"
              name="dueDate"
              type="date"
              value={formData.dueDate || ''}
              onChange={onInputChange}
              className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="notes" className="dark:text-gray-200">Observações</Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes || ''}
              onChange={onInputChange}
              className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}
            className="dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">
            Cancelar
          </Button>
          <Button onClick={handleSubmit} className="dark:bg-primary dark:text-white">
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
