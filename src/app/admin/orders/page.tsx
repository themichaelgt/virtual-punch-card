'use client'

import { useEffect, useState } from 'react'
import { showError } from '@/lib/toast'
import { useConfirm } from '@/components/ConfirmDialog'
import { Tag } from '@/types/database'

interface Order {
  id: string
  quantity: number
  status: string
  shipping_address_json: {
    name: string
    address: string
    city: string
    state: string
    zip: string
    phone: string
  }
  notes: string | null
  total_price: number
  created_at: string
  fulfilled_at: string | null
  shipped_at: string | null
  tracking_number: string | null
  establishments: {
    id: string
    name: string
    profile_json: Record<string, unknown> | null
  }
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<'all' | 'pending' | 'shipped'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [fulfilling, setFulfilling] = useState<string | null>(null)
  const [viewingOrderTags, setViewingOrderTags] = useState<{orderId: string, tags: Tag[]} | null>(null)
  const [shippingOrderId, setShippingOrderId] = useState<string | null>(null)
  const [trackingNumber, setTrackingNumber] = useState('')

  const confirm = useConfirm()

  useEffect(() => {
    fetchOrders()
  }, [])

  const loadOrderTags = async (orderId: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/tags`)
      const data = await response.json()

      if (response.ok) {
        setViewingOrderTags({ orderId, tags: data.tags })
      } else {
        showError('Failed to load tags')
      }
    } catch {
      showError('Failed to load tags')
    }
  }

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/admin/orders')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch orders')
      }

      setOrders(data.orders)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const [generatedTags, setGeneratedTags] = useState<Array<{token: string, activation_code: string, label: string}> | null>(null)

  const handleFulfillOrder = async (orderId: string) => {
  const confirmed = await confirm({
    title: 'Fulfill Order',
    message: 'Generate activation codes and fulfill this order?',
    confirmText: 'Fulfill Order',
    type: 'info'
  })
  if (!confirmed) return

  setFulfilling(orderId)
  try {
    const response = await fetch(`/api/admin/orders/${orderId}/fulfill`, {
      method: 'POST'
    })
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fulfill order')
    }

    setGeneratedTags(data.tags) // Changed from setGeneratedCodes
    await fetchOrders()
  } catch (err) {
    showError(err instanceof Error ? err.message : 'Failed to fulfill order')
  } finally {
    setFulfilling(null)
  }
}

  const handleShipOrder = async (orderId: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/ship`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tracking_number: trackingNumber })
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to mark as shipped')
      }

      setShippingOrderId(null)
      setTrackingNumber('')
      await fetchOrders()
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to mark as shipped')
    }
  }

  // Utility function for printing activation codes (currently unused)
  // const printCodes = () => {
  //   const printWindow = window.open('', '', 'width=800,height=600')
  //   if (!printWindow) return

  //   printWindow.document.write(`
  //     <html>
  //       <head>
  //         <title>Activation Codes and NFC URLs</title>
  //         <style>
  //           body { font-family: Arial, sans-serif; padding: 20px; }
  //           .code-block { margin: 20px 0; padding: 15px; border: 2px solid #ccc; page-break-inside: avoid; }
  //           .label { font-size: 12px; color: #666; margin-bottom: 5px; }
  //           .activation-code { font-size: 24px; font-weight: bold; font-family: monospace; margin-bottom: 10px; }
  //           .nfc-url { font-size: 14px; font-family: monospace; color: #0066cc; }
  //         </style>
  //       </head>
  //       <body>
  //         <h1>NFC Tag Programming Sheet</h1>
  //         ${generatedCodes?.map((code, i) => `
  //           <div class="code-block">
  //             <div class="label">Tag ${i + 1} - Activation Code (print on sticker):</div>
  //             <div class="activation-code">${code}</div>
  //             <div class="label">NFC URL (program into tag):</div>
  //             <div class="nfc-url">${window.location.origin}/t/${code}</div>
  //           </div>
  //         `).join('')}
  //       </body>
  //     </html>
  //   `)
  //   printWindow.document.close()
  //   printWindow.print()
  // }

  const filteredOrders = orders
    .filter(order => {
      if (filter === 'pending') return order.status === 'pending'
      if (filter === 'shipped') return order.status === 'shipped'
      return true
    })
    .filter(order => {
      if (!searchTerm) return true
      return order.establishments.name.toLowerCase().includes(searchTerm.toLowerCase())
    })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'fulfilled':
        return 'bg-blue-100 text-blue-800'
      case 'shipped':
        return 'bg-purple-100 text-purple-800'
      case 'delivered':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center text-gray-600">Loading orders...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin - Order Management</h1>
          <p className="text-gray-600 mt-1">Manage and fulfill tag orders</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Generated Codes Modal */}
        {/* Generated Codes Modal */}
{/* Generated Tags Modal */}
{generatedTags && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-auto p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Tags Generated Successfully</h2>
      <p className="text-gray-600 mb-4">
        {generatedTags.length} tags created. Print the activation codes for stickers and program the URLs into NFC tags.
      </p>
      <div className="bg-gray-50 rounded p-4 mb-6 max-h-96 overflow-auto">
        {generatedTags.map((tag, index) => (
          <div key={index} className="py-3 border-b last:border-b-0">
            <div className="font-semibold text-gray-700 mb-2">{tag.label}</div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-500 mb-1">Activation Code (print on sticker):</div>
                <div className="font-mono text-lg font-bold">{tag.activation_code}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">NFC URL (program into tag):</div>
                <div className="font-mono text-sm text-blue-600 break-all">
                  {window.location.origin}/t/{tag.token}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-3">
        <button
          onClick={() => {
            const printWindow = window.open('', '', 'width=800,height=600')
            if (!printWindow) return
            printWindow.document.write(`
              <html>
                <head>
                  <title>NFC Tag Programming Sheet</title>
                  <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    .tag-block { margin: 20px 0; padding: 15px; border: 2px solid #ccc; page-break-inside: avoid; }
                    .label { font-size: 14px; font-weight: bold; margin-bottom: 10px; }
                    .section { margin: 10px 0; }
                    .section-label { font-size: 11px; color: #666; }
                    .activation-code { font-size: 28px; font-weight: bold; font-family: monospace; }
                    .nfc-url { font-size: 12px; font-family: monospace; color: #0066cc; word-break: break-all; }
                  </style>
                </head>
                <body>
                  <h1>NFC Tag Programming Sheet</h1>
                  ${generatedTags.map((tag) => `
                    <div class="tag-block">
                      <div class="label">${tag.label}</div>
                      <div class="section">
                        <div class="section-label">ACTIVATION CODE (print on sticker):</div>
                        <div class="activation-code">${tag.activation_code}</div>
                      </div>
                      <div class="section">
                        <div class="section-label">NFC URL (program into tag):</div>
                        <div class="nfc-url">${window.location.origin}/t/${tag.token}</div>
                      </div>
                    </div>
                  `).join('')}
                </body>
              </html>
            `)
            printWindow.document.close()
            printWindow.print()
          }}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Print Sheet
        </button>
        <button
          onClick={() => setGeneratedTags(null)}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}

{/* View Order Tags Modal */}
{viewingOrderTags && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-auto p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900">Order Tags</h2>
        <button
          onClick={() => setViewingOrderTags(null)}
          className="text-gray-400 hover:text-gray-600 text-2xl"
        >
          ×
        </button>
      </div>
      
      <div className="space-y-4">
        {viewingOrderTags.tags.map((tag, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4">
            <div className="font-semibold text-gray-700 mb-3">Tag #{index + 1}</div>
            <div className="grid grid-cols-1 gap-3">
              <div>
                <div className="text-xs text-gray-500 mb-1">Activation Code (for sticker):</div>
                <div className="font-mono text-lg font-bold bg-gray-50 p-2 rounded">
                  {tag.activation_code}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">NFC URL (to program):</div>
                <div className="font-mono text-sm text-blue-600 bg-gray-50 p-2 rounded break-all">
                  {window.location.origin}/t/{tag.token}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Status:</div>
                <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
                  tag.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {tag.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => setViewingOrderTags(null)}
        className="mt-6 w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
      >
        Close
      </button>
    </div>
  </div>
)}

        {/* Ship Order Modal */}
        {shippingOrderId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Mark as Shipped</h2>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tracking Number (Optional)
                </label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Enter tracking number..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleShipOrder(shippingOrderId)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Mark as Shipped
                </button>
                <button
                  onClick={() => {
                    setShippingOrderId(null)
                    setTrackingNumber('')
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All ({orders.length})
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-4 py-2 rounded-lg ${
                  filter === 'pending'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Pending ({orders.filter(o => o.status === 'pending').length})
              </button>
              <button
                onClick={() => setFilter('shipped')}
                className={`px-4 py-2 rounded-lg ${
                  filter === 'shipped'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Shipped ({orders.filter(o => o.status === 'shipped').length})
              </button>
            </div>
            <input
              type="text"
              placeholder="Search by business name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <p className="text-gray-600">No orders found</p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">
                        {order.establishments.name}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Order #{order.id.slice(0, 8)} • {formatDate(order.created_at)}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-gray-900">{order.quantity}</div>
                    <div className="text-sm text-gray-600">tags</div>
                    <div className="text-lg font-semibold text-blue-600 mt-1">
                      ${order.total_price}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Shipping Address</h4>
                    <div className="text-sm text-gray-600">
                      <p>{order.shipping_address_json.name}</p>
                      <p>{order.shipping_address_json.address}</p>
                      <p>
                        {order.shipping_address_json.city}, {order.shipping_address_json.state} {order.shipping_address_json.zip}
                      </p>
                      <p>{order.shipping_address_json.phone}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Timeline</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Ordered: {formatDate(order.created_at)}</p>
                      {order.fulfilled_at && (
                        <p>Fulfilled: {formatDate(order.fulfilled_at)}</p>
                      )}
                      {order.shipped_at && (
                        <p>Shipped: {formatDate(order.shipped_at)}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Tracking</h4>
                    <div className="text-sm text-gray-600">
                      {order.tracking_number ? (
                        <p className="font-mono">{order.tracking_number}</p>
                      ) : (
                        <p className="text-gray-400">No tracking number</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Tags</h4>
                    <div className="text-sm text-gray-600">
                      {order.status === 'pending' ? (
                        <p className="text-gray-400">Not yet generated</p>
                      ) : (
                        <button
                          onClick={() => loadOrderTags(order.id)}
                          className="text-blue-600 hover:text-blue-700 underline"
                        >
                          View {order.quantity} Tags
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {order.notes && (
                  <div className="bg-gray-50 rounded p-3 mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-1">Notes</h4>
                    <p className="text-sm text-gray-600">{order.notes}</p>
                  </div>
                )}

                <div className="flex gap-3 border-t pt-4">
                  {order.status === 'pending' && (
                    <button
                      onClick={() => handleFulfillOrder(order.id)}
                      disabled={fulfilling === order.id}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {fulfilling === order.id ? 'Fulfilling...' : 'Fulfill Order'}
                    </button>
                  )}
                  {order.status === 'fulfilled' && (
                    <button
                      onClick={() => setShippingOrderId(order.id)}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      Mark as Shipped
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

