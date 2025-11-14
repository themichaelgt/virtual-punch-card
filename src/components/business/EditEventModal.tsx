// src/components/business/EditEventModal.tsx
'use client'

import { useState } from 'react'
import { Modal } from '../Modal'
import { showError } from '@/lib/toast'

interface Event {
  id: string
  name: string
  description: string
  rules_json: {
    target_punches: number
    cooldown_hours: number
    max_punches_per_day: number
    allow_repeat: boolean
  }
}

interface EditEventModalProps {
  event: Event
  onClose: () => void
  onSuccess: () => void
}

export function EditEventModal({ event, onClose, onSuccess }: EditEventModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: event.name,
    description: event.description || '',
    target_punches: event.rules_json.target_punches,
    cooldown_hours: event.rules_json.cooldown_hours,
    max_punches_per_day: event.rules_json.max_punches_per_day,
    allow_repeat: event.rules_json.allow_repeat !== undefined ? event.rules_json.allow_repeat : true
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/business/events/${event.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          rules_json: {
            target_punches: formData.target_punches,
            cooldown_hours: formData.cooldown_hours,
            max_punches_per_day: formData.max_punches_per_day,
            allow_repeat: formData.allow_repeat
          }
        })
      })

      if (response.ok) {
        onSuccess()
      } else {
        const error = await response.json()
        showError(error.message || 'Failed to update campaign')
      }
    } catch (error) {
      console.error('Update event error:', error)
      showError('Failed to update campaign')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={true} onClose={onClose} title="Edit Campaign" maxWidth="md">
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
          </div>
        </div>

        <div className="flex items-center">
          <input
            id="edit_allow_repeat"
            type="checkbox"
            checked={formData.allow_repeat}
            onChange={(e) => setFormData({...formData, allow_repeat: e.target.checked})}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label htmlFor="edit_allow_repeat" className="ml-2 block text-sm text-gray-700">
            Allow customers to restart after completing
          </label>
        </div>

        <div className="flex space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
