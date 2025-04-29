
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription 
} from '@/components/ui/form';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { format } from 'date-fns';

const orderFormSchema = z.object({
  client: z.string().min(1, 'O cliente é obrigatório'),
  service: z.string().min(1, 'O serviço é obrigatório'),
  dueDate: z.string().min(1, 'A data de entrega é obrigatória'),
  isUrgent: z.boolean().default(false),
  shade: z.string().min(1, 'A cor/escala é obrigatória'),
  material: z.string().min(1, 'O material é obrigatório'),
  notes: z.string().optional(),
});

type OrderFormValues = z.infer<typeof orderFormSchema>;

interface NewOrderDialogProps {
  children: React.ReactNode;
}

export default function NewOrderDialog({ children }: NewOrderDialogProps) {
  const [open, setOpen] = React.useState(false);
  
  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      client: '',
      service: '',
      dueDate: format(
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias no futuro
        'yyyy-MM-dd'
      ),
      isUrgent: false,
      shade: '',
      material: '',
      notes: ''
    }
  });

  const handleSubmit = (data: OrderFormValues) => {
    console.log("Nova ordem:", data);
    toast.success('Ordem de serviço criada com sucesso!');
    setOpen(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Nova Ordem de Serviço</DialogTitle>
          <DialogDescription>
            Preencha as informações para criar uma nova ordem de serviço
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
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
                name="service"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Serviço</FormLabel>
                    <Select 
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um serviço" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Coroa em Zircônia">Coroa em Zircônia</SelectItem>
                        <SelectItem value="Prótese Fixa">Prótese Fixa</SelectItem>
                        <SelectItem value="Faceta">Faceta</SelectItem>
                        <SelectItem value="Implante">Implante</SelectItem>
                        <SelectItem value="Prótese Removível">Prótese Removível</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Entrega</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="isUrgent"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-6">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Ordem Urgente</FormLabel>
                      <FormDescription>
                        Prazo de entrega reduzido (3 dias úteis)
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="shade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cor/Escala</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: A2" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="material"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Material</FormLabel>
                    <Select 
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o material" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Zircônia Multicamada">Zircônia Multicamada</SelectItem>
                        <SelectItem value="Dissilicato de Lítio">Dissilicato de Lítio</SelectItem>
                        <SelectItem value="Resina Z350">Resina Z350</SelectItem>
                        <SelectItem value="Metal para Infraestrutura">Metal para Infraestrutura</SelectItem>
                        <SelectItem value="Cerâmica Feldspática">Cerâmica Feldspática</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Instruções especiais ou observações adicionais" 
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
              <Button type="submit" className="bg-dentalblue-600 hover:bg-dentalblue-700">
                Criar Ordem
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
