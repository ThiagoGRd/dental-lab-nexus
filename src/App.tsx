
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
};

const App = () => {
  // Aplicar tema inicial antes da renderização
  const defaultTheme = applyInitialTheme();
  
  // Adicionar classes CSS globais para resolução de problemas com temas
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      /* Estilos globais para garantir tema escuro em popups */
      html.dark [data-radix-popper-content-wrapper] > div,
      html[data-theme="dark"] [data-radix-popper-content-wrapper] > div,
      .dark [data-radix-popper-content-wrapper] > div {
        background-color: #1f2937 !important;
        border-color: #374151 !important;
        color: #f3f4f6 !important;
      }
      
      /* Garantir que selects em tema escuro mantenham o tema */
      html.dark .select-content,
      html[data-theme="dark"] .select-content,
      .dark .select-content {
        background-color: #1f2937 !important;
        border-color: #374151 !important;
        color: #f3f4f6 !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
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
