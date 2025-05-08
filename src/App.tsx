import React, { lazy, Suspense } from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NotificationProvider } from './context/NotificationContext';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { PageLoading } from './components/ui/page-loading';
import { ErrorBoundary } from './components/ui/error-boundary';

// Configure QueryClient with error handling that's compatible with @tanstack/react-query v5+
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 30000,
      refetchOnWindowFocus: false,
      meta: {
        onError: (error) => {
          console.error('Query error:', error);
        }
      }
    },
    mutations: {
      meta: {
        onError: (error) => {
          console.error('Mutation error:', error);
        }
      }
    }
  }
});

// Lazy load pages with error handling for each chunk loading
const loadComponent = (importer) => {
  return lazy(() => {
    console.log(`Loading component: ${importer.name || 'unknown'}`);
    return importer().catch(error => {
      console.error(`Failed to load component: ${error}`);
      // Re-throw to be caught by ErrorBoundary
      throw error;
    });
  });
};

// Lazy load pages
const Dashboard = loadComponent(() => import('./pages/Dashboard'));
const OrdersPage = loadComponent(() => import('./pages/OrdersPage'));
const ClientsPage = loadComponent(() => import('./pages/ClientsPage'));
const ProductionPage = loadComponent(() => import('./pages/ProductionPage'));
const ServicesPage = loadComponent(() => import('./pages/ServicesPage'));
const InventoryPage = loadComponent(() => import('./pages/InventoryPage'));
const FinancePage = loadComponent(() => import('./pages/FinancePage'));
const ReportsPage = loadComponent(() => import('./pages/ReportsPage'));
const SettingsPage = loadComponent(() => import('./pages/SettingsPage'));
const WorkflowsPage = loadComponent(() => import('./pages/WorkflowsPage'));
const LoginPage = loadComponent(() => import('./pages/LoginPage'));
const NotFound = loadComponent(() => import('./pages/NotFound'));

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <NotificationProvider>
          <Routes>
            <Route path="/login" element={
              <Layout>
                <Suspense fallback={<PageLoading message="Carregando..." />}>
                  <LoginPage />
                </Suspense>
              </Layout>
            } />
            
            <Route element={
              <ProtectedRoute>
                <Layout>
                  <Outlet />
                </Layout>
              </ProtectedRoute>
            }>
              <Route path="/" element={
                <Suspense fallback={<PageLoading message="Carregando dashboard..." />}>
                  <Dashboard />
                </Suspense>
              } />
              <Route path="/orders" element={
                <Suspense fallback={<PageLoading message="Carregando ordens..." />}>
                  <OrdersPage />
                </Suspense>
              } />
              <Route path="/clients" element={
                <Suspense fallback={<PageLoading message="Carregando clientes..." />}>
                  <ClientsPage />
                </Suspense>
              } />
              <Route path="/production" element={
                <Suspense fallback={<PageLoading message="Carregando produção..." />}>
                  <ProductionPage />
                </Suspense>
              } />
              <Route path="/services" element={
                <Suspense fallback={<PageLoading message="Carregando serviços..." />}>
                  <ServicesPage />
                </Suspense>
              } />
              <Route path="/inventory" element={
                <Suspense fallback={<PageLoading message="Carregando inventário..." />}>
                  <InventoryPage />
                </Suspense>
              } />
              <Route path="/finance" element={
                <Suspense fallback={<PageLoading message="Carregando finanças..." />}>
                  <FinancePage />
                </Suspense>
              } />
              <Route path="/reports" element={
                <Suspense fallback={<PageLoading message="Carregando relatórios..." />}>
                  <ReportsPage />
                </Suspense>
              } />
              <Route path="/settings" element={
                <Suspense fallback={<PageLoading message="Carregando configurações..." />}>
                  <SettingsPage />
                </Suspense>
              } />
              <Route path="/workflows" element={
                <Suspense fallback={<PageLoading message="Carregando fluxos..." />}>
                  <WorkflowsPage />
                </Suspense>
              } />
            </Route>
            
            <Route path="*" element={
              <Layout>
                <Suspense fallback={<PageLoading message="Carregando..." />}>
                  <NotFound />
                </Suspense>
              </Layout>
            } />
          </Routes>
        </NotificationProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
