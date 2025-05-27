
import React, { useState } from 'react';
import { Plus, Edit, Trash2, Package, DollarSign, Clock, Users } from 'lucide-react';
import { ModernCard } from '@/components/ui/modern-card';
import { StatCard } from '@/components/ui/stat-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const mockServices = [
  {
    id: '1',
    name: 'Prótese Total',
    category: 'Próteses',
    price: 1200.00,
    description: 'Prótese total superior e inferior',
    active: true,
    estimatedTime: '7-10 dias',
    popularity: 85
  },
  {
    id: '2',
    name: 'Coroa de Porcelana',
    category: 'Restaurações',
    price: 450.00,
    description: 'Coroa de porcelana sobre metal',
    active: true,
    estimatedTime: '3-5 dias',
    popularity: 92
  },
  {
    id: '3',
    name: 'Aparelho Ortodôntico',
    category: 'Ortodontia',
    price: 800.00,
    description: 'Aparelho ortodôntico fixo',
    active: true,
    estimatedTime: '1-2 dias',
    popularity: 78
  },
  {
    id: '4',
    name: 'Implante Dentário',
    category: 'Implantes',
    price: 2500.00,
    description: 'Implante com coroa protética',
    active: false,
    estimatedTime: '14-21 dias',
    popularity: 65
  },
];

const ServicesPage = () => {
  const [services, setServices] = useState(mockServices);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalServices = services.length;
  const activeServices = services.filter(s => s.active).length;
  const averagePrice = services.reduce((acc, s) => acc + s.price, 0) / services.length;
  const totalRevenue = services.reduce((acc, s) => acc + (s.price * s.popularity), 0);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Serviços</h1>
          <p className="text-muted-foreground">Gerenciamento completo dos serviços do laboratório</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Serviço
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Serviço</DialogTitle>
              <DialogDescription>
                Preencha as informações do novo serviço
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Nome</Label>
                <Input id="name" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">Categoria</Label>
                <Input id="category" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="price" className="text-right">Preço</Label>
                <Input id="price" type="number" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">Descrição</Label>
                <Textarea id="description" className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={() => setIsDialogOpen(false)}>
                Salvar Serviço
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total de Serviços"
          value={totalServices}
          description="cadastrados no sistema"
          icon={Package}
          variant="primary"
        />
        <StatCard
          title="Serviços Ativos"
          value={activeServices}
          description={`${((activeServices / totalServices) * 100).toFixed(0)}% do total`}
          icon={Users}
          variant="success"
        />
        <StatCard
          title="Preço Médio"
          value={`R$ ${averagePrice.toFixed(0)}`}
          description="média geral"
          icon={DollarSign}
          variant="warning"
        />
        <StatCard
          title="Receita Estimada"
          value={`R$ ${(totalRevenue / 100).toFixed(0)}k`}
          description="baseada na popularidade"
          icon={Clock}
          variant="primary"
        />
      </div>

      {/* Search and Filters */}
      <ModernCard variant="bordered" className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Buscar serviços..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="sm:max-w-sm"
          />
          <div className="flex gap-2">
            <Button variant="outline" size="sm">Todas as Categorias</Button>
            <Button variant="outline" size="sm">Apenas Ativos</Button>
          </div>
        </div>
      </ModernCard>

      {/* Services Table */}
      <ModernCard variant="elevated">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Lista de Serviços</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Serviço</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Tempo Estimado</TableHead>
                <TableHead>Popularidade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredServices.map((service) => (
                <TableRow key={service.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div>
                      <div className="font-medium">{service.name}</div>
                      <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                        {service.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{service.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">R$ {service.price.toFixed(2)}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{service.estimatedTime}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-12 bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${service.popularity}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">{service.popularity}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={service.active ? 'default' : 'secondary'}>
                      {service.active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-1 justify-end">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </ModernCard>
    </div>
  );
};

export default ServicesPage;
