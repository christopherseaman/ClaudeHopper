import { contextBridge, ipcRenderer } from 'electron';
import {
  setApiKey,
  getApiKey,
  sendMessageToClaude,
  addToContext,
  getContext,
  clearContext,
  executeTask,
  saveConversation,
  loadConversation,
  listConversations,
  saveSettings,
  loadSettings,
  updateSettings,
  getSettings
} from './api';

contextBridge.exposeInMainWorld('electronAPI', {
  setApiKey: (key: string) => setApiKey(key),
  getApiKey: () => getApiKey(),
  sendMessageToClaude: (message: string) => sendMessageToClaude(message),
  addToContext: (message: { role: string; content: string }) => addToContext(message),
  getContext: () => getContext(),
  clearContext: () => clearContext(),
  executeTask: (task: string) => executeTask(task),
  saveConversation: (filename: string) => saveConversation(filename),
  loadConversation: (filename: string) => loadConversation(filename),
  listConversations: () => listConversations(),
  saveSettings: () => saveSettings(),
  loadSettings: () => loadSettings(),
  updateSettings: (newSettings: Partial<{ model: string; maxTokens: number; theme: string }>) => updateSettings(newSettings),
  getSettings: () => getSettings()
});

contextBridge.exposeInMainWorld('versions', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
});
