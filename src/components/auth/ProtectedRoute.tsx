
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { checkAuthSession } from '@/integrations/supabase/client';
import { safeProfileOperations } from '@/utils/supabaseHelpers';
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
        // Verificar a sessão atual usando a função segura
        const { session, error } = await checkAuthSession();
        
        if (error) throw error;
        
        if (!session) {
          setIsAuthenticated(false);
          toast({
            title: "Erro",
            description: 'Você precisa estar logado para acessar esta página',
            variant: "destructive"
          });
          return;
        }
        
        setIsAuthenticated(true);
        
        // Se não há requisito de papel, não precisamos verificar
        if (!requiredRole) {
          setHasRequiredRole(true);
          return;
        }
        
        // Verificar se o usuário tem o papel necessário usando nossas funções seguras
        const profileOps = await safeProfileOperations();
        const { profile, error: profileError } = await profileOps.getById(session.user.id);
        
        if (profileError) {
          throw profileError;
        }
        
        if (!profile || profile.role !== requiredRole) {
          setHasRequiredRole(false);
          toast({
            title: "Erro",
            description: 'Você não tem permissão para acessar esta página',
            variant: "destructive"
          });
          return;
        }
        
        setHasRequiredRole(true);
        
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        setIsAuthenticated(false);
        setHasRequiredRole(false);
        toast({
          title: "Erro",
          description: 'Erro ao verificar autenticação',
          variant: "destructive"
        });
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
