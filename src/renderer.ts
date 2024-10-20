// This file contains the UI logic for our app

let isWaitingForResponse = false;

window.addEventListener('DOMContentLoaded', () => {
  const messageInput = document.getElementById('messageInput') as HTMLInputElement;
  const sendButton = document.getElementById('sendButton') as HTMLButtonElement;
  const chatContainer = document.getElementById('chatContainer') as HTMLDivElement;
  const apiKeyInput = document.getElementById('apiKeyInput') as HTMLInputElement;
  const saveApiKeyButton = document.getElementById('saveApiKeyButton') as HTMLButtonElement;
  const showContextButton = document.getElementById('showContextButton') as HTMLButtonElement;
  const clearContextButton = document.getElementById('clearContextButton') as HTMLButtonElement;
  const saveConversationButton = document.getElementById('saveConversationButton') as HTMLButtonElement;
  const loadConversationButton = document.getElementById('loadConversationButton') as HTMLButtonElement;
  const openSettingsButton = document.getElementById('openSettingsButton') as HTMLButtonElement;
  const settingsModal = document.getElementById('settingsModal') as HTMLDivElement;
  const closeSettingsButton = document.getElementById('closeSettingsButton') as HTMLSpanElement;
  const saveSettingsButton = document.getElementById('saveSettingsButton') as HTMLButtonElement;
  const modelSelect = document.getElementById('modelSelect') as HTMLSelectElement;
  const maxTokensInput = document.getElementById('maxTokens') as HTMLInputElement;
  const themeSelect = document.getElementById('themeSelect') as HTMLSelectElement;
  const contextModal = document.getElementById('contextModal') as HTMLDivElement;
  const contextContent = document.getElementById('contextContent') as HTMLPreElement;
  const closeContextModal = document.querySelector('.close') as HTMLSpanElement;

  const displayMessage = (message: string, isUser: boolean) => {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', isUser ? 'user-message' : 'assistant-message');
    messageElement.textContent = message;
    chatContainer.appendChild(messageElement);
    chatContainer.scrollTop = chatContainer.scrollHeight;
  };

  const displayTasks = (tasks: string[]): HTMLElement => {
    const tasksElement = document.createElement('div');
    tasksElement.classList.add('tasks');
    tasksElement.innerHTML = '<h3>Tasks:</h3>';
    const taskList = document.createElement('ul');
    tasks.forEach((task, index) => {
      const taskItem = document.createElement('li');
      taskItem.innerHTML = `
        <div class="task-progress">
          <div class="status pending" id="task-status-${index}"></div>
          <span>${task}</span>
        </div>
      `;
      taskList.appendChild(taskItem);
    });
    tasksElement.appendChild(taskList);
    chatContainer.appendChild(tasksElement);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    return tasksElement;
  };

  const updateTaskStatus = (index: number, status: 'pending' | 'in-progress' | 'completed' | 'error') => {
    const statusElement = document.getElementById(`task-status-${index}`);
    if (statusElement) {
      statusElement.className = `status ${status}`;
    }
  };

  const executeTasks = async (tasks: string[], tasksElement: HTMLElement) => {
    for (let i = 0; i < tasks.length; i++) {
      updateTaskStatus(i, 'in-progress');
      try {
        const result = await window.electronAPI.executeTask(tasks[i]);
        displayMessage(result, false);
        updateTaskStatus(i, 'completed');
      } catch (error) {
        displayMessage(`Error executing task: ${tasks[i]}`, false);
        updateTaskStatus(i, 'error');
        console.error('Error executing task:', error);
      }
    }
  };

  const handleSendMessage = async () => {
    if (isWaitingForResponse) return;

    const message = messageInput.value.trim();
    if (message) {
      isWaitingForResponse = true;
      sendButton.disabled = true;
      messageInput.value = '';

      displayMessage(message, true);
      window.electronAPI.addToContext({ role: 'user', content: message });

      try {
        const { response, tasks } = await window.electronAPI.sendMessageToClaude(message);
        displayMessage(response, false);
        if (tasks && tasks.length > 0) {
          const tasksElement = displayTasks(tasks);
          await executeTasks(tasks, tasksElement);
        }
      } catch (error) {
        console.error('Error sending message:', error);
        displayMessage('Error: Failed to get response from Claude', false);
      } finally {
        isWaitingForResponse = false;
        sendButton.disabled = false;
      }
    }
  };

  const displayContext = () => {
    const context = window.electronAPI.getContext();
    contextContent.textContent = JSON.stringify(context, null, 2);
    contextModal.style.display = 'block';
  };

  const clearContext = () => {
    window.electronAPI.clearContext();
    chatContainer.innerHTML = '';
    displayMessage('Context cleared', false);
  };

  const saveConversation = () => {
    const filename = prompt('Enter a name for this conversation:');
    if (filename) {
      try {
        window.electronAPI.saveConversation(filename);
        alert(`Conversation saved as ${filename}`);
      } catch (error) {
        console.error('Error saving conversation:', error);
        alert('Failed to save conversation');
      }
    }
  };

  const loadConversation = () => {
    const conversations = window.electronAPI.listConversations();
    if (conversations.length === 0) {
      alert('No conversations available to load.');
      return;
    }
    const filename = prompt('Enter the name of the conversation to load:\n\nAvailable conversations:\n' + conversations.join('\n'));
    if (filename) {
      try {
        window.electronAPI.loadConversation(filename);
        const context = window.electronAPI.getContext();
        chatContainer.innerHTML = '';
        context.forEach(message => {
          displayMessage(message.content, message.role === 'user');
        });
        alert(`Conversation "${filename}" loaded`);
      } catch (error) {
        console.error('Error loading conversation:', error);
        alert('Failed to load conversation');
      }
    }
  };

  const openSettings = () => {
    loadSettingsAndPopulateForm();
    settingsModal.style.display = 'block';
  };

  const closeSettings = () => {
    settingsModal.style.display = 'none';
  };

  const saveSettings = () => {
    const selectedModel = modelSelect.value;
    const maxTokens = parseInt(maxTokensInput.value, 10);
    const selectedTheme = themeSelect.value;

    if (isNaN(maxTokens) || maxTokens < 100 || maxTokens > 4000) {
      alert('Please enter a valid number of max tokens (100 - 4000).');
      return;
    }

    window.electronAPI.updateSettings({
      model: selectedModel,
      maxTokens: maxTokens,
      theme: selectedTheme
    });

    applyTheme(selectedTheme);
    alert('Settings saved successfully!');
    settingsModal.style.display = 'none';
  };

  const loadSettingsAndPopulateForm = () => {
    const settings = window.electronAPI.getSettings();
    modelSelect.value = settings.model;
    maxTokensInput.value = settings.maxTokens.toString();
    themeSelect.value = settings.theme;
  };

  const applyTheme = (theme: string) => {
    document.body.classList.remove('light-theme', 'dark-theme');
    if (theme === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.add('light-theme');
    }
  };

  // Event listeners
  sendButton.addEventListener('click', handleSendMessage);
  messageInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  });

  saveApiKeyButton.addEventListener('click', () => {
    const apiKey = apiKeyInput.value.trim();
    if (apiKey) {
      window.electronAPI.setApiKey(apiKey);
      alert('API key saved successfully!');
    } else {
      alert('Please enter a valid API key.');
    }
  });

  showContextButton.addEventListener('click', displayContext);
  clearContextButton.addEventListener('click', clearContext);
  saveConversationButton.addEventListener('click', saveConversation);
  loadConversationButton.addEventListener('click', loadConversation);
  openSettingsButton.addEventListener('click', openSettings);
  closeSettingsButton.addEventListener('click', closeSettings);
  saveSettingsButton.addEventListener('click', saveSettings);

  // Modal close buttons
  closeContextModal.addEventListener('click', () => {
    contextModal.style.display = 'none';
  });

  // Close modals when clicking outside of them
  window.addEventListener('click', (event) => {
    if (event.target === contextModal) {
      contextModal.style.display = 'none';
    }
    if (event.target === settingsModal) {
      settingsModal.style.display = 'none';
    }
  });

  // Load saved API key if available
  const savedApiKey = window.electronAPI.getApiKey();
  if (savedApiKey) {
    apiKeyInput.value = savedApiKey;
  }

  // Load and apply settings on app start
  const settings = window.electronAPI.getSettings();
  applyTheme(settings.theme);

  // Display version information
  const replaceText = (selector: string, text: string) => {
    const element = document.getElementById(selector);
    if (element) element.innerText = text;
  };

  for (const type of ['chrome', 'node', 'electron'] as const) {
    replaceText(`${type}-version`, window.versions[type]());
  }
});
