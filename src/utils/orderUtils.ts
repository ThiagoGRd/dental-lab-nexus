
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
