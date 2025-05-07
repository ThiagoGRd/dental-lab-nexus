
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  Card, 
  CardContent,
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  Settings, 
  Building, 
  User, 
  Mail, 
  Phone, 
  MapPin 
} from 'lucide-react';
import UserManagement from '@/components/settings/UserManagement';
import { supabase } from '@/integrations/supabase/client';
import { useTheme } from '@/components/theme/ThemeProvider';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [companySettings, setCompanySettings] = useState({
    name: 'Protech Lab Nexus',
    document: '12.345.678/0001-00',
    email: 'contato@protechlabnexus.com',
    phone: '(11) 98765-4321',
    address: 'Av. Paulista, 1000 - Sala 301',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01310-100',
    logo: '',
    description: 'Laboratório especializado em próteses dentárias de alta precisão.'
  });

  const [systemSettings, setSystemSettings] = useState({
    autoBackup: true,
    darkMode: theme === 'dark',
    emailNotifications: true,
    autoLogout: false,
    defaultDueTime: 7,
  });

  // Sincronizar o estado darkMode com o tema atual
  useEffect(() => {
    setSystemSettings(prev => ({
      ...prev,
      darkMode: theme === 'dark'
    }));
  }, [theme]);

  const handleCompanyChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCompanySettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSystemChange = (name: string, value: boolean | number) => {
    setSystemSettings(prev => ({ ...prev, [name]: value }));
    
    // Se for o switch de tema escuro, atualizar o tema
    if (name === 'darkMode') {
      setTheme(value ? 'dark' : 'light');
    }
  };

  const saveCompanySettings = () => {
    // Em uma aplicação real, salvaria no banco de dados
    localStorage.setItem('companySettings', JSON.stringify(companySettings));
    toast.success('Configurações da empresa salvas com sucesso!');
  };

  const saveSystemSettings = () => {
    // Em uma aplicação real, salvaria no banco de dados
    localStorage.setItem('systemSettings', JSON.stringify(systemSettings));
    toast.success('Configurações do sistema salvas com sucesso!');
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">Configurações</h1>
      <p className="text-muted-foreground mb-6">Gerencie as configurações do sistema</p>

      <Tabs defaultValue="company" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="company" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Empresa
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Sistema
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Usuários
          </TabsTrigger>
        </TabsList>

        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle>Informações da Empresa</CardTitle>
              <CardDescription>
                Configure os dados da sua empresa que aparecerão em relatórios e documentos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nome da Empresa</label>
                  <Input 
                    name="name" 
                    value={companySettings.name} 
                    onChange={handleCompanyChange} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">CNPJ</label>
                  <Input 
                    name="document" 
                    value={companySettings.document} 
                    onChange={handleCompanyChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input 
                    name="email" 
                    type="email"
                    value={companySettings.email} 
                    onChange={handleCompanyChange}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Telefone</label>
                  <Input 
                    name="phone" 
                    value={companySettings.phone} 
                    onChange={handleCompanyChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Endereço</label>
                <Input 
                  name="address" 
                  value={companySettings.address} 
                  onChange={handleCompanyChange}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Cidade</label>
                  <Input 
                    name="city" 
                    value={companySettings.city} 
                    onChange={handleCompanyChange}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Estado</label>
                  <Input 
                    name="state" 
                    value={companySettings.state} 
                    onChange={handleCompanyChange}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">CEP</label>
                  <Input 
                    name="zipCode" 
                    value={companySettings.zipCode} 
                    onChange={handleCompanyChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Descrição</label>
                <Textarea 
                  name="description" 
                  value={companySettings.description} 
                  onChange={handleCompanyChange}
                  rows={3}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="bg-protechblue-600 hover:bg-protechblue-700 dark:bg-protechblue-700 dark:hover:bg-protechblue-800"
                onClick={saveCompanySettings}
              >
                Salvar Alterações
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle>Configurações do Sistema</CardTitle>
              <CardDescription>
                Configure o comportamento do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-base font-medium">Backup Automático</label>
                  <p className="text-sm text-muted-foreground">Realiza backup de dados todos os dias às 22h</p>
                </div>
                <Switch
                  checked={systemSettings.autoBackup}
                  onCheckedChange={(checked) => handleSystemChange('autoBackup', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-base font-medium">Tema Escuro</label>
                  <p className="text-sm text-muted-foreground">Utiliza o tema escuro na interface</p>
                </div>
                <Switch
                  checked={systemSettings.darkMode}
                  onCheckedChange={(checked) => handleSystemChange('darkMode', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-base font-medium">Notificações por Email</label>
                  <p className="text-sm text-muted-foreground">Enviar notificações por email para ordens e prazos</p>
                </div>
                <Switch
                  checked={systemSettings.emailNotifications}
                  onCheckedChange={(checked) => handleSystemChange('emailNotifications', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-base font-medium">Logout Automático</label>
                  <p className="text-sm text-muted-foreground">Desconecta após 30 minutos de inatividade</p>
                </div>
                <Switch
                  checked={systemSettings.autoLogout}
                  onCheckedChange={(checked) => handleSystemChange('autoLogout', checked)}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-base font-medium">Prazo Padrão para Entrega (dias)</label>
                <Input 
                  type="number" 
                  value={systemSettings.defaultDueTime}
                  onChange={(e) => handleSystemChange('defaultDueTime', parseInt(e.target.value) || 7)}
                  min={1}
                  max={30}
                  className="max-w-xs dark:bg-gray-800 dark:border-gray-700"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={saveSystemSettings}
                className="dark:bg-protechblue-700 dark:hover:bg-protechblue-800"
              >
                Salvar Alterações
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciamento de Usuários</CardTitle>
              <CardDescription>
                Adicione e gerencie usuários do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserManagement />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
