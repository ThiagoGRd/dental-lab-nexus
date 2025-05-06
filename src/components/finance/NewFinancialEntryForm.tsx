
import React from 'react';
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

// Define the schema for payable and receivable entries
const payableFormSchema = z.object({
  description: z.string().min(3, 'A descrição é obrigatória'),
  category: z.string().min(1, 'A categoria é obrigatória'),
  value: z.coerce.number().min(0.01, 'O valor deve ser maior que zero'),
  dueDate: z.string().min(1, 'A data de vencimento é obrigatória'),
  notes: z.string().optional(),
});

const receivableFormSchema = z.object({
  client: z.string().min(3, 'O cliente é obrigatório'),
  orderNumber: z.string().min(1, 'O número do pedido é obrigatório'),
  value: z.coerce.number().min(0.01, 'O valor deve ser maior que zero'),
  dueDate: z.string().min(1, 'A data de vencimento é obrigatória'),
  notes: z.string().optional(),
});

interface NewFinancialEntryFormProps {
  type: 'payable' | 'receivable';
  onSubmit: (data: any) => void;
  children: React.ReactNode;  // Add this required prop
}

export default function NewFinancialEntryForm({ type, onSubmit, children }: NewFinancialEntryFormProps) {
  const [open, setOpen] = React.useState(false);
  
  const schema = type === 'payable' ? payableFormSchema : receivableFormSchema;
  
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: type === 'payable' 
      ? { description: '', category: '', value: 0, dueDate: '', notes: '' } 
      : { client: '', orderNumber: '', value: 0, dueDate: '', notes: '' },
  });

  const handleSubmit = (data: z.infer<typeof schema>) => {
    onSubmit(data);
    setOpen(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {type === 'payable' ? 'Adicionar Conta a Pagar' : 'Adicionar Conta a Receber'}
          </DialogTitle>
          <DialogDescription>
            {type === 'payable' 
              ? 'Preencha os detalhes da nova conta a pagar' 
              : 'Preencha os detalhes da nova conta a receber'}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
            {type === 'payable' ? (
              <>
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Fornecedor XYZ - Material" {...field} />
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
                      <FormLabel>Categoria</FormLabel>
                      <Select 
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma categoria" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Fornecedores">Fornecedores</SelectItem>
                          <SelectItem value="Despesas Fixas">Despesas Fixas</SelectItem>
                          <SelectItem value="Serviços">Serviços</SelectItem>
                          <SelectItem value="Impostos">Impostos</SelectItem>
                          <SelectItem value="Outros">Outros</SelectItem>
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
                      <FormLabel>Cliente</FormLabel>
                      <Select 
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um cliente" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Clínica Dental Care">Clínica Dental Care</SelectItem>
                          <SelectItem value="Dr. Roberto Alves">Dr. Roberto Alves</SelectItem>
                          <SelectItem value="Odontologia Sorriso">Odontologia Sorriso</SelectItem>
                          <SelectItem value="Dra. Márcia Santos">Dra. Márcia Santos</SelectItem>
                          <SelectItem value="Centro Odontológico Bem Estar">Centro Odontológico Bem Estar</SelectItem>
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
                      <FormLabel>Número do Pedido</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: ORD001" {...field} />
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
                  <FormLabel>Valor (R$)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.01" 
                      min="0" 
                      placeholder="0,00" 
                      {...field}
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
                  <FormLabel>Data de Vencimento</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Observações adicionais (opcional)" 
                      className="resize-none" 
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
