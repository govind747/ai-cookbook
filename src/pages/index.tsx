import { useState, useEffect } from 'react';
import { AgentCard } from '../components/AgentCard';
import { ChatUI } from '../components/ChatUI';
import { aiAgent } from '../agents/aiAgent';
import { promptAgent, listPromptTemplates } from '../agents/promptAgent';
import { ragAgent, addKnowledgeDocument } from '../agents/ragAgent';
import { workflowAgent } from '../agents/workflowAgent';
import { toolAgent, listAvailableTools } from '../agents/toolAgent';
import type { Agent, Message, ChatSession } from '../types';

const agents: Agent[] = [
  {
    id: 'ai',
    name: 'AI Assistant',
    description:
      'General-purpose AI that can answer questions, help with tasks, and engage in natural conversation.',
    icon: '🤖',
    color: 'blue',
    category: 'ai',
  },
  {
    id: 'prompt',
    name: 'Prompt Templates',
    description:
      'Pre-configured prompts for summarization, analysis, translation, code review, and more.',
    icon: '📝',
    color: 'green',
    category: 'prompt',
  },
  {
    id: 'rag',
    name: 'Knowledge Base',
    description:
      'RAG-powered agent that retrieves information from your knowledge base using vector search.',
    icon: '📚',
    color: 'orange',
    category: 'rag',
  },
  {
    id: 'workflow',
    name: 'Workflow Automation',
    description:
      'Automate tasks like database operations, notifications, emails, and webhook calls.',
    icon: '⚡',
    color: 'red',
    category: 'workflow',
  },
  {
    id: 'tool',
    name: 'External Tools',
    description:
      'Integrates with external APIs: weather, crypto prices, calculator, datetime, and exchange rates.',
    icon: '🔧',
    color: 'cyan',
    category: 'tool',
  },
];

