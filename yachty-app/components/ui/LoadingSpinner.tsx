'use client'

import { cn } from '@/lib/utils/cn'

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large'
  text?: string
  className?: string
}

export function LoadingSpinner({ size = 'medium', text, className }: LoadingSpinnerProps) {
  const sizeClasses = {
    small: 'w-5 h-5',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
  }

  return (
    <div className={cn('flex flex-col items-center justify-center', className)}>
      <svg
        className={cn('animate-spin text-blue-600', sizeClasses[size])}
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      {text && <p className="mt-3 text-sm text-gray-600">{text}</p>}
    </div>
  )
}
