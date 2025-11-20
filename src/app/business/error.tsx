'use client'

import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'

export default function BusinessError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        Sentry.captureException(error)
    }, [error])

    return (
        <div className="min-h-[50vh] flex items-center justify-center px-4 py-12">
            <div className="max-w-md w-full space-y-6 text-center">
                <div className="bg-red-50 p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-900">
                        Dashboard Error
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        We encountered an issue loading your dashboard data.
                    </p>
                </div>
                <div className="flex justify-center gap-4">
                    <button
                        onClick={() => reset()}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
                    >
                        Retry
                    </button>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50"
                    >
                        Reload Page
                    </button>
                </div>
            </div>
        </div>
    )
}
