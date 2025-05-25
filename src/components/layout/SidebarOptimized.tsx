import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/components/ui/sidebar-fixed';
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  Factory,
  Package,
  DollarSign,
  BarChart3,
  Settings,
  Menu,
  X,
  Workflow,
  Cog,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Tipo para itens de navegação
type NavItem = {
  title: string;
  href: string;
  icon: React.ReactNode;
  requiredRole?: string;
};

export default function SidebarOptimized() {
  const { open, setOpen } = useSidebar();
  const navigate = useNavigate();
  const location = useLocation();
  const [userData, setUserData] = useState<any>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Carregar dados do usuário do localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUserData(JSON.parse(storedUser));
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
      }
    }
  }, []);

  // Detectar dispositivo móvel
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      
      // Em dispositivos móveis, o sidebar começa fechado
      if (window.innerWidth < 768) {
        setOpen(false);
      }
    };
    
    // Verificar inicialmente
    checkMobile();
    
    // Adicionar listener para redimensionamento
    window.addEventListener('resize', checkMobile);
    
    // Limpar listener
    return () => window.removeEventListener('resize', checkMobile);
  }, [setOpen]);

  // Fechar sidebar após navegação em dispositivos móveis
  useEffect(() => {
    if (isMobile) {
      setOpen(false);
    }
  }, [location.pathname, isMobile, setOpen]);

  // Função para logout
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('user');
      toast.success('Logout realizado com sucesso');
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      toast.error('Erro ao fazer logout');
    }
  };

  // Itens de navegação
  const navItems: NavItem[] = [
    {
      title: 'Dashboard',
      href: '/',
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      title: 'Ordens de Serviço',
      href: '/orders',
      icon: <ClipboardList className="h-5 w-5" />,
    },
    {
      title: 'Clientes',
      href: '/clients',
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: 'Produção',
      href: '/production',
      icon: <Factory className="h-5 w-5" />,
    },
    {
      title: 'Fluxo de Trabalho',
      href: '/workflows',
      icon: <Workflow className="h-5 w-5" />,
    },
    {
      title: 'Estoque',
      href: '/inventory',
      icon: <Package className="h-5 w-5" />,
    },
    {
      title: 'Finanças',
      href: '/finances',
      icon: <DollarSign className="h-5 w-5" />,
    },
    {
      title: 'Relatórios',
      href: '/reports',
      icon: <BarChart3 className="h-5 w-5" />,
    },
    {
      title: 'Configurações',
      href: '/settings',
      icon: <Settings className="h-5 w-5" />,
      requiredRole: 'admin',
    },
  ];

  // Filtrar itens de navegação com base na função do usuário
  const filteredNavItems = navItems.filter(
    (item) => !item.requiredRole || userData?.role === item.requiredRole
  );

  // Verificar se um item está ativo
  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  // Renderizar o sidebar
  return (
    <>
      {/* Overlay para dispositivos móveis */}
      {isMobile && open && (
        <div
          className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "group/sidebar fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r bg-background transition-transform duration-300 ease-in-out",
          isMobile ? (open ? "translate-x-0" : "-translate-x-full") : "translate-x-0",
          !open && !isMobile && "w-16"
        )}
        data-sidebar="root"
      >
        {/* Cabeçalho do sidebar */}
        <div className="flex h-16 items-center justify-between border-b px-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            {/* Ícone do logo */}
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d="M12 5c.67 0 1.35.09 2 .26V3a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v2.26c.65-.17 1.33-.26 2-.26Z" />
                <path d="M19 12c.34 0 .67.09 1 .18V5a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v.18A7.08 7.08 0 0 1 19 12Z" />
                <path d="M5 12c0-2.35 1.15-4.42 2.93-5.7.62-.45 1.33-.8 2.07-1.04V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1v9.18c-.33-.09-.66-.18-1-.18Z" />
                <path d="M12 22c4.97 0 9-4.03 9-9s-4.03-9-9-9-9 4.03-9 9 4.03 9 9 9Z" />
                <path d="M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
              </svg>
            </div>

            {/* Texto do logo (visível apenas quando o sidebar está aberto) */}
            {(open || isMobile) && (
              <span className="text-lg font-bold text-foreground">
                Dental Lab Nexus
              </span>
            )}
          </div>

          {/* Botão para alternar o sidebar (visível apenas em desktop) */}
          {!isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(!open)}
              aria-label={open ? "Recolher menu" : "Expandir menu"}
            >
              {open ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          )}

          {/* Botão para fechar o sidebar (visível apenas em mobile) */}
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(false)}
              aria-label="Fechar menu"
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Conteúdo do sidebar com scroll */}
        <ScrollArea className="flex-1 py-2">
          <nav className="flex flex-col gap-1 px-2">
            {filteredNavItems.map((item) => (
              <Button
                key={item.href}
                variant="ghost"
                className={cn(
                  "flex h-10 justify-start gap-2 px-3",
                  isActive(item.href) && "bg-muted font-medium",
                  !open && !isMobile && "h-10 justify-center px-0"
                )}
                onClick={() => navigate(item.href)}
                data-active={isActive(item.href)}
              >
                {item.icon}
                {(open || isMobile) && <span>{item.title}</span>}
              </Button>
            ))}
          </nav>
        </ScrollArea>

        {/* Rodapé do sidebar */}
        <div className="mt-auto border-t p-2">
          {/* Informações do usuário */}
          {(open || isMobile) && (
            <div className="mb-2 px-2 py-1">
              <p className="truncate text-sm font-medium">
                {userData?.name || 'Usuário'}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {userData?.email || 'usuario@exemplo.com'}
              </p>
            </div>
          )}

          {/* Ações do rodapé */}
          <div className="flex flex-col gap-1">
            <Separator className="my-1" />
            <Button
              variant="ghost"
              className={cn(
                "flex h-10 justify-start gap-2 px-3",
                !open && !isMobile && "h-10 justify-center px-0"
              )}
              onClick={() => navigate('/settings')}
            >
              <Cog className="h-5 w-5" />
              {(open || isMobile) && <span>Configurações</span>}
            </Button>
            <Button
              variant="ghost"
              className={cn(
                "flex h-10 justify-start gap-2 px-3",
                !open && !isMobile && "h-10 justify-center px-0"
              )}
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
              {(open || isMobile) && <span>Sair</span>}
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
