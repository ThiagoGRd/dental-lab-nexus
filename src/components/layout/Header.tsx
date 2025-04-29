
import { useEffect, useState } from 'react';
import { Menu, Search, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSidebar } from '@/components/ui/sidebar';
import Notifications from '@/components/Notifications';
import { supabase } from '@/integrations/supabase/client';

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

  useEffect(() => {
    // Buscar dados do usuário do localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
      }
    }
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-darkblue-700 bg-darkblue-500 px-4 md:px-6">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => sidebar.toggleSidebar()}
        className="text-gray-300 hover:bg-darkblue-700 hover:text-protechblue-200"
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle Menu</span>
      </Button>
      <div className="hidden md:flex md:flex-1 md:gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Buscar ordens, clientes..." 
            className="w-full max-w-md pl-9 bg-darkblue-700 border-darkblue-600" 
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Notifications />
        {user && (
          <div className="flex items-center gap-2">
            <div className="hidden md:flex md:flex-col md:items-end">
              <div className="text-sm font-medium text-protechblue-100">{user.name}</div>
              <div className="text-xs text-gray-400">{user.role === 'admin' ? 'Administrador' : 'Usuário'}</div>
            </div>
            <div className="h-9 w-9 rounded-full bg-protechblue-700 flex items-center justify-center text-protechblue-100 font-medium">
              {user.name?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
