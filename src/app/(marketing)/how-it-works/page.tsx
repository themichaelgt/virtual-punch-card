// src/app/(marketing)/how-it-works/page.tsx
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'How It Works - Virtual Punch Card',
  description: 'Learn how Virtual Punch Card makes it easy for businesses to create digital loyalty programs and for customers to collect rewards.',
}

export default function HowItWorksPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-indigo-50 to-purple-50 pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            How Virtual Punch Card Works
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From setup to customer rewards in three simple steps. No technical knowledge required.
          </p>
        </div>
      </section>

      {/* For Businesses */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              For Businesses
            </h2>
            <p className="text-lg text-gray-600">
              Set up your digital loyalty program in minutes
            </p>
          </div>

          <div className="space-y-16">
            {/* Step 1 */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <div className="inline-block bg-indigo-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl mb-4">
                  1
                </div>
                <h3 className="text-2xl font-bold mb-4">Create Your Account & Order Tags</h3>
                <p className="text-gray-600 mb-4">
                  Sign up for a free business account using just your email. No credit card required to start.
                </p>
                <p className="text-gray-600 mb-4">
                  Then order NFC tags from your dashboard ($5 per tag, minimum 10). Tags ship within 5-7 business days.
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Passwordless sign-up with magic link</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Provide shipping address for tags</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Track order status in dashboard</span>
                  </li>
                </ul>
              </div>
              <div className="order-1 md:order-2 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl p-8 h-64 flex items-center justify-center">
                <span className="text-8xl">📦</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl p-8 h-64 flex items-center justify-center">
                <span className="text-8xl">🏷️</span>
              </div>
              <div>
                <div className="inline-block bg-indigo-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl mb-4">
                  2
                </div>
                <h3 className="text-2xl font-bold mb-4">Register Tags & Create Campaigns</h3>
                <p className="text-gray-600 mb-4">
                  When your tags arrive, use the activation codes (printed on each tag) to register them in your dashboard.
                </p>
                <p className="text-gray-600 mb-4">
                  Then create your first campaign - set the reward (e.g., &quot;Free coffee&quot;), target punches (e.g., 10 visits), and any rules.
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Enter activation codes to claim tags</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Create unlimited campaigns</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Assign tags to specific campaigns</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Step 3 */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <div className="inline-block bg-indigo-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl mb-4">
                  3
                </div>
                <h3 className="text-2xl font-bold mb-4">Place Tags & Start Collecting Data</h3>
                <p className="text-gray-600 mb-4">
                  Place your NFC tags at checkout, on tables, or anywhere customers can easily tap them.
                </p>
                <p className="text-gray-600 mb-4">
                  Customers tap their phone on the tag, sign in once (via magic link), and their punch is recorded automatically.
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Works through most surfaces (wood, plastic, glass)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Track all punches in real-time</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Validate reward codes when customers redeem</span>
                  </li>
                </ul>
              </div>
              <div className="order-1 md:order-2 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl p-8 h-64 flex items-center justify-center">
                <span className="text-8xl">📍</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* For Customers */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              For Customers
            </h2>
            <p className="text-lg text-gray-600">
              Collect punches and earn rewards effortlessly
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white rounded-xl p-6 shadow-sm text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📱</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">1. Tap the Tag</h3>
              <p className="text-gray-600">
                Simply hold your phone near the NFC tag. No app to download - works instantly on iPhone and Android.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">✉️</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">2. Sign In Once</h3>
              <p className="text-gray-600">
                On your first tap, enter your email to receive a magic link. After that, you&apos;re automatically signed in.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🎁</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">3. Get Rewarded</h3>
              <p className="text-gray-600">
                When you complete your card, you instantly receive a reward code. Show it to the business to claim your reward!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Dashboard */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">Track Everything in One Place</h2>
              <p className="text-gray-600 mb-6">
                Customers can view all their active punch cards, track progress toward rewards, and access reward codes anytime from the customer dashboard.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 mt-1">✓</span>
                  <span><strong>Active cards:</strong> See progress bars for each campaign</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 mt-1">✓</span>
                  <span><strong>Available rewards:</strong> Reward codes ready to redeem</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 mt-1">✓</span>
                  <span><strong>History:</strong> View completed cards and past rewards</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 mt-1">✓</span>
                  <span><strong>Works everywhere:</strong> Access from any device with a browser</span>
                </li>
              </ul>
            </div>
            <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-8 h-80 flex items-center justify-center">
              <span className="text-9xl">📊</span>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Details */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Technical Details</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-lg mb-3">NFC Technology</h3>
              <p className="text-gray-600 text-sm mb-4">
                Near Field Communication (NFC) is the same technology used for contactless payments. It&apos;s built into every modern smartphone.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Works on iPhone 7 and newer</li>
                <li>• Works on most Android phones (2016+)</li>
                <li>• No pairing or Bluetooth required</li>
                <li>• Read range: 1-2 inches</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-lg mb-3">Security & Privacy</h3>
              <p className="text-gray-600 text-sm mb-4">
                Your data is secure with enterprise-grade encryption and authentication powered by Supabase.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Passwordless authentication</li>
                <li>• Encrypted data storage</li>
                <li>• Rate limiting prevents abuse</li>
                <li>• GDPR compliant</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-indigo-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Try It Yourself?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Create your free business account and see how easy it is to set up your first campaign.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/business/signup"
              className="inline-block bg-white text-indigo-600 px-8 py-4 rounded-lg hover:bg-gray-100 transition font-semibold text-lg shadow-lg"
            >
              Get Started Free
            </Link>
            <Link
              href="/pricing"
              className="inline-block bg-indigo-500 text-white px-8 py-4 rounded-lg hover:bg-indigo-400 transition font-semibold text-lg border-2 border-white/20"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
