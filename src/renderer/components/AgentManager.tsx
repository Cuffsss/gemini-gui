import React, { useState } from 'react'
import {
  Box,
  Typography,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  OutlinedInput
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import ChatIcon from '@mui/icons-material/Chat'
import { useGeminiStore } from '../stores/geminiStore'

const AVAILABLE_CAPABILITIES = [
  'Code Generation',
  'Code Review',
  'Testing',
  'Documentation',
  'Debugging',
  'Architecture Design',
  'Database Design',
  'API Design',
  'UI/UX Design',
  'Performance Optimization',
  'Security Analysis',
  'DevOps',
  'Project Management'
]

export const AgentManager: React.FC = () => {
  const { agents, createAgent, deleteAgent, sendAgentMessage } = useGeminiStore()
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [chatDialogOpen, setChatDialogOpen] = useState(false)
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null)
  const [agentName, setAgentName] = useState('')
  const [selectedCapabilities, setSelectedCapabilities] = useState<string[]>([])
  const [chatInput, setChatInput] = useState('')

  const handleCreateAgent = async () => {
    if (!agentName.trim() || selectedCapabilities.length === 0) return

    await createAgent(agentName, selectedCapabilities)
    setCreateDialogOpen(false)
    setAgentName('')
    setSelectedCapabilities([])
  }

  const handleCapabilityChange = (event: SelectChangeEvent<typeof selectedCapabilities>) => {
    const value = event.target.value
    setSelectedCapabilities(typeof value === 'string' ? value.split(',') : value)
  }

  const handleOpenChat = (agentId: string) => {
    setSelectedAgentId(agentId)
    setChatDialogOpen(true)
  }

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !selectedAgentId) return

    await sendAgentMessage(selectedAgentId, chatInput)
    setChatInput('')
  }

  const selectedAgent = agents.find(a => a.id === selectedAgentId)

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{
        p: 2,
        borderBottom: 1,
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Typography variant="h6">AI Agents</Typography>
        <IconButton size="small" onClick={() => setCreateDialogOpen(true)}>
          <AddIcon />
        </IconButton>
      </Box>

      {/* Agent List */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {agents.length === 0 ? (
          <Box sx={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column'
          }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              No agents created yet
            </Typography>
            <Button
              variant="outlined"
              size="small"
              startIcon={<AddIcon />}
              onClick={() => setCreateDialogOpen(true)}
            >
              Create Agent
            </Button>
          </Box>
        ) : (
          <List>
            {agents.map(agent => (
              <ListItem key={agent.id} sx={{ mb: 1, bgcolor: 'background.paper', borderRadius: 1 }}>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle1">{agent.name}</Typography>
                      {agent.status === 'working' && <CircularProgress size={16} />}
                    </Box>
                  }
                  secondary={
                    <Box sx={{ mt: 0.5 }}>
                      {agent.capabilities.map(cap => (
                        <Chip
                          key={cap}
                          label={cap}
                          size="small"
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                      ))}
                      {agent.currentTask && (
                        <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                          Current task: {agent.currentTask}
                        </Typography>
                      )}
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton edge="end" onClick={() => handleOpenChat(agent.id)}>
                    <ChatIcon />
                  </IconButton>
                  <IconButton edge="end" onClick={() => deleteAgent(agent.id)}>
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </Box>

      {/* Create Agent Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Agent</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Agent Name"
            fullWidth
            variant="outlined"
            value={agentName}
            onChange={(e) => setAgentName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth>
            <InputLabel>Capabilities</InputLabel>
            <Select
              multiple
              value={selectedCapabilities}
              onChange={handleCapabilityChange}
              input={<OutlinedInput label="Capabilities" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} size="small" />
                  ))}
                </Box>
              )}
            >
              {AVAILABLE_CAPABILITIES.map((capability) => (
                <MenuItem key={capability} value={capability}>
                  {capability}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleCreateAgent}
            variant="contained"
            disabled={!agentName.trim() || selectedCapabilities.length === 0}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Chat Dialog */}
      <Dialog open={chatDialogOpen} onClose={() => setChatDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Chat with {selectedAgent?.name}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ height: 400, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ flex: 1, overflow: 'auto', mb: 2 }}>
              {selectedAgent?.messages.filter(m => m.role !== 'system').map(message => (
                <Box
                  key={message.id}
                  sx={{
                    mb: 1,
                    p: 1,
                    bgcolor: message.role === 'user' ? 'primary.dark' : 'background.paper',
                    borderRadius: 1
                  }}
                >
                  <Typography variant="body2">{message.content}</Typography>
                </Box>
              ))}
            </Box>
            <TextField
              fullWidth
              multiline
              rows={2}
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask the agent..."
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setChatDialogOpen(false)}>Close</Button>
          <Button
            onClick={handleSendMessage}
            variant="contained"
            disabled={!chatInput.trim()}
          >
            Send
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}