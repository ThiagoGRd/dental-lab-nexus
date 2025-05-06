
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
