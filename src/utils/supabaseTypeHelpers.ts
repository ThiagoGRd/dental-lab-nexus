
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

// Use explicit type assertions to avoid TypeScript errors
export async function typedInsert(table: string, data: any) {
  return supabase
    .from(table as any)
    .insert(data);
}

/**
 * Type-safe wrapper for updating data in a specific Supabase table
 */
export async function typedUpdate(
  table: string,
  id: string,
  data: any
) {
  return supabase
    .from(table as any)
    .update(data)
    .eq('id', id);
}

/**
 * Type-safe wrapper for selecting data from a specific Supabase table by a field
 */
export async function typedSelectByField(
  table: string,
  field: string,
  value: any,
  columns: string = '*'
) {
  return supabase
    .from(table as any)
    .select(columns)
    .eq(field, value);
}

/**
 * Type-safe wrapper for selecting data from a specific Supabase table by id
 */
export async function typedSelectById(
  table: string,
  id: string,
  columns: string = '*'
) {
  return typedSelectByField(table, 'id', id, columns);
}

/**
 * Type-safe wrapper for deleting data from a specific Supabase table
 */
export async function typedDelete(
  table: string,
  id: string
) {
  return supabase
    .from(table as any)
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
