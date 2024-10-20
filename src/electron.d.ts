interface ElectronAPI {
  setApiKey: (key: string) => void;
  getApiKey: () => string | null;
  sendMessageToClaude: (message: string) => Promise<{ response: string; tasks?: string[] }>;
  addToContext: (message: { role: string; content: string }) => void;
  getContext: () => Array<{ role: string; content: string }>;
  clearContext: () => void;
  executeTask: (task: string) => Promise<string>;
  saveConversation: (filename: string) => void;
  loadConversation: (filename: string) => void;
  listConversations: () => string[];
  saveSettings: () => void;
  loadSettings: () => void;
  updateSettings: (newSettings: Partial<{ model: string; maxTokens: number; theme: string }>) => void;
  getSettings: () => { model: string; maxTokens: number; theme: string };
}

interface Window {
  electronAPI: ElectronAPI;
  versions: {
    node: () => string;
    chrome: () => string;
    electron: () => string;
  };
}
