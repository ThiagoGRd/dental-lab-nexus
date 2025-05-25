
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit, Calendar, User, FileText, AlertTriangle, Save } from 'lucide-react';
import { toast } from 'sonner';

interface OrderEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: any;
  onSave: (updatedOrder: any) => Promise<boolean>;
}

export default function OrderEditDialog({ open, onOpenChange, order, onSave }: OrderEditDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    patientName: '',
    dueDate: '',
    status: 'pending',
    isUrgent: false,
    notes: '',
    prosthesisType: '',
    material: '',
    shadeDetails: ''
  });

  // Extrair detalhes das notas
  const extractDetailFromNotes = (notes: string, detail: string): string => {
    if (!notes) return '';
    const regex = new RegExp(`${detail}:\\s*([^,\\-]+)`, 'i');
    const match = notes.match(regex);
    return match && match[1] ? match[1].trim() : '';
  };

  useEffect(() => {
    if (order && open) {
      setFormData({
        patientName: order.patientName || '',
        dueDate: order.dueDate || '',
        status: order.status || 'pending',
        isUrgent: order.isUrgent || false,
        notes: order.notes || '',
        prosthesisType: extractDetailFromNotes(order.notes || '', 'Tipo'),
        material: extractDetailFromNotes(order.notes || '', 'Material'),
        shadeDetails: extractDetailFromNotes(order.notes || '', 'Cor')
      });
    }
  }, [order, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const success = await onSave({
        ...order,
        ...formData
      });

      if (success) {
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Erro ao salvar ordem:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Editar Ordem #{order.id.substring(0, 8)}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="production">Em Produção</SelectItem>
                  <SelectItem value="waiting">Aguardando Material</SelectItem>
                  <SelectItem value="completed">Finalizado</SelectItem>
                  <SelectItem value="delivered">Entregue</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority" className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Prioridade
              </Label>
              <Select 
                value={formData.isUrgent ? 'urgent' : 'normal'} 
                onValueChange={(value) => setFormData({...formData, isUrgent: value === 'urgent'})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="urgent">Urgente</SelectItem>
                </SelectContent>
              </Select>
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
                  <SelectItem value="">Não especificado</SelectItem>
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
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="bg-dentalblue-600 hover:bg-dentalblue-700">
              <Save className="mr-2 h-4 w-4" />
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
