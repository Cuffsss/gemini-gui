# Gemini GUI

An AI-powered IDE with integrated Gemini AI capabilities, built with Electron and React. This project provides a VS Code-like interface with powerful AI tools for code generation, review, and multi-agent collaboration.

## Features

- **AI Chat-First Experience**: Main Gemini AI acts as a delegator, managing multiple specialized agents
- **Multi-Agent System**: Create and manage specialized AI agents for different tasks (code generation, testing, documentation, etc.)
- **IDE-Like Interface**: Familiar VS Code-style layout with file explorer, code editor, and terminal
- **Real-time Collaboration**: Agents can communicate and work together on complex applications
- **Customizable Settings**: Configure API keys, models, themes, and editor preferences

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- A Google Gemini API key (get one from [Google AI Studio](https://aistudio.google.com/apikey))

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd gemini-gui
```

2. Install dependencies:
```bash
npm install
```

3. Build the application:
```bash
npm run build
```

## Usage

### Running from Command Line

After installation, you can run the GUI from the command line:

```bash
gemini-gui
```

Or during development:

```bash
npm run electron:dev
```

### First Time Setup

1. Launch the application
2. Click on the Settings icon in the top toolbar
3. Enter your Gemini API key
4. Select your preferred Gemini model
5. Choose a workspace directory for your projects
6. Test the API connection

### Working with AI Agents

1. **Main Chat**: Use the main chat panel to interact with the primary Gemini instance
2. **Create Agents**: Click the "+" button in the Agents panel to create specialized agents
3. **Agent Capabilities**: Assign specific capabilities to each agent (e.g., Code Generation, Testing, Documentation)
4. **Agent Communication**: Agents can communicate with each other to solve complex problems

### Available Agent Capabilities

- Code Generation
- Code Review
- Testing
- Documentation
- Debugging
- Architecture Design
- Database Design
- API Design
- UI/UX Design
- Performance Optimization
- Security Analysis
- DevOps
- Project Management

## Development

### Project Structure

```
gemini-gui/
├── electron/           # Electron main process files
├── src/
│   ├── main/          # Main process TypeScript files
│   ├── renderer/      # React application
│   │   ├── components/  # React components
│   │   ├── services/    # API services
│   │   ├── stores/      # Zustand state management
│   │   └── types/       # TypeScript type definitions
│   └── shared/        # Shared types and utilities
├── public/            # Static assets
└── dist/             # Build output
```

### Key Technologies

- **Electron**: Desktop application framework
- **React**: UI framework
- **TypeScript**: Type-safe JavaScript
- **Material-UI**: Component library
- **Zustand**: State management
- **CodeMirror**: Code editor
- **xterm.js**: Terminal emulator
- **Google Generative AI**: Gemini API integration

### Development Commands

```bash
# Run in development mode
npm run electron:dev

# Build for production
npm run build

# Run tests
npm run test

# Build distributables
npm run dist
```

## Architecture

The application follows a multi-process architecture:

1. **Main Process**: Handles file system operations, window management, and system integration
2. **Renderer Process**: React application providing the UI
3. **AI Service Layer**: Manages communication with Gemini API
4. **Agent System**: Orchestrates multiple AI agents for complex tasks

### State Management

- **geminiStore**: Manages AI-related state (messages, agents, settings)
- **fileStore**: Manages file system and editor state

### Security

- API keys are stored securely using electron-store
- Context isolation is enabled for security
- All file system operations go through the main process

## Configuration

Settings are persisted and include:

- Gemini API key
- Selected AI model
- Workspace path
- Editor preferences (font size, tab size, auto-save)
- Theme (light/dark)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by [gemini-cli](https://github.com/google-gemini/gemini-cli)
- Built with love for the AI development community