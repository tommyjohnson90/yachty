'use client'

import { useEffect, useState } from 'react'

interface ChatHeaderProps {
  onNewChat: () => void
  onBack: () => void
  activeBoatId?: string | null
  activeClientId?: string | null
}

export function ChatHeader({
  onNewChat,
  onBack,
  activeBoatId,
  activeClientId,
}: ChatHeaderProps) {
  const [boatName, setBoatName] = useState<string | null>(null)
  const [clientName, setClientName] = useState<string | null>(null)

  useEffect(() => {
    async function fetchContext() {
      try {
        if (activeBoatId) {
          const boatRes = await fetch(`/api/boats/${activeBoatId}`)
          if (boatRes.ok) {
            const boat = await boatRes.json()
            setBoatName(boat.name)
          }
        } else {
          setBoatName(null)
        }

        if (activeClientId) {
          const clientRes = await fetch(`/api/clients/${activeClientId}`)
          if (clientRes.ok) {
            const client = await clientRes.json()
            setClientName(client.name)
          }
        } else {
          setClientName(null)
        }
      } catch (error) {
        console.error('Error fetching context:', error)
      }
    }

    fetchContext()
  }, [activeBoatId, activeClientId])

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Back Button */}
            <button
              onClick={onBack}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Go back"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            {/* Title and Context */}
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Chat Assistant</h1>
              {(boatName || clientName) && (
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  {clientName && <span>{clientName}</span>}
                  {clientName && boatName && <span>•</span>}
                  {boatName && <span>{boatName}</span>}
                </div>
              )}
            </div>
          </div>

          {/* New Chat Button */}
          <button
            onClick={onNewChat}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Start new chat"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
}
