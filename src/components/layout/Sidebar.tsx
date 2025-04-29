
import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Sidebar as SidebarComponent,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton
} from "@/components/ui/sidebar";
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

export default function Sidebar() {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);
  
  const handleLogout = () => {
    localStorage.removeItem('user');
    toast.success('Sessão encerrada com sucesso');
    navigate('/login');
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
    }
  ];

  return (
    <SidebarComponent className="bg-darkblue-500 border-r border-darkblue-800">
      <div className="p-4">
        <h1 className="text-2xl font-bold text-protechblue-300">
          Protech Lab Nexus
        </h1>
      </div>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-protechblue-100">Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link 
                      to={item.href} 
                      className={`flex items-center gap-3 ${location.pathname === item.href ? 'bg-darkblue-800 text-protechblue-300' : 'text-gray-300 hover:bg-darkblue-700 hover:text-protechblue-200'}`}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <div className="mt-auto p-4">
        {user && (
          <div className="mb-4 rounded-md bg-darkblue-800 p-3">
            <div className="font-medium text-protechblue-100">{user.name}</div>
            <div className="text-xs text-gray-400">{user.email}</div>
          </div>
        )}
        <button 
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-red-400 hover:bg-darkblue-800"
        >
          <LogOut className="h-5 w-5" />
          <span>Sair</span>
        </button>
      </div>
    </SidebarComponent>
  );
}
