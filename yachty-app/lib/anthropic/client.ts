import { query, type SDKMessage } from '@anthropic-ai/claude-agent-sdk'
import Anthropic from '@anthropic-ai/sdk'

// Keep the standard Anthropic client for image analysis
let anthropicClient: Anthropic | null = null

export function getAnthropicClient(): Anthropic {
  if (!anthropicClient) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is not set')
    }

    anthropicClient = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })
  }

  return anthropicClient
}

// Model configurations per PRD
export const ANTHROPIC_MODELS = {
  // Claude Sonnet 4.5 - Primary assistant for complex queries
  SONNET: 'claude-sonnet-4-20250514',

  // Claude Haiku 4.5 - Fast operations (receipts, quick lookups)
  HAIKU: 'claude-haiku-4-20250514',
} as const

export type AnthropicModel = (typeof ANTHROPIC_MODELS)[keyof typeof ANTHROPIC_MODELS]

// Agent SDK-based chat completion with skills and tools support
export async function createAgentChatCompletion({
  messages,
  system,
  maxTurns = 10,
  allowedTools,
}: {
  messages: { role: 'user' | 'assistant'; content: string }[]
  system?: string
  maxTurns?: number
  allowedTools?: string[]
}) {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not set')
  }

  // Build the prompt from message history
  const conversationContext = messages
    .map((msg) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
    .join('\n\n')

  const fullPrompt = system
    ? `${system}\n\nConversation:\n${conversationContext}`
    : conversationContext

  let result = ''
  const textChunks: string[] = []

  // Use the agent SDK query function
  for await (const message of query({
    prompt: fullPrompt,
    options: {
      maxTurns,
      allowedTools: allowedTools || ['WebSearch', 'WebFetch', 'Read', 'Grep', 'Glob'],
    },
  })) {
    // Collect text from assistant messages during streaming
    if (message.type === 'assistant') {
      for (const block of message.message.content) {
        if (block.type === 'text') {
          textChunks.push(block.text)
        }
      }
    }

    // Get final result when query completes
    if (message.type === 'result' && message.subtype === 'success') {
      result = message.result
    }
  }

  // Use the final result if available, otherwise concatenate text chunks
  const finalText = result || textChunks.join('')

  return {
    content: [{ type: 'text' as const, text: finalText }],
  }
}

// Streaming version for agent chat completion
export async function* streamAgentChatCompletion({
  messages,
  system,
  maxTurns = 10,
  allowedTools,
}: {
  messages: { role: 'user' | 'assistant'; content: string }[]
  system?: string
  maxTurns?: number
  allowedTools?: string[]
}) {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not set')
  }

  // Build the prompt from message history
  const conversationContext = messages
    .map((msg) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
    .join('\n\n')

  const fullPrompt = system
    ? `${system}\n\nConversation:\n${conversationContext}`
    : conversationContext

  // Stream messages from the agent SDK
  for await (const message of query({
    prompt: fullPrompt,
    options: {
      maxTurns,
      allowedTools: allowedTools || ['WebSearch', 'WebFetch', 'Read', 'Grep', 'Glob'],
    },
  })) {
    yield message
  }
}

// Legacy function for backward compatibility (delegates to standard SDK)
export async function createChatCompletion({
  model = ANTHROPIC_MODELS.SONNET,
  messages,
  system,
  maxTokens = 4096,
  temperature = 1.0,
  tools,
}: {
  model?: AnthropicModel
  messages: Anthropic.MessageParam[]
  system?: string
  maxTokens?: number
  temperature?: number
  tools?: Anthropic.Tool[]
}) {
  const client = getAnthropicClient()

  return await client.messages.create({
    model,
    max_tokens: maxTokens,
    temperature,
    system,
    messages,
    tools,
  })
}

// Legacy streaming function for backward compatibility
export async function* streamChatCompletion({
  model = ANTHROPIC_MODELS.SONNET,
  messages,
  system,
  maxTokens = 4096,
  temperature = 1.0,
  tools,
}: {
  model?: AnthropicModel
  messages: Anthropic.MessageParam[]
  system?: string
  maxTokens?: number
  temperature?: number
  tools?: Anthropic.Tool[]
}) {
  const client = getAnthropicClient()

  const stream = client.messages.stream({
    model,
    max_tokens: maxTokens,
    temperature,
    system,
    messages,
    tools,
  })

  for await (const chunk of stream) {
    yield chunk
  }
}

// Vision analysis for receipt processing
export async function analyzeImage({
  imageData,
  prompt,
  model = ANTHROPIC_MODELS.HAIKU,
}: {
  imageData: string // Base64 encoded image
  prompt: string
  model?: AnthropicModel
}) {
  const client = getAnthropicClient()

  return await client.messages.create({
    model,
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: 'image/jpeg',
              data: imageData,
            },
          },
          {
            type: 'text',
            text: prompt,
          },
        ],
      },
    ],
  })
}
