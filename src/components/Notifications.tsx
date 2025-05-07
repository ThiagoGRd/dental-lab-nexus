
import React, { useState } from 'react';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { 
  Bell, 
  CheckCheck,
  Trash2,
  CircleX,
  Info,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useNotifications } from '@/context/NotificationContext';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { motion, AnimatePresence } from 'framer-motion';

export default function Notifications() {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification, 
    clearAllNotifications 
  } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [showAllNotifications, setShowAllNotifications] = useState(false);
  const navigate = useNavigate();
  
  const handleNotificationClick = (id: number | string, link?: string) => {
    markAsRead(id);
    
    if (link) {
      setIsOpen(false);
      navigate(link);
    }
  };

  const getNotificationIcon = (type: string, priority: string | undefined) => {
    switch (type) {
      case 'order':
        return <Bell className={`h-4 w-4 ${priority === 'high' ? 'text-red-500' : 'text-blue-500'}`} />;
      case 'deadline':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'inventory':
        return <AlertTriangle className="h-4 w-4 text-purple-500" />;
      case 'payment':
        return <Info className="h-4 w-4 text-green-500" />;
      case 'system':
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  // Limit the notifications in popover
  const popoverNotifications = showAllNotifications 
    ? notifications 
    : notifications.slice(0, 5);

  return (
    <TooltipProvider>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="relative">
                <motion.div
                  initial={{ scale: 1 }}
                  animate={{ scale: unreadCount > 0 ? [1, 1.2, 1] : 1 }}
                  transition={{ 
                    duration: 0.5, 
                    repeat: unreadCount > 0 ? Infinity : 0,
                    repeatDelay: 5
                  }}
                >
                  <Bell className="h-5 w-5" />
                </motion.div>
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Notificações</p>
          </TooltipContent>
        </Tooltip>
        
        <PopoverContent className="w-80 p-0" align="end">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-medium">Notificações</h3>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={markAllAsRead}
                        className="h-8 w-8 p-0"
                      >
                        <CheckCheck className="h-4 w-4 text-green-500" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Marcar todas como lidas</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              
              {notifications.length > 0 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={clearAllNotifications}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Limpar todas</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
          
          <ScrollArea className="h-[320px]">
            <AnimatePresence>
              {popoverNotifications.length > 0 ? (
                <div className="py-2">
                  {popoverNotifications.map((notification) => (
                    <motion.div 
                      key={notification.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className={cn(
                        "p-3 mx-2 my-1 rounded-md text-sm cursor-pointer relative group",
                        notification.read 
                          ? "bg-background hover:bg-muted/50" 
                          : "bg-blue-50 dark:bg-blue-900/20"
                      )}
                      onClick={() => handleNotificationClick(notification.id, notification.link)}
                    >
                      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                        >
                          <CircleX className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                      </div>
                      
                      <div className="flex items-start gap-2">
                        <div className="mt-0.5">
                          {getNotificationIcon(notification.type, notification.priority)}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <h4 className="font-medium">
                              {notification.title}
                            </h4>
                            <span className="text-xs text-muted-foreground">
                              {notification.time}
                            </span>
                          </div>
                          <p className="text-muted-foreground mt-1">{notification.message}</p>
                          
                          {notification.actionText && notification.link && (
                            <div className="mt-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-7 text-xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleNotificationClick(notification.id, notification.link);
                                }}
                              >
                                {notification.actionText}
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  
                  {notifications.length > 5 && !showAllNotifications && (
                    <div className="px-4 py-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full text-xs text-blue-500"
                        onClick={() => setShowAllNotifications(true)}
                      >
                        Mostrar mais ({notifications.length - 5} restantes)
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-8">
                  <div className="rounded-full bg-muted p-3 mb-3">
                    <Bell className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-center text-muted-foreground">Sem notificações</p>
                </div>
              )}
            </AnimatePresence>
          </ScrollArea>
          
          <div className="p-2 border-t">
            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="w-full text-sm"
                >
                  Ver todas as notificações
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                  <DialogTitle>Centro de Notificações</DialogTitle>
                  <DialogDescription>
                    Gerencie todas as suas notificações em um só lugar.
                  </DialogDescription>
                </DialogHeader>
                <NotificationCenter />
              </DialogContent>
            </Dialog>
          </div>
        </PopoverContent>
      </Popover>
    </TooltipProvider>
  );
}

// Notification Center Component
function NotificationCenter() {
  const { notifications, markAsRead, deleteNotification } = useNotifications();
  const [filter, setFilter] = useState<string>('all');
  const navigate = useNavigate();
  
  // Filter notifications based on selected type
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    return notification.type === filter;
  });

  const handleNotificationClick = (id: number | string, link?: string) => {
    markAsRead(id);
    
    if (link) {
      navigate(link);
    }
  };

  const getNotificationIcon = (type: string, priority: string | undefined) => {
    switch (type) {
      case 'order':
        return <Bell className={`h-4 w-4 ${priority === 'high' ? 'text-red-500' : 'text-blue-500'}`} />;
      case 'deadline':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'inventory':
        return <AlertTriangle className="h-4 w-4 text-purple-500" />;
      case 'payment':
        return <Info className="h-4 w-4 text-green-500" />;
      case 'system':
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="mt-4">
      <div className="flex overflow-x-auto pb-2 mb-4 gap-2">
        <Button 
          variant={filter === 'all' ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter('all')}
          className="text-xs"
        >
          Todas
        </Button>
        <Button 
          variant={filter === 'unread' ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter('unread')}
          className="text-xs"
        >
          Não lidas
        </Button>
        <Button 
          variant={filter === 'order' ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter('order')}
          className="text-xs"
        >
          Ordens
        </Button>
        <Button 
          variant={filter === 'deadline' ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter('deadline')}
          className="text-xs"
        >
          Prazos
        </Button>
        <Button 
          variant={filter === 'inventory' ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter('inventory')}
          className="text-xs"
        >
          Inventário
        </Button>
        <Button 
          variant={filter === 'payment' ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter('payment')}
          className="text-xs"
        >
          Pagamentos
        </Button>
        <Button 
          variant={filter === 'system' ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter('system')}
          className="text-xs"
        >
          Sistema
        </Button>
      </div>

      <ScrollArea className="h-[400px] pr-4">
        {filteredNotifications.length > 0 ? (
          <div className="space-y-3">
            {filteredNotifications.map(notification => (
              <div
                key={notification.id}
                className={cn(
                  "p-4 rounded-lg border text-sm cursor-pointer relative group",
                  notification.read 
                    ? "bg-background" 
                    : "bg-blue-50 dark:bg-blue-900/20"
                )}
                onClick={() => handleNotificationClick(notification.id, notification.link)}
              >
                <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notification.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    <div className="p-2 rounded-full bg-muted">
                      {getNotificationIcon(notification.type, notification.priority)}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">
                          {notification.title}
                        </h4>
                        <p className="text-muted-foreground mt-1">{notification.message}</p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                        {notification.time}
                      </span>
                    </div>
                    
                    {notification.actionText && notification.link && (
                      <div className="mt-3">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNotificationClick(notification.id, notification.link);
                          }}
                        >
                          {notification.actionText}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[300px]">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Bell className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-center text-muted-foreground">Nenhuma notificação encontrada</p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
