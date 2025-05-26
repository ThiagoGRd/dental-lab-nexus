
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Package,
  AlertTriangle,
  RefreshCw,
  Minus,
  PlusIcon
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface InventoryItem {
  id: string;
  name: string;
  description: string | null;
  quantity: number;
  min_quantity: number | null;
  price: number | null;
  category: string | null;
  supplier: string | null;
  unit: string | null;
  created_at: string;
  updated_at: string;
}

export default function InventoryPageFixed() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  
  // Dialog states
  const [isNewItemOpen, setIsNewItemOpen] = useState(false);
  const [isEditItemOpen, setIsEditItemOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    quantity: '',
    min_quantity: '',
    price: '',
    category: '',
    supplier: '',
    unit: ''
  });

  useEffect(() => {
    loadItems();
  }, []);

  useEffect(() => {
    filterItems();
  }, [items, searchTerm, categoryFilter, stockFilter]);

  const loadItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .order('name');

      if (error) {
        console.error('Erro ao carregar itens:', error);
        toast.error('Erro ao carregar itens do estoque.');
        return;
      }

      setItems(data || []);
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast.error('Ocorreu um erro inesperado.');
    } finally {
      setLoading(false);
    }
  };

  const filterItems = () => {
    let filtered = items;

    // Filtro por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.supplier && item.supplier.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filtro por categoria
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(item => item.category === categoryFilter);
    }

    // Filtro por status do estoque
    if (stockFilter !== 'all') {
      if (stockFilter === 'low') {
        filtered = filtered.filter(item => 
          item.min_quantity && item.quantity <= item.min_quantity
        );
      } else if (stockFilter === 'out') {
        filtered = filtered.filter(item => item.quantity === 0);
      }
    }

    setFilteredItems(filtered);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      quantity: '',
      min_quantity: '',
      price: '',
      category: '',
      supplier: '',
      unit: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Nome do item é obrigatório.');
      return;
    }

    if (!formData.quantity || Number(formData.quantity) < 0) {
      toast.error('Quantidade deve ser um número válido.');
      return;
    }

    try {
      const itemData = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        quantity: Number(formData.quantity),
        min_quantity: formData.min_quantity ? Number(formData.min_quantity) : null,
        price: formData.price ? Number(formData.price) : null,
        category: formData.category.trim() || null,
        supplier: formData.supplier.trim() || null,
        unit: formData.unit.trim() || null
      };

      let result;
      if (editingItem) {
        // Atualizar item existente
        result = await supabase
          .from('inventory')
          .update(itemData)
          .eq('id', editingItem.id)
          .select();
      } else {
        // Criar novo item
        result = await supabase
          .from('inventory')
          .insert(itemData)
          .select();
      }

      if (result.error) {
        console.error('Erro ao salvar item:', result.error);
        toast.error('Erro ao salvar item.');
        return;
      }

      toast.success(editingItem ? 'Item atualizado com sucesso!' : 'Item criado com sucesso!');
      
      // Recarregar lista
      await loadItems();
      
      // Fechar dialog e resetar form
      setIsNewItemOpen(false);
      setIsEditItemOpen(false);
      setEditingItem(null);
      resetForm();

    } catch (error) {
      console.error('Erro inesperado:', error);
      toast.error('Ocorreu um erro inesperado.');
    }
  };

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      quantity: item.quantity.toString(),
      min_quantity: item.min_quantity?.toString() || '',
      price: item.price?.toString() || '',
      category: item.category || '',
      supplier: item.supplier || '',
      unit: item.unit || ''
    });
    setIsEditItemOpen(true);
  };

  const handleDelete = async (item: InventoryItem) => {
    if (!confirm(`Tem certeza que deseja excluir o item "${item.name}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('inventory')
        .delete()
        .eq('id', item.id);

      if (error) {
        console.error('Erro ao excluir item:', error);
        toast.error('Erro ao excluir item.');
        return;
      }

      toast.success('Item excluído com sucesso!');
      await loadItems();
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast.error('Ocorreu um erro inesperado.');
    }
  };

  const adjustQuantity = async (item: InventoryItem, adjustment: number) => {
    const newQuantity = Math.max(0, item.quantity + adjustment);
    
    try {
      const { error } = await supabase
        .from('inventory')
        .update({ quantity: newQuantity })
        .eq('id', item.id);

      if (error) {
        console.error('Erro ao ajustar quantidade:', error);
        toast.error('Erro ao ajustar quantidade.');
        return;
      }

      toast.success(`Quantidade ${adjustment > 0 ? 'aumentada' : 'diminuída'} com sucesso!`);
      await loadItems();
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast.error('Ocorreu um erro inesperado.');
    }
  };

  const getUniqueCategories = () => {
    const categories = items
      .map(item => item.category)
      .filter((category, index, array) => category && array.indexOf(category) === index)
      .sort();
    return categories;
  };

  const formatPrice = (price: number | null) => {
    if (!price) return 'N/A';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const getStockStatus = (item: InventoryItem) => {
    if (item.quantity === 0) {
      return { label: 'Sem Estoque', variant: 'destructive' as const };
    } else if (item.min_quantity && item.quantity <= item.min_quantity) {
      return { label: 'Estoque Baixo', variant: 'secondary' as const };
    } else {
      return { label: 'Em Estoque', variant: 'default' as const };
    }
  };

  const lowStockItems = items.filter(item => 
    item.min_quantity && item.quantity <= item.min_quantity
  );

  const outOfStockItems = items.filter(item => item.quantity === 0);

  const ItemForm = ({ onSubmit }: { onSubmit: (e: React.FormEvent) => void }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome do Item *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            placeholder="Ex: Resina Acrílica"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Categoria</Label>
          <Input
            id="category"
            value={formData.category}
            onChange={(e) => setFormData({...formData, category: e.target.value})}
            placeholder="Ex: Materiais, Instrumentos"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          placeholder="Descrição detalhada do item..."
          rows={2}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="quantity">Quantidade *</Label>
          <Input
            id="quantity"
            type="number"
            min="0"
            value={formData.quantity}
            onChange={(e) => setFormData({...formData, quantity: e.target.value})}
            placeholder="0"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="min_quantity">Quantidade Mínima</Label>
          <Input
            id="min_quantity"
            type="number"
            min="0"
            value={formData.min_quantity}
            onChange={(e) => setFormData({...formData, min_quantity: e.target.value})}
            placeholder="0"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="unit">Unidade</Label>
          <Input
            id="unit"
            value={formData.unit}
            onChange={(e) => setFormData({...formData, unit: e.target.value})}
            placeholder="Ex: ml, g, unid"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Preço Unitário (R$)</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0"
            value={formData.price}
            onChange={(e) => setFormData({...formData, price: e.target.value})}
            placeholder="0,00"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="supplier">Fornecedor</Label>
          <Input
            id="supplier"
            value={formData.supplier}
            onChange={(e) => setFormData({...formData, supplier: e.target.value})}
            placeholder="Nome do fornecedor"
          />
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={() => {
          setIsNewItemOpen(false);
          setIsEditItemOpen(false);
          setEditingItem(null);
          resetForm();
        }}>
          Cancelar
        </Button>
        <Button type="submit" className="bg-dentalblue-600 hover:bg-dentalblue-700">
          {editingItem ? 'Atualizar' : 'Criar'} Item
        </Button>
      </DialogFooter>
    </form>
  );

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dentalblue-800">Estoque</h1>
          <p className="text-gray-600">Gerencie o inventário do laboratório</p>
        </div>
        <Dialog open={isNewItemOpen} onOpenChange={setIsNewItemOpen}>
          <DialogTrigger asChild>
            <Button className="bg-dentalblue-600 hover:bg-dentalblue-700">
              <Plus className="mr-2 h-4 w-4" />
              Novo Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Item</DialogTitle>
            </DialogHeader>
            <ItemForm onSubmit={handleSubmit} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Alertas de Estoque */}
      {(lowStockItems.length > 0 || outOfStockItems.length > 0) && (
        <div className="mb-6 grid gap-4 md:grid-cols-2">
          {outOfStockItems.length > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-red-800">
                  <AlertTriangle className="h-5 w-5" />
                  Itens sem Estoque ({outOfStockItems.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {outOfStockItems.slice(0, 3).map(item => (
                    <div key={item.id} className="text-sm text-red-700">
                      {item.name}
                    </div>
                  ))}
                  {outOfStockItems.length > 3 && (
                    <div className="text-xs text-red-600">
                      +{outOfStockItems.length - 3} outros itens
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {lowStockItems.length > 0 && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-yellow-800">
                  <AlertTriangle className="h-5 w-5" />
                  Estoque Baixo ({lowStockItems.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {lowStockItems.slice(0, 3).map(item => (
                    <div key={item.id} className="text-sm text-yellow-700">
                      {item.name} - {item.quantity} {item.unit || 'unid'}
                    </div>
                  ))}
                  {lowStockItems.length > 3 && (
                    <div className="text-xs text-yellow-600">
                      +{lowStockItems.length - 3} outros itens
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Filtros */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <Input
                placeholder="Buscar itens..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Categorias</SelectItem>
                {getUniqueCategories().map(category => (
                  <SelectItem key={category} value={category!}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={stockFilter} onValueChange={setStockFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status do Estoque" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="low">Estoque Baixo</SelectItem>
                <SelectItem value="out">Sem Estoque</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => {
              setSearchTerm('');
              setCategoryFilter('all');
              setStockFilter('all');
            }}>
              Limpar Filtros
            </Button>
            <Button variant="outline" onClick={loadItems}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Atualizar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Itens */}
      <Card>
        <CardHeader>
          <CardTitle>Itens do Estoque ({filteredItems.length})</CardTitle>
          <CardDescription>
            Todos os itens cadastrados no estoque
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Carregando itens...</div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {items.length === 0 ? 
                'Nenhum item cadastrado.' : 
                'Nenhum item encontrado com os filtros aplicados.'
              }
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Preço Unit.</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => {
                  const stockStatus = getStockStatus(item);
                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            <Package className="h-4 w-4 text-dentalblue-600" />
                            {item.name}
                          </div>
                          {item.description && (
                            <div className="text-sm text-gray-500 mt-1">
                              {item.description}
                            </div>
                          )}
                          {item.supplier && (
                            <div className="text-xs text-gray-400 mt-1">
                              Fornecedor: {item.supplier}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {item.category ? (
                          <Badge variant="outline">{item.category}</Badge>
                        ) : (
                          <span className="text-gray-400">Sem categoria</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => adjustQuantity(item, -1)}
                            disabled={item.quantity <= 0}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <div className="font-medium min-w-[60px] text-center">
                            {item.quantity} {item.unit || 'unid'}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => adjustQuantity(item, 1)}
                          >
                            <PlusIcon className="h-3 w-3" />
                          </Button>
                        </div>
                        {item.min_quantity && (
                          <div className="text-xs text-gray-500 text-center mt-1">
                            Mín: {item.min_quantity}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={stockStatus.variant}>
                          {stockStatus.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {formatPrice(item.price)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(item)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(item)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Edição */}
      <Dialog open={isEditItemOpen} onOpenChange={setIsEditItemOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Item</DialogTitle>
          </DialogHeader>
          <ItemForm onSubmit={handleSubmit} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
