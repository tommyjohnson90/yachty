import Anthropic from '@anthropic-ai/sdk'

// Singleton instance
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

// Helper function for streaming chat completions
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

// Helper for streaming responses
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
