
import React from 'react';
import { Link } from 'react-router-dom';
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
  LogOut
} from "lucide-react";

export default function Sidebar() {
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
      title: "Configurações",
      icon: Settings,
      href: "/settings",
    }
  ];

  return (
    <SidebarComponent>
      <div className="p-4">
        <h1 className="text-2xl font-bold text-dentalblue-700">
          DentalLab Nexus
        </h1>
      </div>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.href} className="flex items-center gap-3">
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
        <button className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
          <LogOut className="h-5 w-5" />
          <span>Sair</span>
        </button>
      </div>
    </SidebarComponent>
  );
}
