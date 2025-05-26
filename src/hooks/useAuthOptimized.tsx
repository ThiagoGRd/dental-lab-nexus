
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Tipos para autenticação
type User = {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'technician' | 'receptionist';
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
 * 
 * Este hook fornece funcionalidades para:
 * - Login e logout de usuários
 * - Verificação de sessão atual
 * - Controle de permissões baseado em papéis
 * - Persistência de sessão
 * 
 * @returns Objeto com funções e estados para gerenciar autenticação
 */
export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    isAuthenticated: false,
  });
  
  /**
   * Inicializa o estado de autenticação com base na sessão atual
   */
  const initAuth = useCallback(async () => {
    try {
      // Verificar se há uma sessão ativa
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        throw error;
      }
      
      if (session) {
        // Buscar dados adicionais do usuário da tabela profiles
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (userError) {
          throw userError;
        }
        
        // Criar objeto de usuário com dados completos
        const user: User = {
          id: session.user.id,
          email: session.user.email || '',
          name: userData?.name || 'Usuário',
          role: userData?.role || 'technician',
          avatar: userData?.avatar,
        };
        
        // Salvar dados do usuário no localStorage para acesso offline
        localStorage.setItem('user', JSON.stringify(user));
        
        setAuthState({
          user,
          session,
          isLoading: false,
          isAuthenticated: true,
        });
      } else {
        // Tentar recuperar dados do usuário do localStorage (para modo offline)
        const storedUser = localStorage.getItem('user');
        
        if (storedUser) {
          try {
            const user = JSON.parse(storedUser);
            
            setAuthState({
              user,
              session: null,
              isLoading: false,
              isAuthenticated: true, // Consideramos autenticado mesmo offline
            });
            
            // Notificar usuário que está em modo offline
            toast.info('Você está trabalhando em modo offline');
          } catch (e) {
            // Se não conseguir parsear, limpar localStorage
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
      
      // Limpar dados de autenticação em caso de erro
      localStorage.removeItem('user');
      
      setAuthState({
        user: null,
        session: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  }, []);
  
  /**
   * Configura listener para mudanças de autenticação
   */
  useEffect(() => {
    // Inicializar autenticação
    initAuth();
    
    // Configurar listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          // Atualizar estado com nova sessão
          if (session) {
            // Buscar dados adicionais do usuário
            const { data: userData, error: userError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
            
            if (userError) {
              console.error('Erro ao buscar dados do usuário:', userError);
              return;
            }
            
            // Criar objeto de usuário com dados completos
            const user: User = {
              id: session.user.id,
              email: session.user.email || '',
              name: userData?.name || 'Usuário',
              role: userData?.role || 'technician',
              avatar: userData?.avatar,
            };
            
            // Salvar dados do usuário no localStorage para acesso offline
            localStorage.setItem('user', JSON.stringify(user));
            
            setAuthState({
              user,
              session,
              isLoading: false,
              isAuthenticated: true,
            });
          }
        } else if (event === 'SIGNED_OUT') {
          // Limpar dados de autenticação
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
    
    // Limpar subscription ao desmontar
    return () => {
      subscription.unsubscribe();
    };
  }, [initAuth]);
  
  /**
   * Realiza login com email e senha
   */
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
      
      // O estado será atualizado pelo listener de autenticação
      
      toast.success('Login realizado com sucesso');
      return { success: true };
    } catch (error: any) {
      console.error('Erro ao fazer login:', error);
      
      setAuthState(prev => ({ ...prev, isLoading: false }));
      
      // Mensagens de erro mais amigáveis
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
  
  /**
   * Realiza logout
   */
  const logout = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      // Limpar dados de autenticação
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
  
  /**
   * Verifica se o usuário tem uma determinada permissão
   */
  const hasPermission = useCallback((requiredRole: 'admin' | 'technician' | 'receptionist' | string[]) => {
    const { user } = authState;
    
    if (!user) {
      return false;
    }
    
    // Se requiredRole for um array, verificar se o usuário tem alguma das funções
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(user.role);
    }
    
    // Administradores têm acesso a tudo
    if (user.role === 'admin') {
      return true;
    }
    
    // Verificar função específica
    return user.role === requiredRole;
  }, [authState]);
  
  /**
   * Atualiza dados do perfil do usuário
   */
  const updateProfile = useCallback(async (userData: Partial<User>) => {
    try {
      const { user } = authState;
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }
      
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      // Atualizar dados na tabela de usuários
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
      
      // Atualizar estado local
      const updatedUser = {
        ...user,
        ...userData,
      };
      
      // Atualizar localStorage
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
  
  /**
   * Altera a senha do usuário
   */
  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    try {
      const { user, session } = authState;
      
      if (!user || !session) {
        throw new Error('Usuário não autenticado');
      }
      
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      // Verificar senha atual
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });
      
      if (verifyError) {
        throw new Error('Senha atual incorreta');
      }
      
      // Alterar senha
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
      
      // Mensagens de erro mais amigáveis
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
  
  /**
   * Solicita redefinição de senha
   */
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
  
  /**
   * Verifica se o usuário está autenticado
   */
  const isAuthenticated = useCallback(() => {
    return authState.isAuthenticated;
  }, [authState.isAuthenticated]);
  
  /**
   * Verifica se o usuário é administrador
   */
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
