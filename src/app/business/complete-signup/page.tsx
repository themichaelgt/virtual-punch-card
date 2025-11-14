// src/app/business/complete-signup/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { createClientSupabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'

export default function CompleteBusinessSignup() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientSupabase()
  const router = useRouter()

  useEffect(() => {
    const completeSignup = async () => {
  try {
    // Wait a bit for auth to settle
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      setError('Authentication failed. Please try signing up again.')
      setLoading(false)
      return
    }

    setUser(user)

    // Get stored business data from localStorage
    const storedData = localStorage.getItem('pendingBusinessData')
    if (!storedData) {
      setError('Business data not found. Please try signing up again.')
      setLoading(false)
      return
    }

    const businessData = JSON.parse(storedData)

    // Get the session to include in the request
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      setError('No valid session found. Please try signing up again.')
      setLoading(false)
      return
    }

    // Create establishment record with user data
const establishmentResponse = await fetch('/api/business/create-establishment', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include',
  body: JSON.stringify({
    name: businessData.businessName,
    ownerName: businessData.ownerName,
    phone: businessData.phone,
    address: businessData.address,
    userEmail: user.email,
    userId: user.id
  })
})

    if (!establishmentResponse.ok) {
      const errorData = await establishmentResponse.json()
      setError(errorData.message || 'Failed to create business account')
      setLoading(false)
      return
    }

    // Clean up localStorage
    localStorage.removeItem('pendingBusinessData')

    // Redirect to dashboard
    setTimeout(() => {
      router.push('/business/dashboard')
    }, 2000)

  } catch (error) {
    console.error('Signup completion error:', error)
    setError('An unexpected error occurred. Please try again.')
    setLoading(false)
  }
}

    completeSignup()
  }, [router, supabase])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Setting up your business account...</h1>
          <p className="text-gray-600">This will only take a moment.</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-xl font-bold text-red-600 mb-2">Setup Failed</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/business/signup')}
            className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-2xl font-bold text-green-600 mb-2">Welcome to Virtual Punch Card!</h1>
        <p className="text-gray-600 mb-4">
          Your business account has been created successfully.
        </p>
        <p className="text-sm text-gray-500 mb-6">
          Redirecting to your dashboard...
        </p>
        <div className="animate-pulse bg-gray-200 h-2 rounded-full"></div>
      </div>
    </div>
  )
}