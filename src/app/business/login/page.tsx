// src/app/business/login/page.tsx
'use client'

import { useState } from 'react'
import { createClientSupabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { showError } from '@/lib/toast'

export default function BusinessLoginPage() {
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [email, setEmail] = useState('')
  
  const supabase = createClientSupabase()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Send magic link with redirect to business dashboard
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/business/dashboard`
        }
      })

      if (error) {
        console.error('Login error:', error)
        showError('Error sending magic link. Please try again.')
      } else {
        setEmailSent(true)
      }
    } catch (error) {
      console.error('Login error:', error)
      showError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">📧</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email!</h1>
          <p className="text-gray-600 mb-4">
            We sent a magic link to <strong>{email}</strong>
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Click the link to access your business dashboard.
          </p>
          <button
            onClick={() => {
              setEmailSent(false)
              setEmail('')
            }}
            className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
          >
            Use a different email
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Business Sign In</h1>
          <p className="text-gray-600 mt-2">Access your punch card dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Business Email Address
            </label>
            <input
              type="email"
              id="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="owner@yourbusiness.com"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Sending Magic Link...' : 'Send Magic Link'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have a business account?{' '}
            <button
              onClick={() => router.push('/business/signup')}
              className="text-indigo-600 hover:text-indigo-500 font-medium"
            >
              Sign up here
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}