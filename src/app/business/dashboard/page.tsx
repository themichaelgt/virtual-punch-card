// src/app/business/dashboard/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { createClientSupabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import { showSuccess, showError } from '@/lib/toast'
import { useConfirm } from '@/components/ConfirmDialog'
import { CreateEventModal } from '@/components/business/CreateEventModal'
import { EditEventModal } from '@/components/business/EditEventModal'
import { TagManagementModal } from '@/components/business/TagManagementModal'
import { ClaimTagsModal } from '@/components/business/ClaimTagsModal'

interface Establishment {
  id: string
  name: string
  profile_json: any
}

interface Event {
  id: string
  name: string
  description: string
  rules_json: any
  status: string
  created_at: string
  _count: {
    cards: number
    completed_cards: number
  }
}

export default function BusinessDashboard() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [establishment, setEstablishment] = useState<Establishment | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [showCreateEvent, setShowCreateEvent] = useState(false)
  const [selectedEventForTags, setSelectedEventForTags] = useState<string | null>(null)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [availableTags, setAvailableTags] = useState(0)
  const [claimingTags, setClaimingTags] = useState<string | null>(null)
  const [hasPendingOrder, setHasPendingOrder] = useState(false)

  const supabase = createClientSupabase()
  const confirm = useConfirm()
  const router = useRouter()

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !user) {
          router.push('/business/login')
          return
        }

        setUser(user)

        const response = await fetch('/api/business/establishment', {
          credentials: 'include'
        })

        if (response.ok) {
          const data = await response.json()
          setEstablishment(data.establishment)
        } else if (response.status === 404) {
          router.push('/business/complete-signup')
          return
        } else {
          console.error('Failed to load establishment')
        }

        await loadEvents()
        await loadAvailableTags()
        await checkPendingOrders()

      } catch (error) {
        console.error('Dashboard load error:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [router, supabase])

  const loadEvents = async () => {
    try {
      const response = await fetch('/api/business/events', {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setEvents(data.events)
      }
    } catch (error) {
      console.error('Failed to load events:', error)
    }
  }

  const loadAvailableTags = async () => {
    try {
      const response = await fetch('/api/business/tags/available', {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setAvailableTags(data.available)
      }
    } catch (error) {
      console.error('Failed to load available tags:', error)
    }
  }

  const checkPendingOrders = async () => {
    try {
      const response = await fetch('/api/business/orders')
      const data = await response.json()
      if (response.ok) {
        const pending = data.orders.some((order: any) => 
          order.status === 'pending' || order.status === 'fulfilled' || order.status === 'shipped'
        )
        setHasPendingOrder(pending)
      }
    } catch (error) {
      console.error('Error checking orders:', error)
    }
  }

  const handleClaimTags = async (eventId: string, quantity: number) => {
    try {
      const response = await fetch('/api/business/tags/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ eventId, quantity })
      })

      const data = await response.json()

      if (response.ok) {
        showSuccess(data.message)
        await loadEvents()
        await loadAvailableTags()
        setClaimingTags(null)
      } else {
        showError(data.message || 'Failed to claim tags')
      }
    } catch (error) {
      console.error('Claim tags error:', error)
      showError('Failed to claim tags')
    }
  }

  const handlePauseEvent = async (eventId: string) => {
    try {
      const response = await fetch(`/api/business/events/${eventId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'paused' })
      })

      if (response.ok) {
        await loadEvents()
      } else {
        showError('Failed to pause event')
      }
    } catch (error) {
      console.error('Pause event error:', error)
      showError('Failed to pause event')
    }
  }

  const handleResumeEvent = async (eventId: string) => {
    try {
      const response = await fetch(`/api/business/events/${eventId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'active' })
      })

      if (response.ok) {
        await loadEvents()
      } else {
        showError('Failed to resume event')
      }
    } catch (error) {
      console.error('Resume event error:', error)
      showError('Failed to resume event')
    }
  }

  const handleEndEvent = async (eventId: string) => {
    const confirmed = await confirm({
      title: 'End Campaign',
      message: 'Are you sure you want to end this campaign? This cannot be undone.',
      confirmText: 'End Campaign',
      type: 'danger'
    })

    if (!confirmed) {
      return
    }

    try {
      const response = await fetch(`/api/business/events/${eventId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'ended' })
      })

      if (response.ok) {
        await loadEvents()
      } else {
        showError('Failed to end event')
      }
    } catch (error) {
      console.error('End event error:', error)
      showError('Failed to end event')
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
    try {
      const response = await fetch(`/api/business/events/${eventId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (response.ok) {
        await loadEvents()
      } else {
        const error = await response.json()
        showError(error.message || 'Failed to delete event')
      }
    } catch (error) {
      console.error('Delete event error:', error)
      showError('Failed to delete event')
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
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
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {establishment?.name || 'Business Dashboard'}
              </h1>
              <p className="text-sm text-gray-500">
                Manage your punch card campaigns
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/business/orders')}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50"
              >
                My Orders
              </button>
              <button
                onClick={() => router.push('/business/validate-reward')}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium"
              >
                Validate Reward
              </button>
              <button
                onClick={() => router.push('/business/tags')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium"
              >
                Manage Tags
              </button>
              <button
                onClick={() => router.push('/business/register-tag')}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-sm font-medium"
              >
                Register Tag
              </button>
              <span className="text-sm text-gray-600">
                {user?.email}
              </span>
              <button
                onClick={handleSignOut}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Order Tags Banner */}
        {availableTags === 0 && !hasPendingOrder && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-blue-800">Order NFC Tags to Get Started</h3>
                <p className="mt-1 text-sm text-blue-700">
                  You need physical NFC tags to create campaigns. Order your first batch to begin.
                </p>
                <div className="mt-3">
                  <button
                    onClick={() => router.push('/business/order-tags')}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
                  >
                    Order Tags Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {availableTags === 0 && hasPendingOrder && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-yellow-800">Order In Progress</h3>
                <p className="mt-1 text-sm text-yellow-700">
                  Your tag order is being processed. You'll be able to register tags once they arrive.
                </p>
                <div className="mt-3">
                  <button
                    onClick={() => router.push('/business/orders')}
                    className="text-sm font-medium text-yellow-800 hover:text-yellow-900 underline"
                  >
                    View Order Status →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-gray-900">
              {events.length}
            </div>
            <div className="text-sm text-gray-500">Active Campaigns</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-gray-900">
              {events.reduce((sum, event) => sum + (event._count?.cards || 0), 0)}
            </div>
            <div className="text-sm text-gray-500">Total Cards Created</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-gray-900">
              {events.reduce((sum, event) => sum + (event._count?.completed_cards || 0), 0)}
            </div>
            <div className="text-sm text-gray-500">Completed Cards</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-indigo-600">
              {availableTags}
            </div>
            <div className="text-sm text-gray-500">Available Tags</div>
          </div>
        </div>

        {/* Events Section */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">
              Punch Card Campaigns
            </h2>
            <button
              onClick={() => availableTags > 0 ? setShowCreateEvent(true) : router.push('/business/order-tags')}
              disabled={availableTags === 0 && hasPendingOrder}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                availableTags > 0
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  : hasPendingOrder
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
              title={availableTags === 0 && !hasPendingOrder ? 'Order tags first' : availableTags === 0 ? 'Wait for order to arrive' : ''}
            >
              {availableTags === 0 && !hasPendingOrder ? 'Order Tags First' : 'Create Campaign'}
            </button>
          </div>

          <div className="px-6 py-4">
            {events.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-4xl mb-4">📋</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No campaigns yet
                </h3>
                <p className="text-gray-500 mb-4">
                  {availableTags === 0 
                    ? 'Order NFC tags to create your first punch card campaign.'
                    : 'Create your first punch card campaign to get started.'
                  }
                </p>
                {availableTags > 0 ? (
                  <button
                    onClick={() => setShowCreateEvent(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md font-medium"
                  >
                    Create Your First Campaign
                  </button>
                ) : (
                  <button
                    onClick={() => router.push('/business/order-tags')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium"
                    disabled={hasPendingOrder}
                  >
                    {hasPendingOrder ? 'Order In Progress' : 'Order Tags'}
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {events.map((event) => (
                  <div key={event.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium text-gray-900">{event.name}</h3>
                        <p className="text-sm text-gray-500">{event.description}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        event.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : event.status === 'paused'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {event.status}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                      <div>
                        Requirement: {event.rules_json.target_punches} punches
                      </div>
                      <div className="flex space-x-4">
                        <span>{event._count?.cards || 0} cards created</span>
                        <span>{event._count?.completed_cards || 0} completed</span>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedEventForTags(event.id)}
                        className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
                      >
                        View Tags
                      </button>
                      <button
                        onClick={() => setClaimingTags(event.id)}
                        className="text-purple-600 hover:text-purple-500 text-sm font-medium"
                      >
                        Claim Tags
                      </button>
                      <button
                        onClick={() => setEditingEvent(event)}
                        className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                      >
                        Edit
                      </button>
                      {event.status === 'active' && (
                        <button
                          onClick={() => handlePauseEvent(event.id)}
                          className="text-yellow-600 hover:text-yellow-500 text-sm font-medium"
                        >
                          Pause
                        </button>
                      )}
                      {event.status === 'paused' && (
                        <button
                          onClick={() => handleResumeEvent(event.id)}
                          className="text-green-600 hover:text-green-500 text-sm font-medium"
                        >
                          Resume
                        </button>
                      )}
                      <button
                        onClick={() => handleEndEvent(event.id)}
                        className="text-orange-600 hover:text-orange-500 text-sm font-medium"
                      >
                        End
                      </button>
                      <button
                        onClick={async () => {
                          const confirmed = await confirm({
                            title: 'Delete Campaign',
                            message: 'Are you sure you want to delete this campaign? This cannot be undone.',
                            confirmText: 'Delete',
                            type: 'danger'
                          })
                          if (confirmed) {
                            handleDeleteEvent(event.id)
                          }
                        }}
                        className="text-red-600 hover:text-red-500 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {showCreateEvent && (
          <CreateEventModal 
            onClose={() => setShowCreateEvent(false)}
            onSuccess={() => {
              setShowCreateEvent(false)
              loadEvents()
            }}
          />
        )}

        {editingEvent && (
          <EditEventModal 
            event={editingEvent}
            onClose={() => setEditingEvent(null)}
            onSuccess={() => {
              setEditingEvent(null)
              loadEvents()
            }}
          />
        )}

        {selectedEventForTags && (
          <TagManagementModal 
            eventId={selectedEventForTags}
            onClose={() => setSelectedEventForTags(null)}
          />
        )}

        {claimingTags && (
          <ClaimTagsModal 
            eventId={claimingTags}
            availableTags={availableTags}
            onClose={() => setClaimingTags(null)}
            onClaim={(quantity) => handleClaimTags(claimingTags, quantity)}
          />
        )}
      </main>
    </div>
  )
}
