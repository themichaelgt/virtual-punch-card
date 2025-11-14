'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

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
}

export default function OrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/business/orders')
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
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center text-gray-600">Loading orders...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tag Orders</h1>
            <p className="text-gray-600 mt-1">View and track your NFC tag orders</p>
          </div>
          <button
            onClick={() => router.push('/business/order-tags')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            New Order
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Orders Yet</h3>
            <p className="text-gray-600 mb-6">Order your first batch of NFC tags to get started</p>
            <button
              onClick={() => router.push('/business/order-tags')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Order Tags
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Order #{order.id.slice(0, 8)}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Placed on {formatDate(order.created_at)}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">{order.quantity}</div>
                    <div className="text-sm text-gray-600">tags</div>
                  </div>
                </div>

                <div className="border-t pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Order Details</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Total: <span className="font-semibold">${order.total_price}</span></p>
                      {order.fulfilled_at && (
                        <p>Fulfilled: {formatDate(order.fulfilled_at)}</p>
                      )}
                      {order.shipped_at && (
                        <p>Shipped: {formatDate(order.shipped_at)}</p>
                      )}
                      {order.tracking_number && (
                        <p>Tracking: <span className="font-mono">{order.tracking_number}</span></p>
                      )}
                    </div>
                  </div>
                </div>

                {order.notes && (
                  <div className="border-t mt-4 pt-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-1">Notes</h4>
                    <p className="text-sm text-gray-600">{order.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-8">
          <button
            onClick={() => router.push('/business/dashboard')}
            className="text-blue-600 hover:text-blue-700"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}