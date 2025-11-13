'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function NewPaymentPage() {
  const [paymentMethod, setPaymentMethod] = useState('mpesa')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const payment = {
    amount: 45000,
    lateFee: 0,
    total: 45000,
    dueDate: '2025-11-05',
    propertyAddress: '123 Main Street, Apt 4B',
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    // TODO: Implement actual payment processing
    setTimeout(() => {
      alert('Payment initiated! Please check your phone for the M-Pesa prompt.')
      setIsProcessing(false)
    }, 2000)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link href="/tenant/payments" className="text-sm text-blue-600 hover:text-blue-800">
          ← Back to Payments
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">Make Payment</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Form */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Payment Method Selection */}
              <div>
                <label className="text-base font-medium text-gray-900">
                  Choose Payment Method
                </label>
                <fieldset className="mt-4">
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        id="mpesa"
                        name="payment-method"
                        type="radio"
                        checked={paymentMethod === 'mpesa'}
                        onChange={() => setPaymentMethod('mpesa')}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <label
                        htmlFor="mpesa"
                        className="ml-3 block text-sm font-medium text-gray-700"
                      >
                        M-Pesa
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="card"
                        name="payment-method"
                        type="radio"
                        checked={paymentMethod === 'card'}
                        onChange={() => setPaymentMethod('card')}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <label
                        htmlFor="card"
                        className="ml-3 block text-sm font-medium text-gray-700"
                      >
                        Credit/Debit Card
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="bank"
                        name="payment-method"
                        type="radio"
                        checked={paymentMethod === 'bank'}
                        onChange={() => setPaymentMethod('bank')}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <label
                        htmlFor="bank"
                        className="ml-3 block text-sm font-medium text-gray-700"
                      >
                        Bank Transfer
                      </label>
                    </div>
                  </div>
                </fieldset>
              </div>

              {/* M-Pesa Form */}
              {paymentMethod === 'mpesa' && (
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    M-Pesa Phone Number
                  </label>
                  <div className="mt-1">
                    <input
                      type="tel"
                      name="phone"
                      id="phone"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="254700000000"
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md px-3 py-2 border"
                      required
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    You will receive an STK push notification on your phone
                  </p>
                </div>
              )}

              {/* Card Form */}
              {paymentMethod === 'card' && (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="card-number" className="block text-sm font-medium text-gray-700">
                      Card Number
                    </label>
                    <input
                      type="text"
                      id="card-number"
                      placeholder="1234 5678 9012 3456"
                      className="mt-1 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md px-3 py-2 border"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="expiry" className="block text-sm font-medium text-gray-700">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        id="expiry"
                        placeholder="MM/YY"
                        className="mt-1 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md px-3 py-2 border"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="cvc" className="block text-sm font-medium text-gray-700">
                        CVC
                      </label>
                      <input
                        type="text"
                        id="cvc"
                        placeholder="123"
                        className="mt-1 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md px-3 py-2 border"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Bank Transfer Info */}
              {paymentMethod === 'bank' && (
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">
                    Bank Transfer Details
                  </h3>
                  <dl className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Bank Name:</dt>
                      <dd className="text-gray-900 font-medium">Equity Bank</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Account Name:</dt>
                      <dd className="text-gray-900 font-medium">Catalyst Property Management</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Account Number:</dt>
                      <dd className="text-gray-900 font-medium">1234567890</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Reference:</dt>
                      <dd className="text-gray-900 font-medium">APT4B-NOV2025</dd>
                    </div>
                  </dl>
                  <p className="mt-3 text-xs text-gray-600">
                    Please use the reference number above and upload proof of payment after transfer.
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Processing...' : `Pay KES ${payment.total.toLocaleString()}`}
              </button>
            </form>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow rounded-lg p-6 sticky top-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Summary</h2>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Property</span>
                <span className="text-gray-900">{payment.propertyAddress}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Due Date</span>
                <span className="text-gray-900">{payment.dueDate}</span>
              </div>
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Monthly Rent</span>
                  <span className="text-gray-900">KES {payment.amount.toLocaleString()}</span>
                </div>
                {payment.lateFee > 0 && (
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-gray-600">Late Fee</span>
                    <span className="text-red-600">KES {payment.lateFee.toLocaleString()}</span>
                  </div>
                )}
              </div>
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between">
                  <span className="text-base font-medium text-gray-900">Total Amount</span>
                  <span className="text-lg font-bold text-gray-900">
                    KES {payment.total.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 bg-blue-50 rounded-md p-3">
              <p className="text-xs text-blue-800">
                💡 <strong>Tip:</strong> Set up auto-pay to never miss a payment and avoid late fees!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
