import React, { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { toast } from 'sonner';
import { User, Edit, Check, UserMinus, UserPlus } from 'lucide-react';
import { supabase, profileOperations } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isNewUserDialogOpen, setIsNewUserDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'user',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    
    try {
      // Buscar apenas os perfis com informações de usuários
      const profileUtils = await profileOperations();
      const { profiles, error } = await profileUtils.getAll();
      
      if (error) throw error;
      
      // Para cada perfil, buscar o e-mail do usuário correspondente (precisamos usar a sessão atual)
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('Você precisa estar autenticado para visualizar os usuários');
        setLoading(false);
        return;
      }
      
      // Verificar se o usuário atual é um admin
      const { profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();
      
      if (!profile || profile.role !== 'admin') {
        toast.error('Você não tem permissão para gerenciar usuários');
        setLoading(false);
        return;
      }
      
      // Formar uma lista de usuários com os dados dos perfis
      // Nota: Apenas o usuário atual terá o email disponível por limitações de segurança do Supabase
      const combinedUsers = profiles?.map(profile => {
        const isCurrentUser = profile.id === session.user.id;
        
        return {
          id: profile.id,
          email: isCurrentUser ? session.user.email : 'email@protegido.com',
          name: profile.name || 'Usuário',
          role: profile.role || 'user',
          is_active: profile.is_active !== null ? profile.is_active : true,
          created_at: profile.created_at
        };
      }) || [];
      
      setUsers(combinedUsers);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      toast.error('Não foi possível carregar a lista de usuários');
    } finally {
      setLoading(false);
    }
  }

  const handleEditUser = (user: UserProfile) => {
    setCurrentUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      password: '',
      confirmPassword: ''
    });
    setIsEditDialogOpen(true);
  };

  const handleAddNewUser = () => {
    setFormData({
      name: '',
      email: '',
      role: 'user',
      password: '',
      confirmPassword: ''
    });
    setIsNewUserDialogOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (value: string) => {
    setFormData(prev => ({ ...prev, role: value }));
  };

  const saveUserChanges = async () => {
    if (!currentUser) return;

    try {
      // Atualizar informações do perfil
      const profileUtils = await profileOperations();
      const { error: profileError } = await profileUtils.update(currentUser.id, { 
        name: formData.name,
        role: formData.role as 'admin' | 'user'
      });

      if (profileError) throw profileError;

      toast.success('Usuário atualizado com sucesso!');
      setIsEditDialogOpen(false);
      fetchUsers();
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      toast.error('Não foi possível atualizar o usuário');
    }
  };

  const createNewUser = async () => {
    if (formData.password !== formData.confirmPassword) {
      toast.error('As senhas não correspondem');
      return;
    }

    try {
      // Usar o método de registro padrão
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name
          }
        }
      });

      if (error) throw error;

      toast.success(`Usuário criado com sucesso! ${data?.user ? '' : 'Um email de confirmação foi enviado.'}`);
      
      // Se o usuário foi criado com sucesso e o perfil for diferente de 'user',
      // atualizamos o perfil para definir o papel correto
      if (data?.user && formData.role !== 'user') {
        // Nota: Pode ser necessário esperar um pouco para que o trigger crie o perfil
        setTimeout(async () => {
          const profileUtils = await profileOperations();
          const { error: updateError } = await profileUtils.update(data.user!.id, { 
            role: formData.role as 'admin' | 'user'
          });
  
          if (updateError) {
            console.error('Erro ao atualizar o perfil do usuário:', updateError);
            toast.error('Usuário criado, mas não foi possível definir a função');
          }
        }, 1000);
      }

      setIsNewUserDialogOpen(false);
      fetchUsers();
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      toast.error('Não foi possível criar o usuário');
    }
  };

  const toggleUserStatus = async (user: UserProfile) => {
    try {
      const newStatus = !user.is_active;
      
      // Atualizar status no perfil
      const profileUtils = await profileOperations();
      const { error: profileError } = await profileUtils.update(user.id, { 
        is_active: newStatus 
      });
      
      if (profileError) throw profileError;

      toast.success(`Usuário ${newStatus ? 'ativado' : 'desativado'} com sucesso!`);
      fetchUsers();
    } catch (error) {
      console.error('Erro ao alterar status do usuário:', error);
      toast.error('Não foi possível alterar o status do usuário');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Gerenciamento de Usuários</h3>
        <Button 
          onClick={handleAddNewUser}
          className="bg-protechblue-600 hover:bg-protechblue-700"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Adicionar Usuário
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8">Carregando usuários...</div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Função</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">Nenhum usuário encontrado</TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-protechblue-700 flex items-center justify-center text-protechblue-100 font-medium mr-2">
                          {user.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        {user.name}
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <span className={`capitalize px-2 py-1 rounded-full text-xs ${
                        user.role === 'admin' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`capitalize px-2 py-1 rounded-full text-xs ${
                        user.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.is_active ? 'Ativo' : 'Inativo'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditUser(user)}
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Editar</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleUserStatus(user)}
                          className={user.is_active ? "text-red-600" : "text-green-600"}
                        >
                          {user.is_active ? 
                            <UserMinus className="h-4 w-4" /> : 
                            <Check className="h-4 w-4" />
                          }
                          <span className="sr-only">
                            {user.is_active ? 'Desativar' : 'Ativar'}
                          </span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Diálogo de Edição de Usuário */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
            <DialogDescription>
              Atualize as informações do usuário.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                disabled
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Função</Label>
              <Select
                value={formData.role}
                onValueChange={handleRoleChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma função" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="user">Usuário</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={saveUserChanges}
              className="bg-protechblue-600 hover:bg-protechblue-700"
            >
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Criação de Usuário */}
      <Dialog open={isNewUserDialogOpen} onOpenChange={setIsNewUserDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Usuário</DialogTitle>
            <DialogDescription>
              Preencha as informações para criar um novo usuário.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="new-name">Nome</Label>
              <Input
                id="new-name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-email">Email</Label>
              <Input
                id="new-email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-role">Função</Label>
              <Select
                value={formData.role}
                onValueChange={handleRoleChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma função" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="user">Usuário</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-password">Senha</Label>
              <Input
                id="new-password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-confirmPassword">Confirmar Senha</Label>
              <Input
                id="new-confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewUserDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={createNewUser}
              className="bg-protechblue-600 hover:bg-protechblue-700"
            >
              Criar Usuário
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
