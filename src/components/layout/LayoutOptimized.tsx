
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderOptimized from './HeaderOptimized';
import SidebarOptimized from './SidebarOptimized';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { safeProfileOperations } from '@/utils/supabaseHelpers';

// Componente de carregamento otimizado
const LoadingIndicator = () => (
  <div className="flex h-screen w-full items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-4">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      <div className="text-lg font-medium text-primary">Carregando...</div>
    </div>
  </div>
);

type LayoutProps = {
  children: React.ReactNode;
};

export default function LayoutOptimized({ children }: LayoutProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }
        
        if (!session) {
          navigate('/login');
          return;
        }
        
        try {
          const profileOps = await safeProfileOperations();
          const { profile, error: profileError } = await profileOps.getById(session.user.id);
          
          if (profileError) {
            throw profileError;
          }
          
          if (profile && profile.is_active === false) {
            await supabase.auth.signOut();
            toast.error('Sua conta foi desativada. Entre em contato com o administrador.');
            navigate('/login');
            return;
          }
          
          localStorage.setItem('user', JSON.stringify({
            id: session.user.id,
            name: session.user.user_metadata.name || session.user.email?.split('@')[0],
            email: session.user.email,
            avatar: session.user.user_metadata.avatar_url,
            role: profile?.role || 'user'
          }));
        } catch (error) {
          console.error('Erro ao verificar perfil:', error);
          toast.error('Ocorreu um erro ao verificar seu perfil');
          navigate('/login');
          return;
        }
        
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        setError('Ocorreu um erro ao verificar sua autenticação');
        toast.error('Ocorreu um erro ao verificar sua autenticação');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
    
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          localStorage.removeItem('user');
          navigate('/login');
        } else if (event === 'SIGNED_IN' && session) {
          try {
            const profileOps = await safeProfileOperations();
            const { profile } = await profileOps.getById(session.user.id);
              
            localStorage.setItem('user', JSON.stringify({
              id: session.user.id,
              name: session.user.user_metadata.name || session.user.email?.split('@')[0],
              email: session.user.email,
              avatar: session.user.user_metadata.avatar_url,
              role: profile?.role || 'user'
            }));
          } catch (error) {
            console.error('Erro ao obter perfil do usuário após login:', error);
          }
        }
      }
    );
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (loading) {
    return <LoadingIndicator />;
  }

  if (error) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background p-4 text-center">
        <div className="rounded-lg bg-destructive/10 p-6 text-destructive">
          <h2 className="mb-4 text-xl font-semibold">Erro de Autenticação</h2>
          <p className="mb-6">{error}</p>
          <button 
            onClick={() => navigate('/login')}
            className="rounded bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
          >
            Voltar para Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex w-full bg-background">
      <SidebarOptimized isOpen={sidebarOpen} onToggle={handleToggleSidebar} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <HeaderOptimized onToggleSidebar={handleToggleSidebar} />
        <main className="flex-1 overflow-y-auto bg-muted/30 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
