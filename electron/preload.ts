import { contextBridge, ipcRenderer } from 'electron'

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // API Key management
  getApiKey: () => ipcRenderer.invoke('get-api-key'),
  setApiKey: (apiKey: string) => ipcRenderer.invoke('set-api-key', apiKey),
  
  // Workspace management
  getWorkspacePath: () => ipcRenderer.invoke('get-workspace-path'),
  setWorkspacePath: (path: string) => ipcRenderer.invoke('set-workspace-path', path),
  
  // File dialogs
  openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),
  openDirectoryDialog: () => ipcRenderer.invoke('open-directory-dialog'),
  saveFileDialog: (defaultPath?: string) => ipcRenderer.invoke('save-file-dialog', defaultPath),
  
  // File operations
  readFile: (filePath: string) => ipcRenderer.invoke('read-file', filePath),
  writeFile: (filePath: string, content: string) => ipcRenderer.invoke('write-file', filePath, content),
  listDirectory: (dirPath: string) => ipcRenderer.invoke('list-directory', dirPath),
  
  // Terminal operations
  executeCommand: (command: string, cwd?: string) => ipcRenderer.invoke('execute-command', command, cwd),
  
  // Settings
  getSettings: () => ipcRenderer.invoke('get-settings'),
  setSettings: (settings: any) => ipcRenderer.invoke('set-settings', settings),
  
  // Terminal events
  onTerminalData: (callback: (data: string) => void) => {
    ipcRenderer.on('terminal-data', (_, data) => callback(data))
  },
  
  sendTerminalInput: (data: string) => {
    ipcRenderer.send('terminal-input', data)
  },
  
  // Agent communication
  onAgentMessage: (callback: (message: any) => void) => {
    ipcRenderer.on('agent-message', (_, message) => callback(message))
  },
  
  sendAgentMessage: (agentId: string, message: any) => {
    ipcRenderer.send('agent-message', { agentId, message })
  }
})

// Add TypeScript declarations
declare global {
  interface Window {
    electronAPI: {
      getApiKey: () => Promise<string>
      setApiKey: (apiKey: string) => Promise<boolean>
      getWorkspacePath: () => Promise<string>
      setWorkspacePath: (path: string) => Promise<boolean>
      openFileDialog: () => Promise<Electron.OpenDialogReturnValue>
      openDirectoryDialog: () => Promise<Electron.OpenDialogReturnValue>
      saveFileDialog: (defaultPath?: string) => Promise<Electron.SaveDialogReturnValue>
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
  }
}