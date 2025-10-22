'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ChatMessage } from '@/components/chat/ChatMessage'
import { ChatInput } from '@/components/chat/ChatInput'
import { ChatHeader } from '@/components/chat/ChatHeader'
import { ErrorAlert } from '@/components/ui/ErrorAlert'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  created_at: string
  active_boat_id?: string | null
  active_client_id?: string | null
}

export default function ChatPage() {
  const router = useRouter()
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeBoatId, setActiveBoatId] = useState<string | null>(null)
  const [activeClientId, setActiveClientId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Create or load chat session
  useEffect(() => {
    async function initializeSession() {
      try {
        setIsLoading(true)
        setError(null)

        // Create new chat session
        const response = await fetch('/api/chat/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to create chat session')
        }

        const data = await response.json()
        setSessionId(data.session.id)
      } catch (err) {
        console.error('Error initializing session:', err)
        setError(err instanceof Error ? err.message : 'Failed to initialize chat')
      } finally {
        setIsLoading(false)
      }
    }

    initializeSession()
  }, [])

  const handleSendMessage = async (content: string, attachments?: File[]) => {
    if (!sessionId || !content.trim()) return

    try {
      setIsLoading(true)
      setError(null)

      // Optimistically add user message to UI
      const optimisticMessage: Message = {
        id: `temp-${Date.now()}`,
        role: 'user',
        content: content.trim(),
        created_at: new Date().toISOString(),
        active_boat_id: activeBoatId,
        active_client_id: activeClientId,
      }
      setMessages(prev => [...prev, optimisticMessage])

      // TODO: Handle file attachments if provided
      if (attachments && attachments.length > 0) {
        console.log('File attachments to be implemented:', attachments)
      }

      // Send message to API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content.trim(),
          sessionId,
          activeBoatId,
          activeClientId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to send message')
      }

      const data = await response.json()

      // Replace optimistic message with actual messages from server
      setMessages(prev => {
        const withoutOptimistic = prev.filter(m => m.id !== optimisticMessage.id)
        return [
          ...withoutOptimistic,
          data.userMessage,
          data.assistantMessage,
        ]
      })
    } catch (err) {
      console.error('Error sending message:', err)
      setError(err instanceof Error ? err.message : 'Failed to send message')

      // Remove optimistic message on error
      setMessages(prev => prev.filter(m => !m.id.startsWith('temp-')))
    } finally {
      setIsLoading(false)
    }
  }

  const handleNewChat = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/chat/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) {
        throw new Error('Failed to create new chat')
      }

      const data = await response.json()
      setSessionId(data.session.id)
      setMessages([])
      setActiveBoatId(null)
      setActiveClientId(null)
    } catch (err) {
      console.error('Error creating new chat:', err)
      setError(err instanceof Error ? err.message : 'Failed to create new chat')
    } finally {
      setIsLoading(false)
    }
  }

  if (!sessionId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="large" text="Initializing chat..." />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <ChatHeader
        onNewChat={handleNewChat}
        onBack={() => router.push('/')}
        activeBoatId={activeBoatId}
        activeClientId={activeClientId}
      />

      {/* Error Alert */}
      {error && (
        <div className="px-4 pt-2">
          <ErrorAlert message={error} onDismiss={() => setError(null)} />
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-24 sm:pb-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-16 h-16 mb-4 rounded-full bg-blue-100 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Start a conversation
            </h2>
            <p className="text-gray-600 max-w-md">
              Ask me anything about your boats, equipment, work items, or invoices.
              I can help you track time, process receipts, and manage your yacht operations.
            </p>
            <div className="mt-6 grid grid-cols-1 gap-2 w-full max-w-md">
              <button
                onClick={() => handleSendMessage("Show me my clients and boats")}
                className="text-left px-4 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm font-medium text-gray-900">
                  Show me my clients and boats
                </span>
              </button>
              <button
                onClick={() => handleSendMessage("What work do I have scheduled?")}
                className="text-left px-4 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm font-medium text-gray-900">
                  What work do I have scheduled?
                </span>
              </button>
              <button
                onClick={() => handleSendMessage("Help me add a new client")}
                className="text-left px-4 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm font-medium text-gray-900">
                  Help me add a new client
                </span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 max-w-4xl mx-auto">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <ChatInput
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        disabled={!sessionId}
      />
    </div>
  )
}
