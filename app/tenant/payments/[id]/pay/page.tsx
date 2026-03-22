'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

export default function PaySpecificPaymentPage() {
  const params = useParams()
  const router = useRouter()
  const paymentId = params.id as string

  // Mock payment data - would be fetched based on paymentId
  const payment = {
    id: paymentId,
    dueDate: '2025-11-05',
    amount: 45000,
    type: 'Monthly Rent',
    status: 'Pending',
    propertyAddress: '123 Main Street, Apt 4B, Nairobi',
    lateFee: 0,
    total: 45000,
  }

  const [paymentMethod, setPaymentMethod] = useState('mpesa')
  const [mpesaPhone, setMpesaPhone] = useState('')
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: '',
  })
  const [isProcessing, setIsProcessing] = useState(false)

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    // TODO: Implement actual payment processing
    setTimeout(() => {
      setIsProcessing(false)
      alert('Payment processed successfully!')
      router.push('/tenant/payments')
    }, 2000)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2 text-sm">
          <li>
            <Link href="/tenant/payments" className="text-primary-600 hover:text-primary-800">
              Payments
            </Link>
          </li>
          <li>
            <span className="mx-2 text-neutral-400">/</span>
          </li>
          <li className="text-neutral-500">Pay Invoice #{paymentId}</li>
        </ol>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">Pay Invoice #{paymentId}</h1>
        <p className="mt-2 text-neutral-600">Complete your payment securely</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Payment Form */}
        <div className="lg:col-span-2">
          <div className="bg-surface shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-6">Payment Method</h2>

            {/* Payment Method Selection */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
              <button
                type="button"
                onClick={() => setPaymentMethod('mpesa')}
                className={`p-4 border-2 rounded-lg text-center transition-all ${
                  paymentMethod === 'mpesa'
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <div className="text-2xl mb-2">📱</div>
                <div className="font-medium text-sm">M-Pesa</div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-4 border-2 rounded-lg text-center transition-all ${
                  paymentMethod === 'card'
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <div className="text-2xl mb-2">💳</div>
                <div className="font-medium text-sm">Card</div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('bank')}
                className={`p-4 border-2 rounded-lg text-center transition-all ${
                  paymentMethod === 'bank'
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <div className="text-2xl mb-2">🏦</div>
                <div className="font-medium text-sm">Bank Transfer</div>
              </button>
            </div>

            <form onSubmit={handlePayment}>
              {/* M-Pesa Form */}
              {paymentMethod === 'mpesa' && (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="mpesaPhone" className="block text-sm font-medium text-neutral-700 mb-1">
                      M-Pesa Phone Number
                    </label>
                    <input
                      type="tel"
                      id="mpesaPhone"
                      value={mpesaPhone}
                      onChange={(e) => setMpesaPhone(e.target.value)}
                      placeholder="254700000000"
                      className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    />
                    <p className="mt-1 text-sm text-neutral-500">
                      You will receive an STK push notification on your phone
                    </p>
                  </div>
                </div>
              )}

              {/* Card Form */}
              {paymentMethod === 'card' && (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="cardName" className="block text-sm font-medium text-neutral-700 mb-1">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      id="cardName"
                      value={cardDetails.name}
                      onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                      placeholder="John Doe"
                      className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="cardNumber" className="block text-sm font-medium text-neutral-700 mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      id="cardNumber"
                      value={cardDetails.number}
                      onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="expiry" className="block text-sm font-medium text-neutral-700 mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        id="expiry"
                        value={cardDetails.expiry}
                        onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                        placeholder="MM/YY"
                        maxLength={5}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="cvc" className="block text-sm font-medium text-neutral-700 mb-1">
                        CVC
                      </label>
                      <input
                        type="text"
                        id="cvc"
                        value={cardDetails.cvc}
                        onChange={(e) => setCardDetails({ ...cardDetails, cvc: e.target.value })}
                        placeholder="123"
                        maxLength={3}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Bank Transfer */}
              {paymentMethod === 'bank' && (
                <div className="bg-neutral-50 rounded-lg p-4">
                  <h3 className="font-medium text-neutral-900 mb-3">Bank Transfer Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Bank Name:</span>
                      <span className="font-medium text-neutral-900">Catalyst Bank Ltd</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Account Name:</span>
                      <span className="font-medium text-neutral-900">Catalyst Property Management</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Account Number:</span>
                      <span className="font-medium text-neutral-900">1234567890</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Reference:</span>
                      <span className="font-medium text-neutral-900">RENT-{paymentId}</span>
                    </div>
                  </div>
                  <p className="mt-4 text-xs text-neutral-600">
                    Please use the reference number when making your transfer. Payment confirmation
                    may take 1-2 business days.
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <div className="mt-6">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-3 px-4 bg-primary-600 text-white font-medium rounded-md hover:bg-primary-700 disabled:bg-primary-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isProcessing ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Processing...
                    </span>
                  ) : (
                    `Pay KES ${payment.total.toLocaleString()}`
                  )}
                </button>
              </div>

              {/* Security Notice */}
              <div className="mt-4 flex items-center justify-center text-xs text-neutral-500">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                Your payment information is secure and encrypted
              </div>
            </form>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="lg:col-span-1">
          <div className="bg-surface shadow rounded-lg p-6 sticky top-4">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Payment Summary</h2>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-neutral-600">Invoice ID</p>
                <p className="font-medium text-neutral-900">#{paymentId}</p>
              </div>

              <div>
                <p className="text-sm text-neutral-600">Property</p>
                <p className="font-medium text-neutral-900 text-sm">{payment.propertyAddress}</p>
              </div>

              <div>
                <p className="text-sm text-neutral-600">Payment Type</p>
                <p className="font-medium text-neutral-900">{payment.type}</p>
              </div>

              <div>
                <p className="text-sm text-neutral-600">Due Date</p>
                <p className="font-medium text-neutral-900">{payment.dueDate}</p>
              </div>

              <div className="pt-3 border-t border-neutral-200">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Rent Amount</span>
                  <span className="font-medium text-neutral-900">
                    KES {payment.amount.toLocaleString()}
                  </span>
                </div>
                {payment.lateFee > 0 && (
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-neutral-600">Late Fee</span>
                    <span className="font-medium text-danger-600">
                      KES {payment.lateFee.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-neutral-200">
                <div className="flex justify-between">
                  <span className="font-semibold text-neutral-900">Total Amount</span>
                  <span className="font-bold text-xl text-neutral-900">
                    KES {payment.total.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 bg-primary-50 rounded-lg p-4">
              <p className="text-xs text-primary-800">
                💡 <strong>Tip:</strong> Pay before {payment.dueDate} to avoid late fees
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
