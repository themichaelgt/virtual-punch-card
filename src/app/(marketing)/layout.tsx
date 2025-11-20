// src/app/(marketing)/layout.tsx
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Virtual Punch Card - Digital Loyalty Cards for Your Business',
  description: 'Modern NFC-powered loyalty cards that customers tap with their phones. No app required. Increase customer retention effortlessly.',
}

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">VP</span>
              </div>
              <span className="font-bold text-xl text-gray-900">Virtual Punch Card</span>
            </Link>

            {/* Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/features" className="text-gray-600 hover:text-indigo-600 transition">
                Features
              </Link>
              <Link href="/pricing" className="text-gray-600 hover:text-indigo-600 transition">
                Pricing
              </Link>
              <Link href="/how-it-works" className="text-gray-600 hover:text-indigo-600 transition">
                How It Works
              </Link>
              <Link href="/contact" className="text-gray-600 hover:text-indigo-600 transition">
                Contact
              </Link>
              <Link
                href="/business/login"
                className="text-indigo-600 hover:text-indigo-700 font-medium transition"
              >
                Sign In
              </Link>
              <Link
                href="/business/signup"
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition font-medium"
              >
                Get Started
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Link
                href="/business/signup"
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                Get Started
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Main content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company */}
            <div>
              <h3 className="text-white font-semibold mb-4">Virtual Punch Card</h3>
              <p className="text-sm text-gray-400">
                Modern digital loyalty cards powered by NFC technology.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/features" className="hover:text-white transition">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-white transition">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/how-it-works" className="hover:text-white transition">
                    How It Works
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/contact" className="hover:text-white transition">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/business/signup" className="hover:text-white transition">
                    Get Started
                  </Link>
                </li>
              </ul>
            </div>

            {/* Get Started */}
            <div>
              <h4 className="text-white font-semibold mb-4">Get Started</h4>
              <p className="text-sm text-gray-400 mb-4">
                Ready to modernize your loyalty program?
              </p>
              <Link
                href="/business/signup"
                className="inline-block bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
              >
                Sign Up Free
              </Link>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-gray-400 text-center">
            <p>&copy; {new Date().getFullYear()} Virtual Punch Card. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
