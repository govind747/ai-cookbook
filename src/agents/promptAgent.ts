import { aiAgentWithSystemPrompt } from './aiAgent';

export interface PromptTemplate {
  name: string;
  template: string;
  variables: string[];
}

export const promptTemplates: Record<string, PromptTemplate> = {
  summarize: {
    name: 'Summarization',
    template:
      'Summarize the following text in a concise manner:\n\n{text}\n\nSummary:',
    variables: ['text'],
  },
  analyze: {
    name: 'Analysis',
    template:
      'Analyze the following content and provide key insights:\n\n{content}\n\nAnalysis:',
    variables: ['content'],
  },
  translate: {
    name: 'Translation',
    template:
      'Translate the following text to {language}:\n\n{text}\n\nTranslation:',
    variables: ['text', 'language'],
  },
  codeReview: {
    name: 'Code Review',
    template:
      'Review the following code and provide feedback on:\n1. Code quality\n2. Best practices\n3. Potential improvements\n\nCode:\n{code}\n\nReview:',
    variables: ['code'],
  },
  brainstorm: {
    name: 'Brainstorming',
    template:
      'Generate creative ideas for the following topic:\n\n{topic}\n\nProvide at least 5 innovative ideas.',
    variables: ['topic'],
  },
  explain: {
    name: 'Explanation',
    template:
      'Explain the following concept in simple terms that a beginner can understand:\n\n{concept}\n\nExplanation:',
    variables: ['concept'],
  },
};

export const formatPrompt = (
  templateName: string,
  variables: Record<string, string>
): string => {
  const template = promptTemplates[templateName];

  if (!template) {
    throw new Error(`Template "${templateName}" not found`);
  }

  let formattedPrompt = template.template;

  template.variables.forEach((variable) => {
    if (!(variable in variables)) {
      throw new Error(`Missing variable: ${variable}`);
    }
    const regex = new RegExp(`\\{${variable}\\}`, 'g');
    formattedPrompt = formattedPrompt.replace(regex, variables[variable]);
  });

  return formattedPrompt;
};

export const promptAgent = async (
  templateName: string,
  variables: Record<string, string>
): Promise<string> => {
  try {
    const prompt = formatPrompt(templateName, variables);
    const response = await aiAgentWithSystemPrompt(
      'You are a helpful assistant specialized in the requested task. Provide high-quality, detailed responses.',
      prompt
    );
    return response;
  } catch (error: any) {
    console.error('Prompt Agent Error:', error);
    throw error;
  }
};

export const createCustomPrompt = (
  name: string,
  template: string,
  variables: string[]
): void => {
  promptTemplates[name] = {
    name,
    template,
    variables,
  };
};

export const listPromptTemplates = (): string[] => {
  return Object.keys(promptTemplates);
};

export const getPromptTemplate = (
  templateName: string
): PromptTemplate | null => {
  return promptTemplates[templateName] || null;
};
