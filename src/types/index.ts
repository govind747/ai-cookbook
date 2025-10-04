export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  category: 'ai' | 'prompt' | 'rag' | 'workflow' | 'tool';
}

export interface ChatSession {
  agentId: string;
  messages: Message[];
}

export interface VectorDocument {
  id: string;
  content: string;
  embedding: number[];
  metadata?: Record<string, any>;
}

export interface SearchResult {
  id: string;
  content: string;
  similarity: number;
  metadata?: Record<string, any>;
}

export interface WorkflowAction {
  type: 'email' | 'database' | 'notification' | 'webhook';
  payload: Record<string, any>;
}

export interface ToolResponse {
  success: boolean;
  data?: any;
  error?: string;
}
