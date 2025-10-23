import { createClient } from '@/lib/supabase/server'
import { createChatCompletion, ANTHROPIC_MODELS } from '@/lib/anthropic/client'
import { chatMessageSchema } from '@/lib/utils/validation'
import { NextRequest, NextResponse } from 'next/server'
import type { MessageParam } from '@anthropic-ai/sdk/resources/messages'

// POST /api/chat - Send a message and get AI response
export async function POST(request: NextRequest) {
  try {
    // DEVELOPMENT MODE: Use test user when auth is disabled
    const DEV_MODE = true
    const DEV_USER_ID = 'dd3d31db-ad83-4dde-b6b8-4900efcd25ec' // tommyjohnson90@gmail.com

    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Use dev user if in dev mode and no authenticated user
    const effectiveUser = DEV_MODE && !user
      ? { id: DEV_USER_ID, email: 'tommyjohnson90@gmail.com' }
      : user

    if (!effectiveUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { message, sessionId, activeBoatId, activeClientId } = body

    if (!message || !sessionId) {
      return NextResponse.json(
        { error: 'Message and session ID are required' },
        { status: 400 }
      )
    }

    // Validate and save user message
    const userMessageValidation = chatMessageSchema.safeParse({
      session_id: sessionId,
      user_id: effectiveUser.id,
      role: 'user',
      content: message,
      active_boat_id: activeBoatId,
      active_client_id: activeClientId,
    })

    if (!userMessageValidation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: userMessageValidation.error.issues },
        { status: 400 }
      )
    }

    // Save user message
    console.log('Saving user message:', userMessageValidation.data)
    const { data: userMessage, error: userMessageError } = await (supabase
      .from('chat_messages') as any)
      .insert(userMessageValidation.data)
      .select()
      .single()

    if (userMessageError) {
      console.error('Error saving user message:', userMessageError)
      return NextResponse.json({ error: userMessageError.message }, { status: 500 })
    }
    console.log('User message saved:', userMessage)

    // Get recent message history for context
    const { data: messageHistory, error: historyError } = await supabase
      .from('chat_messages')
      .select('role, content')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
      .limit(20)

    if (historyError) {
      console.error('Error fetching message history:', historyError)
      // Continue without history
    }

    // Build context for AI
    const messages: MessageParam[] = (messageHistory || []).map((msg: any) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    }))

    // System prompt (basic version - will be expanded based on PRD)
    const systemPrompt = `You are a yacht management assistant helping manage multiple client vessels.

Your capabilities:
- Answer questions about boats, equipment, and maintenance
- Help track work and time
- Assist with invoicing and client management
- Process receipts and expenses

Communication style:
- Professional but conversational
- Proactive in suggesting actions
- Always confirm before making changes to data`

    // Get AI response
    let assistantMessage: string
    try {
      console.log('Calling Anthropic API with', messages.length, 'messages')
      const aiResponse = await createChatCompletion({
        model: ANTHROPIC_MODELS.SONNET,
        messages,
        system: systemPrompt,
        maxTokens: 2048,
      })

      console.log('Anthropic API response received:', aiResponse.content[0])
      assistantMessage = aiResponse.content[0].type === 'text'
        ? aiResponse.content[0].text
        : 'I apologize, but I encountered an error processing your request.'
    } catch (aiError: any) {
      console.error('Error getting AI response:', aiError)

      // Provide helpful fallback message based on error type
      if (aiError.message?.includes('ANTHROPIC_API_KEY')) {
        assistantMessage = 'Chat functionality is not yet configured. Please set up your Anthropic API key in the environment variables. In the meantime, your message has been saved.'
      } else {
        assistantMessage = `I'm sorry, I encountered an error: ${aiError.message || 'Unknown error'}. Your message has been saved, but I couldn't generate a response.`
      }
    }

    // Save assistant message
    console.log('Saving assistant message for session:', sessionId)
    const { data: savedAssistantMessage, error: assistantMessageError } = await (supabase
      .from('chat_messages') as any)
      .insert({
        session_id: sessionId,
        user_id: effectiveUser.id,
        role: 'assistant',
        content: assistantMessage,
        active_boat_id: activeBoatId,
        active_client_id: activeClientId,
      })
      .select()
      .single()

    if (assistantMessageError) {
      console.error('Error saving assistant message:', assistantMessageError)
      return NextResponse.json(
        { error: assistantMessageError.message },
        { status: 500 }
      )
    }
    console.log('Assistant message saved:', savedAssistantMessage)

    // Update session last_message_at
    await (supabase
      .from('chat_sessions') as any)
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', sessionId)

    return NextResponse.json({
      userMessage,
      assistantMessage: savedAssistantMessage,
    })
  } catch (error: any) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/chat?session_id=xxx - Get chat history
export async function GET(request: NextRequest) {
  try {
    // DEVELOPMENT MODE: Use test user when auth is disabled
    const DEV_MODE = true
    const DEV_USER_ID = 'dd3d31db-ad83-4dde-b6b8-4900efcd25ec' // tommyjohnson90@gmail.com

    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Use dev user if in dev mode and no authenticated user
    const effectiveUser = DEV_MODE && !user
      ? { id: DEV_USER_ID, email: 'tommyjohnson90@gmail.com' }
      : user

    if (!effectiveUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const sessionId = searchParams.get('session_id')

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching messages:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ messages: data })
  } catch (error: any) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
