import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

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
  notes: string
) {
  console.log('Creating workflow with data:', { orderId, notes });
  
  const workflowInsert: Database['public']['Tables']['workflows']['Insert'] = {
    name: `Workflow para Ordem ${orderId}`,
    description: notes,
    order_id: orderId,
    status: 'active',
    progress: 0
  };
  
  try {
    const result = await supabase
      .from('workflows')
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

// Type-safe update workflow function
export async function updateWorkflow(
  workflowId: string,
  currentStep: number
) {
  console.log('Updating workflow:', { workflowId, currentStep });
  
  const workflowUpdate: Database['public']['Tables']['workflows']['Update'] = {
    description: `Etapa ${currentStep}`,
    progress: currentStep * 20,
    updated_at: new Date().toISOString()
  };
  
  try {
    const result = await supabase
      .from('workflows')
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
      .from('workflows')
      .select('*')
      .eq('order_id', orderId)
      .maybeSingle();
      
    if (error) throw error;
    return { workflow: data, error: null };
  } catch (error) {
    console.error('Erro ao buscar workflow por ID de ordem:', error);
    return { workflow: null, error };
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
    }
  };
}