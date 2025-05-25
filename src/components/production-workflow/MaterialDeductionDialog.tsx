import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle,
  Edit,
  Save
} from 'lucide-react';
import { MaterialUsage } from '@/types/workflow';
import { InventoryItem } from '@/types/inventory';

interface MaterialDeductionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  materials: MaterialUsage[];
  inventoryItems: InventoryItem[];
  onConfirm: (adjustedMaterials: MaterialUsage[]) => void;
  onCancel: () => void;
  title?: string;
  description?: string;
}

const MaterialDeductionDialog: React.FC<MaterialDeductionDialogProps> = ({
  open,
  onOpenChange,
  materials,
  inventoryItems,
  onConfirm,
  onCancel,
  title = "Confirmar Uso de Materiais",
  description = "Revise e confirme os materiais que serão deduzidos do estoque."
}) => {
  const [adjustedMaterials, setAdjustedMaterials] = useState<MaterialUsage[]>([]);
  const [editingMaterial, setEditingMaterial] = useState<string | null>(null);
  const [hasInsufficientStock, setHasInsufficientStock] = useState(false);

  // Inicializar materiais ajustados quando o diálogo abrir
  useEffect(() => {
    if (open) {
      setAdjustedMaterials([...materials]);
      
      // Verificar se há estoque suficiente
      const insufficient = materials.some(material => {
        const inventoryItem = inventoryItems.find(item => item.id === material.materialId);
        return !inventoryItem || inventoryItem.currentQuantity < material.quantity;
      });
      
      setHasInsufficientStock(insufficient);
    }
  }, [open, materials, inventoryItems]);

  // Atualizar quantidade de um material
  const handleQuantityChange = (materialId: string, newQuantity: number) => {
    setAdjustedMaterials(prev => 
      prev.map(material => 
        material.materialId === materialId 
          ? { ...material, quantity: newQuantity } 
          : material
      )
    );
    
    // Verificar se há estoque suficiente após ajuste
    const insufficient = adjustedMaterials.some(material => {
      if (material.materialId === materialId) {
        const inventoryItem = inventoryItems.find(item => item.id === materialId);
        return !inventoryItem || inventoryItem.currentQuantity < newQuantity;
      }
      
      const inventoryItem = inventoryItems.find(item => item.id === material.materialId);
      return !inventoryItem || inventoryItem.currentQuantity < material.quantity;
    });
    
    setHasInsufficientStock(insufficient);
  };

  // Obter informações de estoque para um material
  const getStockInfo = (materialId: string) => {
    return inventoryItems.find(item => item.id === materialId);
  };

  // Verificar se há estoque suficiente para um material
  const hasSufficientStock = (material: MaterialUsage) => {
    const inventoryItem = getStockInfo(material.materialId);
    return inventoryItem && inventoryItem.currentQuantity >= material.quantity;
  };

  // Obter nome do material
  const getMaterialName = (materialId: string) => {
    const inventoryItem = getStockInfo(materialId);
    return inventoryItem ? inventoryItem.name : 'Material desconhecido';
  };

  // Obter unidade do material
  const getMaterialUnit = (material: MaterialUsage) => {
    const inventoryItem = getStockInfo(material.materialId);
    return inventoryItem ? inventoryItem.unit : material.unit;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        
        {hasInsufficientStock && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Estoque insuficiente</AlertTitle>
            <AlertDescription>
              Alguns materiais não possuem estoque suficiente. Ajuste as quantidades ou reponha o estoque.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="max-h-[400px] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Material</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Disponível</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {adjustedMaterials.map(material => {
                const inventoryItem = getStockInfo(material.materialId);
                const sufficient = hasSufficientStock(material);
                
                return (
                  <TableRow key={material.materialId}>
                    <TableCell>{getMaterialName(material.materialId)}</TableCell>
                    <TableCell>
                      {editingMaterial === material.materialId ? (
                        <Input 
                          type="number" 
                          min="0" 
                          step="0.01"
                          value={material.quantity} 
                          onChange={(e) => handleQuantityChange(material.materialId, parseFloat(e.target.value))}
                          className="w-24"
                        />
                      ) : (
                        <span>
                          {material.quantity} {getMaterialUnit(material)}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {inventoryItem ? (
                        <span>
                          {inventoryItem.currentQuantity} {inventoryItem.unit}
                        </span>
                      ) : (
                        <Badge variant="outline" className="text-red-500">
                          Não encontrado
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {sufficient ? (
                        <Badge className="bg-green-100 text-green-700">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Disponível
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Insuficiente
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingMaterial === material.materialId ? (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setEditingMaterial(null)}
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setEditingMaterial(material.materialId)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        
        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button 
            onClick={() => onConfirm(adjustedMaterials)}
            disabled={hasInsufficientStock}
          >
            Confirmar Dedução
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MaterialDeductionDialog;
