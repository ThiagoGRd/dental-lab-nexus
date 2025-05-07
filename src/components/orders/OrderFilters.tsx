
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Calendar } from 'lucide-react';

interface OrderFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  startDate: string;
  setStartDate: (date: string) => void;
  endDate: string;
  setEndDate: (date: string) => void;
  handleFilter: () => void;
  sortByDueDate: boolean;
  setSortByDueDate: (sort: boolean) => void;
  urgentOnly: boolean;
  setUrgentOnly: (urgent: boolean) => void;
}

export function OrderFilters({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  handleFilter,
  sortByDueDate,
  setSortByDueDate,
  urgentOnly,
  setUrgentOnly
}: OrderFiltersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Filtrar Ordens</CardTitle>
        <CardDescription>Use os campos abaixo para filtrar as ordens de serviço</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              placeholder="Buscar por cliente, paciente ou ID..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select 
            value={statusFilter} 
            onValueChange={setStatusFilter}
          >
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Status</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="production">Em Produção</SelectItem>
              <SelectItem value="waiting">Aguardando Material</SelectItem>
              <SelectItem value="completed">Finalizado</SelectItem>
              <SelectItem value="delivered">Entregue</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-4">
            <Input
              type="date"
              className="flex-1"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <Input
              type="date"
              className="flex-1"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div>
            <Button className="w-full" onClick={handleFilter}>Filtrar</Button>
          </div>
        </div>
        
        {/* Adicionando opções de ordenação e filtros especiais */}
        <div className="grid gap-4 md:grid-cols-2 mt-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="sortByDueDate"
              checked={sortByDueDate}
              onChange={(e) => setSortByDueDate(e.target.checked)}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="sortByDueDate" className="text-sm font-medium cursor-pointer flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
              Ordenar por Data de Vencimento
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="urgentOnly"
              checked={urgentOnly}
              onChange={(e) => setUrgentOnly(e.target.checked)}
              className="rounded border-gray-300 text-red-600 focus:ring-red-500"
            />
            <label htmlFor="urgentOnly" className="text-sm font-medium cursor-pointer">
              Mostrar apenas ordens urgentes
            </label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
