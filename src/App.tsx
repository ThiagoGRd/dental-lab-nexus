
import React, { lazy, Suspense } from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NotificationProvider } from './context/NotificationContext';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { PageLoading } from './components/ui/page-loading';
import { ErrorBoundary } from './components/ui/error-boundary';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000
    }
  }
});

// Lazy load pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const OrdersPage = lazy(() => import('./pages/OrdersPage'));
const ClientsPage = lazy(() => import('./pages/ClientsPage'));
const ProductionPage = lazy(() => import('./pages/ProductionPage'));
const ServicesPage = lazy(() => import('./pages/ServicesPage'));
const InventoryPage = lazy(() => import('./pages/InventoryPage'));
const FinancePage = lazy(() => import('./pages/FinancePage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const WorkflowsPage = lazy(() => import('./pages/WorkflowsPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const NotFound = lazy(() => import('./pages/NotFound'));

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
