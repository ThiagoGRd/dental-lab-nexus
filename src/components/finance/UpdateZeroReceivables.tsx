
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { safeFinanceOperations } from '@/utils/supabaseHelpers';

export default function UpdateZeroReceivables({ onComplete }: { onComplete: () => void }) {
  const [updating, setUpdating] = useState(false);

  const updateReceivables = async () => {
    try {
      setUpdating(true);
      const financeOps = await safeFinanceOperations();
      const { updated, error } = await financeOps.updateReceivablesForOrders();
      
      if (error) {
        toast.error('Ocorreu um erro ao atualizar as contas: ' + error.message);
        return;
      }
      
      if (updated === 0) {
        toast.info('Nenhuma conta necessitava de atualização.');
      } else {
        toast.success(`${updated} contas a receber foram atualizadas com sucesso!`);
      }
      
      // Chamar a função para atualizar os dados
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Erro ao processar atualização das contas:', error);
      toast.error('Erro inesperado ao atualizar contas.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Button 
      onClick={updateReceivables} 
      variant="outline" 
      size="sm"
      disabled={updating}
      className="ml-2"
    >
      {updating ? 'Atualizando...' : 'Corrigir Contas Zeradas'}
    </Button>
  );
}
