import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { Json } from '@/integrations/supabase/types';

// Type-safe create order function
export async function createOrder(
  clientId: string,
  deadline: string | null,
  priority: 'urgent' | 'normal',
  notes: string,
  status: string = 'pending'
) {
  console.log('Creating order with data:', { clientId, deadline, priority, notes, status });
  
  const orderInsert: Database['public']['Tables']['orders']['Insert'] = {
    client_id: clientId,
    deadline: deadline,
    priority: priority,
    notes: notes,
    status: status
  };
  
  try {
    const result = await supabase
      .from('orders')
      .insert(orderInsert)
      .select()
      .single();
      
    console.log('Create order result:', result);
    return result;
  } catch (error) {
    console.error('Error in createOrder:', error);
    throw error;
  }
}

// Type-safe create order item function
export async function createOrderItem(
  orderId: string,
  serviceId: string,
  price: number,
  total: number,
  notes: string
) {
  console.log('Creating order item with data:', { orderId, serviceId, price, total, notes });
  
  const orderItemInsert: Database['public']['Tables']['order_items']['Insert'] = {
    order_id: orderId,
    service_id: serviceId,
    price: price,
    total: total,
    notes: notes
  };
  
  try {
    const result = await supabase
      .from('order_items')
      .insert(orderItemInsert);
      
    console.log('Create order item result:', result);
    return result;
  } catch (error) {
    console.error('Error in createOrderItem:', error);
    throw error;
  }
}

// Type-safe create workflow function
export async function createWorkflow(
  orderId: string,
  templateId: string,
  currentStep: number = 0,
  history: Json = [],
  notes: string
) {
  console.log('Creating workflow with data:', { orderId, templateId, currentStep, history, notes });
  
  const workflowInsert: Database['public']['Tables']['order_workflows']['Insert'] = {
    order_id: orderId,
    template_id: templateId,
    current_step: currentStep,
    history: history,
    notes: notes
  };
  
  try {
    const result = await supabase
      .from('order_workflows')
      .insert(workflowInsert);
      
    console.log('Create workflow result:', result);
    return result;
  } catch (error) {
    console.error('Error in createWorkflow:', error);
    throw error;
  }
}

// Type-safe update order function
export async function updateOrder(
  orderId: string,
  status: string,
  deadline: string | null,
  priority: 'urgent' | 'normal',
  notes: string
) {
  const orderUpdate: Database['public']['Tables']['orders']['Update'] = {
    status: status,
    deadline: deadline,
    priority: priority,
    notes: notes
  };
  
  return await supabase
    .from('orders')
    .update(orderUpdate)
    .eq('id', orderId);
}

// Type-safe update workflow function with proper typing
export async function updateWorkflow(
  workflowId: string,
  currentStep: number,
  history: Json
) {
  console.log('Updating workflow:', { workflowId, currentStep, history });
  
  const workflowUpdate: Database['public']['Tables']['order_workflows']['Update'] = {
    current_step: currentStep,
    history: history,
    updated_at: new Date().toISOString()
  };
  
  try {
    const result = await supabase
      .from('order_workflows')
      .update(workflowUpdate)
      .eq('id', workflowId);
      
    console.log('Update workflow result:', result);
    return result;
  } catch (error) {
    console.error('Error in updateWorkflow:', error);
    throw error;
  }
}

// Type-safe function to get workflow by order ID
export async function getWorkflowByOrderId(orderId: string) {
  try {
    const { data, error } = await supabase
      .from('order_workflows')
      .select(`
        id,
        template_id,
        current_step,
        history,
        notes,
        workflow_templates (*)
      `)
      .eq('order_id', orderId)
      .single();
      
    if (error) throw error;
    return { workflow: data, error: null };
  } catch (error) {
    console.error('Erro ao buscar workflow por ID de ordem:', error);
    return { workflow: null, error };
  }
}

