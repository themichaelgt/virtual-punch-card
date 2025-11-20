'use client'

import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'

export default function CustomerError({
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
                <div>
                    <h2 className="text-xl font-bold text-gray-900">
                        Unable to load your card
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        There was a problem loading your punch card information.
                    </p>
                </div>
                <button
                    onClick={() => reset()}
                    className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
                >
                    Try Again
                </button>
            </div>
        </div>
    )
}
