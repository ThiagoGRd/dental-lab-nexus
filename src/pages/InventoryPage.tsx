
import React, { useState } from 'react';
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
import { Plus, Search, Package, Edit, Trash } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

// Dados simulados para o estoque
const mockInventoryItems = [
  { 
    id: 1, 
    name: 'Zircônia Multicamada', 
    category: 'Material Protético', 
    quantity: 45, 
    unit: 'unidades',
    minQuantity: 10,
    supplier: 'Dental Lab Supply'
  },
  { 
    id: 2, 
    name: 'Dissilicato de Lítio', 
    category: 'Material Protético', 
    quantity: 28, 
    unit: 'blocos',
    minQuantity: 5,
    supplier: 'Dental Cerâmica'
  },
  { 
    id: 3, 
    name: 'Resina Z350', 
    category: 'Material Restaurador', 
    quantity: 12, 
    unit: 'tubos',
    minQuantity: 5,
    supplier: 'Dental Master'
  },
  { 
    id: 4, 
    name: 'Gesso Especial Tipo IV', 
    category: 'Material de Moldagem', 
    quantity: 5, 
    unit: 'kg',
    minQuantity: 10,
    supplier: 'Dental Produtos'
  },
  { 
    id: 5, 
    name: 'Alginato', 
    category: 'Material de Moldagem', 
    quantity: 8, 
    unit: 'pacotes',
    minQuantity: 3,
    supplier: 'Supply Dental'
  },
];

interface InventoryItem {
  id: number;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minQuantity: number;
  supplier: string;
}

export default function InventoryPage() {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(mockInventoryItems);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isNewItemDialogOpen, setIsNewItemDialogOpen] = useState(false);
  const [isEditItemDialogOpen, setIsEditItemDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<InventoryItem | null>(null);
  const [newItemData, setNewItemData] = useState({
    name: '',
    category: '',
    quantity: 0,
    unit: '',
    minQuantity: 0,
    supplier: ''
  });

  // Filtragem dos itens de estoque
  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Categorias únicas para o filtro
  const categories = [...new Set(inventoryItems.map(item => item.category))];

  // Gerenciamento do form de novo item
  const handleNewItemInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewItemData({
      ...newItemData,
      [name]: name === 'quantity' || name === 'minQuantity' ? Number(value) : value,
    });
  };

  // Adicionar novo item
  const handleAddItem = () => {
    const newId = Math.max(...inventoryItems.map(item => item.id), 0) + 1;
    const newItem = {
      id: newId,
      ...newItemData,
    };
    setInventoryItems([...inventoryItems, newItem]);
    setIsNewItemDialogOpen(false);
    toast.success('Item adicionado ao estoque com sucesso!');
    
    // Reset form
    setNewItemData({
      name: '',
      category: '',
      quantity: 0,
      unit: '',
      minQuantity: 0,
      supplier: ''
    });
  };

  // Preparar edição
  const handleEditItemSetup = (item: InventoryItem) => {
    setCurrentItem(item);
    setNewItemData({
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      minQuantity: item.minQuantity,
      supplier: item.supplier
    });
    setIsEditItemDialogOpen(true);
  };

  // Salvar edição
  const handleEditItem = () => {
    if (!currentItem) return;
    
    const updatedItems = inventoryItems.map(item =>
      item.id === currentItem.id ? { ...item, ...newItemData } : item
    );
    
    setInventoryItems(updatedItems);
    setIsEditItemDialogOpen(false);
    toast.success('Item atualizado com sucesso!');
    
    // Reset
    setCurrentItem(null);
    setNewItemData({
      name: '',
      category: '',
      quantity: 0,
      unit: '',
      minQuantity: 0,
      supplier: ''
    });
  };

  // Deletar item
  const handleDeleteItem = (id: number) => {
    const updatedItems = inventoryItems.filter(item => item.id !== id);
    setInventoryItems(updatedItems);
    toast.success('Item removido do estoque com sucesso!');
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
                  <label htmlFor="minQuantity" className="block text-sm font-medium text-gray-700 mb-1">
                    Quantidade Mínima
                  </label>
                  <Input
                    id="minQuantity"
                    name="minQuantity"
                    type="number"
                    min="0"
                    value={newItemData.minQuantity}
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
              <Button onClick={handleAddItem}>
                Adicionar
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
              {filteredItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>
                    {item.quantity} {item.unit}
                  </TableCell>
                  <TableCell>{item.supplier}</TableCell>
                  <TableCell>
                    {item.quantity <= item.minQuantity ? (
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
              ))}
            </TableBody>
          </Table>
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
                <label htmlFor="edit-minQuantity" className="block text-sm font-medium text-gray-700 mb-1">
                  Quantidade Mínima
                </label>
                <Input
                  id="edit-minQuantity"
                  name="minQuantity"
                  type="number"
                  min="0"
                  value={newItemData.minQuantity}
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
            <Button onClick={handleEditItem}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
