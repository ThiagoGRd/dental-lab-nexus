import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SidebarProvider } from "@/components/ui/sidebar-fixed";
import Header from './Header-fixed';
import Sidebar from './Sidebar-fixed';
import { toast } from 'sonner';

// Componente de carregamento
const LoadingIndicator = () => (
  <div className="flex h-screen w-full items-center justify-center bg-white dark:bg-gray-900">
    <div className="text-xl text-blue-600 dark:text-blue-400">Carregando...</div>
  </div>
);

type LayoutProps = {
  children: React.ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
