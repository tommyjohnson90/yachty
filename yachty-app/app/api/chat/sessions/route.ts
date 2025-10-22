import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// POST /api/chat/sessions - Create a new chat session
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Create new chat session
    const { data: session, error } = await (supabase
      .from('chat_sessions') as any)
      .insert({
        title: 'New Chat',
        last_message_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating chat session:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to create chat session' },
        { status: 500 }
      )
    }

    return NextResponse.json({ session })
  } catch (error: any) {
    console.error('Unexpected error creating session:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/chat/sessions - Get all chat sessions
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: sessions, error } = await supabase
      .from('chat_sessions')
      .select('*')
      .order('last_message_at', { ascending: false })

    if (error) {
      console.error('Error fetching chat sessions:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to fetch sessions' },
        { status: 500 }
      )
    }

    return NextResponse.json({ sessions })
  } catch (error: any) {
    console.error('Unexpected error fetching sessions:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
