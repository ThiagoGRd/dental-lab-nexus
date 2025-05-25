
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Calendar, User, FileText, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { createOrder, createOrderItem } from '@/utils/orderUtils';

interface NewOrderDialogProps {
  children: React.ReactNode;
  onOrderCreated?: () => void;
}

export default function NewOrderDialog({ children, onOrderCreated }: NewOrderDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    clientId: '',
    serviceId: '',
    patientName: '',
    dueDate: '',
    priority: 'normal' as 'normal' | 'urgent',
    notes: '',
    prosthesisType: '',
    material: '',
    shadeDetails: ''
  });

  // Carregar clientes e serviços
  useEffect(() => {
    const loadData = async () => {
      try {
        const [clientsResponse, servicesResponse] = await Promise.all([
          supabase.from('clients').select('id, name').order('name'),
          supabase.from('services').select('id, name, price').eq('active', true).order('name')
        ]);

        if (clientsResponse.data) setClients(clientsResponse.data);
        if (servicesResponse.data) setServices(servicesResponse.data);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast.error('Erro ao carregar dados do formulário');
      }
    };

    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.clientId || !formData.serviceId) {
      toast.error('Cliente e serviço são obrigatórios');
      return;
    }

    setLoading(true);
    
    try {
      // Preparar notas com detalhes técnicos
      let notes = '';
      if (formData.patientName) {
        notes += `Paciente: ${formData.patientName}`;
      }
      if (formData.prosthesisType) {
        notes += notes ? ` - Tipo: ${formData.prosthesisType}` : `Tipo: ${formData.prosthesisType}`;
      }
      if (formData.material) {
        notes += notes ? ` - Material: ${formData.material}` : `Material: ${formData.material}`;
      }
      if (formData.shadeDetails) {
        notes += notes ? ` - Cor: ${formData.shadeDetails}` : `Cor: ${formData.shadeDetails}`;
      }
      if (formData.notes) {
        notes += notes ? ` - ${formData.notes}` : formData.notes;
      }

      // Criar ordem
      const orderResult = await createOrder(
        formData.clientId,
        formData.dueDate || null,
        formData.priority,
        notes
      );

      if (orderResult.error) {
        throw orderResult.error;
      }

      const orderId = orderResult.data?.id;
      if (!orderId) {
        throw new Error('ID da ordem não retornado');
      }

      // Obter preço do serviço
      const selectedService = services.find(s => s.id === formData.serviceId);
      const price = selectedService?.price || 0;

      // Criar item da ordem
      const itemResult = await createOrderItem(
        orderId,
        formData.serviceId,
        price,
        price,
        notes
      );

      if (itemResult.error) {
        throw itemResult.error;
      }

      toast.success('Ordem criada com sucesso!');
      setIsOpen(false);
      setFormData({
        clientId: '',
        serviceId: '',
        patientName: '',
        dueDate: '',
        priority: 'normal',
        notes: '',
        prosthesisType: '',
        material: '',
        shadeDetails: ''
      });
      
      if (onOrderCreated) {
        onOrderCreated();
      }

    } catch (error) {
      console.error('Erro ao criar ordem:', error);
      toast.error('Erro ao criar ordem de serviço');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Nova Ordem de Serviço
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="client">Cliente *</Label>
              <Select value={formData.clientId} onValueChange={(value) => setFormData({...formData, clientId: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="service">Serviço *</Label>
              <Select value={formData.serviceId} onValueChange={(value) => setFormData({...formData, serviceId: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o serviço" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name} - R$ {service.price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="patientName" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Nome do Paciente
              </Label>
              <Input
                id="patientName"
                value={formData.patientName}
                onChange={(e) => setFormData({...formData, patientName: e.target.value})}
                placeholder="Nome do paciente"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Data de Entrega
              </Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="prosthesisType">Tipo de Prótese</Label>
              <Select value={formData.prosthesisType} onValueChange={(value) => setFormData({...formData, prosthesisType: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="coroa">Coroa</SelectItem>
                  <SelectItem value="ponte">Ponte</SelectItem>
                  <SelectItem value="protese_total">Prótese Total</SelectItem>
                  <SelectItem value="protese_parcial">PPR</SelectItem>
                  <SelectItem value="implante">Implante</SelectItem>
                  <SelectItem value="faceta">Faceta</SelectItem>
                  <SelectItem value="onlay">Onlay</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="material">Material</Label>
              <Input
                id="material"
                value={formData.material}
                onChange={(e) => setFormData({...formData, material: e.target.value})}
                placeholder="Ex: Zircônia, Metal..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="shadeDetails">Cor/Tonalidade</Label>
              <Input
                id="shadeDetails"
                value={formData.shadeDetails}
                onChange={(e) => setFormData({...formData, shadeDetails: e.target.value})}
                placeholder="Ex: A2, B1..."
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Prioridade
            </Label>
            <Select value={formData.priority} onValueChange={(value: 'normal' | 'urgent') => setFormData({...formData, priority: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="urgent">Urgente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Observações
            </Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Observações adicionais sobre a ordem..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="bg-dentalblue-600 hover:bg-dentalblue-700">
              {loading ? 'Criando...' : 'Criar Ordem'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
