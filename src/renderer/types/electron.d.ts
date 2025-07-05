export interface ElectronAPI {
  getApiKey: () => Promise<string>
  setApiKey: (apiKey: string) => Promise<boolean>
  getWorkspacePath: () => Promise<string>
  setWorkspacePath: (path: string) => Promise<boolean>
  openFileDialog: () => Promise<{
    canceled: boolean
    filePaths: string[]
  }>
  openDirectoryDialog: () => Promise<{
    canceled: boolean
    filePaths: string[]
  }>
  saveFileDialog: (defaultPath?: string) => Promise<{
    canceled: boolean
    filePath?: string
  }>
  readFile: (filePath: string) => Promise<{ success: boolean; content?: string; error?: string }>
  writeFile: (filePath: string, content: string) => Promise<{ success: boolean; error?: string }>
  listDirectory: (dirPath: string) => Promise<{ 
    success: boolean; 
    items?: Array<{ name: string; isDirectory: boolean; path: string }>; 
    error?: string 
  }>
  executeCommand: (command: string, cwd?: string) => Promise<{ 
    success: boolean; 
    stdout?: string; 
    stderr?: string; 
    error?: string 
  }>
  getSettings: () => Promise<any>
  setSettings: (settings: any) => Promise<boolean>
  onTerminalData: (callback: (data: string) => void) => void
  sendTerminalInput: (data: string) => void
  onAgentMessage: (callback: (message: any) => void) => void
  sendAgentMessage: (agentId: string, message: any) => void
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}