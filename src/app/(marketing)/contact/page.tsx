// src/app/(marketing)/contact/page.tsx
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us - Virtual Punch Card',
  description: 'Get in touch with Virtual Punch Card. We&apos;re here to help with questions, support, or custom solutions.',
}

export default function ContactPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-indigo-50 to-purple-50 pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Get In Touch
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Have questions? Need help? Want to discuss custom solutions? We&apos;re here to help.
          </p>
        </div>
      </section>

      {/* Contact Options */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white rounded-xl p-6 shadow-sm text-center hover:shadow-md transition">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📧</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Email Support</h3>
              <p className="text-gray-600 mb-4 text-sm">
                Get help with technical issues or questions about your account
              </p>
              <a
                href="mailto:support@virtual-punch-card.com"
                className="text-indigo-600 hover:text-indigo-700 font-medium"
              >
                support@virtual-punch-card.com
              </a>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm text-center hover:shadow-md transition">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">💼</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Sales Inquiries</h3>
              <p className="text-gray-600 mb-4 text-sm">
                Bulk orders, custom pricing, or enterprise solutions
              </p>
              <a
                href="mailto:sales@virtual-punch-card.com"
                className="text-indigo-600 hover:text-indigo-700 font-medium"
              >
                sales@virtual-punch-card.com
              </a>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm text-center hover:shadow-md transition">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📚</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Documentation</h3>
              <p className="text-gray-600 mb-4 text-sm">
                Find answers in our help center and guides
              </p>
              <Link
                href="/how-it-works"
                className="text-indigo-600 hover:text-indigo-700 font-medium"
              >
                View How It Works →
              </Link>
            </div>
          </div>

          {/* About Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">About Virtual Punch Card</h2>
            <div className="prose prose-lg max-w-none text-gray-600">
              <p className="mb-4">
                Virtual Punch Card is a modern digital loyalty solution built for small and medium-sized businesses.
                We believe loyalty programs should be simple, affordable, and actually work for both businesses and customers.
              </p>
              <p className="mb-4">
                Traditional paper punch cards get lost, damaged, and forgotten. Loyalty apps require downloads and are
                rarely used. We created Virtual Punch Card to bridge the gap - using NFC technology that&apos;s already
                built into every smartphone, with no app downloads required.
              </p>
              <p className="mb-6">
                Our mission is to help local businesses increase customer retention and build lasting relationships
                through hassle-free loyalty rewards.
              </p>

              <h3 className="text-xl font-semibold mb-4 text-gray-900">Why We Built This</h3>
              <p className="mb-4">
                After seeing countless businesses struggle with expensive loyalty platforms and watching customers
                accumulate dozens of forgotten paper punch cards, we knew there had to be a better way.
              </p>
              <p>
                Virtual Punch Card combines the simplicity of traditional punch cards with the convenience and
                reliability of modern technology - at a fraction of the cost of other digital solutions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
            Common Questions
          </h2>
          <div className="space-y-6">
            <details className="bg-white rounded-lg p-6 shadow-sm">
              <summary className="font-semibold cursor-pointer">
                How quickly can I get started?
              </summary>
              <p className="mt-3 text-gray-600">
                You can create your free business account in under 2 minutes. NFC tags ship within 5-7 business days.
                Once you receive them, you can be up and running the same day!
              </p>
            </details>

            <details className="bg-white rounded-lg p-6 shadow-sm">
              <summary className="font-semibold cursor-pointer">
                What if I need help setting up?
              </summary>
              <p className="mt-3 text-gray-600">
                We provide email support to help you get started. The setup process is designed to be simple and
                straightforward, but if you run into any issues, just reach out to support@virtual-punch-card.com.
              </p>
            </details>

            <details className="bg-white rounded-lg p-6 shadow-sm">
              <summary className="font-semibold cursor-pointer">
                Do you offer custom solutions for larger businesses?
              </summary>
              <p className="mt-3 text-gray-600">
                Yes! If you need 50+ tags, custom integrations, or have specific requirements, contact our sales team
                at sales@virtual-punch-card.com. We can discuss custom pricing and features.
              </p>
            </details>

            <details className="bg-white rounded-lg p-6 shadow-sm">
              <summary className="font-semibold cursor-pointer">
                Can I see a demo before signing up?
              </summary>
              <p className="mt-3 text-gray-600">
                The best way to experience Virtual Punch Card is to create a free account and try it yourself.
                There&apos;s no credit card required, and you can explore all the features before ordering tags.
              </p>
            </details>

            <details className="bg-white rounded-lg p-6 shadow-sm">
              <summary className="font-semibold cursor-pointer">
                What&apos;s your refund policy?
              </summary>
              <p className="mt-3 text-gray-600">
                We offer a 30-day money-back guarantee on NFC tag purchases. If you&apos;re not satisfied, return the
                unused tags for a full refund.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-indigo-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Still Have Questions?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            The fastest way to get answers is to try Virtual Punch Card yourself - it&apos;s free to start.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/business/signup"
              className="inline-block bg-white text-indigo-600 px-8 py-4 rounded-lg hover:bg-gray-100 transition font-semibold text-lg shadow-lg"
            >
              Create Free Account
            </Link>
            <a
              href="mailto:support@virtual-punch-card.com"
              className="inline-block bg-indigo-500 text-white px-8 py-4 rounded-lg hover:bg-indigo-400 transition font-semibold text-lg border-2 border-white/20"
            >
              Email Support
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
