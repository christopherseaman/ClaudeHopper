import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

let apiKey: string | null = null;
let context: Array<{ role: string; content: string }> = [];

interface Settings {
  model: string;
  maxTokens: number;
  theme: string;
}

let settings: Settings = {
  model: 'claude-3-opus-20240229',
  maxTokens: 1000,
  theme: 'light'
};

const SETTINGS_DIR = path.join(process.cwd(), 'config');
const SETTINGS_PATH = path.join(SETTINGS_DIR, 'settings.json');

export const setApiKey = (key: string): void => {
  apiKey = key;
};

export const getApiKey = (): string | null => {
  return apiKey;
};

export const addToContext = (message: { role: string; content: string }): void => {
  context.push(message);
  if (context.length > 10) {
    context.shift(); // Remove the oldest message if we have more than 10
  }
};

export const getContext = (): Array<{ role: string; content: string }> => {
  return context;
};

export const clearContext = (): void => {
  context = [];
};

const parseTaskSteps = (response: string): string[] => {
  const steps = response.split('\n').filter(step => step.trim().startsWith('-'));
  return steps.map(step => step.trim().substring(2));
};

export const sendMessageToClaude = async (message: string): Promise<{ response: string; tasks?: string[] }> => {
  if (!apiKey) {
    throw new Error('API key not set');
  }

  const systemMessage = {
    role: 'system',
    content: 'You are an AI assistant capable of breaking down complex tasks into steps and executing them. When given a task, first break it down into steps, then execute each step sequentially.'
  };

  const fullContext = [systemMessage, ...context, { role: 'user', content: message }];

  try {
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: settings.model,
        max_tokens: settings.maxTokens,
        messages: fullContext,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
      }
    );

    if (response.data.content && response.data.content.length > 0) {
      const assistantMessage = response.data.content[0].text;
      addToContext({ role: 'assistant', content: assistantMessage });

      const tasks = parseTaskSteps(assistantMessage);
      return { response: assistantMessage, tasks: tasks.length > 0 ? tasks : undefined };
    } else {
      throw new Error('Unexpected response format from Claude API');
    }
  } catch (error) {
    console.error('Error sending message to Claude:', error);
    throw new Error('Failed to get response from Claude');
  }
};

export const executeTask = async (task: string): Promise<string> => {
  // In a real implementation, this function would execute the task
  // For now, we'll just simulate task execution
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate some work
  return `Executed task: ${task}`;
};

export const saveConversation = (filename: string): void => {
  const conversationData = JSON.stringify(context, null, 2);
  const conversationsDir = path.join(process.cwd(), 'conversations');
  const filePath = path.join(conversationsDir, `${filename}.json`);
  
  if (!fs.existsSync(conversationsDir)) {
    fs.mkdirSync(conversationsDir, { recursive: true });
  }

  fs.writeFileSync(filePath, conversationData);
};

export const loadConversation = (filename: string): void => {
  const filePath = path.join(process.cwd(), 'conversations', `${filename}.json`);
  
  if (fs.existsSync(filePath)) {
    const conversationData = fs.readFileSync(filePath, 'utf-8');
    context = JSON.parse(conversationData);
  } else {
    throw new Error('Conversation file not found');
  }
};

export const listConversations = (): string[] => {
  const conversationsDir = path.join(process.cwd(), 'conversations');
  
  if (!fs.existsSync(conversationsDir)) {
    return [];
  }

  return fs.readdirSync(conversationsDir)
    .filter(file => file.endsWith('.json'))
    .map(file => file.replace('.json', ''));
};

// Settings Management
export const saveSettings = (): void => {
  const settingsDir = SETTINGS_DIR;
  if (!fs.existsSync(settingsDir)) {
    fs.mkdirSync(settingsDir, { recursive: true });
  }

  fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2));
};

export const loadSettings = (): void => {
  if (fs.existsSync(SETTINGS_PATH)) {
    const settingsData = fs.readFileSync(SETTINGS_PATH, 'utf-8');
    settings = JSON.parse(settingsData);
  }
};

export const updateSettings = (newSettings: Partial<Settings>): void => {
  settings = { ...settings, ...newSettings };
  saveSettings();
};

export const getSettings = (): Settings => {
  return settings;
};
