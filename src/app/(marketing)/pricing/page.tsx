// src/app/(marketing)/pricing/page.tsx
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing - Virtual Punch Card',
  description: 'Simple, transparent pricing. No monthly fees, no hidden costs. Just pay for the NFC tags you need.',
}

export default function PricingPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-indigo-50 to-purple-50 pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            No monthly subscriptions. No hidden fees. Pay once for NFC tags and use them forever.
          </p>
        </div>
      </section>

      {/* Main Pricing */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white px-8 py-12 text-center">
              <h2 className="text-3xl font-bold mb-2">Pay Per Tag</h2>
              <p className="text-indigo-100">The only cost you&apos;ll ever pay</p>
            </div>

            <div className="p-8 md:p-12">
              <div className="text-center mb-8">
                <div className="text-5xl md:text-6xl font-bold text-indigo-600 mb-2">$5</div>
                <div className="text-xl text-gray-600">per NFC tag (one-time purchase)</div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="font-semibold text-lg mb-4 text-center">What&apos;s Included</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2 mt-1">✓</span>
                      <span>Physical NFC tag with activation code</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2 mt-1">✓</span>
                      <span>Unlimited punches per tag</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2 mt-1">✓</span>
                      <span>Lifetime access to dashboard</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2 mt-1">✓</span>
                      <span>Reassign tags to different campaigns</span>
                    </li>
                  </ul>
                </div>

                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="font-semibold text-lg mb-4 text-center">No Extra Costs For</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2 mt-1">✓</span>
                      <span>Unlimited campaigns</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2 mt-1">✓</span>
                      <span>Unlimited customers</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2 mt-1">✓</span>
                      <span>Customer dashboard access</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2 mt-1">✓</span>
                      <span>Email support</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6 mb-8">
                <h3 className="font-semibold text-lg mb-3 text-indigo-900">💡 How It Works</h3>
                <ol className="space-y-2 text-gray-700">
                  <li><strong>1. Order Tags:</strong> Buy as many NFC tags as you need (minimum 10)</li>
                  <li><strong>2. Receive Tags:</strong> Tags ship within 5-7 business days</li>
                  <li><strong>3. Register Tags:</strong> Use activation codes to add tags to your account</li>
                  <li><strong>4. Create Campaigns:</strong> Set up loyalty programs and assign tags</li>
                  <li><strong>5. Start Tapping:</strong> Customers tap tags and collect punches immediately</li>
                </ol>
              </div>

              <div className="text-center">
                <Link
                  href="/business/signup"
                  className="inline-block bg-indigo-600 text-white px-8 py-4 rounded-lg hover:bg-indigo-700 transition font-semibold text-lg shadow-lg"
                >
                  Get Started Now
                </Link>
                <p className="text-sm text-gray-500 mt-4">
                  Start with your business account, then order tags from your dashboard
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bulk Pricing */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Recommended Quantities</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-1">10 tags</div>
                <div className="text-indigo-600 font-semibold mb-4">$50</div>
                <div className="text-sm text-gray-600 mb-4">Perfect for:</div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>Single location</li>
                  <li>Testing the system</li>
                  <li>Small businesses</li>
                </ul>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-lg border-2 border-indigo-600 relative">
              <div className="absolute top-0 right-0 bg-indigo-600 text-white text-xs px-3 py-1 rounded-bl-lg rounded-tr-lg font-semibold">
                POPULAR
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-1">25 tags</div>
                <div className="text-indigo-600 font-semibold mb-4">$125</div>
                <div className="text-sm text-gray-600 mb-4">Perfect for:</div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>Multiple campaigns</li>
                  <li>Growing businesses</li>
                  <li>Multiple locations</li>
                </ul>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-1">50+ tags</div>
                <div className="text-indigo-600 font-semibold mb-4">Contact Us</div>
                <div className="text-sm text-gray-600 mb-4">Perfect for:</div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>Enterprise</li>
                  <li>Franchises</li>
                  <li>Custom pricing</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
            Compare to Traditional Solutions
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-lg shadow-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left">Feature</th>
                  <th className="px-6 py-4 text-center">Paper Cards</th>
                  <th className="px-6 py-4 text-center">Loyalty Apps</th>
                  <th className="px-6 py-4 text-center bg-indigo-50 text-indigo-900 font-bold">
                    Virtual Punch Card
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4">Setup Cost</td>
                  <td className="px-6 py-4 text-center text-gray-600">~$50/month printing</td>
                  <td className="px-6 py-4 text-center text-gray-600">$50-500/month</td>
                  <td className="px-6 py-4 text-center bg-indigo-50 font-semibold">$5 per tag (one-time)</td>
                </tr>
                <tr>
                  <td className="px-6 py-4">Monthly Fee</td>
                  <td className="px-6 py-4 text-center">❌</td>
                  <td className="px-6 py-4 text-center">✅ $50-500</td>
                  <td className="px-6 py-4 text-center bg-indigo-50 font-semibold text-green-600">❌ $0</td>
                </tr>
                <tr>
                  <td className="px-6 py-4">Customer App Required</td>
                  <td className="px-6 py-4 text-center">❌</td>
                  <td className="px-6 py-4 text-center">✅ Yes</td>
                  <td className="px-6 py-4 text-center bg-indigo-50 font-semibold text-green-600">❌ No</td>
                </tr>
                <tr>
                  <td className="px-6 py-4">Cards Get Lost</td>
                  <td className="px-6 py-4 text-center">✅ Often</td>
                  <td className="px-6 py-4 text-center">❌</td>
                  <td className="px-6 py-4 text-center bg-indigo-50 font-semibold text-green-600">❌ Never</td>
                </tr>
                <tr>
                  <td className="px-6 py-4">Fraud Prevention</td>
                  <td className="px-6 py-4 text-center">❌</td>
                  <td className="px-6 py-4 text-center">✅</td>
                  <td className="px-6 py-4 text-center bg-indigo-50 font-semibold text-green-600">✅ Built-in</td>
                </tr>
                <tr>
                  <td className="px-6 py-4">Digital Dashboard</td>
                  <td className="px-6 py-4 text-center">❌</td>
                  <td className="px-6 py-4 text-center">✅</td>
                  <td className="px-6 py-4 text-center bg-indigo-50 font-semibold text-green-600">✅ Included</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
            Pricing FAQs
          </h2>
          <div className="space-y-6">
            <details className="bg-white rounded-lg p-6 shadow-sm">
              <summary className="font-semibold cursor-pointer">
                Are there any monthly fees?
              </summary>
              <p className="mt-3 text-gray-600">
                No! You only pay once for the NFC tags. There are no subscription fees, no monthly charges, and no hidden costs.
              </p>
            </details>

            <details className="bg-white rounded-lg p-6 shadow-sm">
              <summary className="font-semibold cursor-pointer">
                What&apos;s the minimum order?
              </summary>
              <p className="mt-3 text-gray-600">
                The minimum order is 10 NFC tags ($50). This gives you enough to get started with one or multiple campaigns.
              </p>
            </details>

            <details className="bg-white rounded-lg p-6 shadow-sm">
              <summary className="font-semibold cursor-pointer">
                Can I reuse tags for different campaigns?
              </summary>
              <p className="mt-3 text-gray-600">
                Yes! You can reassign tags from one campaign to another at any time from your dashboard. Tags are reusable indefinitely.
              </p>
            </details>

            <details className="bg-white rounded-lg p-6 shadow-sm">
              <summary className="font-semibold cursor-pointer">
                Do you offer refunds?
              </summary>
              <p className="mt-3 text-gray-600">
                We offer a 30-day money-back guarantee. If you&apos;re not satisfied with the NFC tags, return them for a full refund.
              </p>
            </details>

            <details className="bg-white rounded-lg p-6 shadow-sm">
              <summary className="font-semibold cursor-pointer">
                How long does shipping take?
              </summary>
              <p className="mt-3 text-gray-600">
                NFC tags typically ship within 5-7 business days via standard shipping. Express shipping options are available.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-indigo-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Create your account now and order tags from your dashboard.
          </p>
          <Link
            href="/business/signup"
            className="inline-block bg-white text-indigo-600 px-8 py-4 rounded-lg hover:bg-gray-100 transition font-semibold text-lg shadow-lg"
          >
            Create Free Account
          </Link>
        </div>
      </section>
    </>
  )
}
