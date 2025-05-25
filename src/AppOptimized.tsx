import React from 'react';
import { SidebarProvider } from "@/components/ui/sidebar-fixed";
import { ThemeProvider } from "next-themes";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { NotificationProvider } from '@/context/NotificationContext';

// Importar componentes de layout otimizados
import LayoutOptimized from './components/layout/LayoutOptimized';
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

// Importar estilos globais
import './global-styles.css';

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
      // Verificar preferência de tema do sistema
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const savedTheme = localStorage.getItem('theme');
      
      // Se não houver tema salvo, usar preferência do sistema
      if (!savedTheme) {
        localStorage.setItem('theme', prefersDark ? 'dark' : 'light');
        document.documentElement.classList.toggle('dark', prefersDark);
      } else {
        // Aplicar tema salvo
        document.documentElement.classList.toggle('dark', savedTheme === 'dark');
      }
      
      // Observar mudanças na preferência do sistema
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e) => {
        // Só atualizar automaticamente se o usuário não tiver definido uma preferência
        if (!localStorage.getItem('theme')) {
          document.documentElement.classList.toggle('dark', e.matches);
          localStorage.setItem('theme', e.matches ? 'dark' : 'light');
        }
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } catch (error) {
      console.debug("Erro ao configurar tema:", error);
    }
  }, []);
  
  return (
    <React.StrictMode>
      <ThemeProvider defaultTheme={defaultTheme as "light" | "dark" | "system"} enableSystem>
        <QueryClientProvider client={queryClient}>
          <NotificationProvider>
            <TooltipProvider>
              <Toaster 
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  className: "toast-custom-class",
                  style: {
                    background: 'var(--color-background)',
                    color: 'var(--color-foreground)',
                    border: '1px solid var(--color-border)',
                  },
                }}
              />
              <BrowserRouter>
                <Routes>
                  <Route path="/login" element={<LoginPage />} />
                  
                  <Route path="/" element={
                    <ProtectedRoute>
                      <LayoutOptimized>
                        <Dashboard />
                      </LayoutOptimized>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/orders" element={
                    <ProtectedRoute>
                      <LayoutOptimized>
                        <OrdersPage />
                      </LayoutOptimized>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/clients" element={
                    <ProtectedRoute>
                      <LayoutOptimized>
                        <ClientsPage />
                      </LayoutOptimized>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/production" element={
                    <ProtectedRoute>
                      <LayoutOptimized>
                        <ProductionPage />
                      </LayoutOptimized>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/workflows" element={
                    <ProtectedRoute>
                      <LayoutOptimized>
                        <WorkflowsPage />
                      </LayoutOptimized>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/inventory" element={
                    <ProtectedRoute>
                      <LayoutOptimized>
                        <InventoryPage />
                      </LayoutOptimized>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/finances" element={
                    <ProtectedRoute>
                      <LayoutOptimized>
                        <FinancePage />
                      </LayoutOptimized>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/reports" element={
                    <ProtectedRoute>
                      <LayoutOptimized>
                        <ReportsPage />
                      </LayoutOptimized>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/services" element={
                    <ProtectedRoute>
                      <LayoutOptimized>
                        <ServicesPage />
                      </LayoutOptimized>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/settings" element={
                    <ProtectedRoute requiredRole="admin">
                      <LayoutOptimized>
                        <SettingsPage />
                      </LayoutOptimized>
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
