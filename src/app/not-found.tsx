import Link from 'next/link'

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 text-center">
                <div>
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        Page Not Found
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Could not find the requested resource.
                    </p>
                </div>
                <div className="mt-5">
                    <Link
                        href="/"
                        className="text-base font-medium text-indigo-600 hover:text-indigo-500"
                    >
                        Go back home <span aria-hidden="true">&rarr;</span>
                    </Link>
                </div>
            </div>
        </div>
    )
}
