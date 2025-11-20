// src/components/business/TagManagementModal.tsx
'use client'

import { useState, useEffect } from 'react'
import { Modal } from '../Modal'
import { showSuccess } from '@/lib/toast'
import { Tag } from '@/types/database'

interface TagManagementModalProps {
  eventId: string
  onClose: () => void
}

export function TagManagementModal({ eventId, onClose }: TagManagementModalProps) {
  const [loading, setLoading] = useState(true)
  const [tags, setTags] = useState<Tag[]>([])

  useEffect(() => {
    const loadTags = async () => {
      try {
        const response = await fetch(`/api/business/events/${eventId}/tags`, {
          credentials: 'include'
        })

        if (response.ok) {
          const data = await response.json()
          setTags(data.tags || [])
        }
      } catch (error) {
        console.error('Failed to load tags:', error)
      } finally {
        setLoading(false)
      }
    }

    loadTags()
  }, [eventId])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    showSuccess('URL copied to clipboard!')
  }

  return (
    <Modal isOpen={true} onClose={onClose} title="NFC Tags for Campaign" maxWidth="2xl">
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading tags...</p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Program these URLs onto your NFC tags. When customers tap the tags, they&apos;ll be taken to your punch card.
          </p>

          {tags.map((tag, index) => (
            <div key={tag.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium text-gray-900">Tag #{index + 1}</h4>
                  <p className="text-sm text-gray-500 font-mono">
                    {typeof window !== 'undefined' && `${window.location.origin}/t/${tag.token}`}
                  </p>
                </div>
                <button
                  onClick={() => copyToClipboard(`${window.location.origin}/t/${tag.token}`)}
                  className="ml-4 px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700"
                >
                  Copy URL
                </button>
              </div>
            </div>
          ))}

          {tags.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No tags assigned to this campaign yet. Click &quot;Claim Tags&quot; to assign tags from your inventory.
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}
