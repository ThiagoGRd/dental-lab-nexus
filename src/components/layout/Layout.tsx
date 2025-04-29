
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SidebarProvider } from "@/components/ui/sidebar";
import Header from './Header';
import Sidebar from './Sidebar';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type LayoutProps = {
  children: React.ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        
        // Verificar se o usuário está autenticado
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        if (!session) {
          // Usuário não autenticado, redirecionar para login
          navigate('/login');
          return;
        }
        
        // Verificar se o usuário está ativo verificando o perfil
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('is_active, role')
          .eq('id', session.user.id)
          .single();
        
        if (profileError) {
          throw profileError;
        }
        
        // Se o usuário não estiver ativo, fazer logout e redirecionar
        if (profile && profile.is_active === false) {
          await supabase.auth.signOut();
          toast.error('Sua conta foi desativada. Entre em contato com o administrador.');
          navigate('/login');
          return;
        }
        
        // Salvar dados do usuário no localStorage
        localStorage.setItem('user', JSON.stringify({
          id: session.user.id,
          name: session.user.user_metadata.name || session.user.email?.split('@')[0],
          email: session.user.email,
          avatar: session.user.user_metadata.avatar_url,
          role: profile?.role || 'user'
        }));
        
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        toast.error('Ocorreu um erro ao verificar sua autenticação');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
    
    // Configurar listener para mudanças no estado de autenticação
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          localStorage.removeItem('user');
          navigate('/login');
        } else if (event === 'SIGNED_IN' && session) {
          // Atualizar dados do usuário no localStorage
          const { data: profile } = await supabase
            .from('profiles')
            .select('is_active, role')
            .eq('id', session.user.id)
            .single();
            
          localStorage.setItem('user', JSON.stringify({
            id: session.user.id,
            name: session.user.user_metadata.name || session.user.email?.split('@')[0],
            email: session.user.email,
            avatar: session.user.user_metadata.avatar_url,
            role: profile?.role || 'user'
          }));
        }
      }
    );

    // Limpar listener ao desmontar
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-darkblue-500">
        <div className="text-xl text-protechblue-100">Carregando...</div>
      </div>
    );
  }

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
