// File system types
export interface FileItem {
  name: string
  path: string
  isDirectory: boolean
  children?: FileItem[]
}

// Chat types
export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system' | 'agent'
  content: string
  timestamp: Date
  agentId?: string
  agentName?: string
  files?: string[]
  error?: boolean
}

// Agent types
export interface Agent {
  id: string
  name: string
  status: 'idle' | 'thinking' | 'working' | 'error'
  currentTask?: string
  messages: Message[]
  capabilities: string[]
  model: string
}

// Settings types
export interface Settings {
  theme: 'light' | 'dark'
  fontSize: number
  tabSize: number
  autoSave: boolean
  geminiModel: string
  apiKey?: string
  workspacePath?: string
}

// Editor types
export interface EditorTab {
  id: string
  path: string
  content: string
  language: string
  isDirty: boolean
}

// Terminal types
export interface TerminalSession {
  id: string
  cwd: string
  history: string[]
}