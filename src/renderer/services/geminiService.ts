import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai'
import { Message, Agent } from '@shared/types'

export class GeminiService {
  private genAI: GoogleGenerativeAI | null = null
  private model: GenerativeModel | null = null
  private apiKey: string = ''
  private modelName: string = 'gemini-2.0-flash-exp'

  async initialize(apiKey: string, modelName?: string) {
    this.apiKey = apiKey
    if (modelName) {
      this.modelName = modelName
    }
    
    if (!apiKey) {
      throw new Error('API key is required')
    }

    this.genAI = new GoogleGenerativeAI(apiKey)
    this.model = this.genAI.getGenerativeModel({ model: this.modelName })
  }

  async sendMessage(messages: Message[], systemPrompt?: string): Promise<string> {
    if (!this.model) {
      throw new Error('Gemini service not initialized')
    }

    // Convert messages to Gemini format
    const formattedMessages = messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }))

    // Add system prompt if provided
    if (systemPrompt) {
      formattedMessages.unshift({
        role: 'user',
        parts: [{ text: `System: ${systemPrompt}` }]
      })
    }

    try {
      const chat = this.model.startChat({
        history: formattedMessages.slice(0, -1),
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        },
      })

      const result = await chat.sendMessage(formattedMessages[formattedMessages.length - 1].parts[0].text)
      const response = await result.response
      return response.text()
    } catch (error) {
      console.error('Error sending message to Gemini:', error)
      throw error
    }
  }

  async createAgent(name: string, capabilities: string[], systemPrompt: string): Promise<Agent> {
    const agent: Agent = {
      id: `agent-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      status: 'idle',
      messages: [{
        id: `msg-${Date.now()}`,
        role: 'system',
        content: systemPrompt,
        timestamp: new Date()
      }],
      capabilities,
      model: this.modelName
    }

    return agent
  }

  async sendAgentMessage(agent: Agent, message: string): Promise<string> {
    if (!this.model) {
      throw new Error('Gemini service not initialized')
    }

    // Add user message to agent's history
    agent.messages.push({
      id: `msg-${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: new Date()
    })

    // Create specialized system prompt based on agent capabilities
    const systemPrompt = this.createAgentSystemPrompt(agent)

    try {
      agent.status = 'thinking'
      const response = await this.sendMessage(agent.messages, systemPrompt)
      
      // Add response to agent's history
      agent.messages.push({
        id: `msg-${Date.now()}-resp`,
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        agentId: agent.id,
        agentName: agent.name
      })

      agent.status = 'idle'
      return response
    } catch (error) {
      agent.status = 'error'
      throw error
    }
  }

  private createAgentSystemPrompt(agent: Agent): string {
    const capabilitiesStr = agent.capabilities.join(', ')
    return `You are ${agent.name}, a specialized AI agent with the following capabilities: ${capabilitiesStr}. 
    Focus on these capabilities and provide expert assistance within your domain. 
    Collaborate with other agents when tasks fall outside your expertise.
    Always be clear about what you can and cannot do.`
  }

  async analyzeCode(code: string, language: string): Promise<string> {
    const prompt = `Analyze the following ${language} code and provide insights:
    - Code quality and best practices
    - Potential bugs or issues
    - Performance considerations
    - Suggestions for improvements
    
    Code:
    \`\`\`${language}
    ${code}
    \`\`\`
    `

    return this.sendMessage([{
      id: `msg-${Date.now()}`,
      role: 'user',
      content: prompt,
      timestamp: new Date()
    }])
  }

  async generateCode(prompt: string, language: string, context?: string): Promise<string> {
    const fullPrompt = `Generate ${language} code for the following request:
    ${prompt}
    
    ${context ? `Context:\n${context}\n` : ''}
    
    Please provide clean, well-commented code that follows best practices.
    Include any necessary imports or dependencies.`

    return this.sendMessage([{
      id: `msg-${Date.now()}`,
      role: 'user',
      content: fullPrompt,
      timestamp: new Date()
    }])
  }

  async explainCode(code: string, language: string): Promise<string> {
    const prompt = `Explain the following ${language} code in detail:
    - What does it do?
    - How does it work?
    - Key concepts used
    
    Code:
    \`\`\`${language}
    ${code}
    \`\`\`
    `

    return this.sendMessage([{
      id: `msg-${Date.now()}`,
      role: 'user',
      content: prompt,
      timestamp: new Date()
    }])
  }

  async refactorCode(code: string, language: string, requirements?: string): Promise<string> {
    const prompt = `Refactor the following ${language} code:
    ${requirements ? `Requirements: ${requirements}` : 'Improve code quality, readability, and performance.'}
    
    Original code:
    \`\`\`${language}
    ${code}
    \`\`\`
    
    Provide the refactored code with explanations for the changes made.`

    return this.sendMessage([{
      id: `msg-${Date.now()}`,
      role: 'user',
      content: prompt,
      timestamp: new Date()
    }])
  }

  getAvailableModels(): string[] {
    return [
      'gemini-2.0-flash-exp',
      'gemini-1.5-flash',
      'gemini-1.5-pro',
      'gemini-pro'
    ]
  }

  getCurrentModel(): string {
    return this.modelName
  }

  setModel(modelName: string) {
    this.modelName = modelName
    if (this.genAI && this.apiKey) {
      this.model = this.genAI.getGenerativeModel({ model: modelName })
    }
  }
}

// Export singleton instance
export const geminiService = new GeminiService()