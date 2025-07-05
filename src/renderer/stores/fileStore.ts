import { create } from 'zustand'
import { FileItem, EditorTab } from '@shared/types'
import '../types/electron'

interface FileStore {
  // State
  workspacePath: string
  fileTree: FileItem[]
  openTabs: EditorTab[]
  activeTabId: string | null
  currentFile: string | null
  
  // Actions
  setWorkspacePath: (path: string) => Promise<void>
  loadFileTree: () => Promise<void>
  openFile: (path: string) => Promise<void>
  closeTab: (tabId: string) => void
  setActiveTab: (tabId: string) => void
  updateTabContent: (tabId: string, content: string) => void
  saveFile: (tabId: string) => Promise<void>
  saveAllFiles: () => Promise<void>
  createNewFile: (path: string) => Promise<void>
  deleteFile: (path: string) => Promise<void>
}

export const useFileStore = create<FileStore>((set, get) => ({
  // Initial state
  workspacePath: '',
  fileTree: [],
  openTabs: [],
  activeTabId: null,
  currentFile: null,

  // Set workspace path
  setWorkspacePath: async (path: string) => {
    await window.electronAPI.setWorkspacePath(path)
    set({ workspacePath: path })
    await get().loadFileTree()
  },

  // Load file tree
  loadFileTree: async () => {
    const { workspacePath } = get()
    if (!workspacePath) return

    const loadDirectory = async (dirPath: string): Promise<FileItem[]> => {
      const result = await window.electronAPI.listDirectory(dirPath)
      if (!result.success || !result.items) return []

      const items: FileItem[] = []
      for (const item of result.items) {
        const fileItem: FileItem = {
          name: item.name,
          path: item.path,
          isDirectory: item.isDirectory
        }

        if (item.isDirectory && !item.name.startsWith('.') && item.name !== 'node_modules') {
          fileItem.children = await loadDirectory(item.path)
        }

        items.push(fileItem)
      }

      return items.sort((a, b) => {
        if (a.isDirectory && !b.isDirectory) return -1
        if (!a.isDirectory && b.isDirectory) return 1
        return a.name.localeCompare(b.name)
      })
    }

    const tree = await loadDirectory(workspacePath)
    set({ fileTree: tree })
  },

  // Open a file
  openFile: async (path: string) => {
    const { openTabs } = get()
    
    // Check if file is already open
    const existingTab = openTabs.find(tab => tab.path === path)
    if (existingTab) {
      set({ activeTabId: existingTab.id, currentFile: path })
      return
    }

    // Read file content
    const result = await window.electronAPI.readFile(path)
    if (!result.success || !result.content) {
      console.error('Failed to read file:', result.error)
      return
    }

    // Detect language from file extension
    const extension = path.split('.').pop() || ''
    const languageMap: Record<string, string> = {
      js: 'javascript',
      jsx: 'javascript',
      ts: 'typescript',
      tsx: 'typescript',
      py: 'python',
      html: 'html',
      css: 'css',
      json: 'json',
      md: 'markdown',
      yml: 'yaml',
      yaml: 'yaml',
      xml: 'xml',
      sql: 'sql',
      sh: 'shell',
      bash: 'shell'
    }

    const language = languageMap[extension] || 'plaintext'

    // Create new tab
    const newTab: EditorTab = {
      id: `tab-${Date.now()}`,
      path,
      content: result.content,
      language,
      isDirty: false
    }

    set({
      openTabs: [...openTabs, newTab],
      activeTabId: newTab.id,
      currentFile: path
    })
  },

  // Close a tab
  closeTab: (tabId: string) => {
    const { openTabs, activeTabId } = get()
    const tabIndex = openTabs.findIndex(tab => tab.id === tabId)
    
    if (tabIndex === -1) return

    const newTabs = openTabs.filter(tab => tab.id !== tabId)
    
    let newActiveTabId = activeTabId
    if (activeTabId === tabId) {
      if (newTabs.length > 0) {
        // Activate the tab that was next to the closed one
        const newIndex = Math.min(tabIndex, newTabs.length - 1)
        newActiveTabId = newTabs[newIndex].id
      } else {
        newActiveTabId = null
      }
    }

    set({
      openTabs: newTabs,
      activeTabId: newActiveTabId,
      currentFile: newActiveTabId ? newTabs.find(t => t.id === newActiveTabId)?.path || null : null
    })
  },

  // Set active tab
  setActiveTab: (tabId: string) => {
    const { openTabs } = get()
    const tab = openTabs.find(t => t.id === tabId)
    if (tab) {
      set({ activeTabId: tabId, currentFile: tab.path })
    }
  },

  // Update tab content
  updateTabContent: (tabId: string, content: string) => {
    const { openTabs } = get()
    const updatedTabs = openTabs.map(tab =>
      tab.id === tabId ? { ...tab, content, isDirty: true } : tab
    )
    set({ openTabs: updatedTabs })
  },

  // Save a file
  saveFile: async (tabId: string) => {
    const { openTabs } = get()
    const tab = openTabs.find(t => t.id === tabId)
    
    if (!tab) return

    const result = await window.electronAPI.writeFile(tab.path, tab.content)
    if (result.success) {
      const updatedTabs = openTabs.map(t =>
        t.id === tabId ? { ...t, isDirty: false } : t
      )
      set({ openTabs: updatedTabs })
    } else {
      console.error('Failed to save file:', result.error)
    }
  },

  // Save all files
  saveAllFiles: async () => {
    const { openTabs } = get()
    const dirtyTabs = openTabs.filter(tab => tab.isDirty)
    
    for (const tab of dirtyTabs) {
      await get().saveFile(tab.id)
    }
  },

  // Create a new file
  createNewFile: async (path: string) => {
    const result = await window.electronAPI.writeFile(path, '')
    if (result.success) {
      await get().loadFileTree()
      await get().openFile(path)
    } else {
      console.error('Failed to create file:', result.error)
    }
  },

  // Delete a file
  deleteFile: async (path: string) => {
    // Note: This would need to be implemented in the main process
    // For now, we'll just reload the file tree
    await get().loadFileTree()
  }
}))