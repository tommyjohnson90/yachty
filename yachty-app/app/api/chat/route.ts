import { createClient } from '@/lib/supabase/server'
import { createChatCompletion, ANTHROPIC_MODELS } from '@/lib/anthropic/client'
import { chatMessageSchema } from '@/lib/utils/validation'
import { NextRequest, NextResponse } from 'next/server'
import type { MessageParam } from '@anthropic-ai/sdk/resources/messages'

// POST /api/chat - Send a message and get AI response
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
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
    const { data: userMessage, error: userMessageError } = await (supabase
      .from('chat_messages') as any)
      .insert(userMessageValidation.data)
      .select()
      .single()

    if (userMessageError) {
      console.error('Error saving user message:', userMessageError)
      return NextResponse.json({ error: userMessageError.message }, { status: 500 })
    }

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
    const aiResponse = await createChatCompletion({
      model: ANTHROPIC_MODELS.SONNET,
      messages,
      system: systemPrompt,
      maxTokens: 2048,
    })

    const assistantMessage = aiResponse.content[0].type === 'text'
      ? aiResponse.content[0].text
      : 'I apologize, but I encountered an error processing your request.'

    // Save assistant message
    const { data: savedAssistantMessage, error: assistantMessageError } = await (supabase
      .from('chat_messages') as any)
      .insert({
        session_id: sessionId,
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
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
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
