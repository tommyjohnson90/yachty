'use client'

import { useState } from 'react'
import { ErrorAlert } from '@/components/ui/ErrorAlert'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

interface AddBoatModalProps {
  clientId: string
  clientName: string
  onClose: () => void
  onSuccess: () => void
}

export function AddBoatModal({ clientId, clientName, onClose, onSuccess }: AddBoatModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    make: '',
    model: '',
    year: '',
    length: '',
    notes: '',
  })

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      setError('Boat name is required')
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const payload = {
        client_id: clientId,
        name: formData.name.trim(),
        make: formData.make.trim() || null,
        model: formData.model.trim() || null,
        year: formData.year ? parseInt(formData.year) : null,
        length: formData.length ? parseFloat(formData.length) : null,
        notes: formData.notes.trim() || null,
      }

      const response = await fetch('/api/boats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create boat')
      }

      onSuccess()
    } catch (err) {
      console.error('Error creating boat:', err)
      setError(err instanceof Error ? err.message : 'Failed to create boat')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Add Boat</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <span className="font-medium">Client:</span> {clientName}
            </p>
          </div>

          {error && (
            <div className="mb-4">
              <ErrorAlert message={error} onDismiss={() => setError(null)} />
            </div>
          )}

          <div className="space-y-4">
            <Input
              label="Boat Name *"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              required
              placeholder="e.g., Sea Breeze, MINX"
              helperText="Each boat name must be unique"
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Make"
                value={formData.make}
                onChange={(e) => handleChange('make', e.target.value)}
                placeholder="e.g., Beneteau"
              />
              <Input
                label="Model"
                value={formData.model}
                onChange={(e) => handleChange('model', e.target.value)}
                placeholder="e.g., Oceanis 46"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Year"
                type="number"
                min="1900"
                max={new Date().getFullYear() + 1}
                value={formData.year}
                onChange={(e) => handleChange('year', e.target.value)}
                placeholder="2020"
              />
              <Input
                label="Length (ft)"
                type="number"
                min="0"
                step="0.1"
                value={formData.length}
                onChange={(e) => handleChange('length', e.target.value)}
                placeholder="46"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Additional notes about this boat..."
              />
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !formData.name.trim()}
              className="flex-1"
            >
              {isLoading ? <LoadingSpinner size="small" /> : 'Add Boat'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
