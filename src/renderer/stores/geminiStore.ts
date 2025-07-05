import { create } from 'zustand'
import { Message, Agent, Settings } from '@shared/types'
import { geminiService } from '../services/geminiService'

interface GeminiStore {
  // State
  messages: Message[]
  agents: Agent[]
  isLoading: boolean
  error: string | null
  settings: Settings
  initialized: boolean
  
  // Actions
  initialize: () => Promise<void>
  sendMessage: (content: string) => Promise<void>
  createAgent: (name: string, capabilities: string[]) => Promise<Agent>
  sendAgentMessage: (agentId: string, message: string) => Promise<void>
  deleteAgent: (agentId: string) => void
  updateSettings: (settings: Partial<Settings>) => Promise<void>
  clearError: () => void
  clearMessages: () => void
}

export const useGeminiStore = create<GeminiStore>((set, get) => ({
  // Initial state
  messages: [],
  agents: [],
  isLoading: false,
  error: null,
  settings: {
    theme: 'dark',
    fontSize: 14,
    tabSize: 2,
    autoSave: true,
    geminiModel: 'gemini-2.0-flash-exp'
  },
  initialized: false,

  // Initialize the store
  initialize: async () => {
    try {
      // Get settings from electron store
      const savedSettings = await window.electronAPI.getSettings()
      const apiKey = await window.electronAPI.getApiKey()
      
      set({ settings: { ...savedSettings, apiKey } })

      if (apiKey) {
        await geminiService.initialize(apiKey, savedSettings.geminiModel)
        set({ initialized: true })
      }
    } catch (error) {
      set({ error: (error as Error).message })
    }
  },

  // Send a message to the main Gemini instance
  sendMessage: async (content: string) => {
    const { messages } = get()
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date()
    }

    set({ 
      messages: [...messages, userMessage],
      isLoading: true,
      error: null
    })

    try {
      const response = await geminiService.sendMessage([...messages, userMessage])
      
      const assistantMessage: Message = {
        id: `msg-${Date.now()}-resp`,
        role: 'assistant',
        content: response,
        timestamp: new Date()
      }

      set({
        messages: [...get().messages, assistantMessage],
        isLoading: false
      })
    } catch (error) {
      set({
        error: (error as Error).message,
        isLoading: false
      })
    }
  },

  // Create a new agent
  createAgent: async (name: string, capabilities: string[]) => {
    const systemPrompt = `You are ${name}, a specialized AI agent focused on ${capabilities.join(', ')}.`
    
    try {
      const agent = await geminiService.createAgent(name, capabilities, systemPrompt)
      set({ agents: [...get().agents, agent] })
      return agent
    } catch (error) {
      set({ error: (error as Error).message })
      throw error
    }
  },

  // Send a message to a specific agent
  sendAgentMessage: async (agentId: string, message: string) => {
    const { agents } = get()
    const agent = agents.find(a => a.id === agentId)
    
    if (!agent) {
      set({ error: 'Agent not found' })
      return
    }

    set({ isLoading: true, error: null })

    try {
      const response = await geminiService.sendAgentMessage(agent, message)
      
      // Update the agent in the store
      const updatedAgents = agents.map(a => 
        a.id === agentId ? agent : a
      )
      
      set({
        agents: updatedAgents,
        isLoading: false
      })

      // Also add to main messages for visibility
      const agentResponseMessage: Message = {
        id: `msg-${Date.now()}-agent`,
        role: 'agent',
        content: response,
        timestamp: new Date(),
        agentId: agent.id,
        agentName: agent.name
      }

      set({
        messages: [...get().messages, agentResponseMessage]
      })
    } catch (error) {
      set({
        error: (error as Error).message,
        isLoading: false
      })
    }
  },

  // Delete an agent
  deleteAgent: (agentId: string) => {
    const { agents } = get()
    set({ agents: agents.filter(a => a.id !== agentId) })
  },

  // Update settings
  updateSettings: async (newSettings: Partial<Settings>) => {
    const { settings } = get()
    const updatedSettings = { ...settings, ...newSettings }
    
    try {
      await window.electronAPI.setSettings(updatedSettings)
      
      if (newSettings.apiKey) {
        await window.electronAPI.setApiKey(newSettings.apiKey)
        await geminiService.initialize(newSettings.apiKey, updatedSettings.geminiModel)
      }
      
      if (newSettings.geminiModel && settings.apiKey) {
        geminiService.setModel(newSettings.geminiModel)
      }
      
      set({ settings: updatedSettings })
    } catch (error) {
      set({ error: (error as Error).message })
    }
  },

  // Clear error
  clearError: () => set({ error: null }),

  // Clear messages
  clearMessages: () => set({ messages: [] })
}))