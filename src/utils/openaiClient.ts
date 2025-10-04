import OpenAI from 'openai';

const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

if (!apiKey) {
  console.warn('VITE_OPENAI_API_KEY is not set. OpenAI features will not work.');
}

export const openai = new OpenAI({
  apiKey: apiKey || 'dummy-key',
  dangerouslyAllowBrowser: true,
});

export const DEFAULT_MODEL = 'gpt-4o-mini';
export const EMBEDDING_MODEL = 'text-embedding-3-small';

export const createChatCompletion = async (
  messages: Array<{ role: string; content: string }>,
  options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  }
) => {
  try {
    const response = await openai.chat.completions.create({
      model: options?.model || DEFAULT_MODEL,
      messages: messages as any,
      temperature: options?.temperature || 0.7,
      max_tokens: options?.maxTokens || 1000,
    });

    return {
      success: true,
      data: response.choices[0].message.content,
      usage: response.usage,
    };
  } catch (error: any) {
    console.error('OpenAI API Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to generate response',
    };
  }
};

export const createEmbedding = async (text: string): Promise<number[]> => {
  try {
    const response = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: text,
    });

    return response.data[0].embedding;
  } catch (error: any) {
    console.error('Embedding Error:', error);
    throw new Error(`Failed to create embedding: ${error.message}`);
  }
};

export const streamChatCompletion = async (
  messages: Array<{ role: string; content: string }>,
  onChunk: (chunk: string) => void,
  options?: {
    model?: string;
    temperature?: number;
  }
) => {
  try {
    const stream = await openai.chat.completions.create({
      model: options?.model || DEFAULT_MODEL,
      messages: messages as any,
      temperature: options?.temperature || 0.7,
      stream: true,
    });

    let fullResponse = '';

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        fullResponse += content;
        onChunk(content);
      }
    }

    return { success: true, data: fullResponse };
  } catch (error: any) {
    console.error('Streaming Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to stream response',
    };
  }
};
