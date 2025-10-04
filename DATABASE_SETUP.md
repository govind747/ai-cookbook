# Database Setup Instructions

This AI Agent System uses Supabase for data persistence and vector search capabilities. Follow these steps to set up the required database schema.

## Prerequisites

- A Supabase project with access to SQL editor
- pgvector extension enabled (available by default in Supabase)

## Required Tables

### 1. Documents Table (for RAG/Vector Search)

Run this SQL in your Supabase SQL Editor:

\`\`\`sql
-- Enable vector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create documents table for RAG
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  embedding vector(1536),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create vector similarity search index
CREATE INDEX IF NOT EXISTS documents_embedding_idx ON documents
USING hnsw (embedding vector_cosine_ops);

-- Create metadata search index
CREATE INDEX IF NOT EXISTS documents_metadata_idx ON documents
USING gin (metadata);

-- Create vector search function
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    documents.id,
    documents.content,
    documents.metadata,
    1 - (documents.embedding <=> query_embedding) AS similarity
  FROM documents
  WHERE 1 - (documents.embedding <=> query_embedding) > match_threshold
  ORDER BY documents.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- Enable RLS
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view all documents"
  ON documents FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert documents"
  ON documents FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Users can update documents"
  ON documents FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Users can delete documents"
  ON documents FOR DELETE TO authenticated USING (true);
\`\`\`

### 2. Workflow Tables (Optional - for workflow automation)

\`\`\`sql
-- Table for workflow logs
CREATE TABLE IF NOT EXISTS workflow_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action text NOT NULL,
  message text,
  created_at timestamptz DEFAULT now()
);

-- Table for notifications
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL,
  user_id uuid,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Table for email queue
CREATE TABLE IF NOT EXISTS emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  to text NOT NULL,
  subject text NOT NULL,
  body text NOT NULL,
  sent boolean DEFAULT false,
  sent_at timestamptz
);

-- Enable RLS
ALTER TABLE workflow_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE emails ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Authenticated users can manage workflow_logs"
  ON workflow_logs FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can manage notifications"
  ON notifications FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can manage emails"
  ON emails FOR ALL TO authenticated USING (true) WITH CHECK (true);
\`\`\`

## Environment Variables

Make sure your `.env` file contains:

\`\`\`
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_OPENAI_API_KEY=your-openai-api-key
\`\`\`

## Testing the Setup

After running the migrations, you can test the setup by:

1. Using the RAG Agent to add a document
2. Searching for documents using the RAG Agent
3. Running workflow automations
4. Using external tools

## Notes

- The vector dimension is 1536 (matches OpenAI's text-embedding-3-small model)
- Cosine distance is used for similarity measurements
- RLS policies allow all authenticated users to access documents (adjust as needed for your use case)
- The workflow tables are optional but enable full workflow automation features
