
import { type PostgrestFilterBuilder } from '@supabase/postgrest-js';
import { type Database } from '@/integrations/supabase/types';
import { supabase } from '@/integrations/supabase/client';

/**
 * Type-safe wrapper for inserting data to a specific Supabase table
 */
export async function typedInsert<
  T extends keyof Database['public']['Tables'],
  U extends Database['public']['Tables'][T]['Insert']
>(
  table: T,
  data: U
) {
  return supabase
    .from(table)
    .insert(data);
}

/**
 * Type-safe wrapper for updating data in a specific Supabase table
 */
export async function typedUpdate<
  T extends keyof Database['public']['Tables'],
  U extends Database['public']['Tables'][T]['Update']
>(
  table: T,
  id: string,
  data: U
) {
  return supabase
    .from(table)
    .update(data)
    .eq('id', id);
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
    .eq(field, value);
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
    .eq('id', id);
}

/**
 * Helper for casting Supabase responses safely to the expected type
 */
export function castResponse<T>(data: any): T | null {
  if (!data) return null;
  return data as T;
}
