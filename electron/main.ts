import { app, BrowserWindow, ipcMain, shell, dialog } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'
import Store from 'electron-store'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const store = new Store()

let mainWindow: BrowserWindow | null = null
let isDev = process.argv.includes('--dev')

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    titleBarStyle: 'hiddenInset',
    frame: process.platform !== 'darwin',
    icon: path.join(__dirname, '../public/icon.png')
  })

  // Load the app
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null
  })

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })
}

// App event handlers
app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// IPC handlers for main process operations
ipcMain.handle('get-api-key', () => {
  return store.get('geminiApiKey', '')
})

ipcMain.handle('set-api-key', (_, apiKey: string) => {
  store.set('geminiApiKey', apiKey)
  return true
})

ipcMain.handle('get-workspace-path', () => {
  return store.get('workspacePath', '')
})

ipcMain.handle('set-workspace-path', (_, workspacePath: string) => {
  store.set('workspacePath', workspacePath)
  return true
})

ipcMain.handle('open-file-dialog', async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    properties: ['openFile', 'multiSelections']
  })
  return result
})

ipcMain.handle('open-directory-dialog', async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    properties: ['openDirectory']
  })
  return result
})

ipcMain.handle('save-file-dialog', async (_, defaultPath?: string) => {
  const result = await dialog.showSaveDialog(mainWindow!, {
    defaultPath
  })
  return result
})

// Handle file system operations
ipcMain.handle('read-file', async (_, filePath: string) => {
  const fs = await import('fs/promises')
  try {
    const content = await fs.readFile(filePath, 'utf-8')
    return { success: true, content }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
})

ipcMain.handle('write-file', async (_, filePath: string, content: string) => {
  const fs = await import('fs/promises')
  try {
    await fs.writeFile(filePath, content, 'utf-8')
    return { success: true }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
})

ipcMain.handle('list-directory', async (_, dirPath: string) => {
  const fs = await import('fs/promises')
  try {
    const items = await fs.readdir(dirPath, { withFileTypes: true })
    return {
      success: true,
      items: items.map(item => ({
        name: item.name,
        isDirectory: item.isDirectory(),
        path: path.join(dirPath, item.name)
      }))
    }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
})

// Terminal operations
ipcMain.handle('execute-command', async (_, command: string, cwd?: string) => {
  const { exec } = await import('child_process')
  const { promisify } = await import('util')
  const execAsync = promisify(exec)
  
  try {
    const { stdout, stderr } = await execAsync(command, { cwd })
    return { success: true, stdout, stderr }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
})

// Settings management
ipcMain.handle('get-settings', () => {
  return store.get('settings', {
    theme: 'dark',
    fontSize: 14,
    tabSize: 2,
    autoSave: true,
    geminiModel: 'gemini-2.0-flash-exp'
  })
})

ipcMain.handle('set-settings', (_, settings: any) => {
  store.set('settings', settings)
  return true
})