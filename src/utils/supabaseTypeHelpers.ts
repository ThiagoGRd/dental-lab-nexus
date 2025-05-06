
import { PostgrestFilterBuilder } from '@supabase/postgrest-js';
import { type Database } from '@/integrations/supabase/types';
import { supabase } from '@/integrations/supabase/client';

/**
 * Type-safe wrapper for inserting data to a specific Supabase table
 */
export async function typedInsert<
  T extends keyof Database['public']['Tables']
>(
  table: T,
  data: Database['public']['Tables'][T]['Insert']
) {
  return supabase
    .from(table)
    .insert(data as any);
}

/**
 * Type-safe wrapper for updating data in a specific Supabase table
 */
export async function typedUpdate<
  T extends keyof Database['public']['Tables']
>(
  table: T,
  id: string,
  data: Database['public']['Tables'][T]['Update']
) {
  return supabase
    .from(table)
    .update(data as any)
    .eq('id' as any, id);
}

/**
 * Type-safe wrapper for selecting data from a specific Supabase table by a field
 */
export async function typedSelectByField<
  T extends keyof Database['public']['Tables']
>(
  table: T,
  field: string,
  value: any,
  columns: string = '*'
) {
  return supabase
    .from(table)
    .select(columns)
    .eq(field as any, value);
}

/**
 * Type-safe wrapper for selecting data from a specific Supabase table by id
 */
export async function typedSelectById<
  T extends keyof Database['public']['Tables']
>(
  table: T,
  id: string,
  columns: string = '*'
) {
  return typedSelectByField(table, 'id', id, columns);
}

/**
 * Type-safe wrapper for deleting data from a specific Supabase table
 */
export async function typedDelete<
  T extends keyof Database['public']['Tables']
>(
  table: T,
  id: string
) {
  return supabase
    .from(table)
    .delete()
    .eq('id' as any, id);
}

/**
 * Helper for casting Supabase responses safely to the expected type
 */
export function castResponse<T>(data: any): T | null {
  if (!data) return null;
  return data as T;
}
