import { createChatCompletion, streamChatCompletion } from '../utils/openaiClient';
import type { Message } from '../types';

export const aiAgent = async (input: string): Promise<string> => {
  try {
    const response = await createChatCompletion([
      {
        role: 'system',
        content:
          'You are a helpful AI assistant. Provide clear, concise, and accurate responses.',
      },
      { role: 'user', content: input },
    ]);

    if (!response.success) {
      throw new Error(response.error || 'Failed to get response');
    }

    return response.data || 'No response generated';
  } catch (error: any) {
    console.error('AI Agent Error:', error);
    throw error;
  }
};

export const aiAgentWithContext = async (
  messages: Message[]
): Promise<string> => {
  try {
    const formattedMessages = messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    const response = await createChatCompletion(formattedMessages);

    if (!response.success) {
      throw new Error(response.error || 'Failed to get response');
    }

    return response.data || 'No response generated';
  } catch (error: any) {
    console.error('AI Agent Context Error:', error);
    throw error;
  }
};

export const aiAgentStream = async (
  input: string,
  onChunk: (chunk: string) => void
): Promise<void> => {
  try {
    await streamChatCompletion(
      [
        {
          role: 'system',
          content:
            'You are a helpful AI assistant. Provide clear, concise, and accurate responses.',
        },
        { role: 'user', content: input },
      ],
      onChunk
    );
  } catch (error: any) {
    console.error('AI Agent Stream Error:', error);
    throw error;
  }
};

export const aiAgentWithSystemPrompt = async (
  systemPrompt: string,
  userInput: string
): Promise<string> => {
  try {
    const response = await createChatCompletion([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userInput },
    ]);

    if (!response.success) {
      throw new Error(response.error || 'Failed to get response');
    }

    return response.data || 'No response generated';
  } catch (error: any) {
    console.error('AI Agent System Prompt Error:', error);
    throw error;
  }
};
