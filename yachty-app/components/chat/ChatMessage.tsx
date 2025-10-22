'use client'

import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils/cn'

interface ChatMessageProps {
  message: {
    id: string
    role: 'user' | 'assistant' | 'system'
    content: string
    created_at: string
  }
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user'
  const isSystem = message.role === 'system'

  if (isSystem) {
    return (
      <div className="flex justify-center my-4">
        <div className="px-3 py-1 text-xs text-gray-500 bg-gray-100 rounded-full">
          {message.content}
        </div>
      </div>
    )
  }

  return (
    <div className={cn('flex gap-3', isUser && 'flex-row-reverse')}>
      {/* Avatar */}
      <div
        className={cn(
          'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
          isUser
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 text-gray-700'
        )}
      >
        {isUser ? 'Y' : 'A'}
      </div>

      {/* Message Content */}
      <div className={cn('flex-1 max-w-2xl', isUser && 'flex flex-col items-end')}>
        <div
          className={cn(
            'px-4 py-3 rounded-2xl',
            isUser
              ? 'bg-blue-600 text-white'
              : 'bg-white border border-gray-200 text-gray-900'
          )}
        >
          <div className="prose prose-sm max-w-none">
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          </div>
        </div>

        {/* Timestamp */}
        <div className="mt-1 px-2 text-xs text-gray-500">
          {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
        </div>
      </div>
    </div>
  )
}
