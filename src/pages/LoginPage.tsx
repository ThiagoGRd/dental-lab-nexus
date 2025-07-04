
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { 
  checkAuthSession, 
  signInWithEmail, 
  signUpWithEmail 
} from '@/integrations/supabase/client';

export default function LoginPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });

  // Use useEffect com dependências corretas para evitar re-renderizações desnecessárias
  useEffect(() => {
    // Verificar se o usuário já está logado - apenas uma vez ao montar
    const checkSession = async () => {
      try {
        const { session, error } = await checkAuthSession();
        if (error) {
          console.error("Erro ao verificar sessão:", error);
          return;
        }
        
        if (session) {
          navigate('/');
        }
      } catch (error) {
        console.error("Erro ao verificar sessão:", error);
      }
    };
    checkSession();
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Memorize funções complexas para evitar re-criá-las a cada renderização
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        // Processo de registro usando nossa função segura
        const { data, error } = await signUpWithEmail(
          formData.email, 
          formData.password, 
          { name: formData.name }
        );

        if (error) throw error;
        
        if (data?.user && !data.session) {
          toast.info('Enviamos um email de confirmação. Por favor, confirme seu email para continuar.');
        } else if (data?.session) {
          toast.success('Conta criada com sucesso!');
          navigate('/');
        }
      } else {
        // Processo de login usando nossa função segura
        const { data, error } = await signInWithEmail(formData.email, formData.password);

        if (error) throw error;
        
        toast.success('Login realizado com sucesso!');
        navigate('/');
      }
    } catch (error: any) {
      console.error('Erro de autenticação:', error);
      
      // Mensagens de erro mais amigáveis
      const errorMessages: Record<string, string> = {
        'Email not confirmed': 'Email ainda não confirmado. Verifique sua caixa de entrada.',
        'Invalid login credentials': 'Credenciais inválidas. Verifique seu email e senha.',
        'Email already registered': 'Este email já está cadastrado.',
        'Password should be at least 6 characters': 'A senha deve ter pelo menos 6 caracteres.'
      };
      
      const errorMessage = errorMessages[error.message] || error.message || 'Ocorreu um erro durante a autenticação';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Memorize elementos de UI que não mudam frequentemente
  const cardTitle = useMemo(() => (
    <CardTitle className="text-3xl font-bold text-protechblue-300">
      Protech Lab Nexus
    </CardTitle>
  ), []);

  const cardDescription = useMemo(() => (
    <CardDescription className="text-gray-400">
      {isSignUp ? 'Crie sua conta para acessar o sistema' : 'Entre com suas credenciais para acessar o sistema'}
    </CardDescription>
  ), [isSignUp]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-darkblue-500 p-4">
      <Card className="w-full max-w-md bg-darkblue-700 text-white border-darkblue-800">
        <CardHeader className="text-center">
          {cardTitle}
          {cardDescription}
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-300">Nome</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Digite seu nome completo"
                  value={formData.name}
                  onChange={handleChange}
                  required={isSignUp}
                  className="bg-darkblue-800 border-darkblue-600"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Digite seu email"
                value={formData.email}
                onChange={handleChange}
                required
                className="bg-darkblue-800 border-darkblue-600"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">Senha</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Digite sua senha"
                value={formData.password}
                onChange={handleChange}
                required
                className="bg-darkblue-800 border-darkblue-600"
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {isSignUp 
                ? 'Ao criar uma conta, você concorda com os nossos termos de serviço.'
                : 'Se você não conseguir fazer login, tente criar uma nova conta.'}
            </p>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button
              type="submit"
              className="w-full bg-protechblue-600 hover:bg-protechblue-700"
              disabled={isLoading}
            >
              {isLoading
                ? 'Processando...'
                : isSignUp
                ? 'Criar Conta'
                : 'Entrar'}
            </Button>
            <Button
              type="button"
              variant="link"
              className="text-protechblue-300"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp
                ? 'Já tem uma conta? Faça login'
                : 'Não tem uma conta? Cadastre-se'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
