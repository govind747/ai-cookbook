# AI Agent System

A production-ready modular AI Agent System built with TypeScript, React, OpenAI, and Supabase. This system provides five specialized agents for different AI-powered tasks.

## Features

- **Modular Architecture**: Each agent is self-contained with a single responsibility
- **TypeScript**: Fully typed for better development experience
- **React UI**: Modern, responsive interface with dark mode support
- **Vector Search**: RAG capabilities using Supabase vector store
- **Workflow Automation**: Database operations, notifications, and webhooks
- **External Tools**: Weather, crypto prices, calculator, and more
- **Tailwind CSS**: Beautiful, professional styling

## Project Structure

```
/src
 ├─ agents/
 │   ├─ aiAgent.ts         # Base AI agent with OpenAI integration
 │   ├─ promptAgent.ts     # Template-based prompt management
 │   ├─ ragAgent.ts        # RAG with vector search
 │   ├─ workflowAgent.ts   # Workflow automation
 │   └─ toolAgent.ts       # External API integrations
 ├─ utils/
 │   ├─ openaiClient.ts    # OpenAI API wrapper
 │   ├─ supabaseClient.ts  # Supabase client
 │   └─ vectorDB.ts        # Vector database operations
 ├─ components/
 │   ├─ ChatUI.tsx         # Chat interface component
 │   └─ AgentCard.tsx      # Agent selection cards
 ├─ pages/
 │   └─ index.tsx          # Main dashboard
 └─ types/
     └─ index.ts           # TypeScript type definitions
```

## Agents Overview

### 1. AI Assistant (`aiAgent.ts`)
General-purpose conversational AI powered by GPT-4o-mini.

**Features:**
- Natural conversation
- Context-aware responses
- Streaming support
- Custom system prompts

**Usage:**
```typescript
import { aiAgent } from './agents/aiAgent';

const response = await aiAgent('Tell me about AI agents');
```

### 2. Prompt Templates (`promptAgent.ts`)
Pre-configured prompts for common tasks.

**Available Templates:**
- Summarization
- Analysis
- Translation
- Code Review
- Brainstorming
- Explanation

**Usage:**
```typescript
import { promptAgent } from './agents/promptAgent';

const summary = await promptAgent('summarize', {
  text: 'Your long text here...'
});
```

### 3. Knowledge Base (`ragAgent.ts`)
RAG system with vector search for retrieving relevant information.

**Features:**
- Add documents to knowledge base
- Semantic search
- Source attribution
- Hybrid search with filters

**Usage:**
```typescript
import { ragAgent, addKnowledgeDocument } from './agents/ragAgent';

// Add a document
await addKnowledgeDocument('Important information...');

// Query the knowledge base
const answer = await ragAgent('What is the information about?');
```

### 4. Workflow Automation (`workflowAgent.ts`)
Automate tasks like database operations, notifications, and webhooks.

**Supported Actions:**
- Database insert/update
- Notifications
- Email queue
- Webhook calls

**Usage:**
```typescript
import { workflowAgent } from './agents/workflowAgent';

await workflowAgent({
  type: 'notification',
  payload: {
    title: 'Alert',
    body: 'Something happened!'
  }
});
```

### 5. External Tools (`toolAgent.ts`)
Integration with external APIs for real-world data.

**Available Tools:**
- Weather information
- Cryptocurrency prices
- Calculator
- Date/time
- Exchange rates

**Usage:**
```typescript
import { toolAgent } from './agents/toolAgent';

const weather = await toolAgent('weather', { location: 'London' });
const price = await toolAgent('crypto', { symbol: 'BTC' });
```

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```env
VITE_OPENAI_API_KEY=your-openai-api-key
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. Set Up Database

Follow the instructions in `DATABASE_SETUP.md` to create the required tables in Supabase.

### 4. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## Building for Production

```bash
npm run build
```

The optimized production build will be in the `dist/` folder.

## Usage Guide

### Using the Dashboard

1. **Select an Agent**: Click on any agent card to activate it
2. **Start Chatting**: Type your message in the input field
3. **View Responses**: See AI responses in real-time
4. **Switch Agents**: Click a different agent card to change agents

### Agent-Specific Commands

#### AI Assistant
Just ask any question naturally.

#### Prompt Templates
- Type `list` to see available templates
- Use format: `templateName: your content`
- Example: `summarize: [long text]`

#### Knowledge Base
- Add documents: `add: Your document content here`
- Query: Ask questions naturally

#### Workflow Automation
- `Send notification: message`
- `Database insert: data`
- `Send email to user@email.com: message`

#### External Tools
- `Weather in [city]`
- `BTC crypto price`
- `Calculate 15 * 32 + 10`
- `Exchange rate USD to EUR`

## API Reference

### OpenAI Client (`utils/openaiClient.ts`)

```typescript
// Create chat completion
createChatCompletion(messages, options)

