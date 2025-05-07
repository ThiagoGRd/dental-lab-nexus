
import { NavigateFunction } from 'react-router-dom';

interface OrderFilterOptions {
  status?: string;
  isUrgent?: boolean;
  startDate?: string;
  endDate?: string;
  searchTerm?: string;
}

/**
 * Navega para a página de ordens com os filtros especificados
 */
export const navigateToOrdersWithFilter = (
  navigate: NavigateFunction,
  filterOptions: OrderFilterOptions
) => {
  // Criar querystring com os filtros
  const params = new URLSearchParams();
  
  if (filterOptions.status) {
    params.append('status', filterOptions.status);
  }
  
  if (filterOptions.isUrgent === true) {
    params.append('urgent', 'true');
  }
  
  if (filterOptions.startDate) {
    params.append('startDate', filterOptions.startDate);
  }
  
  if (filterOptions.endDate) {
    params.append('endDate', filterOptions.endDate);
  }
  
  if (filterOptions.searchTerm) {
    params.append('search', filterOptions.searchTerm);
  }
  
  // Navegar para a página de ordens com os parâmetros
  const queryString = params.toString();
  navigate(`/orders${queryString ? '?' + queryString : ''}`);
};
