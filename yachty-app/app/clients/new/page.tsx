'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ErrorAlert } from '@/components/ui/ErrorAlert'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

interface FormData {
  name: string
  email: string
  phone: string
  billing_address: {
    street: string
    city: string
    state: string
    zip: string
    country: string
  }
  hourly_rate: string
  payment_terms: string
  tax_rate: string
  tax_jurisdiction: string
  notes: string
}

export default function NewClientPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    billing_address: {
      street: '',
      city: '',
      state: '',
      zip: '',
      country: 'USA',
    },
    hourly_rate: '0',
    payment_terms: 'Net 30',
    tax_rate: '0',
    tax_jurisdiction: '',
    notes: '',
  })

  const handleChange = (field: string, value: string) => {
    if (field.startsWith('billing_address.')) {
      const addressField = field.split('.')[1]
      setFormData(prev => ({
        ...prev,
        billing_address: {
          ...prev.billing_address,
          [addressField]: value,
        },
      }))
    } else {
      setFormData(prev => ({ ...prev, [field]: value }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      setError('Client name is required')
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim() || null,
        phone: formData.phone.trim() || null,
        billing_address: formData.billing_address.street
          ? formData.billing_address
          : null,
        hourly_rate: parseFloat(formData.hourly_rate) || 0,
        payment_terms: formData.payment_terms || 'Net 30',
        tax_rate: parseFloat(formData.tax_rate) / 100 || 0,
        tax_jurisdiction: formData.tax_jurisdiction.trim() || null,
        notes: formData.notes.trim() || null,
      }

      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create client')
      }

      const data = await response.json()
      router.push(`/clients/${data.client.id}`)
    } catch (err) {
      console.error('Error creating client:', err)
      setError(err instanceof Error ? err.message : 'Failed to create client')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
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
            <h1 className="text-xl font-semibold text-gray-900">Add New Client</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6">
            <ErrorAlert message={error} onDismiss={() => setError(null)} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
            <div className="space-y-4">
              <Input
                label="Client Name *"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
                placeholder="Enter client name"
              />
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="client@example.com"
              />
              <Input
                label="Phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="(555) 555-5555"
              />
            </div>
          </div>

          {/* Billing Address */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Billing Address</h2>
            <div className="space-y-4">
              <Input
                label="Street Address"
                value={formData.billing_address.street}
                onChange={(e) => handleChange('billing_address.street', e.target.value)}
                placeholder="123 Main St"
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="City"
                  value={formData.billing_address.city}
                  onChange={(e) => handleChange('billing_address.city', e.target.value)}
                  placeholder="City"
                />
                <Input
                  label="State"
                  value={formData.billing_address.state}
                  onChange={(e) => handleChange('billing_address.state', e.target.value)}
                  placeholder="State"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="ZIP Code"
                  value={formData.billing_address.zip}
                  onChange={(e) => handleChange('billing_address.zip', e.target.value)}
                  placeholder="12345"
                />
                <Input
                  label="Country"
                  value={formData.billing_address.country}
                  onChange={(e) => handleChange('billing_address.country', e.target.value)}
                  placeholder="USA"
                />
              </div>
            </div>
          </div>

          {/* Billing Configuration */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Billing Configuration</h2>
            <div className="space-y-4">
              <Input
                label="Hourly Rate"
                type="number"
                min="0"
                step="0.01"
                value={formData.hourly_rate}
                onChange={(e) => handleChange('hourly_rate', e.target.value)}
                placeholder="0.00"
                helperText="Default hourly rate for this client"
              />
              <Input
                label="Payment Terms"
                value={formData.payment_terms}
                onChange={(e) => handleChange('payment_terms', e.target.value)}
                placeholder="Net 30"
                helperText="e.g., Net 30, Due on Receipt"
              />
              <Input
                label="Tax Rate (%)"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={formData.tax_rate}
                onChange={(e) => handleChange('tax_rate', e.target.value)}
                placeholder="0.00"
                helperText="Enter as percentage (e.g., 8.5 for 8.5%)"
              />
              <Input
                label="Tax Jurisdiction"
                value={formData.tax_jurisdiction}
                onChange={(e) => handleChange('tax_jurisdiction', e.target.value)}
                placeholder="e.g., Seattle, WA"
                helperText="Location for tax rate reference"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Additional notes about this client..."
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.back()}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? <LoadingSpinner size="small" /> : 'Create Client'}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
