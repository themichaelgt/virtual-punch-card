// src/app/(marketing)/page.tsx
import Link from 'next/link'

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Digital Loyalty Cards That{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                Actually Work
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Say goodbye to lost punch cards. Customers just tap their phone on an NFC tag to collect punches.
              No app download required. Simple, modern, effective.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/business/signup"
                className="bg-indigo-600 text-white px-8 py-4 rounded-lg hover:bg-indigo-700 transition font-semibold text-lg shadow-lg hover:shadow-xl"
              >
                Get Started Free
              </Link>
              <Link
                href="/how-it-works"
                className="bg-white text-indigo-600 px-8 py-4 rounded-lg hover:bg-gray-50 transition font-semibold text-lg border-2 border-indigo-600"
              >
                See How It Works
              </Link>
            </div>
            <p className="mt-6 text-sm text-gray-500">
              ✓ No monthly fees ✓ No app required ✓ Works with any smartphone
            </p>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Traditional Punch Cards Are Broken
            </h2>
            <p className="text-lg text-gray-600">
              Paper cards get lost, damaged, or forgotten. Your customers lose their progress, and you lose repeat business.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📄</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Gets Lost</h3>
              <p className="text-gray-600 text-sm">
                Customers forget their punch cards at home or lose them entirely
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">💧</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Gets Damaged</h3>
              <p className="text-gray-600 text-sm">
                Water, wear and tear make paper cards unreadable over time
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">✏️</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Easy to Fake</h3>
              <p className="text-gray-600 text-sm">
                Anyone can stamp their own card or copy someone else&apos;s
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20 bg-gradient-to-br from-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              The Modern Solution: Tap, Track, Reward
            </h2>
            <p className="text-lg text-indigo-100">
              Virtual Punch Card uses NFC technology built into every smartphone. No app downloads, no hassle.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white/10 backdrop-blur rounded-xl p-6">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="font-semibold text-xl mb-2">1. Customer Taps</h3>
              <p className="text-indigo-100">
                Customer taps their phone on your NFC tag. Works with iPhone and Android - no app needed.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-6">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="font-semibold text-xl mb-2">2. Progress Tracked</h3>
              <p className="text-indigo-100">
                Their punch is automatically recorded. They can view their progress anytime on their phone.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-6">
              <div className="text-4xl mb-4">🎁</div>
              <h3 className="font-semibold text-xl mb-2">3. Reward Earned</h3>
              <p className="text-indigo-100">
                When they complete their card, they instantly receive a reward code to redeem.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Boost Customer Loyalty
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🚀</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Quick Setup</h3>
              <p className="text-gray-600">
                Order NFC tags, create your campaign, and start collecting customer data in minutes.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">📲</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">No App Required</h3>
              <p className="text-gray-600">
                Customers tap with their phone&apos;s built-in NFC. Works on iPhone and Android automatically.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🔒</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Fraud Prevention</h3>
              <p className="text-gray-600">
                Built-in cooldown periods and punch limits prevent abuse and fake punches.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Customer Dashboard</h3>
              <p className="text-gray-600">
                Customers see all their active cards and rewards in one place. Never lose progress again.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">⚙️</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Flexible Rules</h3>
              <p className="text-gray-600">
                Set custom targets, cooldown periods, daily limits, and repeat rewards for each campaign.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">✉️</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Magic Link Auth</h3>
              <p className="text-gray-600">
                Passwordless authentication via email. Simple and secure for both you and your customers.
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link
              href="/features"
              className="text-indigo-600 hover:text-indigo-700 font-semibold text-lg"
            >
              View All Features →
            </Link>
          </div>
        </div>
      </section>

      {/* Social Proof / Use Cases */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Perfect For Any Business
            </h2>
            <p className="text-lg text-gray-600">
              From coffee shops to car washes, any business can benefit from modern loyalty rewards.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center p-6">
              <div className="text-5xl mb-3">☕</div>
              <h3 className="font-semibold mb-1">Coffee Shops</h3>
              <p className="text-sm text-gray-600">Buy 10, get 1 free</p>
            </div>
            <div className="text-center p-6">
              <div className="text-5xl mb-3">🍕</div>
              <h3 className="font-semibold mb-1">Restaurants</h3>
              <p className="text-sm text-gray-600">Reward loyal diners</p>
            </div>
            <div className="text-center p-6">
              <div className="text-5xl mb-3">💇</div>
              <h3 className="font-semibold mb-1">Salons & Spas</h3>
              <p className="text-sm text-gray-600">Track appointments</p>
            </div>
            <div className="text-center p-6">
              <div className="text-5xl mb-3">🚗</div>
              <h3 className="font-semibold mb-1">Car Washes</h3>
              <p className="text-sm text-gray-600">Unlimited monthly plans</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            No monthly fees. No hidden costs. Just pay for the NFC tags you need.
          </p>

          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 max-w-md mx-auto">
            <div className="text-4xl font-bold text-indigo-600 mb-2">$5</div>
            <div className="text-gray-600 mb-6">per NFC tag (one-time)</div>
            <ul className="text-left space-y-3 mb-8">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Unlimited punches per tag</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Unlimited campaigns</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Customer dashboard included</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>No monthly subscription</span>
              </li>
            </ul>
            <Link
              href="/pricing"
              className="block w-full bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition font-semibold"
            >
              View Full Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-indigo-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Modernize Your Loyalty Program?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Join businesses already using Virtual Punch Card to increase customer retention and boost repeat visits.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/business/signup"
              className="bg-white text-indigo-600 px-8 py-4 rounded-lg hover:bg-gray-100 transition font-semibold text-lg shadow-lg"
            >
              Get Started Free
            </Link>
            <Link
              href="/contact"
              className="bg-indigo-500 text-white px-8 py-4 rounded-lg hover:bg-indigo-400 transition font-semibold text-lg border-2 border-white/20"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
