
import React, { lazy, Suspense, useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/theme/ThemeProvider";
import { applyInitialTheme } from "./components/theme/utils/themeUtils";
import { NotificationProvider } from "./context/NotificationContext";
import LayoutOptimized from "./components/layout/LayoutOptimized";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/LoginPage";

// Use lazy loading para componentes de página
const Dashboard = lazy(() => import("./pages/Dashboard"));
const OrdersPage = lazy(() => import("./pages/OrdersPage"));
const ClientsPage = lazy(() => import("./pages/ClientsPage"));
const ProductionPage = lazy(() => import("./pages/ProductionPage"));
const InventoryPage = lazy(() => import("./pages/InventoryPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const FinancePage = lazy(() => import("./pages/FinancePage"));
const ReportsPage = lazy(() => import("./pages/ReportsPage"));
const ServicesPage = lazy(() => import("./pages/ServicesPage"));

// Configuração do QueryClient com otimizações
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minuto
      gcTime: 5 * 60 * 1000, // 5 minutos
      retry: 1,
    },
  },
});

// Componente de carregamento
const LoadingFallback = () => (
  <div className="flex h-full w-full items-center justify-center p-8">
    <div className="flex flex-col items-center gap-4">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      <div className="text-lg font-medium text-primary">Carregando...</div>
    </div>
  </div>
);

// Pre-render theme to avoid flashing
if (typeof document !== 'undefined') {
  applyInitialTheme();
}

const App = () => {
  const defaultTheme = applyInitialTheme();
  
  useEffect(() => {
    try {
      const styleId = 'global-theme-styles';
      let style = document.getElementById(styleId) as HTMLStyleElement;
      
      if (!style) {
        style = document.createElement('style');
        style.id = styleId;
        document.head.appendChild(style);
      }
      
      style.textContent = `
        html.dark [data-radix-popper-content-wrapper] > div,
        html[data-theme="dark"] [data-radix-popper-content-wrapper] > div,
        .dark [data-radix-popper-content-wrapper] > div {
          background-color: #1f2937 !important;
          border-color: #374151 !important;
          color: #f3f4f6 !important;
        }
        
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
      `;
      
      return () => {
        if (style && style.parentNode) {
          style.parentNode.removeChild(style);
        }
      };
    } catch (error) {
      console.debug("Error setting up global styles:", error);
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
                <Suspense fallback={<LoadingFallback />}>
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
