
import React, { useState } from 'react';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TooltipProvider } from '@/components/ui/tooltip';

// Mock de notificações
const mockNotifications = [
  { id: 1, title: 'Ordem Urgente', message: 'Nova ordem urgente adicionada (#ORD045)', time: '10 min', read: false },
  { id: 2, title: 'Prazo Próximo', message: 'A ordem #ORD033 vence em 24 horas', time: '1 hora', read: false },
  { id: 3, title: 'Material em Falta', message: 'Estoque baixo de Resina Z350', time: '2 horas', read: false },
  { id: 4, title: 'Pagamento Recebido', message: 'Pagamento da Clínica Dental Care confirmado', time: '5 horas', read: true },
  { id: 5, title: 'Ordem Concluída', message: 'Ordem #ORD028 foi finalizada', time: '1 dia', read: true },
];

export default function Notifications() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [isOpen, setIsOpen] = useState(false);
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };
  
  const markAsRead = (id: number) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  return (
    <TooltipProvider>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500">
                {unreadCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium">Notificações</h3>
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs text-blue-500 hover:text-blue-600"
                onClick={markAllAsRead}
              >
                Marcar todas como lidas
              </Button>
            )}
          </div>
          <ScrollArea className="h-80">
            <div className="space-y-2">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div 
                    key={notification.id}
                    className={`p-3 rounded-md text-sm ${notification.read ? 'bg-gray-50' : 'bg-blue-50'}`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex justify-between">
                      <h4 className="font-medium">{notification.title}</h4>
                      <span className="text-xs text-gray-500">{notification.time}</span>
                    </div>
                    <p className="text-gray-600 mt-1">{notification.message}</p>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-4">Sem notificações</p>
              )}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>
    </TooltipProvider>
  );
}
