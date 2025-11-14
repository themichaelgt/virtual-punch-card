// src/app/business/register-tag/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function RegisterTagPage() {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean, message: string } | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) return

    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/business/tags/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ activationCode: code.toUpperCase().trim() })
      })

      const data = await response.json()

      if (response.ok) {
        setResult({ success: true, message: data.message })
        setCode('')
        // Redirect to tag management after success
        setTimeout(() => {
          router.push('/business/tags')
        }, 2000)
      } else {
        setResult({ success: false, message: data.message })
      }
    } catch (error) {
      console.error('Registration error:', error)
      setResult({ success: false, message: 'Network error occurred. Please try again.' })
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
              <h1 className="text-2xl font-bold text-gray-900">Register NFC Tag</h1>
              <p className="text-sm text-gray-500">Add a new tag to your inventory</p>
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
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Enter Activation Code</h2>
            <p className="text-gray-600">
              Find the activation code printed on your NFC tag sticker (e.g., VPC-A7X9-2K4M)
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                Activation Code
              </label>
              <input
                type="text"
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="block w-full px-4 py-3 text-lg font-mono border-2 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 uppercase"
                placeholder="VPC-XXXX-XXXX"
                disabled={loading}
                autoFocus
                maxLength={20}
                pattern="[A-Z0-9-]+"
              />
              <p className="mt-2 text-sm text-gray-500">
                Format: VPC-XXXX-XXXX (dashes optional)
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !code.trim()}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Registering...' : 'Register Tag'}
            </button>
          </form>

          {/* Result Display */}
          {result && (
            <div className={`mt-6 p-4 rounded-lg border-2 ${
              result.success 
                ? 'bg-green-50 border-green-500' 
                : 'bg-red-50 border-red-500'
            }`}>
              <div className="flex items-start">
                <div className="text-2xl mr-3">
                  {result.success ? '✓' : '✗'}
                </div>
                <div>
                  <h3 className={`font-semibold ${
                    result.success ? 'text-green-900' : 'text-red-900'
                  }`}>
                    {result.success ? 'Success!' : 'Registration Failed'}
                  </h3>
                  <p className={`text-sm mt-1 ${
                    result.success ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {result.message}
                  </p>
                  {result.success && (
                    <p className="text-sm text-green-600 mt-2">
                      Redirecting to tag management...
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">How to Register Your Tags:</h3>
          <ol className="list-decimal list-inside space-y-2 text-blue-800">
            <li>Locate the activation code printed on your NFC tag sticker</li>
            <li>Enter the code exactly as shown (VPC-XXXX-XXXX format)</li>
            <li>Click "Register Tag" to add it to your inventory</li>
            <li>Once registered, you can assign it to a campaign from the dashboard</li>
            <li>Repeat for each tag you purchased</li>
          </ol>
          <div className="mt-4 pt-4 border-t border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Each activation code can only be registered once. If you encounter issues, contact support.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}