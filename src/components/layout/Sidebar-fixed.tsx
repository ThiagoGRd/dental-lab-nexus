import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Sidebar as SidebarComponent,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger
} from "@/components/ui/sidebar-fixed";
import { 
  Home,
  Calendar,
  Users,
  FileText,
  Database,
  Settings,
  LogOut,
  BarChart2,
  Wallet,
  Package
} from "lucide-react";
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

type User = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
};

export default function Sidebar() {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);
  
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('user');
      toast.success('Sessão encerrada com sucesso');
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      toast.error('Erro ao encerrar sessão');
    }
  };

  const menuItems = [
    {
      title: "Dashboard",
      icon: Home,
      href: "/",
    },
    {
      title: "Ordens de Serviço",
      icon: FileText,
      href: "/orders",
    },
    {
      title: "Clientes",
      icon: Users,
      href: "/clients",
    },
    {
      title: "Produção",
      icon: Calendar,
      href: "/production",
    },
    {
      title: "Estoque",
      icon: Database,
      href: "/inventory",
    },
    {
      title: "Serviços",
      icon: Package,
      href: "/services",
    },
    {
      title: "Finanças",
      icon: Wallet,
      href: "/finances",
    },
    {
      title: "Relatórios",
      icon: BarChart2,
      href: "/reports",
    },
    {
      title: "Configurações",
      icon: Settings,
      href: "/settings",
      adminOnly: true,
    }
  ];

  // Filtrar itens do menu com base no papel do usuário
  const filteredMenuItems = user?.role === 'admin'
    ? menuItems
    : menuItems.filter(item => !item.adminOnly);

  return (
    <SidebarComponent className="bg-sidebar border-r border-sidebar-border">
      <div className="p-4 border-b border-sidebar-border flex items-center justify-between">
        <h1 className="text-xl font-semibold text-sidebar-primary">
          Protech Lab Nexus
        </h1>
        <SidebarTrigger className="md:hidden" />
      </div>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/60 text-xs">Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    isActive={location.pathname === item.href}
                  >
                    <Link 
                      to={item.href} 
                      className="flex items-center gap-3"
                    >
                      <item.icon className="h-4 w-4" />
                      <span className="text-sm">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <div className="mt-auto p-4 border-t border-sidebar-border">
        {user && (
          <div className="mb-4 rounded p-3 bg-sidebar-accent/50">
            <div className="font-medium text-sidebar-foreground text-sm">{user.name}</div>
            <div className="text-xs text-sidebar-foreground/70">{user.email}</div>
          </div>
        )}
        <button 
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          <LogOut className="h-4 w-4" />
          <span>Sair</span>
        </button>
      </div>
    </SidebarComponent>
  );
}

// Adicionar o import que estava faltando
import { useState } from 'react';