// Type-safe function to update workflow step
export async function updateWorkflowStep(
  workflowId: string,
  currentStep: number,
  history: any[]
) {
  try {
    const workflowUpdate: Database['public']['Tables']['order_workflows']['Update'] = {
      current_step: currentStep,
      history: history as Json,
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('order_workflows')
      .update(workflowUpdate)
      .eq('id', workflowId);
      
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Erro ao atualizar etapa do workflow:', error);
    return { data: null, error };
  }
}

// Function to handle service related operations
export async function serviceOperations() {
  return {
    // Get all services
    getAll: async () => {
      try {
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .order('name');
          
        if (error) throw error;
        return { services: data, error: null };
      } catch (error) {
        console.error('Erro ao buscar serviços:', error);
        return { services: null, error };
      }
    },
    
    // Get active services only
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
        console.error('Erro ao buscar serviços ativos:', error);
        return { services: null, error };
      }
    },
    
    // Add new service
    add: async (serviceData: Omit<Database['public']['Tables']['services']['Insert'], 'id' | 'created_at' | 'updated_at'>) => {
      try {
        // Ensure active is set if not provided
        const fullServiceData = {
          ...serviceData,
          active: serviceData.active !== undefined ? serviceData.active : true
        };
        
        const { data, error } = await supabase
          .from('services')
          .insert(fullServiceData)
          .select();
          
        if (error) throw error;
        return { service: data?.[0] || null, error: null };
      } catch (error) {
        console.error('Erro ao adicionar serviço:', error);
        return { service: null, error };
      }
    },
    
    // Update existing service
    update: async (id: string, serviceData: Omit<Database['public']['Tables']['services']['Update'], 'id' | 'created_at' | 'updated_at'>) => {
      try {
        const { data, error } = await supabase
          .from('services')
          .update(serviceData)
          .eq('id', id)
          .select();
          
        if (error) throw error;
        return { service: data?.[0] || null, error: null };
      } catch (error) {
        console.error('Erro ao atualizar serviço:', error);
        return { service: null, error };
      }
    },
    
    // Delete service
    delete: async (id: string) => {
      try {
        const { error } = await supabase
          .from('services')
          .delete()
          .eq('id', id);
          
        if (error) throw error;
        return { error: null };
      } catch (error) {
        console.error('Erro ao excluir serviço:', error);
        return { error };
      }
    }
  };
}

// Function to handle order workflow operations
export async function orderWorkflowOperations() {
  return {
    // Get workflow by order ID
    getByOrderId: async (orderId: string) => {
      try {
        const { data, error } = await supabase
          .from('order_workflows')
          .select(`
            id,
            template_id,
            current_step,
            history,
            notes,
            workflow_templates (*)
          `)
          .eq('order_id', orderId)
          .single();
          
        if (error) throw error;
        return { workflow: data, error: null };
      } catch (error) {
        console.error('Erro ao buscar workflow por ID de ordem:', error);
        return { workflow: null, error };
      }
    },
    
    // Update workflow step
    updateStep: async (
      workflowId: string,
      currentStep: number,
      history: any[]
    ) => {
      try {
        const workflowUpdate: Database['public']['Tables']['order_workflows']['Update'] = {
          current_step: currentStep,
          history: history as Json,
          updated_at: new Date().toISOString()
        };
        
        const { error } = await supabase
          .from('order_workflows')
          .update(workflowUpdate)
          .eq('id', workflowId);
          
        if (error) throw error;
        return { error: null };
      } catch (error) {
        console.error('Erro ao atualizar etapa do workflow:', error);
        return { error };
      }
    }
  };
}

// Type-safe profile operations
export async function profileOperations() {
  return {
    // Get all profiles
    getAll: async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*');
          
        if (error) throw error;
        return { profiles: data, error: null };
      } catch (error) {
        console.error('Erro ao buscar perfis:', error);
        return { profiles: null, error };
      }
    },
    
    // Get profile by ID
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
        console.error('Erro ao buscar perfil:', error);
        return { profile: null, error };
      }
    },
    
    // Update existing profile
    update: async (id: string, profileData: Partial<Database['public']['Tables']['profiles']['Update']>) => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .update(profileData)
          .eq('id', id)
          .select();
          
        if (error) throw error;
        return { profile: data?.[0] || null, error: null };
      } catch (error) {
        console.error('Erro ao atualizar perfil:', error);
        return { profile: null, error };
      }
    }
  };
}
