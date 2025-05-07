
import React, { useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage 
} from '@/components/ui/form';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';

// Define the schema for payable and receivable entries
const payableFormSchema = z.object({
  description: z.string().min(3, 'A descrição é obrigatória'),
  category: z.string().min(1, 'A categoria é obrigatória'),
  value: z.coerce.number().min(0.01, 'O valor deve ser maior que zero'),
  dueDate: z.string().min(1, 'A data de vencimento é obrigatória'),
  notes: z.string().optional(),
  isInstallment: z.boolean().default(false),
  installmentCount: z.coerce.number().min(2, 'O número de parcelas deve ser pelo menos 2').max(36, 'O máximo de parcelas é 36').optional(),
});

const receivableFormSchema = z.object({
  client: z.string().min(3, 'O cliente é obrigatório'),
  orderNumber: z.string().min(1, 'O número do pedido é obrigatório'),
  value: z.coerce.number().min(0.01, 'O valor deve ser maior que zero'),
  dueDate: z.string().min(1, 'A data de vencimento é obrigatória'),
  notes: z.string().optional(),
  isInstallment: z.boolean().default(false),
  installmentCount: z.coerce.number().min(2, 'O número de parcelas deve ser pelo menos 2').max(36, 'O máximo de parcelas é 36').optional(),
});

// Lista fixa de categorias para contas a pagar
const EXPENSE_CATEGORIES = [
  { value: 'Fornecedores', label: 'Fornecedores' },
  { value: 'Despesas Fixas', label: 'Despesas Fixas' },
  { value: 'Serviços', label: 'Serviços' },
  { value: 'Impostos', label: 'Impostos' },
  { value: 'Outros', label: 'Outros' },
];

// Lista fixa de clientes para contas a receber
const CLIENTS = [
  { value: 'Clínica Dental Care', label: 'Clínica Dental Care' },
  { value: 'Dr. Roberto Alves', label: 'Dr. Roberto Alves' },
  { value: 'Odontologia Sorriso', label: 'Odontologia Sorriso' },
  { value: 'Dra. Márcia Santos', label: 'Dra. Márcia Santos' },
  { value: 'Centro Odontológico Bem Estar', label: 'Centro Odontológico Bem Estar' },
];

interface NewFinancialEntryFormProps {
  type: 'payable' | 'receivable';
  onSubmit: (data: any) => void;
  children: React.ReactNode;
}

export default function NewFinancialEntryForm({ type, onSubmit, children }: NewFinancialEntryFormProps) {
  const [open, setOpen] = React.useState(false);
  
  const schema = type === 'payable' ? payableFormSchema : receivableFormSchema;
  
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: type === 'payable' 
      ? { description: '', category: '', value: 0, dueDate: '', notes: '', isInstallment: false } 
      : { client: '', orderNumber: '', value: 0, dueDate: '', notes: '', isInstallment: false },
  });

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  // Watch isInstallment to conditionally show installment count field
  const isInstallment = form.watch('isInstallment');

  const handleFormSubmit = (data: z.infer<typeof schema>) => {
    try {
      onSubmit(data);
      setOpen(false);
      form.reset();
    } catch (error) {
      console.error('Erro ao processar formulário:', error);
      toast.error('Ocorreu um erro ao processar o formulário.');
    }
  };

  // Safe handler for dialog state changes
  const handleOpenChange = (newOpen: boolean) => {
    try {
      setOpen(newOpen);
      if (!newOpen) {
        // Use timeout to avoid state changes during render
        setTimeout(() => form.reset(), 100);
      }
    } catch (error) {
      console.error("Erro ao manipular estado do diálogo:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
        <DialogHeader>
          <DialogTitle className="dark:text-gray-100">
            {type === 'payable' ? 'Adicionar Conta a Pagar' : 'Adicionar Conta a Receber'}
          </DialogTitle>
          <DialogDescription className="dark:text-gray-400">
            {type === 'payable' 
              ? 'Preencha os detalhes da nova conta a pagar' 
              : 'Preencha os detalhes da nova conta a receber'}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
            {type === 'payable' ? (
              <>
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="dark:text-gray-200">Descrição</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Fornecedor XYZ - Material" 
                          className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
                          {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="dark:text-gray-200">Categoria</FormLabel>
                      <Select 
                        onValueChange={field.onChange}
                        value={field.value || ''}
                        defaultValue={field.value || ''}
                      >
                        <FormControl>
                          <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100">
                            <SelectValue placeholder="Selecione uma categoria" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {EXPENSE_CATEGORIES.map((category) => (
                            <SelectItem key={category.value} value={category.value}>
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            ) : (
              <>
                <FormField
                  control={form.control}
                  name="client"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="dark:text-gray-200">Cliente</FormLabel>
                      <Select 
                        onValueChange={field.onChange}
                        value={field.value || ''}
                        defaultValue={field.value || ''}
                      >
                        <FormControl>
                          <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100">
                            <SelectValue placeholder="Selecione um cliente" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CLIENTS.map((client) => (
                            <SelectItem key={client.value} value={client.value}>
                              {client.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="orderNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="dark:text-gray-200">Número do Pedido</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: ORD001" 
                          className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
                          {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
            
            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="dark:text-gray-200">Valor (R$)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.01" 
                      min="0" 
                      placeholder="0,00" 
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                      {...field}
                      onChange={(e) => {
                        // Garantir que o valor digitado seja interpretado como número
                        const value = e.target.value === '' ? '0' : e.target.value;
                        field.onChange(parseFloat(value));
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="dark:text-gray-200">Data de Vencimento</FormLabel>
                  <FormControl>
                    <Input type="date" 
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                      {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="isInstallment"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-4 border dark:border-gray-700 dark:bg-gray-750">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="dark:border-gray-500"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="dark:text-gray-200">
                      Pagamento Parcelado
                    </FormLabel>
                    <FormDescription className="dark:text-gray-400">
                      Marque esta opção para criar parcelas automáticas
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            
            {isInstallment && (
              <FormField
                control={form.control}
                name="installmentCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="dark:text-gray-200">Número de Parcelas</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="2"
                        max="36"
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value === '' ? '2' : e.target.value;
                          field.onChange(parseInt(value, 10));
                        }}
                      />
                    </FormControl>
                    <FormDescription className="dark:text-gray-400">
                      Mínimo de 2 e máximo de 36 parcelas
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="dark:text-gray-200">Observações</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Observações adicionais (opcional)" 
                      className="resize-none dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400" 
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}
                className="dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">
                Cancelar
              </Button>
              <Button type="submit" className="dark:bg-primary dark:text-white">Salvar</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
