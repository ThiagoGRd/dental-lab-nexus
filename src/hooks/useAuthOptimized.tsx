
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Tipos para autenticação
type User = {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user' | 'technician'; // Usando apenas roles válidos
  avatar?: string;
};

type AuthState = {
  user: User | null;
  session: any | null;
  isLoading: boolean;
  isAuthenticated: boolean;
};

/**
 * Hook para gerenciamento de autenticação e autorização
 */
export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    isAuthenticated: false,
  });
  
  const initAuth = useCallback(async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        throw error;
      }
      
      if (session) {
        // Buscar dados do usuário da tabela profiles (que existe)
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (userError) {
          console.warn('Erro ao buscar dados do usuário:', userError);
        }
        
        // Criar objeto de usuário com dados completos
        const user: User = {
          id: session.user.id,
          email: session.user.email || '',
          name: userData?.name || session.user.user_metadata?.name || 'Usuário',
          role: (userData?.role === 'admin') ? 'admin' : 'user', // Garantir tipo correto
          avatar: userData?.avatar || session.user.user_metadata?.avatar_url,
        };
        
        localStorage.setItem('user', JSON.stringify(user));
        
        setAuthState({
          user,
          session,
          isLoading: false,
          isAuthenticated: true,
        });
      } else {
        const storedUser = localStorage.getItem('user');
        
        if (storedUser) {
          try {
            const user = JSON.parse(storedUser);
            
            setAuthState({
              user,
              session: null,
              isLoading: false,
              isAuthenticated: true,
            });
            
            toast.info('Você está trabalhando em modo offline');
          } catch (e) {
            localStorage.removeItem('user');
            
            setAuthState({
              user: null,
              session: null,
              isLoading: false,
              isAuthenticated: false,
            });
          }
        } else {
          setAuthState({
            user: null,
            session: null,
            isLoading: false,
            isAuthenticated: false,
          });
        }
      }
    } catch (error: any) {
      console.error('Erro ao inicializar autenticação:', error);
      localStorage.removeItem('user');
      
      setAuthState({
        user: null,
        session: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  }, []);
  
  useEffect(() => {
    initAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session) {
            const { data: userData, error: userError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
            
            if (userError) {
              console.warn('Erro ao buscar dados do usuário:', userError);
            }
            
            const user: User = {
              id: session.user.id,
              email: session.user.email || '',
              name: userData?.name || session.user.user_metadata?.name || 'Usuário',
              role: (userData?.role === 'admin') ? 'admin' : 'user', // Garantir tipo correto
              avatar: userData?.avatar || session.user.user_metadata?.avatar_url,
            };
            
            localStorage.setItem('user', JSON.stringify(user));
            
            setAuthState({
              user,
              session,
              isLoading: false,
              isAuthenticated: true,
            });
          }
        } else if (event === 'SIGNED_OUT') {
          localStorage.removeItem('user');
          
          setAuthState({
            user: null,
            session: null,
            isLoading: false,
            isAuthenticated: false,
          });
        }
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, [initAuth]);
  
  const login = useCallback(async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        throw error;
      }
      
      toast.success('Login realizado com sucesso');
      return { success: true };
    } catch (error: any) {
      console.error('Erro ao fazer login:', error);
      
      setAuthState(prev => ({ ...prev, isLoading: false }));
      
      if (error.message.includes('Invalid login credentials')) {
        toast.error('Email ou senha incorretos');
      } else if (error.message.includes('Email not confirmed')) {
        toast.error('Email não confirmado. Verifique sua caixa de entrada');
      } else {
        toast.error('Erro ao fazer login. Tente novamente mais tarde');
      }
      
      return { success: false, error };
    }
  }, []);
  
  const logout = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      localStorage.removeItem('user');
      
      setAuthState({
        user: null,
        session: null,
        isLoading: false,
        isAuthenticated: false,
      });
      
      toast.success('Logout realizado com sucesso');
      return { success: true };
    } catch (error: any) {
      console.error('Erro ao fazer logout:', error);
      
      setAuthState(prev => ({ ...prev, isLoading: false }));
      
      toast.error('Erro ao fazer logout. Tente novamente mais tarde');
      return { success: false, error };
    }
  }, []);
  
  const hasPermission = useCallback((requiredRole: 'admin' | 'user' | 'technician' | string[]) => {
    const { user } = authState;
    
    if (!user) {
      return false;
    }
    
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(user.role);
    }
    
    if (user.role === 'admin') {
      return true;
    }
    
    return user.role === requiredRole;
  }, [authState]);
  
  const updateProfile = useCallback(async (userData: Partial<User>) => {
    try {
      const { user } = authState;
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }
      
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      const { error } = await supabase
        .from('profiles')
        .update({
          name: userData.name,
          avatar: userData.avatar,
        })
        .eq('id', user.id);
      
      if (error) {
        throw error;
      }
      
      const updatedUser = {
        ...user,
        ...userData,
      };
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setAuthState(prev => ({
        ...prev,
        user: updatedUser,
        isLoading: false,
      }));
      
      toast.success('Perfil atualizado com sucesso');
      return { success: true };
    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error);
      
      setAuthState(prev => ({ ...prev, isLoading: false }));
      
      toast.error('Erro ao atualizar perfil. Tente novamente mais tarde');
      return { success: false, error };
    }
  }, [authState]);
  
  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    try {
      const { user, session } = authState;
      
      if (!user || !session) {
        throw new Error('Usuário não autenticado');
      }
      
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });
      
      if (verifyError) {
        throw new Error('Senha atual incorreta');
      }
      
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      
      if (error) {
        throw error;
      }
      
      setAuthState(prev => ({ ...prev, isLoading: false }));
      
      toast.success('Senha alterada com sucesso');
      return { success: true };
    } catch (error: any) {
      console.error('Erro ao alterar senha:', error);
      
      setAuthState(prev => ({ ...prev, isLoading: false }));
      
      if (error.message.includes('Senha atual incorreta')) {
        toast.error('Senha atual incorreta');
      } else if (error.message.includes('Password should be at least')) {
        toast.error('A nova senha deve ter pelo menos 6 caracteres');
      } else {
        toast.error('Erro ao alterar senha. Tente novamente mais tarde');
      }
      
      return { success: false, error };
    }
  }, [authState]);
  
  const resetPassword = useCallback(async (email: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        throw error;
      }
      
      setAuthState(prev => ({ ...prev, isLoading: false }));
      
      toast.success('Email de redefinição de senha enviado');
      return { success: true };
    } catch (error: any) {
      console.error('Erro ao solicitar redefinição de senha:', error);
      
      setAuthState(prev => ({ ...prev, isLoading: false }));
      
      toast.error('Erro ao solicitar redefinição de senha. Tente novamente mais tarde');
      return { success: false, error };
    }
  }, []);
  
  const isAuthenticated = useCallback(() => {
    return authState.isAuthenticated;
  }, [authState.isAuthenticated]);
  
  const isAdmin = useCallback(() => {
    return authState.user?.role === 'admin';
  }, [authState.user?.role]);
  
  return {
    user: authState.user,
    session: authState.session,
    isLoading: authState.isLoading,
    isAuthenticated: authState.isAuthenticated,
    login,
    logout,
    hasPermission,
    updateProfile,
    changePassword,
    resetPassword,
    isAdmin,
  };
}
