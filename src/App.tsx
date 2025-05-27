
import React, { lazy, Suspense, useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/theme/ThemeProvider";
import { NotificationProvider } from "./context/NotificationContext";
import LayoutOptimized from "./components/layout/LayoutOptimized";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/LoginPage";
import { LoadingSpinner } from "./components/ui/loading-spinner";

// Lazy loading otimizado para componentes de página
const Dashboard = lazy(() => import("./pages/Dashboard"));
const OrdersPage = lazy(() => import("./pages/OrdersPage"));
const ClientsPage = lazy(() => import("./pages/ClientsPage"));
const ProductionPage = lazy(() => import("./pages/ProductionPage"));
const InventoryPage = lazy(() => import("./pages/InventoryPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const FinancePage = lazy(() => import("./pages/FinancePage"));
const ReportsPage = lazy(() => import("./pages/ReportsPage"));
const ServicesPage = lazy(() => import("./pages/ServicesPage"));

// Configuração otimizada do QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      gcTime: 10 * 60 * 1000, // 10 minutos
      retry: 2,
      refetchOnWindowFocus: false,
      refetchOnMount: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Componente de loading melhorado
const PageLoadingFallback = () => (
  <div className="flex h-screen w-full items-center justify-center bg-background">
    <LoadingSpinner size="lg" text="Carregando página..." />
  </div>
);

const App = () => {
  // Aplicar tema inicial para evitar flash
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const theme = savedTheme || (prefersDark ? 'dark' : 'light');
      
      document.documentElement.classList.toggle('dark', theme === 'dark');
      
      if (!savedTheme) {
        localStorage.setItem('theme', theme);
      }
    } catch (error) {
      console.debug("Erro ao configurar tema inicial:", error);
    }
  }, []);
  
  return (
    <React.StrictMode>
      <ThemeProvider defaultTheme="system">
        <QueryClientProvider client={queryClient}>
          <NotificationProvider>
            <TooltipProvider>
              <Toaster 
                position="top-right" 
                expand={false} 
                richColors 
                closeButton
                toastOptions={{
                  style: {
                    background: 'hsl(var(--background))',
                    color: 'hsl(var(--foreground))',
                    border: '1px solid hsl(var(--border))',
                  },
                }}
              />
              <BrowserRouter>
                <Suspense fallback={<PageLoadingFallback />}>
                  <Routes>
                    {/* Rota de login sem layout */}
                    <Route path="/login" element={<LoginPage />} />
                    
                    {/* Todas as outras rotas com layout protegido */}
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
                    
                    {/* Rota 404 */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </BrowserRouter>
            </TooltipProvider>
          </NotificationProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </React.StrictMode>
  );
};

export default App;
