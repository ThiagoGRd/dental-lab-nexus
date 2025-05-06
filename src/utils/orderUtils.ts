
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
  const orderInsert: Database['public']['Tables']['orders']['Insert'] = {
    client_id: clientId,
    deadline: deadline,
    priority: priority,
    notes: notes,
    status: status
  };
  
  return await supabase
    .from('orders')
    .insert(orderInsert)
    .select()
    .single();
}

// Type-safe create order item function
export async function createOrderItem(
  orderId: string,
  serviceId: string,
  price: number,
  total: number,
  notes: string
) {
  const orderItemInsert: Database['public']['Tables']['order_items']['Insert'] = {
    order_id: orderId,
    service_id: serviceId,
    price: price,
    total: total,
    notes: notes
  };
  
  return await supabase
    .from('order_items')
    .insert(orderItemInsert);
}

// Type-safe create workflow function
export async function createWorkflow(
  orderId: string,
  templateId: string,
  currentStep: number = 0,
  history: Json = [],
  notes: string
) {
  const workflowInsert: Database['public']['Tables']['order_workflows']['Insert'] = {
    order_id: orderId,
    template_id: templateId,
    current_step: currentStep,
    history: history,
    notes: notes
  };
  
  return await supabase
    .from('order_workflows')
    .insert(workflowInsert);
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

// Type-safe update workflow function
export async function updateWorkflow(
  workflowId: string,
  currentStep: number,
  history: Json
) {
  const workflowUpdate: Database['public']['Tables']['order_workflows']['Update'] = {
    current_step: currentStep,
    history: history,
    updated_at: new Date().toISOString()
  };
  
  return await supabase
    .from('order_workflows')
    .update(workflowUpdate)
    .eq('id', workflowId);
}

// Type-safe function to get active services
export async function getActiveServices() {
  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('active', true);
      
    if (error) throw error;
    return { services: data, error: null };
  } catch (error) {
    console.error('Erro ao buscar serviços ativos:', error);
    return { services: null, error };
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

// Type-safe function to update workflow with proper type handling
export async function updateWorkflowStep(
  workflowId: string,
  currentStep: number,
  history: Json[]
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

// Type-safe function to handle service related operations
export async function updateServiceById(
  serviceId: string,
  serviceData: Database['public']['Tables']['services']['Update']
) {
  try {
    const { data, error } = await supabase
      .from('services')
      .update(serviceData)
      .eq('id', serviceId);
      
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Erro ao atualizar serviço:', error);
    return { data: null, error };
  }
}

// Type-safe function to handle profile related operations
export async function updateProfileById(
  profileId: string,
  profileData: Database['public']['Tables']['profiles']['Update']
) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', profileId);
      
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    return { data: null, error };
  }
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
      history: Json[]
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
