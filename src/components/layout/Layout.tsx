
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SidebarProvider } from "@/components/ui/sidebar";
import Header from './Header';
import Sidebar from './Sidebar';

type LayoutProps = {
  children: React.ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();

  useEffect(() => {
    // Verifica se o usuário está autenticado
    const user = localStorage.getItem('user');
    if (!user) {
      navigate('/login');
    }
  }, [navigate]);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto bg-darkblue-500">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
