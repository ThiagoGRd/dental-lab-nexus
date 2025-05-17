import { useEffect, useState } from 'react';
import { Menu, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSidebar } from '@/components/ui/sidebar';
import Notifications from '@/components/Notifications';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { supabase } from '@/integrations/supabase/client';
import { useNotifications } from '@/context/NotificationContext';

type User = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
};

export default function Header() {
  const sidebar = useSidebar();
  const [user, setUser] = useState<User | null>(null);
  const { unreadCount, setShowNotifications } = useNotifications();

  useEffect(() => {
    // Buscar dados do usuário do localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);

        // Simular login do usuário - em um app real, isto seria na função de login
        const checkLoginState = () => {
          const lastLoginTime = localStorage.getItem('lastLoginTime');
          const currentTime = new Date().getTime();
          
          // Se não houver registro de login anterior ou tiver passado mais de 1 hora,
          // consideramos um novo login
          if (!lastLoginTime || (currentTime - parseInt(lastLoginTime)) > 60 * 60 * 1000) {
            console.log('Novo login detectado, salvando timestamp');
            localStorage.setItem('lastLoginTime', currentTime.toString());
            
            // Aqui não precisamos abrir manualmente as notificações,
            // isso será feito no contexto de notificações
          }
        };

        checkLoginState();
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
      }
    }
  }, [setShowNotifications]);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background border-border px-4 md:px-6 shadow-sm transition-colors duration-300">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => sidebar.toggleSidebar()}
        className="text-muted-foreground hover:bg-accent"
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle Menu</span>
      </Button>
      <div className="hidden md:flex md:flex-1 md:gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Buscar ordens, clientes..." 
            className="w-full max-w-md pl-9 bg-muted/50 border-input dark:bg-gray-800 dark:border-gray-700" 
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <Notifications />
        {user && (
          <div className="flex items-center gap-2">
            <div className="hidden md:flex md:flex-col md:items-end">
              <div className="text-sm font-medium">{user.name}</div>
              <div className="text-xs text-muted-foreground">{user.role === 'admin' ? 'Administrador' : 'Usuário'}</div>
            </div>
            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-primary font-medium dark:bg-gray-700">
              {user.name?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
