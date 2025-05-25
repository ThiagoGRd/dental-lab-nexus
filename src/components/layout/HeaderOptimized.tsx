import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Menu, X, Bell, User, Settings, LogOut, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSidebar } from '@/components/ui/sidebar-fixed';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function HeaderOptimized() {
  const { theme, setTheme } = useTheme();
  const { open, setOpen } = useSidebar();
  const navigate = useNavigate();
  const [userData, setUserData] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [hasUnread, setHasUnread] = useState(false);

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

  // Simular carregamento de notificações
  useEffect(() => {
    // Em um sistema real, isso viria de uma API
    const mockNotifications = [
      { id: 1, title: 'Nova ordem de serviço', read: false, time: '5 min atrás' },
      { id: 2, title: 'Lembrete: Prótese para entrega', read: false, time: '1 hora atrás' },
      { id: 3, title: 'Atualização de sistema', read: true, time: '1 dia atrás' },
    ];
    
    setNotifications(mockNotifications);
    setHasUnread(mockNotifications.some(n => !n.read));
  }, []);

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

  // Função para alternar tema
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Função para marcar notificação como lida
  const markAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    
    // Verificar se ainda há notificações não lidas
    const stillHasUnread = notifications.some(n => n.id !== id && !n.read);
    setHasUnread(stillHasUnread);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-background px-4 shadow-sm">
      {/* Botão do menu (visível apenas em dispositivos móveis) */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => setOpen(!open)}
        aria-label={open ? "Fechar menu" : "Abrir menu"}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Logo ou título (visível apenas em dispositivos móveis quando o sidebar está fechado) */}
      <div className="md:hidden">
        {!open && (
          <h1 className="text-xl font-bold text-primary">Dental Lab Nexus</h1>
        )}
      </div>

      {/* Espaço vazio para desktop (quando o sidebar já mostra o logo) */}
      <div className="hidden md:block">
        {/* Espaço reservado para possíveis controles adicionais */}
      </div>

      {/* Ações do usuário */}
      <div className="flex items-center gap-2">
        {/* Botão de tema */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? "Mudar para tema claro" : "Mudar para tema escuro"}
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>

        {/* Notificações */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {hasUnread && (
                <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-destructive"></span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notificações</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.length === 0 ? (
              <div className="py-2 text-center text-muted-foreground">
                Nenhuma notificação
              </div>
            ) : (
              notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className={`flex cursor-pointer flex-col items-start p-3 ${
                    !notification.read ? 'bg-muted/50' : ''
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex w-full justify-between">
                    <span className="font-medium">{notification.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {notification.time}
                    </span>
                  </div>
                  {!notification.read && (
                    <span className="mt-1 text-xs text-blue-500">Não lida</span>
                  )}
                </DropdownMenuItem>
              ))
            )}
            {notifications.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer justify-center text-center text-primary">
                  Ver todas
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Perfil do usuário */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage 
                  src={userData?.avatar || ''} 
                  alt={userData?.name || 'Usuário'} 
                />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {userData?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{userData?.name || 'Usuário'}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {userData?.email || 'usuario@exemplo.com'}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/profile')}>
              <User className="mr-2 h-4 w-4" />
              <span>Perfil</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings')}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Configurações</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
