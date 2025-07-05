import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  Switch,
  FormControlLabel,
  Divider
} from '@mui/material'
import FolderOpenIcon from '@mui/icons-material/FolderOpen'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import { useGeminiStore } from '../stores/geminiStore'
import { useFileStore } from '../stores/fileStore'
import { geminiService } from '../services/geminiService'

interface SettingsDialogProps {
  open: boolean
  onClose: () => void
}

export const SettingsDialog: React.FC<SettingsDialogProps> = ({ open, onClose }) => {
  const { settings, updateSettings } = useGeminiStore()
  const { setWorkspacePath } = useFileStore()
  const [localSettings, setLocalSettings] = useState(settings)
  const [showApiKey, setShowApiKey] = useState(false)
  const [testingApi, setTestingApi] = useState(false)
  const [apiTestResult, setApiTestResult] = useState<{ success: boolean; message: string } | null>(null)

  useEffect(() => {
    setLocalSettings(settings)
  }, [settings])

  const handleSave = async () => {
    await updateSettings(localSettings)
    onClose()
  }

  const handleWorkspaceSelect = async () => {
    const result = await window.electronAPI.openDirectoryDialog()
    if (!result.canceled && result.filePaths.length > 0) {
      const path = result.filePaths[0]
      setLocalSettings({ ...localSettings, workspacePath: path })
      await setWorkspacePath(path)
    }
  }

  const handleTestApi = async () => {
    if (!localSettings.apiKey) {
      setApiTestResult({ success: false, message: 'API key is required' })
      return
    }

    setTestingApi(true)
    setApiTestResult(null)

    try {
      await geminiService.initialize(localSettings.apiKey, localSettings.geminiModel)
      const response = await geminiService.sendMessage([{
        id: 'test',
        role: 'user',
        content: 'Hello, please respond with "API connection successful"',
        timestamp: new Date()
      }])
      
      if (response.toLowerCase().includes('api connection successful')) {
        setApiTestResult({ success: true, message: 'API connection successful!' })
      } else {
        setApiTestResult({ success: true, message: 'API is working' })
      }
    } catch (error) {
      setApiTestResult({ 
        success: false, 
        message: `Failed to connect: ${(error as Error).message}` 
      })
    } finally {
      setTestingApi(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Settings</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {/* API Settings */}
          <Typography variant="h6" gutterBottom>
            Gemini API Configuration
          </Typography>
          
          <TextField
            fullWidth
            label="API Key"
            type={showApiKey ? 'text' : 'password'}
            value={localSettings.apiKey || ''}
            onChange={(e) => setLocalSettings({ ...localSettings, apiKey: e.target.value })}
            margin="normal"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowApiKey(!showApiKey)}
                    edge="end"
                  >
                    {showApiKey ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              )
            }}
            helperText="Get your API key from Google AI Studio"
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Gemini Model</InputLabel>
            <Select
              value={localSettings.geminiModel}
              onChange={(e) => setLocalSettings({ ...localSettings, geminiModel: e.target.value })}
              label="Gemini Model"
            >
              {geminiService.getAvailableModels().map(model => (
                <MenuItem key={model} value={model}>
                  {model}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button 
            variant="outlined" 
            onClick={handleTestApi}
            disabled={!localSettings.apiKey || testingApi}
            sx={{ mt: 1 }}
          >
            {testingApi ? 'Testing...' : 'Test API Connection'}
          </Button>

          {apiTestResult && (
            <Alert 
              severity={apiTestResult.success ? 'success' : 'error'} 
              sx={{ mt: 1 }}
            >
              {apiTestResult.message}
            </Alert>
          )}

          <Divider sx={{ my: 3 }} />

          {/* Workspace Settings */}
          <Typography variant="h6" gutterBottom>
            Workspace
          </Typography>
          
          <TextField
            fullWidth
            label="Workspace Path"
            value={localSettings.workspacePath || ''}
            margin="normal"
            InputProps={{
              readOnly: true,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleWorkspaceSelect} edge="end">
                    <FolderOpenIcon />
                  </IconButton>
                </InputAdornment>
              )
            }}
            helperText="Select the root folder of your project"
          />

          <Divider sx={{ my: 3 }} />

          {/* Editor Settings */}
          <Typography variant="h6" gutterBottom>
            Editor
          </Typography>

          <TextField
            type="number"
            label="Font Size"
            value={localSettings.fontSize}
            onChange={(e) => setLocalSettings({ 
              ...localSettings, 
              fontSize: parseInt(e.target.value) || 14 
            })}
            margin="normal"
            sx={{ mr: 2 }}
          />

          <TextField
            type="number"
            label="Tab Size"
            value={localSettings.tabSize}
            onChange={(e) => setLocalSettings({ 
              ...localSettings, 
              tabSize: parseInt(e.target.value) || 2 
            })}
            margin="normal"
          />

          <FormControlLabel
            control={
              <Switch
                checked={localSettings.autoSave}
                onChange={(e) => setLocalSettings({ 
                  ...localSettings, 
                  autoSave: e.target.checked 
                })}
              />
            }
            label="Auto Save"
            sx={{ mt: 2, display: 'block' }}
          />

          <Divider sx={{ my: 3 }} />

          {/* Appearance */}
          <Typography variant="h6" gutterBottom>
            Appearance
          </Typography>

          <FormControl fullWidth margin="normal">
            <InputLabel>Theme</InputLabel>
            <Select
              value={localSettings.theme}
              onChange={(e) => setLocalSettings({ 
                ...localSettings, 
                theme: e.target.value as 'light' | 'dark' 
              })}
              label="Theme"
            >
              <MenuItem value="dark">Dark</MenuItem>
              <MenuItem value="light">Light</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  )
}