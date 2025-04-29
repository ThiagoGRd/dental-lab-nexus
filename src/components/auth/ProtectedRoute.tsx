
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { toast } from 'sonner';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  
  useEffect(() => {
    const user = localStorage.getItem('user');
    setIsAuthenticated(!!user);
    
    if (!user) {
      toast.error('Você precisa estar logado para acessar esta página');
    }
  }, []);

  if (isAuthenticated === null) {
    // Ainda carregando
    return <div className="flex h-screen items-center justify-center">Carregando...</div>;
  }
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}
