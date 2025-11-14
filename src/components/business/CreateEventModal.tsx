// src/components/business/CreateEventModal.tsx
'use client'

import { useState } from 'react'
import { Modal } from '../Modal'
import { showError } from '@/lib/toast'

interface CreateEventModalProps {
  onClose: () => void
  onSuccess: () => void
}

export function CreateEventModal({ onClose, onSuccess }: CreateEventModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    target_punches: 5,
    cooldown_hours: 0,
    max_punches_per_day: 1,
    allow_repeat: true
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/business/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        onSuccess()
      } else {
        const error = await response.json()
        showError(error.message || 'Failed to create campaign')
      }
    } catch (error) {
      console.error('Create event error:', error)
      showError('Failed to create campaign')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={true} onClose={onClose} title="Create New Campaign" maxWidth="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Campaign Name
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Buy 5, Get 1 Free"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Get a free coffee after 5 purchases"
            rows={2}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Punches Required
          </label>
          <input
            type="number"
            min="1"
            max="20"
            value={formData.target_punches}
            onChange={(e) => setFormData({...formData, target_punches: parseInt(e.target.value)})}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="flex space-x-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700">
              Cooldown (hours)
            </label>
            <input
              type="number"
              min="0"
              max="168"
              value={formData.cooldown_hours}
              onChange={(e) => setFormData({...formData, cooldown_hours: parseInt(e.target.value)})}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            <p className="mt-1 text-xs text-gray-500">Time between punches (0 = none)</p>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700">
              Daily Limit
            </label>
            <input
              type="number"
              min="0"
              max="50"
              value={formData.max_punches_per_day || 0}
              onChange={(e) => setFormData({...formData, max_punches_per_day: parseInt(e.target.value)})}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            <p className="mt-1 text-xs text-gray-500">Max punches/day (0 = unlimited)</p>
          </div>
        </div>

        <div className="flex items-center">
          <input
            id="allow_repeat"
            type="checkbox"
            checked={formData.allow_repeat}
            onChange={(e) => setFormData({...formData, allow_repeat: e.target.checked})}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label htmlFor="allow_repeat" className="ml-2 block text-sm text-gray-700">
            Allow customers to restart after completing a card
          </label>
        </div>

        <div className="flex space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Campaign'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
