
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from 'sonner';
import { Plus, Search, Edit, Trash } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';

interface InventoryItem {
  id: string;
  name: string;
  category: string | null;
  quantity: number;
  unit: string | null;
  min_quantity: number | null;
  supplier: string | null;
}

export default function InventoryPage() {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isNewItemDialogOpen, setIsNewItemDialogOpen] = useState(false);
  const [isEditItemDialogOpen, setIsEditItemDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<InventoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [newItemData, setNewItemData] = useState({
    name: '',
    category: '',
    quantity: 0,
    unit: '',
    min_quantity: 0,
    supplier: ''
  });

  // Fetch inventory data from Supabase
  useEffect(() => {
    fetchInventoryData();
  }, []);

  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Erro ao buscar dados do estoque:', error);
        toast.error('Não foi possível carregar os itens do estoque.');
        return;
      }
      
      if (data) {
        setInventoryItems(data);
        
        // Extract unique categories
        const uniqueCategories = [...new Set(data
          .map(item => item.category)
          .filter(category => category !== null) as string[])];
        setCategories(uniqueCategories);
      }
    } catch (error) {
      console.error('Erro ao processar dados do estoque:', error);
      toast.error('Ocorreu um erro ao processar os dados do estoque.');
    } finally {
      setLoading(false);
    }
  };

  // Filtragem dos itens de estoque
  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch = (
      (item.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
      ((item.supplier || '')?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Gerenciamento do form de novo item
  const handleNewItemInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewItemData({
      ...newItemData,
      [name]: name === 'quantity' || name === 'min_quantity' ? Number(value) : value,
    });
  };

  // Adicionar novo item
  const handleAddItem = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('inventory')
        .insert({
          name: newItemData.name,
          category: newItemData.category || null,
          quantity: newItemData.quantity,
          unit: newItemData.unit || null,
          min_quantity: newItemData.min_quantity,
          supplier: newItemData.supplier || null
        })
        .select();
      
      if (error) {
        console.error('Erro ao adicionar item:', error);
        toast.error('Não foi possível adicionar o item ao estoque.');
        return;
      }
      
      // Update the local state with the new item
      if (data && data[0]) {
        setInventoryItems([...inventoryItems, data[0]]);
        
        // Update categories if a new one was added
        if (newItemData.category && !categories.includes(newItemData.category)) {
          setCategories([...categories, newItemData.category]);
        }
      }
      
      toast.success('Item adicionado ao estoque com sucesso!');
      setIsNewItemDialogOpen(false);
      
      // Reset form
      setNewItemData({
        name: '',
        category: '',
        quantity: 0,
        unit: '',
        min_quantity: 0,
        supplier: ''
      });
    } catch (error) {
      console.error('Erro ao processar adição de item:', error);
      toast.error('Ocorreu um erro ao adicionar o item.');
    } finally {
      setLoading(false);
    }
  };

  // Preparar edição
  const handleEditItemSetup = (item: InventoryItem) => {
    setCurrentItem(item);
    setNewItemData({
      name: item.name,
      category: item.category || '',
      quantity: item.quantity,
      unit: item.unit || '',
      min_quantity: item.min_quantity || 0,
      supplier: item.supplier || ''
    });
    setIsEditItemDialogOpen(true);
  };

  // Salvar edição
  const handleEditItem = async () => {
    if (!currentItem) return;
    
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('inventory')
        .update({
          name: newItemData.name,
          category: newItemData.category || null,
          quantity: newItemData.quantity,
          unit: newItemData.unit || null,
          min_quantity: newItemData.min_quantity,
          supplier: newItemData.supplier || null
        })
        .eq('id', currentItem.id);
      
      if (error) {
        console.error('Erro ao atualizar item:', error);
        toast.error('Não foi possível atualizar o item no estoque.');
        return;
      }
      
      // Update the local state
      const updatedItems = inventoryItems.map(item =>
        item.id === currentItem.id ? { 
          ...item, 
          name: newItemData.name,
          category: newItemData.category || null,
          quantity: newItemData.quantity,
          unit: newItemData.unit || null,
          min_quantity: newItemData.min_quantity || 0,
          supplier: newItemData.supplier || null
        } : item
      );
      
      setInventoryItems(updatedItems);
      
      // Update categories if needed
      if (newItemData.category && !categories.includes(newItemData.category)) {
        setCategories([...categories, newItemData.category]);
      }
      
      toast.success('Item atualizado com sucesso!');
      setIsEditItemDialogOpen(false);
      
      // Reset
      setCurrentItem(null);
      setNewItemData({
        name: '',
        category: '',
        quantity: 0,
        unit: '',
        min_quantity: 0,
        supplier: ''
      });
    } catch (error) {
      console.error('Erro ao processar atualização:', error);
      toast.error('Ocorreu um erro ao atualizar o item.');
    } finally {
      setLoading(false);
    }
  };

  // Deletar item
  const handleDeleteItem = async (id: string) => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('inventory')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Erro ao remover item:', error);
        toast.error('Não foi possível remover o item do estoque.');
        return;
      }
      
      // Update local state
      const updatedItems = inventoryItems.filter(item => item.id !== id);
      setInventoryItems(updatedItems);
      
      toast.success('Item removido do estoque com sucesso!');
      
      // Recalculate categories if needed
      const remainingCategories = [...new Set(updatedItems
        .map(item => item.category)
        .filter(category => category !== null) as string[])];
      setCategories(remainingCategories);
    } catch (error) {
      console.error('Erro ao processar exclusão:', error);
      toast.error('Ocorreu um erro ao remover o item.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dentalblue-800">Estoque</h1>
          <p className="text-gray-600">Gerencie o estoque de materiais do laboratório</p>
        </div>
        <Dialog open={isNewItemDialogOpen} onOpenChange={setIsNewItemDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Novo Item ao Estoque</DialogTitle>
              <DialogDescription>
                Preencha as informações do novo item abaixo.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Nome do Item
                  </label>
                  <Input
                    id="name"
                    name="name"
                    value={newItemData.name}
                    onChange={handleNewItemInputChange}
                    placeholder="Ex: Zircônia Multicamada"
                  />
                </div>
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                    Categoria
                  </label>
                  <Input
                    id="category"
                    name="category"
                    value={newItemData.category}
                    onChange={handleNewItemInputChange}
                    placeholder="Ex: Material Protético"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                    Quantidade
                  </label>
                  <Input
                    id="quantity"
                    name="quantity"
                    type="number"
                    min="0"
                    value={newItemData.quantity}
                    onChange={handleNewItemInputChange}
                  />
                </div>
                <div>
                  <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-1">
                    Unidade
                  </label>
                  <Input
                    id="unit"
                    name="unit"
                    value={newItemData.unit}
                    onChange={handleNewItemInputChange}
                    placeholder="Ex: unidades, kg, pacotes"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="min_quantity" className="block text-sm font-medium text-gray-700 mb-1">
                    Quantidade Mínima
                  </label>
                  <Input
                    id="min_quantity"
                    name="min_quantity"
                    type="number"
                    min="0"
                    value={newItemData.min_quantity}
                    onChange={handleNewItemInputChange}
                  />
                </div>
                <div>
                  <label htmlFor="supplier" className="block text-sm font-medium text-gray-700 mb-1">
                    Fornecedor
                  </label>
                  <Input
                    id="supplier"
                    name="supplier"
                    value={newItemData.supplier}
                    onChange={handleNewItemInputChange}
                    placeholder="Ex: Dental Lab Supply"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsNewItemDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddItem} disabled={loading}>
                {loading ? 'Adicionando...' : 'Adicionar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filtrar Estoque</CardTitle>
          <CardDescription>Encontre rapidamente os itens em estoque</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <Input
                placeholder="Buscar por nome ou fornecedor..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select
              value={categoryFilter}
              onValueChange={setCategoryFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Categorias</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={() => {setSearchTerm(''); setCategoryFilter('all')}}>
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Inventário</CardTitle>
          <CardDescription>Total de {filteredItems.length} itens encontrados</CardDescription>
        </CardHeader>
        <CardContent>
          {loading && inventoryItems.length === 0 ? (
            <div className="flex justify-center items-center py-8">
              <div className="text-center">
                <p className="text-gray-500 mb-2">Carregando dados do estoque...</p>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Fornecedor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.length > 0 ? (
                  filteredItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.category || '-'}</TableCell>
                      <TableCell>
                        {item.quantity} {item.unit || 'un'}
                      </TableCell>
                      <TableCell>{item.supplier || '-'}</TableCell>
                      <TableCell>
                        {item.quantity <= (item.min_quantity || 0) ? (
                          <Badge variant="destructive">Estoque Baixo</Badge>
                        ) : (
                          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                            Adequado
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEditItemSetup(item)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Trash className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remover Item</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja remover o item "{item.name}" do estoque?
                                  Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-red-600 hover:bg-red-700"
                                  onClick={() => handleDeleteItem(item.id)}
                                >
                                  Remover
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10">
                      <p className="text-gray-500">Nenhum item encontrado no estoque.</p>
                      <p className="text-gray-400 text-sm mt-1">
                        {searchTerm || categoryFilter !== 'all' ? 
                          'Tente alterar os filtros de busca.' : 
                          'Adicione seu primeiro item clicando no botão "Novo Item".'}
                      </p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      {/* Dialog para editar item */}
      <Dialog open={isEditItemDialogOpen} onOpenChange={setIsEditItemDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Item do Estoque</DialogTitle>
            <DialogDescription>
              Atualize as informações do item selecionado.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Item
                </label>
                <Input
                  id="edit-name"
                  name="name"
                  value={newItemData.name}
                  onChange={handleNewItemInputChange}
                />
              </div>
              <div>
                <label htmlFor="edit-category" className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria
                </label>
                <Input
                  id="edit-category"
                  name="category"
                  value={newItemData.category}
                  onChange={handleNewItemInputChange}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="edit-quantity" className="block text-sm font-medium text-gray-700 mb-1">
                  Quantidade
                </label>
                <Input
                  id="edit-quantity"
                  name="quantity"
                  type="number"
                  min="0"
                  value={newItemData.quantity}
                  onChange={handleNewItemInputChange}
                />
              </div>
              <div>
                <label htmlFor="edit-unit" className="block text-sm font-medium text-gray-700 mb-1">
                  Unidade
                </label>
                <Input
                  id="edit-unit"
                  name="unit"
                  value={newItemData.unit}
                  onChange={handleNewItemInputChange}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="edit-min_quantity" className="block text-sm font-medium text-gray-700 mb-1">
                  Quantidade Mínima
                </label>
                <Input
                  id="edit-min_quantity"
                  name="min_quantity"
                  type="number"
                  min="0"
                  value={newItemData.min_quantity}
                  onChange={handleNewItemInputChange}
                />
              </div>
              <div>
                <label htmlFor="edit-supplier" className="block text-sm font-medium text-gray-700 mb-1">
                  Fornecedor
                </label>
                <Input
                  id="edit-supplier"
                  name="supplier"
                  value={newItemData.supplier}
                  onChange={handleNewItemInputChange}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditItemDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditItem} disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