export default function Dashboard() {
  const [selectedAgent, setSelectedAgent] = useState<string>('ai');
  const [darkMode, setDarkMode] = useState(false);
  const [sessions, setSessions] = useState<Record<string, ChatSession>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const isDark = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', String(newMode));
    document.documentElement.classList.toggle('dark', newMode);
  };

  const getCurrentSession = (): ChatSession => {
    return (
      sessions[selectedAgent] || {
        agentId: selectedAgent,
        messages: [],
      }
    );
  };

  const updateSession = (agentId: string, messages: Message[]) => {
    setSessions((prev) => ({
      ...prev,
      [agentId]: { agentId, messages },
    }));
  };

  const handleSendMessage = async (input: string) => {
    const session = getCurrentSession();
    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    updateSession(selectedAgent, [...session.messages, userMessage]);
    setIsLoading(true);

    try {
      let response = '';

      switch (selectedAgent) {
        case 'ai':
          response = await aiAgent(input);
          break;

        case 'prompt':
          response = await handlePromptAgent(input);
          break;

        case 'rag':
          response = await handleRAGAgent(input);
          break;

        case 'workflow':
          response = await handleWorkflowAgent(input);
          break;

        case 'tool':
          response = await handleToolAgent(input);
          break;

        default:
          response = 'Agent not implemented';
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      updateSession(selectedAgent, [
        ...session.messages,
        userMessage,
        assistantMessage,
      ]);
    } catch (error: any) {
      const errorMessage: Message = {
        role: 'assistant',
        content: `Error: ${error.message || 'Something went wrong'}`,
        timestamp: new Date(),
      };

      updateSession(selectedAgent, [
        ...session.messages,
        userMessage,
        errorMessage,
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePromptAgent = async (input: string): Promise<string> => {
    const templates = listPromptTemplates();

    if (input.toLowerCase().includes('list') || input.toLowerCase().includes('available')) {
      return `Available prompt templates:\n\n${templates.map((t, i) => `${i + 1}. ${t}`).join('\n')}\n\nTo use a template, specify:\n- "summarize: [your text]"\n- "analyze: [your content]"\n- "translate: [text] to [language]"`;
    }

    const templateMatch = input.match(/^(\w+):\s*(.+)$/);
    if (templateMatch) {
      const [, templateName, content] = templateMatch;

      if (templateName === 'translate') {
        const translateMatch = content.match(/^(.+?)\s+to\s+(\w+)$/i);
        if (translateMatch) {
          const [, text, language] = translateMatch;
          return await promptAgent('translate', { text, language });
        }
      }

      return await promptAgent(templateName, {
        text: content,
        content,
        code: content,
        topic: content,
        concept: content,
      });
    }

    return `Please specify a template. Available templates: ${templates.join(', ')}\n\nExample: "summarize: Your text here"`;
  };

  const handleRAGAgent = async (input: string): Promise<string> => {
    if (input.toLowerCase().startsWith('add:')) {
      const content = input.substring(4).trim();
      const result = await addKnowledgeDocument(content);

      if (result.success) {
        return 'Document added to knowledge base successfully!';
      } else {
        return `Failed to add document: ${result.error}`;
      }
    }

    return await ragAgent(input);
  };

  const handleWorkflowAgent = async (input: string): Promise<string> => {
    if (input.toLowerCase().includes('database') || input.toLowerCase().includes('insert')) {
      const result = await workflowAgent({
        type: 'database',
        payload: {
          operation: 'insert',
          table: 'workflow_logs',
          data: {
            action: 'test_insert',
            message: input,
            created_at: new Date().toISOString(),
          },
        },
      });

      return result.success
        ? `✓ ${result.message}`
        : `✗ ${result.message}`;
    }

    if (input.toLowerCase().includes('notification') || input.toLowerCase().includes('notify')) {
      const result = await workflowAgent({
        type: 'notification',
        payload: {
          title: 'Test Notification',
          body: input,
        },
      });

      return result.success
        ? `✓ ${result.message}`
        : `✗ ${result.message}`;
    }

    return `Workflow Agent Commands:

• "Send notification: [message]" - Send a notification
• "Database insert: [data]" - Insert data into database
• "Send email to [email]: [message]" - Queue an email

Try one of these commands to automate a workflow!`;
  };

  const handleToolAgent = async (input: string): Promise<string> => {
    const tools = listAvailableTools();

    if (input.toLowerCase().includes('weather')) {
      const location = input.replace(/weather|in|for/gi, '').trim();
      const result = await toolAgent('weather', { location });

      if (result.success) {
        return `Weather in ${result.data.location}:

🌡️ Temperature: ${result.data.temperature}
☁️ Condition: ${result.data.condition}
💧 Humidity: ${result.data.humidity}
💨 Wind Speed: ${result.data.windSpeed}
🌡️ Feels Like: ${result.data.feelsLike}`;
      }

      return `Error: ${result.error}`;
    }

    if (input.toLowerCase().includes('crypto') || input.toLowerCase().includes('bitcoin') || input.toLowerCase().includes('btc')) {
      const symbol = input.match(/\b[A-Z]{3,4}\b/)?.[0] || 'BTC';
      const result = await toolAgent('crypto', { symbol });

      if (result.success) {
        return `💰 ${result.data.symbol} Price: ${result.data.price}`;
      }

      return `Error: ${result.error}`;
    }

    if (input.toLowerCase().includes('calculate') || /[\d+\-*/()]/.test(input)) {
      const expression = input.replace(/calculate|what is|=/gi, '').trim();
      const result = await toolAgent('calculator', { expression });

      if (result.success) {
        return `🧮 ${result.data.expression} = ${result.data.result}`;
      }

      return `Error: ${result.error}`;
    }

    return `Available tools: ${tools.join(', ')}

Examples:
• "Weather in London"
• "BTC crypto price"
• "Calculate 15 * 32 + 10"
• "Exchange rate USD to EUR"`;
  };

  const currentAgent = agents.find((a) => a.id === selectedAgent)!;
  const currentSession = getCurrentSession();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              AI Agent System
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Production-ready modular AI agents powered by OpenAI and Supabase
            </p>
          </div>

          <button
            onClick={toggleDarkMode}
            className="p-3 rounded-lg bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
            aria-label="Toggle dark mode"
          >
            <span className="text-2xl">
              {darkMode ? '☀️' : '🌙'}
            </span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {agents.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              isSelected={selectedAgent === agent.id}
              onSelect={setSelectedAgent}
            />
          ))}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
          <div className="h-[600px]">
            <ChatUI
              agentName={currentAgent.name}
              onSendMessage={handleSendMessage}
              messages={currentSession.messages}
              isLoading={isLoading}
            />
          </div>
        </div>

        <div className="mt-6 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            Quick Tips
          </h3>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <li>• <strong>AI Assistant:</strong> Ask any question or request help with tasks</li>
            <li>• <strong>Prompt Templates:</strong> Type "list" to see available templates</li>
            <li>• <strong>Knowledge Base:</strong> Add documents with "add: [content]"</li>
            <li>• <strong>Workflow:</strong> Try "send notification: test message"</li>
            <li>• <strong>Tools:</strong> Try "weather in Paris" or "BTC price"</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
