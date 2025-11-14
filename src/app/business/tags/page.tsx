// src/app/business/tags/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { showSuccess, showError } from '@/lib/toast'
import { useConfirm } from '@/components/ConfirmDialog'

interface Tag {
  id: string
  token: string
  label: string
  status: 'active' | 'disabled' | 'stolen'
  created_at: string
  event: {
    id: string
    name: string
    status: string
  } | null
}

export default function TagManagementPage() {
  const [loading, setLoading] = useState(true)
  const [tags, setTags] = useState<Tag[]>([])
  const [filter, setFilter] = useState<'all' | 'active' | 'disabled' | 'stolen'>('all')
  const router = useRouter()
  const confirm = useConfirm()

  useEffect(() => {
    loadTags()
  }, [])

  const loadTags = async () => {
    try {
      const response = await fetch('/api/business/tags', {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setTags(data.tags || [])
      } else {
        console.error('Failed to load tags')
      }
    } catch (error) {
      console.error('Tag load error:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateTagStatus = async (tagId: string, newStatus: 'active' | 'disabled' | 'stolen') => {
    try {
      const response = await fetch('/api/business/tags/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ tagId, status: newStatus })
      })

      if (response.ok) {
        await loadTags()
      } else {
        showError('Failed to update tag status')
      }
    } catch (error) {
      console.error('Tag update error:', error)
      showError('Failed to update tag status')
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    showSuccess('URL copied to clipboard!')
  }

  const filteredTags = tags.filter(tag => {
    if (filter === 'all') return true
    return tag.status === filter
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'disabled': return 'bg-gray-100 text-gray-800'
      case 'stolen': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">NFC Tag Management</h1>
              <p className="text-sm text-gray-500">Manage your punch card NFC tags</p>
            </div>
            <button
              onClick={() => router.push('/business/dashboard')}
              className="text-sm text-indigo-600 hover:text-indigo-500 font-medium"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-gray-900">{tags.length}</div>
            <div className="text-sm text-gray-500">Total Tags</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-green-600">
              {tags.filter(t => t.status === 'active').length}
            </div>
            <div className="text-sm text-gray-500">Active</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-gray-600">
              {tags.filter(t => t.status === 'disabled').length}
            </div>
            <div className="text-sm text-gray-500">Disabled</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-red-600">
              {tags.filter(t => t.status === 'stolen').length}
            </div>
            <div className="text-sm text-gray-500">Stolen</div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {(['all', 'active', 'disabled', 'stolen'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    filter === status
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                  <span className="ml-2 text-xs text-gray-400">
                    ({status === 'all' ? tags.length : tags.filter(t => t.status === status).length})
                  </span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tags List */}
          <div className="p-6">
            {filteredTags.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No tags found with this filter
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTags.map((tag) => (
                  <div key={tag.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-medium text-gray-900">{tag.label}</h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(tag.status)}`}>
                            {tag.status}
                          </span>
                        </div>
                        
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center">
                            <span className="text-gray-500 w-24">URL:</span>
                            <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                              {window.location.origin}/t/{tag.token}
                            </code>
                            <button
                              onClick={() => copyToClipboard(`${window.location.origin}/t/${tag.token}`)}
                              className="ml-2 text-indigo-600 hover:text-indigo-500 text-xs"
                            >
                              Copy
                            </button>
                          </div>
                          
                          {tag.event ? (
                            <div className="flex items-center">
                              <span className="text-gray-500 w-24">Campaign:</span>
                              <span className="text-gray-900">{tag.event.name}</span>
                              <span className={`ml-2 px-2 py-0.5 text-xs rounded ${
                                tag.event.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {tag.event.status}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <span className="text-gray-500 w-24">Campaign:</span>
                              <span className="text-gray-400 italic">Not assigned</span>
                            </div>
                          )}
                          
                          <div className="flex items-center">
                            <span className="text-gray-500 w-24">Created:</span>
                            <span className="text-gray-600">
                              {new Date(tag.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="ml-4 flex flex-col space-y-2">
                        {tag.status === 'active' && (
                          <>
                            <button
                              onClick={() => updateTagStatus(tag.id, 'disabled')}
                              className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded"
                            >
                              Disable
                            </button>
                            <button
                              onClick={async () => {
                                const confirmed = await confirm({
                                  title: 'Mark Tag as Stolen',
                                  message: 'Mark this tag as stolen? This will permanently disable it.',
                                  confirmText: 'Mark Stolen',
                                  type: 'danger'
                                })
                                if (confirmed) {
                                  updateTagStatus(tag.id, 'stolen')
                                }
                              }}
                              className="px-3 py-1 text-xs font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded"
                            >
                              Mark Stolen
                            </button>
                          </>
                        )}
                        
                        {tag.status === 'disabled' && (
                          <button
                            onClick={() => updateTagStatus(tag.id, 'active')}
                            className="px-3 py-1 text-xs font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded"
                          >
                            Enable
                          </button>
                        )}
                        
                        {tag.status === 'stolen' && (
                          <span className="px-3 py-1 text-xs font-medium text-red-700 bg-red-50 rounded border border-red-200">
                            Permanently Disabled
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Tag Status Guide:</h3>
          <ul className="space-y-2 text-blue-800 text-sm">
            <li><strong>Active:</strong> Tag is working and customers can use it to punch their cards</li>
            <li><strong>Disabled:</strong> Tag is temporarily turned off (can be re-enabled)</li>
            <li><strong>Stolen:</strong> Tag is permanently disabled due to theft or loss</li>
          </ul>
        </div>
      </main>
    </div>
  )
}