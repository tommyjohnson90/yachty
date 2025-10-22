'use client'

import Link from 'next/link'
import type { Database } from '@/lib/supabase/database.types'

type Boat = Database['public']['Tables']['boats']['Row']

interface BoatCardProps {
  boat: Boat
}

export function BoatCard({ boat }: BoatCardProps) {
  return (
    <Link
      href={`/boats/${boat.id}`}
      className="block bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all p-4"
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="font-semibold text-gray-900 text-lg">{boat.name}</h3>
          {(boat.make || boat.model) && (
            <p className="text-sm text-gray-600">
              {[boat.make, boat.model].filter(Boolean).join(' ')}
            </p>
          )}
        </div>
        {boat.year && (
          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded">
            {boat.year}
          </span>
        )}
      </div>

      {boat.length && (
        <div className="text-sm text-gray-600 mb-2">
          <span className="font-medium">Length:</span> {boat.length} ft
        </div>
      )}

      {boat.notes && (
        <p className="text-sm text-gray-600 line-clamp-2">{boat.notes}</p>
      )}

      <div className="mt-3 flex items-center text-sm text-blue-600 font-medium">
        View Details
        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  )
}
