import React, { useState, useRef, useEffect } from 'react'
import { 
  Box, 
  TextField, 
  IconButton, 
  Typography, 
  Paper,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material'
import SendIcon from '@mui/icons-material/Send'
import ClearIcon from '@mui/icons-material/Clear'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useGeminiStore } from '../stores/geminiStore'
import { Message } from '@shared/types'

export const ChatPanel: React.FC = () => {
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { messages, isLoading, error, sendMessage, clearMessages, clearError, initialized } = useGeminiStore()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading || !initialized) return

    const message = input.trim()
    setInput('')
    await sendMessage(message)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const renderMessage = (message: Message) => {
    const isUser = message.role === 'user'
    const isAgent = message.role === 'agent'

    return (
      <Box
        key={message.id}
        sx={{
          display: 'flex',
          justifyContent: isUser ? 'flex-end' : 'flex-start',
          mb: 2
        }}
      >
        <Paper
          elevation={1}
          sx={{
            maxWidth: '80%',
            p: 2,
            bgcolor: isUser ? 'primary.dark' : 'background.paper',
            borderRadius: 2
          }}
        >
          {isAgent && (
            <Box sx={{ mb: 1 }}>
              <Chip 
                label={message.agentName} 
                size="small" 
                color="secondary"
                sx={{ mb: 0.5 }}
              />
            </Box>
          )}
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={{
              code: ({ node, inline, className, children, ...props }) => {
                const match = /language-(\w+)/.exec(className || '')
                return !inline && match ? (
                  <Box
                    component="pre"
                    sx={{
                      bgcolor: 'background.default',
                      p: 1,
                      borderRadius: 1,
                      overflow: 'auto',
                      fontSize: '0.875rem',
                      fontFamily: 'monospace'
                    }}
                  >
                    <code className={className} {...props}>
                      {children}
                    </code>
                  </Box>
                ) : (
                  <code 
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      padding: '2px 4px',
                      borderRadius: '3px',
                      fontFamily: 'monospace',
                      fontSize: '0.875em'
                    }}
                    {...props}
                  >
                    {children}
                  </code>
                )
              }
            }}
          >
            {message.content}
          </ReactMarkdown>
          <Typography 
            variant="caption" 
            sx={{ 
              display: 'block', 
              mt: 1, 
              opacity: 0.7 
            }}
          >
            {formatTime(message.timestamp)}
          </Typography>
        </Paper>
      </Box>
    )
  }

  if (!initialized) {
    return (
      <Box sx={{ 
        height: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        flexDirection: 'column',
        p: 3
      }}>
        <Typography variant="h6" gutterBottom>
          Welcome to Gemini GUI
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center">
          Please set your Gemini API key in Settings to start chatting
        </Typography>
      </Box>
    )
  }

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
        <Typography variant="h6">AI Chat</Typography>
        <IconButton 
          size="small" 
          onClick={clearMessages}
          disabled={messages.length === 0}
        >
          <ClearIcon />
        </IconButton>
      </Box>

      {/* Messages */}
      <Box sx={{ 
        flex: 1, 
        overflow: 'auto', 
        p: 2,
        bgcolor: 'background.default'
      }}>
        {error && (
          <Alert 
            severity="error" 
            onClose={clearError}
            sx={{ mb: 2 }}
          >
            {error}
          </Alert>
        )}
        
        {messages.length === 0 ? (
          <Box sx={{ 
            height: '100%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            <Typography variant="body2" color="text.secondary">
              Start a conversation with Gemini...
            </Typography>
          </Box>
        ) : (
          <>
            {messages.map(renderMessage)}
            {isLoading && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
                <Paper elevation={1} sx={{ p: 2, bgcolor: 'background.paper' }}>
                  <CircularProgress size={20} />
                </Paper>
              </Box>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </Box>

      {/* Input */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton size="small" disabled>
            <AttachFileIcon />
          </IconButton>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask Gemini anything..."
            disabled={isLoading || !initialized}
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2
              }
            }}
          />
          <IconButton 
            color="primary" 
            onClick={handleSend}
            disabled={!input.trim() || isLoading || !initialized}
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Box>
    </Box>
  )
}