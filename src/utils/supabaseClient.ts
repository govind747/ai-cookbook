import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const insertDocument = async (
  table: string,
  data: Record<string, any>
) => {
  try {
    const { data: result, error } = await supabase
      .from(table)
      .insert(data)
      .select()
      .single();

    if (error) throw error;

    return { success: true, data: result };
  } catch (error: any) {
    console.error('Supabase Insert Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to insert document',
    };
  }
};

export const queryDocuments = async (
  table: string,
  filters?: Record<string, any>
) => {
  try {
    let query = supabase.from(table).select('*');

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }

    const { data, error } = await query;

    if (error) throw error;

    return { success: true, data };
  } catch (error: any) {
    console.error('Supabase Query Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to query documents',
    };
  }
};

export const updateDocument = async (
  table: string,
  id: string,
  updates: Record<string, any>
) => {
  try {
    const { data, error } = await supabase
      .from(table)
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error: any) {
    console.error('Supabase Update Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to update document',
    };
  }
};

export const deleteDocument = async (table: string, id: string) => {
  try {
    const { error } = await supabase.from(table).delete().eq('id', id);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('Supabase Delete Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to delete document',
    };
  }
};
