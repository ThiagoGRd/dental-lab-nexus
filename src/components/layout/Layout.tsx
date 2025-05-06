
import React, { useEffect, useState, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { SidebarProvider } from "@/components/ui/sidebar";
import Header from './Header';
import Sidebar from './Sidebar';
import { 
  supabase, 
  checkAuthSession, 
  getUserProfile, 
  signOut 
} from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

// Use lazy loading for child components when appropriate
const LoadingIndicator = () => (
  <div className="flex h-screen w-full items-center justify-center bg-white">
    <div className="text-xl text-blue-600">Carregando...</div>
  </div>
);

type LayoutProps = {
  children: React.ReactNode;
};

type Profile = Database['public']['Tables']['profiles']['Row'];

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        
        // Get session using our safe function
        const { session, error } = await checkAuthSession();
        
        if (error) {
          throw error;
        }
        
        if (!session) {
          navigate('/login');
          return;
        }
        
        // Check user profile with our safe function
        const { profile, error: profileError } = await getUserProfile(session.user.id);
        
        if (profileError) {
          throw profileError;
        }
        
        if (profile && profile.is_active === false) {
          await signOut();
          toast.error('Sua conta foi desativada. Entre em contato com o administrador.');
          navigate('/login');
          return;
        }
        
        // Store minimal user data in localStorage
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
    
    // Setup auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          localStorage.removeItem('user');
          navigate('/login');
        } else if (event === 'SIGNED_IN' && session) {
          // Use our safe function to get profile
          const { profile } = await getUserProfile(session.user.id);
            
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

    // Clean up listener
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  if (loading) {
    return <LoadingIndicator />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto bg-gray-50">
            <Suspense fallback={<LoadingIndicator />}>
              {children}
            </Suspense>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