// Create embedding
createEmbedding(text)

// Stream chat completion
streamChatCompletion(messages, onChunk, options)
```

### Vector DB (`utils/vectorDB.ts`)

```typescript
// Add document
addDocument(content, metadata)

// Search documents
searchDocuments(query, options)

// Bulk add documents
bulkAddDocuments(documents)

// Delete document
deleteDocument(documentId)
```

### Supabase Client (`utils/supabaseClient.ts`)

```typescript
// Insert document
insertDocument(table, data)

// Query documents
queryDocuments(table, filters)

// Update document
updateDocument(table, id, updates)

// Delete document
deleteDocument(table, id)
```

## Architecture

### Agent Pattern

Each agent follows a consistent pattern:

1. **Single Responsibility**: Each agent handles one specific task type
2. **Async Operations**: All agent functions are async
3. **Error Handling**: Comprehensive try-catch blocks
4. **Type Safety**: Full TypeScript typing
5. **Modular Design**: Easy to extend and maintain

### Data Flow

```
User Input → Dashboard → Selected Agent → Utilities → External Services
                ↓
            Chat UI ← Agent Response
```

## Extending the System

### Adding a New Agent

1. Create a new file in `src/agents/`
2. Export an async function that takes input and returns a response
3. Add the agent to the dashboard in `src/pages/index.tsx`
4. Create an agent card in the `agents` array

### Adding a New Tool

1. Add a new case in `toolAgent.ts`
2. Implement the tool function
3. Update `listAvailableTools()` and `getToolDescription()`

### Adding a New Prompt Template

```typescript
import { createCustomPrompt } from './agents/promptAgent';

createCustomPrompt(
  'myTemplate',
  'Your template with {variable}',
  ['variable']
);
```

## Security Considerations

- API keys are stored in environment variables
- RLS policies protect database access
- Input sanitization for calculator
- CORS headers configured
- No sensitive data in client code

## Performance

- Vector search uses HNSW index for fast similarity search
- Streaming responses for real-time feedback
- Optimized React components with proper memoization
- Code splitting with Vite
- Minimal bundle size

## Troubleshooting

### "OpenAI API key not set"
Add `VITE_OPENAI_API_KEY` to your `.env` file.

### "Supabase connection failed"
Check your `VITE_SUPABASE_URL` and `VITE_SUPABASE_SUPABASE_ANON_KEY` in `.env`.

### "Vector search not working"
Make sure you've run the database migrations in `DATABASE_SETUP.md`.

### Build warnings about eval
This is expected for the calculator tool. The Function constructor is used as a safer alternative.

## Technologies Used

- **React 18**: UI framework
- **TypeScript**: Type safety
- **Vite**: Build tool
- **Tailwind CSS**: Styling
- **OpenAI API**: AI capabilities
- **Supabase**: Database and vector store
- **pgvector**: Vector similarity search

## License

This project is part of the AI Cookbook and follows its license terms.

## Support

For questions and issues, please refer to the main repository documentation.

## Contributing

Contributions are welcome! Please ensure:
- Code is properly typed
- New agents follow the established pattern
- All features are documented
- Tests pass (if applicable)

## Future Enhancements

Potential improvements:
- Add authentication system
- Implement agent memory/history
- Add voice input/output
- Create agent orchestration (multi-agent workflows)
- Add analytics dashboard
- Implement agent testing framework
- Add more external tool integrations
- Create agent marketplace

---

Built with ❤️ using modern AI technologies.
