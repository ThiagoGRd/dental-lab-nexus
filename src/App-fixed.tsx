import React from 'react';
import { SidebarProvider } from "@/components/ui/sidebar-fixed";
import { ThemeProvider } from "next-themes";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { NotificationProvider } from '@/context/NotificationContext';

// Componentes de layout
import LayoutSimplified from './components/layout/LayoutSimplified';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Páginas
import Dashboard from './pages/Dashboard';
import LoginPage from './pages/LoginPage';
import OrdersPage from './pages/OrdersPage';
import ClientsPage from './pages/ClientsPage';
import ProductionPage from './pages/ProductionPage';
import InventoryPage from './pages/InventoryPage';
import FinancePage from './pages/FinancePage';
import ReportsPage from './pages/ReportsPage';
import ServicesPage from './pages/ServicesPage';
import SettingsPage from './pages/SettingsPage';
import NotFound from './pages/NotFound';
import WorkflowsPage from './pages/WorkflowsPage';

// Configuração do cliente de consulta
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutos
    },
  },
});

// Tema padrão
const defaultTheme = localStorage.getItem('theme') || 'light';

const App = () => {
  // Adicionar estilos globais para garantir consistência de tema
  React.useEffect(() => {
    try {
      const style = document.createElement('style');
      document.head.appendChild(style);
      style.innerHTML = `
        /* Garantir que o tema escuro seja aplicado corretamente */
        html.dark body,
        html[data-theme="dark"] body,
        .dark {
          background-color: #111827 !important;
          color: #f3f4f6 !important;
        }
        
        /* Garantir que diálogos e modais tenham o tema correto */
        html.dark [role="dialog"],
        html[data-theme="dark"] [role="dialog"],
        .dark [role="dialog"],
        .dialog-content[data-theme="dark"],
        .modal-content[data-theme="dark"] {
          background-color: #1f2937 !important;
          border-color: #374151 !important;
          color: #f3f4f6 !important;
        }
        
        /* Garantir que inputs tenham o tema correto */
        html.dark input, 
        html.dark textarea, 
        html.dark select,
        html[data-theme="dark"] input,
        html[data-theme="dark"] textarea,
        html[data-theme="dark"] select,
        .dark input,
        .dark textarea,
        .dark select {
          background-color: #374151 !important;
          border-color: #4b5563 !important;
          color: #f3f4f6 !important;
        }
        
        /* Garantir que itens de menu tenham o tema correto */
        html.dark [role="menuitem"],
        html[data-theme="dark"] [role="menuitem"],
        .dark [role="menuitem"] {
          background-color: #1f2937 !important;
          color: #f3f4f6 !important;
        }
        
        /* Garantir que SVGs em componentes select/popover tenham o tema correto */
        html.dark .select-content svg,
        html[data-theme="dark"] .select-content svg,
        .dark .select-content svg {
          color: #f3f4f6 !important;
        }
        
        /* Corrigir z-index para garantir que o sidebar esteja sempre visível */
        .group\\/sidebar {
          z-index: 40 !important;
        }
        
        /* Garantir que o conteúdo principal tenha espaço adequado em dispositivos móveis */
        @media (max-width: 768px) {
          main {
            padding: 1rem !important;
          }
        }
      `;
      
      return () => {
        // Limpar estilos ao desmontar
        if (style && style.parentNode) {
          style.parentNode.removeChild(style);
        }
      };
    } catch (error) {
      console.debug("Erro ao configurar estilos globais:", error);
    }
  }, []);
  
  return (
    <React.StrictMode>
      <ThemeProvider defaultTheme={defaultTheme as "light" | "dark" | "system"}>
        <QueryClientProvider client={queryClient}>
          <NotificationProvider>
            <TooltipProvider>
              <Toaster />
              <BrowserRouter>
                <Routes>
                  <Route path="/login" element={<LoginPage />} />
                  
                  <Route path="/" element={
                    <ProtectedRoute>
                      <LayoutSimplified>
                        <Dashboard />
                      </LayoutSimplified>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/orders" element={
                    <ProtectedRoute>
                      <LayoutSimplified>
                        <OrdersPage />
                      </LayoutSimplified>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/clients" element={
                    <ProtectedRoute>
                      <LayoutSimplified>
                        <ClientsPage />
                      </LayoutSimplified>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/production" element={
                    <ProtectedRoute>
                      <LayoutSimplified>
                        <ProductionPage />
                      </LayoutSimplified>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/workflows" element={
                    <ProtectedRoute>
                      <LayoutSimplified>
                        <WorkflowsPage />
                      </LayoutSimplified>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/inventory" element={
                    <ProtectedRoute>
                      <LayoutSimplified>
                        <InventoryPage />
                      </LayoutSimplified>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/finances" element={
                    <ProtectedRoute>
                      <LayoutSimplified>
                        <FinancePage />
                      </LayoutSimplified>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/reports" element={
                    <ProtectedRoute>
                      <LayoutSimplified>
                        <ReportsPage />
                      </LayoutSimplified>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/services" element={
                    <ProtectedRoute>
                      <LayoutSimplified>
                        <ServicesPage />
                      </LayoutSimplified>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/settings" element={
                    <ProtectedRoute requiredRole="admin">
                      <LayoutSimplified>
                        <SettingsPage />
                      </LayoutSimplified>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </NotificationProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </React.StrictMode>
  );
};

export default App;
