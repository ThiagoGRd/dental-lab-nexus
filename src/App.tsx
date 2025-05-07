
import React, { lazy, Suspense, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./components/theme/ThemeProvider";
import Layout from "./components/layout/Layout";
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
      gcTime: 5 * 60 * 1000, // 5 minutos (substitui cacheTime)
      retry: 1, // Reduza o número de retentativas
    },
  },
});

// Componente de carregamento
const LoadingFallback = () => (
  <div className="flex h-full w-full items-center justify-center p-8">
    <div className="text-xl text-protechblue-100">Carregando...</div>
  </div>
);

// Aplica tema inicial para evitar flash de tema errado
const applyInitialTheme = () => {
  if (typeof window === 'undefined') return 'light';
  
  try {
    // Verificar se há um tema armazenado
    const storedTheme = localStorage.getItem('protech-ui-theme');
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    let initialTheme;
    
    // Decidir qual tema usar
    if (storedTheme === 'dark' || (storedTheme === 'system' && systemPrefersDark) || (!storedTheme && systemPrefersDark)) {
      initialTheme = 'dark';
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      initialTheme = 'light';
      document.documentElement.classList.remove('dark');
      document.documentElement.removeAttribute('data-theme');
    }
    
    return initialTheme;
  } catch (error) {
    console.debug("Error applying initial theme:", error);
    return 'light'; // Fallback to light theme if there's an error
  }
};

// Pre-render theme to avoid flashing
if (typeof document !== 'undefined') {
  // Apply initial theme immediately before React hydration
  applyInitialTheme();
}

const App = () => {
  // Aplicar tema inicial antes da renderização
  const defaultTheme = applyInitialTheme();
  
  // Adicionar classes CSS globais para resolução de problemas com temas
  useEffect(() => {
    // Use a safe approach to add global styles
    try {
      const styleId = 'global-theme-styles';
      let style = document.getElementById(styleId) as HTMLStyleElement;
      
      // Create the style element if it doesn't exist
      if (!style) {
        style = document.createElement('style');
        style.id = styleId;
        document.head.appendChild(style);
      }
      
      style.textContent = `
        /* Ensure shadow DOM and portals respect theme */
        html.dark [data-radix-popper-content-wrapper] > div,
        html[data-theme="dark"] [data-radix-popper-content-wrapper] > div,
        .dark [data-radix-popper-content-wrapper] > div {
          background-color: #1f2937 !important;
          border-color: #374151 !important;
          color: #f3f4f6 !important;
        }
        
        /* Ensure select content elements have correct theme */
        html.dark .select-content,
        html[data-theme="dark"] .select-content,
        .dark .select-content {
          background-color: #1f2937 !important;
          border-color: #374151 !important;
          color: #f3f4f6 !important;
        }
        
        /* Force select-content to use dark theme colors */
        .select-content[data-theme="dark"] {
          background-color: #1f2937 !important;
          border-color: #374151 !important;
          color: #f3f4f6 !important;
        }
        
        /* Force dialog content to respect dark theme */
        [role="dialog"][data-theme="dark"],
        .dialog-content[data-theme="dark"],
        .modal-content[data-theme="dark"] {
          background-color: #1f2937 !important;
          border-color: #374151 !important;
          color: #f3f4f6 !important;
        }
        
        /* Ensure form inputs have proper dark theme */
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
        
        /* Ensure popover items have proper theme */
        html.dark [role="menuitem"],
        html[data-theme="dark"] [role="menuitem"],
        .dark [role="menuitem"] {
          background-color: #1f2937 !important;
          color: #f3f4f6 !important;
        }
        
        /* Set theme on SVG elements inside select/popover components */
        html.dark .select-content svg,
        html[data-theme="dark"] .select-content svg,
        .dark .select-content svg {
          color: #f3f4f6 !important;
        }
      `;
      
      return () => {
        // Clean up styles on unmount
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
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Suspense fallback={<LoadingFallback />}>
                <Routes>
                  <Route path="/login" element={<LoginPage />} />
                  
                  <Route path="/" element={
                    <ProtectedRoute>
                      <Layout>
                        <Dashboard />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/orders" element={
                    <ProtectedRoute>
                      <Layout>
                        <OrdersPage />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/clients" element={
                    <ProtectedRoute>
                      <Layout>
                        <ClientsPage />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/production" element={
                    <ProtectedRoute>
                      <Layout>
                        <ProductionPage />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/inventory" element={
                    <ProtectedRoute>
                      <Layout>
                        <InventoryPage />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/finances" element={
                    <ProtectedRoute>
                      <Layout>
                        <FinancePage />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/reports" element={
                    <ProtectedRoute>
                      <Layout>
                        <ReportsPage />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/services" element={
                    <ProtectedRoute>
                      <Layout>
                        <ServicesPage />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/settings" element={
                    <ProtectedRoute requiredRole="admin">
                      <Layout>
                        <SettingsPage />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </React.StrictMode>
  );
};

export default App;
