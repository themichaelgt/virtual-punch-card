// src/app/business/validate-reward/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface ValidationResult {
  valid: boolean
  message: string
  redeemed_at?: string
  reward?: {
    code: string
    event_name: string
    customer_email: string
    customer_name: string
    issued_at: string
  }
}

export default function ValidateRewardPage() {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ValidationResult | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) return

    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/business/validate-reward', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ code: code.toUpperCase().trim() })
      })

      const data = await response.json()
      setResult(data)
      
      if (data.valid) {
        // Clear the input on success
        setTimeout(() => {
          setCode('')
          setResult(null)
        }, 5000)
      }
    } catch (error) {
      console.error('Validation error:', error)
      setResult({
        valid: false,
        message: 'Network error occurred. Please try again.'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Validate Reward</h1>
              <p className="text-sm text-gray-500">Check and redeem customer reward codes</p>
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

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="code" className="block text-lg font-medium text-gray-900 mb-2">
                Enter Reward Code
              </label>
              <input
                type="text"
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="block w-full px-4 py-3 text-2xl font-mono border-2 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 uppercase"
                placeholder="ABC123XY"
                disabled={loading}
                autoFocus
                maxLength={20}
              />
              <p className="mt-2 text-sm text-gray-500">
                Ask the customer to show you their reward code
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !code.trim()}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Validating...' : 'Validate Reward'}
            </button>
          </form>

          {/* Result Display */}
          {result && (
            <div className={`mt-8 p-6 rounded-lg border-2 ${
              result.valid 
                ? 'bg-green-50 border-green-500' 
                : 'bg-red-50 border-red-500'
            }`}>
              <div className="text-center">
                <div className="text-6xl mb-4">
                  {result.valid ? '✓' : '✗'}
                </div>
                <h3 className={`text-2xl font-bold mb-2 ${
                  result.valid ? 'text-green-900' : 'text-red-900'
                }`}>
                  {result.valid ? 'Valid Reward!' : 'Invalid Reward'}
                </h3>
                <p className={`text-lg mb-4 ${
                  result.valid ? 'text-green-700' : 'text-red-700'
                }`}>
                  {result.message}
                </p>

                {result.valid && result.reward && (
                  <div className="bg-white rounded-lg p-4 mt-4 text-left">
                    <h4 className="font-semibold text-gray-900 mb-3">Reward Details:</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Campaign:</span>
                        <span className="font-medium text-gray-900">{result.reward.event_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Customer:</span>
                        <span className="font-medium text-gray-900">{result.reward.customer_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email:</span>
                        <span className="font-medium text-gray-900">{result.reward.customer_email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Earned:</span>
                        <span className="font-medium text-gray-900">
                          {new Date(result.reward.issued_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Code:</span>
                        <span className="font-mono font-bold text-gray-900">{result.reward.code}</span>
                      </div>
                    </div>
                  </div>
                )}

                {result.redeemed_at && (
                  <div className="mt-4 text-sm text-red-600">
                    Already redeemed on: {new Date(result.redeemed_at).toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">How to use:</h3>
          <ol className="list-decimal list-inside space-y-2 text-blue-800">
            <li>Ask the customer to show their reward code</li>
            <li>Enter the code in the field above</li>
            <li>Click "Validate Reward" to check if it's legitimate</li>
            <li>If valid, provide the reward and the code will be marked as redeemed</li>
            <li>If invalid or already used, inform the customer</li>
          </ol>
        </div>
      </main>
    </div>
  )
}