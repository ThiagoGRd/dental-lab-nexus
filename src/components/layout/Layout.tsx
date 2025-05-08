
import React, { useEffect, useState, lazy, Suspense } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import { 
  supabase, 
  checkAuthSession, 
  signOut 
} from '@/integrations/supabase/client';
import { safeProfileOperations } from '@/utils/supabaseHelpers';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';
import { SidebarProvider } from "@/components/ui/sidebar";

const LoadingIndicator = () => (
  <div className="flex h-screen w-full items-center justify-center bg-background">
    <div className="text-xl text-blue-600">Carregando...</div>
  </div>
);

type LayoutProps = {
  children: React.ReactNode;
};

type Profile = Database['public']['Tables']['profiles']['Row'];

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  
  // Check if we're on the login page
  const isLoginPage = location.pathname === '/login';

  useEffect(() => {
    // Skip auth check if we're on the login page
    if (isLoginPage) {
      setLoading(false);
      setInitialized(true);
      return;
    }
    
    const checkAuth = async () => {
      try {
        setLoading(true);
        console.log("Checking authentication status...");
        
        // Get session using our safe function
        const { session, error } = await checkAuthSession();
        
        if (error) {
          console.error("Auth check error:", error);
          throw error;
        }
        
        if (!session) {
          console.log("No session found, redirecting to login");
          navigate('/login');
          return;
        }
        
        console.log("Session found, checking user profile");
        
        // Check user profile with our safe function
        const profileOps = await safeProfileOperations();
        const { profile, error: profileError } = await profileOps.getById(session.user.id);
        
        if (profileError) {
          console.error("Profile check error:", profileError);
          throw profileError;
        }
        
        if (profile && profile.is_active === false) {
          console.log("User account is inactive");
          await signOut();
          toast.error('Sua conta foi desativada. Entre em contato com o administrador.');
          navigate('/login');
          return;
        }
        
        console.log("Authentication successful, storing user data");
        
        // Store minimal user data in localStorage
        localStorage.setItem('user', JSON.stringify({
          id: session.user.id,
          name: session.user.user_metadata.name || session.user.email?.split('@')[0],
          email: session.user.email,
          avatar: session.user.user_metadata.avatar_url,
          role: profile?.role || 'user'
        }));
        
        setInitialized(true);
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        toast.error('Ocorreu um erro ao verificar sua autenticação');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
    
    // Setup auth state listener only if not on login page
    if (!isLoginPage) {
      console.log("Setting up auth state listener");
      const { data: authListener } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log(`Auth state changed: ${event}`);
          if (event === 'SIGNED_OUT') {
            localStorage.removeItem('user');
            navigate('/login');
          } else if (event === 'SIGNED_IN' && session) {
            try {
              // Use our safe function to get profile
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

      // Clean up listener
      return () => {
        console.log("Cleaning up auth listener");
        authListener.subscription.unsubscribe();
      };
    }
  }, [navigate, isLoginPage, location.pathname]);

  if (loading) {
    return <LoadingIndicator />;
  }
  
  if (!initialized) {
    return <LoadingIndicator />;
  }
  
  // Render a simple layout without sidebar for login page
  if (isLoginPage) {
    console.log("Rendering login page layout");
    return (
      <div className="min-h-screen flex w-full bg-background dark:bg-gray-900">
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    );
  }

  // Render the full layout with sidebar for authenticated pages
  console.log("Rendering authenticated page layout with sidebar");
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background dark:bg-gray-900">
        <div className="flex flex-1 w-full">
          <Sidebar />
          <div className="flex flex-1 flex-col overflow-hidden">
            <Header />
            <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4">
              {children}
            </main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
