// src/app/(marketing)/features/page.tsx
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Features - Virtual Punch Card',
  description: 'Explore all the features that make Virtual Punch Card the best digital loyalty solution for your business.',
}

export default function FeaturesPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-indigo-50 to-purple-50 pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Powerful Features for Modern Businesses
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to create, manage, and track digital loyalty campaigns that your customers will actually use.
          </p>
        </div>
      </section>

      {/* Feature Sections */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">

          {/* NFC Technology */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full text-sm font-semibold mb-4">
                Core Technology
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                NFC-Powered Simplicity
              </h2>
              <p className="text-gray-600 mb-6">
                Every modern smartphone has NFC built in. Customers just tap their phone on your NFC tag - no app download, no QR codes to scan, no friction.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 mt-1">✓</span>
                  <span><strong>Works on all devices:</strong> iPhone 7+ and Android phones with NFC</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 mt-1">✓</span>
                  <span><strong>Instant recognition:</strong> Tap completes in under 1 second</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 mt-1">✓</span>
                  <span><strong>No installation:</strong> Uses phone&apos;s native NFC reader</span>
                </li>
              </ul>
            </div>
            <div className="bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl p-8 h-64 flex items-center justify-center">
              <span className="text-8xl">📱</span>
            </div>
          </div>

          {/* Customer Dashboard */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl p-8 h-64 flex items-center justify-center">
              <span className="text-8xl">📊</span>
            </div>
            <div className="order-1 md:order-2">
              <div className="inline-block bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-semibold mb-4">
                Customer Experience
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Beautiful Customer Dashboard
              </h2>
              <p className="text-gray-600 mb-6">
                Customers can view all their active punch cards, track progress, and access rewards anytime from any device. No app required - just visit the website.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 mt-1">✓</span>
                  <span><strong>Real-time progress:</strong> See punches as they happen</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 mt-1">✓</span>
                  <span><strong>Reward codes:</strong> Digital codes ready to redeem</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 mt-1">✓</span>
                  <span><strong>History tracking:</strong> View completed cards and past rewards</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Business Dashboard */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-sm font-semibold mb-4">
                Business Tools
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Complete Campaign Management
              </h2>
              <p className="text-gray-600 mb-6">
                Create and manage unlimited campaigns from your dashboard. Track active cards, validate rewards, and monitor engagement - all in one place.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 mt-1">✓</span>
                  <span><strong>Unlimited campaigns:</strong> Run multiple promotions simultaneously</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 mt-1">✓</span>
                  <span><strong>Tag management:</strong> Assign and reassign NFC tags easily</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 mt-1">✓</span>
                  <span><strong>Reward validation:</strong> Verify codes before giving rewards</span>
                </li>
              </ul>
            </div>
            <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-8 h-64 flex items-center justify-center">
              <span className="text-8xl">💼</span>
            </div>
          </div>

          {/* Flexible Rules */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl p-8 h-64 flex items-center justify-center">
              <span className="text-8xl">⚙️</span>
            </div>
            <div className="order-1 md:order-2">
              <div className="inline-block bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm font-semibold mb-4">
                Customization
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Customizable Campaign Rules
              </h2>
              <p className="text-gray-600 mb-6">
                Design campaigns that fit your business model. Set targets, prevent fraud, and control how customers earn rewards.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 mt-1">✓</span>
                  <span><strong>Target punches:</strong> Any number from 5 to 50+</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 mt-1">✓</span>
                  <span><strong>Cooldown periods:</strong> Prevent punch-spamming (e.g., max 1 per day)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 mt-1">✓</span>
                  <span><strong>Daily limits:</strong> Cap punches per day</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 mt-1">✓</span>
                  <span><strong>Repeat rewards:</strong> Allow cards to reset after completion</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Fraud Prevention */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-semibold mb-4">
                Security
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Built-In Fraud Prevention
              </h2>
              <p className="text-gray-600 mb-6">
                Unlike paper punch cards, Virtual Punch Card makes it virtually impossible for customers to cheat or abuse your loyalty program.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 mt-1">✓</span>
                  <span><strong>Rate limiting:</strong> Prevent rapid-fire punch attempts</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 mt-1">✓</span>
                  <span><strong>Unique codes:</strong> Every reward code is generated randomly</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 mt-1">✓</span>
                  <span><strong>One-time use:</strong> Codes automatically expire after redemption</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 mt-1">✓</span>
                  <span><strong>Audit trail:</strong> Every punch is logged with timestamp</span>
                </li>
              </ul>
            </div>
            <div className="bg-gradient-to-br from-red-100 to-orange-100 rounded-2xl p-8 h-64 flex items-center justify-center">
              <span className="text-8xl">🔒</span>
            </div>
          </div>

          {/* Magic Link Authentication */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-2xl p-8 h-64 flex items-center justify-center">
              <span className="text-8xl">✉️</span>
            </div>
            <div className="order-1 md:order-2">
              <div className="inline-block bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-semibold mb-4">
                Authentication
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Passwordless Magic Links
              </h2>
              <p className="text-gray-600 mb-6">
                No passwords to remember or reset. Customers (and businesses) sign in with a magic link sent to their email. Simple, secure, and modern.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 mt-1">✓</span>
                  <span><strong>No passwords:</strong> Just enter your email and click the link</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 mt-1">✓</span>
                  <span><strong>Secure:</strong> Uses industry-standard Supabase Auth</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 mt-1">✓</span>
                  <span><strong>Fast:</strong> Email arrives in seconds</span>
                </li>
              </ul>
            </div>
          </div>

        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-indigo-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Try These Features?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Get started in minutes. No credit card required.
          </p>
          <Link
            href="/business/signup"
            className="inline-block bg-white text-indigo-600 px-8 py-4 rounded-lg hover:bg-gray-100 transition font-semibold text-lg shadow-lg"
          >
            Start Free Trial
          </Link>
        </div>
      </section>
    </>
  )
}
