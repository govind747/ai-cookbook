import { searchDocuments, addDocument } from '../utils/vectorDB';
import { aiAgentWithSystemPrompt } from './aiAgent';
import type { SearchResult } from '../types';

export const ragAgent = async (query: string): Promise<string> => {
  try {
    const searchResults = await searchDocuments(query, {
      threshold: 0.7,
      maxResults: 3,
    });

    if (!searchResults.success || !searchResults.data) {
      throw new Error(
        searchResults.error || 'Failed to retrieve relevant documents'
      );
    }

    const results = searchResults.data;

    if (results.length === 0) {
      return 'I couldn\'t find any relevant information in the knowledge base. Please try rephrasing your question or add more context.';
    }

    const context = results
      .map((doc, idx) => `[Document ${idx + 1}]\n${doc.content}`)
      .join('\n\n');

    const systemPrompt = `You are a helpful assistant with access to a knowledge base. Answer the user's question based on the following relevant documents. If the documents don't contain enough information, say so clearly.

Relevant Documents:
${context}

Instructions:
- Base your answer primarily on the provided documents
- If the documents don't fully answer the question, acknowledge the limitations
- Cite which document(s) you're referencing when appropriate
- Be concise but thorough`;

    const response = await aiAgentWithSystemPrompt(systemPrompt, query);

    return response;
  } catch (error: any) {
    console.error('RAG Agent Error:', error);
    throw error;
  }
};

export const ragAgentWithSources = async (
  query: string
): Promise<{ answer: string; sources: SearchResult[] }> => {
  try {
    const searchResults = await searchDocuments(query, {
      threshold: 0.7,
      maxResults: 3,
    });

    if (!searchResults.success || !searchResults.data) {
      throw new Error(
        searchResults.error || 'Failed to retrieve relevant documents'
      );
    }

    const results = searchResults.data;

    if (results.length === 0) {
      return {
        answer:
          'I couldn\'t find any relevant information in the knowledge base.',
        sources: [],
      };
    }

    const context = results
      .map((doc, idx) => `[Document ${idx + 1}]\n${doc.content}`)
      .join('\n\n');

    const systemPrompt = `You are a helpful assistant with access to a knowledge base. Answer the user's question based on the following relevant documents.

Relevant Documents:
${context}

Provide a clear and concise answer based on the documents provided.`;

    const answer = await aiAgentWithSystemPrompt(systemPrompt, query);

    return {
      answer,
      sources: results,
    };
  } catch (error: any) {
    console.error('RAG Agent With Sources Error:', error);
    throw error;
  }
};

export const addKnowledgeDocument = async (
  content: string,
  metadata?: Record<string, any>
): Promise<{ success: boolean; error?: string }> => {
  try {
    const result = await addDocument(content, metadata);

    if (!result.success) {
      throw new Error(result.error || 'Failed to add document');
    }

    return { success: true };
  } catch (error: any) {
    console.error('Add Knowledge Document Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to add document to knowledge base',
    };
  }
};

export const hybridSearch = async (
  query: string,
  filters?: Record<string, any>
): Promise<SearchResult[]> => {
  try {
    const searchResults = await searchDocuments(query, {
      threshold: 0.6,
      maxResults: 10,
    });

    if (!searchResults.success || !searchResults.data) {
      return [];
    }

    let results = searchResults.data;

    if (filters) {
      results = results.filter((doc) => {
        if (!doc.metadata) return false;

        return Object.entries(filters).every(
          ([key, value]) => doc.metadata![key] === value
        );
      });
    }

    return results;
  } catch (error: any) {
    console.error('Hybrid Search Error:', error);
    return [];
  }
};
