
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Bell, 
  Menu,
  Moon,
  Sun,
  User
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { useSidebar } from '@/components/ui/sidebar-fixed';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNotifications } from '@/context/NotificationContext';

export default function Header() {
  const { setTheme, theme } = useTheme();
  const { notifications } = useNotifications();
  const { toggleSidebar } = useSidebar();
  const location = useLocation();
  
  // Determinar o título da página com base na rota atual
  const getPageTitle = () => {
    const path = location.pathname;
    
    if (path === '/') return 'Dashboard';
    if (path === '/orders') return 'Ordens de Serviço';
    if (path === '/clients') return 'Clientes';
    if (path === '/production') return 'Produção';
    if (path === '/inventory') return 'Estoque';
    if (path === '/finances') return 'Finanças';
    if (path === '/reports') return 'Relatórios';
    if (path === '/services') return 'Serviços';
    if (path === '/settings') return 'Configurações';
    
    return 'Dental Lab Nexus';
  };
  
  const unreadNotifications = notifications.filter(n => !n.read).length;
  
  return (
    <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6">
      <Button 
        variant="ghost" 
        size="icon" 
        className="lg:hidden"
        onClick={toggleSidebar}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle Menu</span>
      </Button>
      
      <div className="flex-1">
        <h1 className="text-lg font-semibold">{getPageTitle()}</h1>
      </div>
      
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unreadNotifications > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
                  {unreadNotifications > 9 ? '9+' : unreadNotifications}
                </span>
              )}
              <span className="sr-only">Notificações</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="flex items-center justify-between border-b px-4 py-2">
              <span className="font-medium">Notificações</span>
              {unreadNotifications > 0 && (
                <Button variant="ghost" size="sm" className="h-auto text-xs">
                  Marcar todas como lidas
                </Button>
              )}
            </div>
            <div className="max-h-[300px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-4 text-center">
                  <Bell className="mb-2 h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Nenhuma notificação no momento
                  </p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <DropdownMenuItem key={notification.id} className="cursor-pointer p-0">
                    <Link
                      to={notification.link || '#'}
                      className={`flex w-full gap-4 p-3 ${
                        !notification.read ? 'bg-muted/50' : ''
                      }`}
                    >
                      <div className={`flex-1 ${!notification.read ? 'font-medium' : ''}`}>
                        <p className="text-sm">{notification.title || notification.content}</p>
                        <p className="text-xs text-muted-foreground">
                          {notification.content}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                ))
              )}
            </div>
            {notifications.length > 0 && (
              <div className="border-t p-2">
                <Button variant="ghost" size="sm" className="w-full justify-center text-xs">
                  Ver todas as notificações
                </Button>
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Alternar tema</span>
        </Button>
      </div>
    </header>
  );
}
