// src/app/business/signup/page.tsx
'use client'

import { useState } from 'react'
import { createClientSupabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { showError } from '@/lib/toast'

export default function BusinessSignupPage() {
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [businessData, setBusinessData] = useState({
    email: '',
    businessName: '',
    ownerName: '',
    phone: '',
    address: ''
  })
  
  const supabase = createClientSupabase()
  const router = useRouter()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setBusinessData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Store business data in localStorage temporarily
      localStorage.setItem('pendingBusinessData', JSON.stringify(businessData))

      // Send magic link with redirect to business onboarding
      const { error } = await supabase.auth.signInWithOtp({
        email: businessData.email,
        options: {
          emailRedirectTo: `${window.location.origin}/business/complete-signup`
        }
      })

      if (error) {
        console.error('Signup error:', error)
        showError('Error sending magic link. Please try again.')
      } else {
        setEmailSent(true)
      }
    } catch (error) {
      console.error('Signup error:', error)
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
            We sent a magic link to <strong>{businessData.email}</strong>
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Click the link to complete your business account setup.
          </p>
          <button
            onClick={() => {
              setEmailSent(false)
              setBusinessData(prev => ({ ...prev, email: '' }))
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
          <h1 className="text-3xl font-bold text-gray-900">Start Your Business</h1>
          <p className="text-gray-600 mt-2">Create digital punch cards for your customers</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="businessName" className="block text-sm font-medium text-gray-700">
              Business Name *
            </label>
            <input
              type="text"
              name="businessName"
              id="businessName"
              required
              value={businessData.businessName}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Coffee Shop Co."
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="ownerName" className="block text-sm font-medium text-gray-700">
              Your Name *
            </label>
            <input
              type="text"
              name="ownerName"
              id="ownerName"
              required
              value={businessData.ownerName}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="John Smith"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address *
            </label>
            <input
              type="email"
              name="email"
              id="email"
              required
              value={businessData.email}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="owner@coffeeshop.com"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              id="phone"
              value={businessData.phone}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="(555) 123-4567"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
              Business Address
            </label>
            <textarea
              name="address"
              id="address"
              rows={3}
              value={businessData.address}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="123 Main St, City, State 12345"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Sending Magic Link...' : 'Create Business Account'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <button
              onClick={() => router.push('/business/login')}
              className="text-indigo-600 hover:text-indigo-500 font-medium"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}