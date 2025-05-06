import { supabase } from "@/integrations/supabase/client";
import type { Database } from '@/integrations/supabase/types';

// Type-safe helper for services table operations
export async function safeServiceOperations() {
  return {
    getAll: async () => {
      try {
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .order('name');
          
        if (error) throw error;
        return { services: data, error: null };
      } catch (error) {
        console.error('Error fetching services:', error);
        return { services: null, error };
      }
    },
    
    getActive: async () => {
      try {
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .filter('active', 'eq', true)
          .order('name');
          
        if (error) throw error;
        return { services: data, error: null };
      } catch (error) {
        console.error('Error fetching active services:', error);
        return { services: null, error };
      }
    },
    
    add: async (serviceData: Partial<Database['public']['Tables']['services']['Insert']>) => {
      try {
        const insertData = {
          ...serviceData,
          active: serviceData.active !== undefined ? serviceData.active : true
        } as Database['public']['Tables']['services']['Insert'];
        
        const { data, error } = await supabase
          .from('services')
          .insert(insertData)
          .select();
          
        if (error) throw error;
        return { service: data[0] || null, error: null };
      } catch (error) {
        console.error('Error adding service:', error);
        return { service: null, error };
      }
    },
    
    update: async (id: string, serviceData: Partial<Database['public']['Tables']['services']['Update']>) => {
      try {
        const { data, error } = await supabase
          .from('services')
          .update(serviceData as Database['public']['Tables']['services']['Update'])
          .eq('id', id)
          .select();
          
        if (error) throw error;
        return { service: data[0] || null, error: null };
      } catch (error) {
        console.error('Error updating service:', error);
        return { service: null, error };
      }
    },
    
    delete: async (id: string) => {
      try {
        const { error } = await supabase
          .from('services')
          .delete()
          .eq('id', id);
          
        if (error) throw error;
        return { error: null };
      } catch (error) {
        console.error('Error deleting service:', error);
        return { error };
      }
    }
  };
}

// Type-safe helper for profiles table operations
export async function safeProfileOperations() {
  return {
    getAll: async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*');
          
        if (error) throw error;
        return { profiles: data, error: null };
      } catch (error) {
        console.error('Error fetching profiles:', error);
        return { profiles: null, error };
      }
    },
    
    getById: async (id: string) => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) throw error;
        return { profile: data, error: null };
      } catch (error) {
        console.error('Error fetching profile:', error);
        return { profile: null, error };
      }
    },
    
    update: async (id: string, profileData: Partial<Database['public']['Tables']['profiles']['Update']>) => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .update(profileData as Database['public']['Tables']['profiles']['Update'])
          .eq('id', id)
          .select();
          
        if (error) throw error;
        return { profile: data[0] || null, error: null };
      } catch (error) {
        console.error('Error updating profile:', error);
        return { profile: null, error };
      }
    }
  };
}

