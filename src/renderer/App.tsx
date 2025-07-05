import React, { useState, useEffect } from 'react'
import { Box, AppBar, Toolbar, IconButton, Typography } from '@mui/material'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import MenuIcon from '@mui/icons-material/Menu'
import SettingsIcon from '@mui/icons-material/Settings'
import { FileExplorer } from './components/FileExplorer'
import { CodeEditor } from './components/CodeEditor'
import { ChatPanel } from './components/ChatPanel'
import { Terminal } from './components/Terminal'
import { AgentManager } from './components/AgentManager'
import { SettingsDialog } from './components/SettingsDialog'
import { useGeminiStore } from './stores/geminiStore'
import { useFileStore } from './stores/fileStore'

const App: React.FC = () => {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [showSidebar, setShowSidebar] = useState(true)
  const { initialize } = useGeminiStore()
  const { currentFile } = useFileStore()

  useEffect(() => {
    // Initialize the app
    initialize()
  }, [initialize])

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* App Bar */}
      <AppBar position="static" sx={{ bgcolor: '#2d2d30' }}>
        <Toolbar variant="dense">
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={() => setShowSidebar(!showSidebar)}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Gemini GUI
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>
            {currentFile || 'No file open'}
          </Typography>
          <IconButton color="inherit" onClick={() => setSettingsOpen(true)}>
            <SettingsIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        <PanelGroup direction="horizontal">
          {/* Sidebar */}
          {showSidebar && (
            <>
              <Panel defaultSize={20} minSize={15} maxSize={30}>
                <FileExplorer />
              </Panel>
              <PanelResizeHandle className="resize-handle" />
            </>
          )}

          {/* Editor and Terminal */}
          <Panel defaultSize={50}>
            <PanelGroup direction="vertical">
              <Panel defaultSize={70}>
                <CodeEditor />
              </Panel>
              <PanelResizeHandle className="resize-handle" />
              <Panel defaultSize={30} minSize={10}>
                <Terminal />
              </Panel>
            </PanelGroup>
          </Panel>

          <PanelResizeHandle className="resize-handle" />

          {/* Chat and Agents Panel */}
          <Panel defaultSize={30} minSize={20} maxSize={50}>
            <PanelGroup direction="vertical">
              <Panel defaultSize={70}>
                <ChatPanel />
              </Panel>
              <PanelResizeHandle className="resize-handle" />
              <Panel defaultSize={30} minSize={15}>
                <AgentManager />
              </Panel>
            </PanelGroup>
          </Panel>
        </PanelGroup>
      </Box>

      {/* Settings Dialog */}
      <SettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </Box>
  )
}

export default App