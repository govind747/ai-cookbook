import { supabase } from './supabaseClient';
import { createEmbedding } from './openaiClient';
import type { VectorDocument, SearchResult } from '../types';

const DOCUMENTS_TABLE = 'documents';
const SIMILARITY_THRESHOLD = 0.7;
const MAX_RESULTS = 5;

export const addDocument = async (
  content: string,
  metadata?: Record<string, any>
): Promise<{ success: boolean; data?: VectorDocument; error?: string }> => {
  try {
    const embedding = await createEmbedding(content);

    const document = {
      content,
      embedding,
      metadata: metadata || {},
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from(DOCUMENTS_TABLE)
      .insert(document)
      .select()
      .single();

    if (error) throw error;

    return { success: true, data: data as VectorDocument };
  } catch (error: any) {
    console.error('Add Document Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to add document',
    };
  }
};

export const searchDocuments = async (
  query: string,
  options?: {
    threshold?: number;
    maxResults?: number;
  }
): Promise<{ success: boolean; data?: SearchResult[]; error?: string }> => {
  try {
    const queryEmbedding = await createEmbedding(query);

    const { data, error } = await supabase.rpc('match_documents', {
      query_embedding: queryEmbedding,
      match_threshold: options?.threshold || SIMILARITY_THRESHOLD,
      match_count: options?.maxResults || MAX_RESULTS,
    });

    if (error) throw error;

    const results: SearchResult[] = (data || []).map((item: any) => ({
      id: item.id,
      content: item.content,
      similarity: item.similarity,
      metadata: item.metadata,
    }));

    return { success: true, data: results };
  } catch (error: any) {
    console.error('Search Documents Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to search documents',
    };
  }
};

export const bulkAddDocuments = async (
  documents: Array<{ content: string; metadata?: Record<string, any> }>
): Promise<{ success: boolean; count?: number; error?: string }> => {
  try {
    const documentsWithEmbeddings = await Promise.all(
      documents.map(async (doc) => ({
        content: doc.content,
        embedding: await createEmbedding(doc.content),
        metadata: doc.metadata || {},
        created_at: new Date().toISOString(),
      }))
    );

    const { data, error } = await supabase
      .from(DOCUMENTS_TABLE)
      .insert(documentsWithEmbeddings)
      .select();

    if (error) throw error;

    return { success: true, count: data?.length || 0 };
  } catch (error: any) {
    console.error('Bulk Add Documents Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to add documents',
    };
  }
};

export const deleteDocument = async (
  documentId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from(DOCUMENTS_TABLE)
      .delete()
      .eq('id', documentId);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('Delete Document Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to delete document',
    };
  }
};

export const getAllDocuments = async (): Promise<{
  success: boolean;
  data?: VectorDocument[];
  error?: string;
}> => {
  try {
    const { data, error } = await supabase
      .from(DOCUMENTS_TABLE)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { success: true, data: data as VectorDocument[] };
  } catch (error: any) {
    console.error('Get All Documents Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch documents',
    };
  }
};