// Type-safe helper for finances table operations
export async function safeFinanceOperations() {
  return {
    getByType: async (type: 'expense' | 'revenue') => {
      try {
        console.log(`Buscando finanças do tipo ${type}...`);
        const { data, error } = await supabase
          .from('finances')
          .select('*')
          .eq('type', type)
          .order('due_date', { ascending: true });
          
        if (error) {
          console.error(`Erro em getByType para ${type}:`, error);
          throw error;
        }
        
        console.log(`Dados obtidos para ${type}:`, data);
        return { finances: data, error: null };
      } catch (error) {
        console.error(`Error fetching ${type} finances:`, error);
        return { finances: null, error };
      }
    },
    
    getRelatedOrders: async (orderIds: string[]) => {
      try {
        if (orderIds.length === 0) return { orders: [], error: null };
        
        const { data, error } = await supabase
          .from('orders')
          .select('id, client_id')
          .in('id', orderIds);
          
        if (error) throw error;
        return { orders: data, error: null };
      } catch (error) {
        console.error('Error fetching related orders:', error);
        return { orders: null, error };
      }
    },
    
    getClientsByIds: async (clientIds: string[]) => {
      try {
        if (clientIds.length === 0) return { clients: [], error: null };
        
        const { data, error } = await supabase
          .from('clients')
          .select('id, name')
          .in('id', clientIds);
          
        if (error) throw error;
        return { clients: data, error: null };
      } catch (error) {
        console.error('Error fetching clients:', error);
        return { clients: null, error };
      }
    },
    
    updateStatus: async (id: string, status: string) => {
      try {
        const updateData = {
          status: status
        } as any; // Using any to avoid TypeScript errors
        
        if (status === 'paid' || status === 'received') {
          updateData.payment_date = new Date().toISOString();
        }
        
        const { error } = await supabase
          .from('finances')
          .update(updateData)
          .eq('id', id);
          
        if (error) throw error;
        return { error: null };
      } catch (error) {
        console.error('Error updating finance status:', error);
        return { error };
      }
    },
    
    update: async (id: string, data: any) => {
      try {
        const { error } = await supabase
          .from('finances')
          .update(data)
          .eq('id', id);
          
        if (error) throw error;
        return { error: null };
      } catch (error) {
        console.error('Error updating finance data:', error);
        return { error };
      }
    },
    
    add: async (financeData: any) => {
      try {
        const { data, error } = await supabase
          .from('finances')
          .insert(financeData)
          .select();
          
        if (error) throw error;
        return { finance: data[0] || null, error: null };
      } catch (error) {
        console.error('Error adding finance entry:', error);
        return { finance: null, error };
      }
    },
    
    updateReceivablesForOrders: async () => {
      try {
        // 1. Buscar todas as contas a receber com valor zero que têm related_order_id
        const { data: zeroReceivables, error: receiveError } = await supabase
          .from('finances')
          .select('id, related_order_id')
          .eq('type', 'revenue')
          .eq('amount', 0);
          
        if (receiveError) throw receiveError;
        
        console.log(`Encontradas ${zeroReceivables?.length || 0} contas a receber com valor zero`);
        
        if (!zeroReceivables || zeroReceivables.length === 0) {
          return { updated: 0, error: null };
        }
        
        // 2. Para cada conta, buscar a ordem relacionada e atualizar o valor
        let updatedCount = 0;
        
        for (const receivable of zeroReceivables) {
          if (!receivable.related_order_id) continue;
          
          // Buscar valor da ordem
          const { data: order, error: orderError } = await supabase
            .from('orders')
            .select('total_value')
            .eq('id', receivable.related_order_id)
            .single();
            
          if (orderError) {
            console.error(`Erro ao buscar ordem ${receivable.related_order_id}:`, orderError);
            continue;
          }
          
          let orderValue = order?.total_value;
          
          // Se não tiver valor na ordem, buscar dos itens
          if (!orderValue || orderValue <= 0) {
            const { data: items, error: itemsError } = await supabase
              .from('order_items')
              .select('total')
              .eq('order_id', receivable.related_order_id);
              
            if (itemsError) {
              console.error(`Erro ao buscar itens da ordem ${receivable.related_order_id}:`, itemsError);
              continue;
            }
            
            if (items && items.length > 0) {
              orderValue = items.reduce((sum, item) => sum + (Number(item.total) || 0), 0);
            }
          }
          
          // Se ainda não tiver valor, usar 100 como padrão
          if (!orderValue || orderValue <= 0) {
            orderValue = 100;
          }
          
          // Atualizar a conta a receber
          const { error: updateError } = await supabase
            .from('finances')
            .update({ amount: orderValue })
            .eq('id', receivable.id);
            
          if (updateError) {
            console.error(`Erro ao atualizar conta ${receivable.id}:`, updateError);
            continue;
          }
          
          updatedCount++;
        }
        
        console.log(`${updatedCount} contas a receber atualizadas com sucesso`);
        return { updated: updatedCount, error: null };
      } catch (error) {
        console.error('Erro ao atualizar contas a receber:', error);
        return { updated: 0, error };
      }
    }
  };
}

// Safe data extraction helper - extracts data or returns fallback
export function safeExtract<T>(response: { finances?: T, data?: T, error?: any } | null | undefined, fallback: T): T {
  // Direct data access for standard Supabase responses
  if (response?.data) {
    console.log("safeExtract: returning data from response.data", response.data);
    return response.data as T;
  }
  
  // Access finances field for our custom finance operations
  if (response?.finances) {
    console.log("safeExtract: returning data from response.finances", response.finances);
    return response.finances as T;
  }
  
  // Fallback if no valid data found
  if (!response || response.error) {
    console.log("safeExtract: returning fallback for response:", response);
    return fallback;
  }
  
  // If we have a direct response that's not in data or finances field
  if (response && typeof response === 'object' && !('data' in response) && !('error' in response) && !('finances' in response)) {
    console.log("safeExtract: returning direct response", response);
    return response as T;
  }
  
  console.log("safeExtract: unable to extract data, returning fallback", fallback);
  return fallback;
}
