'use client'

import Link from 'next/link'
import { formatCurrency } from '@/lib/utils/format'
import type { Database } from '@/lib/supabase/database.types'

type Client = Database['public']['Tables']['clients']['Row']
type Boat = Database['public']['Tables']['boats']['Row']

interface ClientCardProps {
  client: Client & { boats: Boat[] }
  onUpdate?: () => void
}

export function ClientCard({ client, onUpdate }: ClientCardProps) {
  const boatCount = client.boats?.length || 0

  return (
    <Link
      href={`/clients/${client.id}`}
      className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 overflow-hidden"
    >
      <div className="p-5">
        {/* Client Name */}
        <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
          {client.name}
        </h3>

        {/* Contact Info */}
        <div className="space-y-1 mb-4">
          {client.email && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <span className="truncate">{client.email}</span>
            </div>
          )}
          {client.phone && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              <span>{client.phone}</span>
            </div>
          )}
        </div>

        {/* Boats */}
        <div className="mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
              />
            </svg>
            <span className="font-medium">
              {boatCount} {boatCount === 1 ? 'Boat' : 'Boats'}
            </span>
          </div>
          {boatCount > 0 && (
            <div className="flex flex-wrap gap-1">
              {client.boats.slice(0, 3).map((boat) => (
                <span
                  key={boat.id}
                  className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded-full"
                >
                  {boat.name}
                </span>
              ))}
              {boatCount > 3 && (
                <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                  +{boatCount - 3} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Billing Info */}
        <div className="pt-4 border-t border-gray-200 flex items-center justify-between text-sm">
          <div>
            <span className="text-gray-600">Hourly Rate:</span>
            <span className="ml-2 font-semibold text-gray-900">
              {formatCurrency(client.hourly_rate || 0)}/hr
            </span>
          </div>
          {client.tax_rate > 0 && (
            <div>
              <span className="text-gray-600">Tax:</span>
              <span className="ml-1 font-semibold text-gray-900">
                {(client.tax_rate * 100).toFixed(2)}%
              </span>
            </div>
          )}
        </div>

        {/* Payment Terms */}
        {client.payment_terms && (
          <div className="mt-2 text-xs text-gray-500">
            {client.payment_terms}
          </div>
        )}
      </div>

      {/* View Details Arrow */}
      <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
        <span className="text-sm text-gray-600">View Details</span>
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  )
}
