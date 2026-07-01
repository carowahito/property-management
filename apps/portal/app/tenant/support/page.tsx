'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function TenantSupportPage() {
  const [formData, setFormData] = useState({
    subject: '',
    category: '',
    priority: 'Medium',
    description: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement support ticket submission
    alert('Support ticket submitted successfully! We will get back to you soon.')
    setFormData({ subject: '', category: '', priority: 'Medium', description: '' })
  }

  const faqs = [
    {
      question: 'How do I pay my rent?',
      answer: 'You can pay your rent through the Payments page using M-Pesa, Credit/Debit Card, or Bank Transfer. Visit the Payments section and click "Make Payment".',
    },
    {
      question: 'How do I submit a maintenance request?',
      answer: 'Go to the Maintenance section and click "Submit Request". Fill in the details, select priority, and you can even upload photos. Our team will respond within 24 hours.',
    },
    {
      question: 'When is rent due each month?',
      answer: 'Rent is typically due on the 5th of each month. You can see your next payment due date on your dashboard.',
    },
    {
      question: 'How can I view my payment history?',
      answer: 'Visit the Payments page to see all your past payments, including receipts and payment methods used.',
    },
    {
      question: 'What should I do in case of an emergency?',
      answer: 'For emergencies (water leaks, electrical issues, etc.), submit a maintenance request with "Urgent" priority or call the emergency number listed on the Maintenance page.',
    },
    {
      question: 'How do I update my contact information?',
      answer: 'Go to your Profile page to update your email, phone number, and emergency contact details.',
    },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">Help & Support</h1>
        <p className="mt-2 text-neutral-600">
          Get help with your account, payments, and maintenance requests
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Contact Options */}
        <div className="lg:col-span-1">
          <div className="bg-surface shadow rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Contact Us</h2>

            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="text-2xl">📧</div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-neutral-900">Email Support</p>
                  <a
                    href="mailto:info@tochiproperty.com"
                    className="text-sm text-primary-600 hover:text-primary-800"
                  >
                    info@tochiproperty.com
                  </a>
                  <p className="text-xs text-neutral-500 mt-1">Response within 24 hours</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="text-2xl">📞</div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-neutral-900">Phone Support</p>
                  <a
                    href="tel:+254721998499"
                    className="text-sm text-primary-600 hover:text-primary-800"
                  >
                    +254 721 998 499
                  </a>
                  <p className="text-xs text-neutral-500 mt-1">Mon-Fri: 8AM - 6PM</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="text-2xl">🚨</div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-neutral-900">Emergency</p>
                  <a
                    href="tel:+254711111111"
                    className="text-sm text-danger-600 hover:text-danger-800 font-medium"
                  >
                    +254 711 111 111
                  </a>
                  <p className="text-xs text-neutral-500 mt-1">24/7 Emergency Line</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="text-2xl">💬</div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-neutral-900">Live Chat</p>
                  <button className="text-sm text-primary-600 hover:text-primary-800">
                    Start Chat
                  </button>
                  <p className="text-xs text-neutral-500 mt-1">Available during business hours</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-surface shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Quick Links</h2>
            <div className="space-y-2">
              <Link
                href="/tenant/payments"
                className="block text-sm text-primary-600 hover:text-primary-800"
              >
                → Make a Payment
              </Link>
              <Link
                href="/tenant/maintenance/new"
                className="block text-sm text-primary-600 hover:text-primary-800"
              >
                → Submit Maintenance Request
              </Link>
              <Link
                href="/tenant/documents"
                className="block text-sm text-primary-600 hover:text-primary-800"
              >
                → View Lease Agreement
              </Link>
              <Link
                href="/tenant/profile"
                className="block text-sm text-primary-600 hover:text-primary-800"
              >
                → Update Profile
              </Link>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Submit Ticket */}
          <div className="bg-surface shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">
              Submit a Support Ticket
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-neutral-700 mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Brief description of your issue"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-neutral-700 mb-1">
                      Category
                    </label>
                    <select
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    >
                      <option value="">Select a category</option>
                      <option value="Payments">Payments</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Lease">Lease Agreement</option>
                      <option value="Account">Account Issues</option>
                      <option value="Technical">Technical Support</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="priority" className="block text-sm font-medium text-neutral-700 mb-1">
                      Priority
                    </label>
                    <select
                      id="priority"
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-neutral-700 mb-1">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={6}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Please provide as much detail as possible..."
                    required
                  ></textarea>
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-primary-600 text-white rounded-md font-medium hover:bg-primary-700"
                >
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>

          {/* FAQs */}
          <div className="bg-surface shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <details key={index} className="group">
                  <summary className="flex justify-between items-center cursor-pointer list-none">
                    <span className="text-sm font-medium text-neutral-900">
                      {faq.question}
                    </span>
                    <span className="transition group-open:rotate-180">
                      <svg
                        fill="none"
                        height="24"
                        shapeRendering="geometricPrecision"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        viewBox="0 0 24 24"
                        width="24"
                        className="w-5 h-5 text-neutral-500"
                      >
                        <path d="M6 9l6 6 6-6"></path>
                      </svg>
                    </span>
                  </summary>
                  <p className="text-sm text-neutral-600 mt-3 group-open:animate-fadeIn">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>

          {/* Additional Resources */}
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-6">
            <h3 className="text-sm font-semibold text-primary-900 mb-2">
              Need more help?
            </h3>
            <p className="text-sm text-primary-800 mb-4">
              Check out our tenant handbook for comprehensive guides on using the portal,
              understanding your lease, and property guidelines.
            </p>
            <button className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700">
              Download Tenant Handbook
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
