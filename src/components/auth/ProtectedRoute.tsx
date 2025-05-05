
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase, hasError, safeData, filterByField } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'user';
}

type Profile = Database['public']['Tables']['profiles']['Row'];

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [hasRequiredRole, setHasRequiredRole] = useState<boolean | null>(null);
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Verificar a sessão atual
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (!session) {
          setIsAuthenticated(false);
          toast.error('Você precisa estar logado para acessar esta página');
          return;
        }
        
        setIsAuthenticated(true);
        
        // Se não há requisito de papel, não precisamos verificar
        if (!requiredRole) {
          setHasRequiredRole(true);
          return;
        }
        
        // Verificar se o usuário tem o papel necessário
        const profileResponse = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        
        if (hasError(profileResponse)) {
          throw profileResponse.error;
        }
        
        const profileData = safeData<{ role: string } | null>(profileResponse, null);
        
        if (!profileData || profileData.role !== requiredRole) {
          setHasRequiredRole(false);
          toast.error('Você não tem permissão para acessar esta página');
          return;
        }
        
        setHasRequiredRole(true);
        
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        setIsAuthenticated(false);
        setHasRequiredRole(false);
        toast.error('Erro ao verificar autenticação');
      }
    };
    
    checkAuth();
  }, [requiredRole]);

  if (isAuthenticated === null || (requiredRole && hasRequiredRole === null)) {
    // Ainda carregando
    return <div className="flex h-screen items-center justify-center bg-darkblue-500">
      <div className="text-xl text-protechblue-100">Carregando...</div>
    </div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (requiredRole && !hasRequiredRole) {
    return <Navigate to="/" />;
  }
  
  return <>{children}</>;
}
