// src/app/tap/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClientSupabase } from '@/lib/supabase'
import { showError, showInfo } from '@/lib/toast'

interface PunchResponse {
  status: 'punched' | 'completed' | 'error'
  progress?: number
  remaining?: number
  reward?: { code: string }
  message?: string
  next_eligible_at?: string
}

export default function TapPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  
  const [loading, setLoading] = useState(true)
  const [result, setResult] = useState<PunchResponse | null>(null)
  const [user, setUser] = useState<any>(null)
  const [authLoading, setAuthLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const supabase = createClientSupabase()

  useEffect(() => {
    // If no token, show error
    if (!token) {
      setResult({
        status: 'error',
        message: 'No tap session found - please tap the NFC tag again'
      })
      setLoading(false)
      return
    }

    let hasAttemptedPunch = false

    const checkAuthAndPunch = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
        
        if (user && !hasAttemptedPunch) {
          // User is authenticated, attempt punch
          hasAttemptedPunch = true
          await attemptPunch()
        } else {
          // No user, show login form
          setLoading(false)
        }
      } catch (error) {
        console.error('Auth check error:', error)
        setLoading(false)
      }
    }

    checkAuthAndPunch()

    // Listen for auth state changes (only for new sign-ins, not existing sessions)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user && !hasAttemptedPunch) {
        setUser(session.user)
        setLoading(true)
        hasAttemptedPunch = true
        await attemptPunch()
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setResult(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [token])

  const attemptPunch = async () => {
    if (!token) {
      setResult({
        status: 'error',
        message: 'No token found'
      })
      setLoading(false)
      return
    }

    try {
      // Try to get user's location
      let location = null
      if (navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              timeout: 5000,
              maximumAge: 60000
            })
          })
          location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }
        } catch (geoError) {
          console.log('Location access denied or unavailable')
        }
      }

      const response = await fetch('/api/punch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ token, location })
      })

      const data: PunchResponse = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        status: 'error',
        message: 'Network error occurred'
      })
    } finally {
      setLoading(false)
    }
  }

  const signInWithMagicLink = async (email: string) => {
    setAuthLoading(true)
    
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/tap?token=${token}`
        }
      })
      
      if (error) {
        console.error('Magic link error:', error)
        showError('Error sending magic link. Please try again.')
      } else {
        setEmailSent(true)
      }
    } catch (error) {
      console.error('Auth error:', error)
      showError('Something went wrong. Please try again.')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleEmailSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    if (email && email.includes('@')) {
      signInWithMagicLink(email)
    } else {
      showError('Please enter a valid email address')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Processing your tap...</p>
        </div>
      </div>
    )
  }

  // Show login form if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Welcome!</h1>
            <p className="text-gray-600 mt-2">Sign in to get your punch card stamp</p>
          </div>

          {!emailSent ? (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="your@email.com"
                  disabled={authLoading}
                />
              </div>
              <button
                type="submit"
                disabled={authLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {authLoading ? 'Sending...' : 'Send Magic Link'}
              </button>
            </form>
          ) : (
            <div className="text-center">
              <div className="text-4xl mb-4">📧</div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Check Your Email!</h2>
              <p className="text-gray-600 mb-4">
                We sent you a magic link. Click it to sign in and get your punch!
              </p>
              <button
                onClick={() => setEmailSent(false)}
                className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
              >
                Use a different email
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Show punch result
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        {result?.status === 'completed' && (
          <>
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-2xl font-bold text-green-600 mb-2">Congratulations!</h1>
            <p className="text-gray-600 mb-6">You've completed your punch card!</p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="font-mono text-lg font-bold">{result.reward?.code}</p>
              <p className="text-sm text-gray-500">Show this code to redeem your reward</p>
            </div>
          </>
        )}

        {result?.status === 'punched' && (
          <>
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-2xl font-bold text-blue-600 mb-2">Punched!</h1>
            <div className="bg-blue-50 rounded-lg p-6 mb-6">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {result.progress}/{result.progress! + result.remaining!}
              </div>
              <p className="text-blue-700">
                {result.remaining} more {result.remaining === 1 ? 'punch' : 'punches'} to go!
              </p>
            </div>
          </>
        )}

        {result?.status === 'error' && (
          <>
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-red-600 mb-2">Oops!</h1>
            <p className="text-gray-600 mb-6">{result.message}</p>
            {result.next_eligible_at && (
              <p className="text-sm text-gray-500">
                Next punch available: {new Date(result.next_eligible_at).toLocaleString()}
              </p>
            )}
          </>
        )}

        <div className="mt-6 space-y-2">
          <p className="text-sm text-gray-500">
            Signed in as: {user.email}
          </p>
          <button 
            onClick={() => supabase.auth.signOut()}
            className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  )
}