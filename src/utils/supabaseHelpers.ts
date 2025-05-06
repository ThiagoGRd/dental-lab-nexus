
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
          .eq('active', true)
          .order('name');
          
        if (error) throw error;
        return { services: data, error: null };
      } catch (error) {
        console.error('Error fetching active services:', error);
        return { services: null, error };
      }
    },
    
    add: async (serviceData: Omit<Database['public']['Tables']['services']['Insert'], 'id' | 'created_at' | 'updated_at'>) => {
      try {
        const { data, error } = await supabase
          .from('services')
          .insert({
            ...serviceData,
            active: serviceData.active !== undefined ? serviceData.active : true
          })
          .select();
          
        if (error) throw error;
        return { service: data[0] || null, error: null };
      } catch (error) {
        console.error('Error adding service:', error);
        return { service: null, error };
      }
    },
    
    update: async (id: string, serviceData: Omit<Database['public']['Tables']['services']['Update'], 'id' | 'created_at' | 'updated_at'>) => {
      try {
        const { data, error } = await supabase
          .from('services')
          .update(serviceData)
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
          .update(profileData)
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
        const { data, error } = await supabase
          .from('finances')
          .select('*')
          .eq('type', type)
          .order('due_date', { ascending: true });
          
        if (error) throw error;
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
        const updateData: Database['public']['Tables']['finances']['Update'] = {
          status: status
        };
        
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
    
    update: async (id: string, data: Partial<Database['public']['Tables']['finances']['Update']>) => {
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
    
    add: async (financeData: Omit<Database['public']['Tables']['finances']['Insert'], 'id' | 'created_at' | 'updated_at'>) => {
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
    }
  };
}

// Safe data extraction helper - extracts data or returns fallback
export function safeExtract<T>(response: { data?: T, error?: any } | null | undefined, fallback: T): T {
  if (!response || response.error || !response.data) {
    return fallback;
  }
  return response.data;
}
