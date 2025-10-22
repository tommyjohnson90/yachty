'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ErrorAlert } from '@/components/ui/ErrorAlert'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { BoatCard } from '@/components/boats/BoatCard'
import { AddBoatModal } from '@/components/boats/AddBoatModal'
import { formatCurrency } from '@/lib/utils/format'
import type { Database } from '@/lib/supabase/database.types'

type Client = Database['public']['Tables']['clients']['Row']
type Boat = Database['public']['Tables']['boats']['Row']

interface ClientWithBoats extends Client {
  boats: Boat[]
}

export default function ClientDetailPage() {
  const router = useRouter()
  const params = useParams()
  const clientId = params?.id as string

  const [client, setClient] = useState<ClientWithBoats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddBoat, setShowAddBoat] = useState(false)

  useEffect(() => {
    if (clientId) {
      fetchClient()
    }
  }, [clientId])

  async function fetchClient() {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/clients/${clientId}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch client')
      }

      const data = await response.json()
      setClient(data.client)
    } catch (err) {
      console.error('Error fetching client:', err)
      setError(err instanceof Error ? err.message : 'Failed to load client')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="large" text="Loading client..." />
      </div>
    )
  }

  if (error || !client) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <button
              onClick={() => router.push('/clients')}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ErrorAlert message={error || 'Client not found'} />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 sm:pb-0">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/clients')}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Go back"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{client.name}</h1>
                <p className="text-sm text-gray-500">{client.boats?.length || 0} boats</p>
              </div>
            </div>
            <Link
              href={`/clients/${clientId}/edit`}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Edit
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Client Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {client.email && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                <p className="text-gray-900">{client.email}</p>
              </div>
            )}
            {client.phone && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Phone</label>
                <p className="text-gray-900">{client.phone}</p>
              </div>
            )}
            {client.billing_address && (
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-500 mb-1">Billing Address</label>
                <p className="text-gray-900">
                  {typeof client.billing_address === 'object' && client.billing_address !== null && (
                    <>
                      {(client.billing_address as any).street}<br />
                      {(client.billing_address as any).city}, {(client.billing_address as any).state} {(client.billing_address as any).zip}<br />
                      {(client.billing_address as any).country}
                    </>
                  )}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Billing Configuration */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Billing Configuration</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Hourly Rate</label>
              <p className="text-lg font-semibold text-gray-900">{formatCurrency(client.hourly_rate || 0)}/hr</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Payment Terms</label>
              <p className="text-gray-900">{client.payment_terms || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Tax Rate</label>
              <p className="text-gray-900">{((client.tax_rate || 0) * 100).toFixed(2)}%</p>
            </div>
            {client.tax_jurisdiction && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Tax Jurisdiction</label>
                <p className="text-gray-900">{client.tax_jurisdiction}</p>
              </div>
            )}
          </div>
        </div>

        {/* Boats Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Boats</h2>
            <button
              onClick={() => setShowAddBoat(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Add Boat
            </button>
          </div>

          {client.boats && client.boats.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {client.boats.map((boat) => (
                <BoatCard key={boat.id} boat={boat} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No boats yet</h3>
              <p className="text-gray-600 mb-4">Add a boat to get started tracking work and equipment</p>
              <button
                onClick={() => setShowAddBoat(true)}
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Add First Boat
              </button>
            </div>
          )}
        </div>

        {/* Notes */}
        {client.notes && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Notes</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{client.notes}</p>
          </div>
        )}
      </main>

      {/* Add Boat Modal */}
      {showAddBoat && (
        <AddBoatModal
          clientId={clientId}
          clientName={client.name}
          onClose={() => setShowAddBoat(false)}
          onSuccess={() => {
            setShowAddBoat(false)
            fetchClient()
          }}
        />
      )}
    </div>
  )
}
