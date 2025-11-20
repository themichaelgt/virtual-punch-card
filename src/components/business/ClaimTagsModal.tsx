// src/components/business/ClaimTagsModal.tsx
'use client'

import { useState } from 'react'
import { Modal } from '../Modal'

interface ClaimTagsModalProps {
  eventId: string
  availableTags: number
  onClose: () => void
  onClaim: (quantity: number) => void
}

export function ClaimTagsModal({ availableTags, onClose, onClaim }: ClaimTagsModalProps) {
  const [quantity, setQuantity] = useState(1)

  return (
    <Modal isOpen={true} onClose={onClose} title="Claim Tags for Campaign" maxWidth="md">
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            You have <strong>{availableTags}</strong> unclaimed tags available in your inventory.
          </p>
        </div>

        <p className="text-sm text-gray-600">
          How many tags would you like to assign to this campaign?
        </p>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Number of Tags
          </label>
          <input
            type="number"
            min="1"
            max={Math.min(availableTags, 10)}
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
          <p className="mt-1 text-xs text-gray-500">
            Maximum: {Math.min(availableTags, 10)} tags
          </p>
        </div>

        {availableTags === 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">
              You don&apos;t have any available tags. Contact support to purchase more tags.
            </p>
          </div>
        )}

        <div className="flex space-x-3 pt-4">
          <button
            onClick={onClose}
            className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onClaim(quantity)}
            disabled={availableTags === 0 || quantity > availableTags}
            className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Claim Tags
          </button>
        </div>
      </div>
    </Modal>
  )
}
