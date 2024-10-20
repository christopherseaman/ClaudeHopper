# ClaudeHopper

Please proceed with the development, focusing solely on the MVP requirements for now. Regularly check in with updates, challenges faced, and any design decisions that require input. The project this will be based on is available in the /cline subfolder, so search there for existing code references.

## Project Overview
Adapt cline's agentic functionality (using Anthropic's claude-3-5-sonnet model) into an Electron-based menu bar app for macOS called ClaudeHopper. The app will leverage Claude's API to provide an intelligent assistant capable of breaking down complex problems, managing context, and executing tasks.

Key points to consider:
1. Leverage existing Electron expertise: VS Code, the platform CLINE is currently built for, is itself an Electron app. This shared technological foundation should significantly ease the transition from a VS Code extension to a standalone app.
2. MVP Focus: The immediate goal is to build only the Minimum Viable Product (MVP) as outlined in this prompt. Future milestones are provided for context but are not part of the current development phase.
3. Reuse and adapt: Much of CLINE's existing codebase and functionality can likely be reused or easily adapted for this new context, potentially accelerating development.

## Core References
- CLINE GitHub repository: https://github.com/joseluisq/cline
- Electron documentation: https://www.electronjs.org/docs/latest
- Anthropic API reference: https://docs.anthropic.com/en/api/getting-started
- Prompt caching: https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching
- Agentic Evaluation https://www-cdn.anthropic.com/fed9cc193a14b84131812372d8d5857f8f304c52/Model_Card_Claude_3_Addendum.pdf
- Tool use
  - Documentation: https://docs.anthropic.com/en/docs/build-with-claude/tool-use
  - Tutorial: https://github.com/anthropics/courses/tree/master/tool_use
  - Cookbook: https://github.com/anthropics/anthropic-cookbook/tree/main/tool_use
  - News release: Claude can now use tools https://www.anthropic.com/news/tool-use-ga
- Prompt library: https://docs.anthropic.com/en/prompt-library/library
  - 

## Development Guidelines
1. Prioritize core functionality over UI polish for the MVP
2. Ensure robust error handling throughout the application
3. Focus on creating a seamless user experience, especially for non-technical users
4. Maintain modularity in the codebase to facilitate future extensions
5. Regularly commit code and maintain clear documentation of key decisions and architectures
6. Strive for a clean, intuitive user interface that mimics the simplicity and effectiveness of CLINE's VS Code extension

## Technology Stack
- Use React Native with Electron for cross-platform development:
  - React Native for iOS/iPadOS and Android
  - Electron (with React) for macOS, Linux, and Windows desktop platforms
- Use TypeScript for enhanced type safety and developer experience
- Prioritize development in this order: macOS, iOS/iPadOS, Linux, Android, Windows

## Key Challenges to Address
1. Efficiently managing context across multiple API calls
2. Implementing secure and user-friendly API key management
3. Balancing between automated actions and user control/permissions
4. Optimizing for performance while maintaining a responsive UI
5. Adapting CLINE's VS Code extension UI to a standalone Electron app

## MVP Requirements

### 1. Electron App Setup
- Initialize an Electron project targeting macOS menu bar
- Set up development environment with necessary build tools
- Implement app activation through:
  - Menu bar icon click
  - Keyboard shortcut (Ctrl+Space)
- Design app window to appear below the menu bar icon when activated

### 2. Claude API Integration
- Implement secure API key management
- Set up Claude API client with error handling and retries
- Implement basic rate limiting and quota management
- Design the API interaction flow:
  1. Send user input to Claude API
  2. Receive and parse Claude's response
  3. Extract task breakdown and next steps
  4. Execute steps sequentially, sending results back to Claude
  5. Repeat until task is completed or user interrupts

### 3. Task Planning and Execution
- Adapt CLINE's task planning module:
  - Logic to break down complex tasks into steps
  - Sequential execution engine for these steps
- Implement basic error handling for task execution
- Add ability to cancel current task
- Implement task resumption:
  - Save task state when interrupted or app is closed
  - Provide option to resume task when app is reopened

### 4. Context Management
- Develop a context management system:
  - Ability to request specific context from user (e.g., "please share this file")
  - Automatic context gathering with user permission (e.g., "may I run this command and see the output?")
- Implement a basic conversational memory store

### 5. Minimal UI
- Create a main window interface inspired by CLINE's VS Code extension sidebar:
  - If no API key is set, the window should open directly to settings
  - If API key is set, open to chat interface with a gear icon for settings
- Chat Interface:
  - Markdown-interpreted chat view
  - Input field for user messages
  - "Start New Chat" button
- Settings Interface:
  - API key management
  - Model selection
  - Custom instructions input
  - "Always allow read-only operations" checkbox
- Implement a gear icon or button to switch between chat and settings views
- Ensure the window is resizable and remembers its size/position
- Add UI elements for task management based on CLINE:
  - Cancel current task button
  - Resume task option (if a task was previously interrupted)
  - Display current task status and progress
- Implement permission buttons (e.g., 'Approve CLI command') for user authorization before tool use or sending information to the API
- Display total tokens used and API usage cost for the current task loop
- Implement a setting to set a maximum number of API requests allowed for a task before prompting for permission to proceed

### 6. Basic Persistence
- Implement basic data persistence for:
  - User preferences
  - API keys
  - Current task state and progress

### 7. API Interaction Transparency
- Display the JSON of API requests when they are made
- Track and display individual API request costs

--- END OF MVP ---

## Milestone 2 Requirements

### 1. Enhanced Chat Functionality
- Implement resumable chat history
- Visible task list (markdown outline) with highlight of current step
- Implement ability to cancel current step and provide additional input (rather than just resume)

### 2. File Operations
- Implement ability to create artifacts and edit files in place (with user permission)
- Add beautifully syntax-highlighted previews for file edits and new files

### 3. Improved Caching and Efficiency
- Develop a caching system to minimize API usage (see https://www.anthropic.com/news/prompt-caching )
- Implement project state saving:
  - Save full context of ongoing projects
  - Allow resuming projects from saved state, even after app restart

### 4. Usage Tracking
- Implement API usage and expense tracking:
  - Track by individual step
  - Track across entire problem/session

### 5. Security Enhancements
- Implement secure local storage for API keys

### 6. Command Execution
- Stream command execution output into the chat interface if possible
- When a task is completed, determine if the result can be presented with a CLI command (e.g., `open -a "Google Chrome" index.html` or `python new_script.py`)
- Implement a button to run suggested CLI commands with a single click

## Future Development Plans

### 1. Performance Optimization
- Optimize context retrieval algorithms
- Improve API usage efficiency

### 2. Cross-Platform Support
- Extend build process for Windows, Linux, iOS, and Android

### 3. Documentation
- Create comprehensive documentation and help system

### 4. CI/CD and Testing
- Implement CI/CD pipeline
- Develop unit testing suite
