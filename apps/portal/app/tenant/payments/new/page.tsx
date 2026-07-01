'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useQuery } from '@tanstack/react-query'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { formatDate } from '@/lib/utils'

export default function NewPaymentPage() {
  const { data: session } = useSession()
  const [paymentMethod, setPaymentMethod] = useState('mpesa')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [customAmount, setCustomAmount] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // Fetch the active lease for this tenant
  const { data: leasesData, isLoading } = useQuery({
    queryKey: ['active-lease-payment'],
    queryFn: () => fetch('/api/leases?status=ACTIVE').then(r => r.json()),
    enabled: !!session?.user?.id,
  })

  // Fetch outstanding payments to show total balance
  const { data: paymentsData } = useQuery({
    queryKey: ['payments-balance'],
    queryFn: () => fetch('/api/payments').then(r => r.json()),
    enabled: !!session?.user?.id,
  })

  const activeLease = leasesData?.leases?.[0] ?? null
  const payments: any[] = paymentsData?.payments ?? []

  const monthlyRent = Number(activeLease?.unitRef?.monthlyRent ?? activeLease?.rentAmount ?? 0)
  const outstandingBalance = payments
    .filter(p => p.status === 'PENDING' || p.status === 'OVERDUE')
    .reduce((sum, p) => sum + Number(p.amount), 0)

  const defaultAmount = outstandingBalance > 0 ? outstandingBalance : monthlyRent
  const amountToPay = customAmount !== '' ? Number(customAmount) : defaultAmount

  // Next due date: first of next month if clear, today if outstanding
  const now = new Date()
  const nextDueDate = outstandingBalance > 0
    ? now
    : new Date(now.getFullYear(), now.getMonth() + 1, 1)

  const propertyName = activeLease?.property?.name ?? '—'
  const unitNumber = activeLease?.unitRef?.unitNumber ?? activeLease?.unitNumber ?? '—'
  const propertyRef = unitNumber !== '—' ? `Unit ${unitNumber}, ${propertyName}` : propertyName

  // Generate a payment reference: UNIT-MONYYYY
  const monthLabel = now.toLocaleString('en-KE', { month: 'short' }).toUpperCase()
  const payRef = unitNumber !== '—'
    ? `${unitNumber.replace('-', '')}-${monthLabel}${now.getFullYear()}`
    : 'PMT-' + now.getFullYear()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)
    // Simulate brief processing delay then show instructions
    await new Promise(r => setTimeout(r, 800))
    setIsProcessing(false)
    setSubmitted(true)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (submitted && paymentMethod === 'mpesa') {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-surface shadow rounded-lg p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-success-100 mb-4">
            <svg className="h-8 w-8 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-neutral-900 mb-2">M-Pesa Payment Instructions</h2>
          <p className="text-neutral-600 mb-6">
            Send <strong>KES {amountToPay.toLocaleString()}</strong> via M-Pesa using the details below:
          </p>
          <div className="bg-neutral-50 rounded-lg p-5 text-left space-y-3 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500">Paybill Number</span>
              <span className="font-bold text-neutral-900 text-base">522533</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500">Account Number</span>
              <span className="font-bold text-neutral-900">{payRef}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500">Amount</span>
              <span className="font-bold text-neutral-900">KES {amountToPay.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500">Phone</span>
              <span className="font-medium text-neutral-900">{phoneNumber}</span>
            </div>
          </div>
          <p className="text-xs text-neutral-500 mb-6">
            After payment, your property manager will confirm and update your account within 24 hours.
          </p>
          <Link
            href="/tenant/payments"
            className="inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
          >
            Back to Payments
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link href="/tenant/payments" className="text-sm text-primary-600 hover:text-primary-800">
          ← Back to Payments
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-neutral-900">Make Payment</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Form */}
        <div className="lg:col-span-2">
          <div className="bg-surface shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Payment Details</h2>

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Amount to Pay */}
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-neutral-700 mb-1">
                  Amount to Pay (KES)
                </label>
                <input
                  type="number"
                  id="amount"
                  min={1}
                  step={1}
                  value={customAmount !== '' ? customAmount : defaultAmount}
                  onChange={e => setCustomAmount(e.target.value)}
                  className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-neutral-300 rounded-md px-3 py-2 border text-lg font-semibold"
                  required
                />
                {outstandingBalance > 0 && (
                  <p className="mt-1 text-xs text-danger-600">
                    Outstanding balance: KES {outstandingBalance.toLocaleString()}
                  </p>
                )}
                {outstandingBalance === 0 && monthlyRent > 0 && (
                  <p className="mt-1 text-xs text-neutral-500">
                    Monthly rent: KES {monthlyRent.toLocaleString()}
                  </p>
                )}
              </div>

              {/* Payment Method Selection */}
              <div>
                <label className="text-base font-medium text-neutral-900">
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
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300"
                      />
                      <label htmlFor="mpesa" className="ml-3 block text-sm font-medium text-neutral-700">
                        M-Pesa
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="bank"
                        name="payment-method"
                        type="radio"
                        checked={paymentMethod === 'bank'}
                        onChange={() => setPaymentMethod('bank')}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300"
                      />
                      <label htmlFor="bank" className="ml-3 block text-sm font-medium text-neutral-700">
                        Bank Transfer
                      </label>
                    </div>
                  </div>
                </fieldset>
              </div>

              {/* M-Pesa Form */}
              {paymentMethod === 'mpesa' && (
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-neutral-700">
                    M-Pesa Phone Number
                  </label>
                  <div className="mt-1">
                    <input
                      type="tel"
                      name="phone"
                      id="phone"
                      value={phoneNumber}
                      onChange={e => setPhoneNumber(e.target.value)}
                      placeholder="254700000000"
                      className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-neutral-300 rounded-md px-3 py-2 border"
                      required
                    />
                  </div>
                  <p className="mt-2 text-sm text-neutral-500">
                    You will receive payment instructions for Paybill <strong>522533</strong>, Account <strong>{payRef}</strong>
                  </p>
                </div>
              )}

              {/* Bank Transfer Info */}
              {paymentMethod === 'bank' && (
                <div className="bg-neutral-50 p-4 rounded-md">
                  <h3 className="text-sm font-medium text-neutral-900 mb-2">
                    Bank Transfer Details
                  </h3>
                  <dl className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-neutral-500">Bank Name:</dt>
                      <dd className="text-neutral-900 font-medium">Equity Bank</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-neutral-500">Account Name:</dt>
                      <dd className="text-neutral-900 font-medium">Tochi Property</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-neutral-500">Account Number:</dt>
                      <dd className="text-neutral-900 font-medium">1234567890</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-neutral-500">Reference:</dt>
                      <dd className="text-neutral-900 font-medium">{payRef}</dd>
                    </div>
                  </dl>
                  <p className="mt-3 text-xs text-neutral-600">
                    Use the reference above. After transfer, share proof of payment with your property manager.
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isProcessing || amountToPay <= 0}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing
                  ? 'Processing...'
                  : `Pay KES ${amountToPay > 0 ? amountToPay.toLocaleString() : '0'}`}
              </button>
            </form>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="lg:col-span-1">
          <div className="bg-surface shadow rounded-lg p-6 sticky top-4">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Payment Summary</h2>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Property</span>
                <span className="text-neutral-900 text-right text-xs font-medium leading-tight max-w-[140px]">
                  {propertyRef}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Next Due Date</span>
                <span className="text-neutral-900">{formatDate(nextDueDate.toISOString())}</span>
              </div>

              <div className="border-t border-neutral-200 pt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Monthly Rent</span>
                  <span className="text-neutral-900">
                    KES {monthlyRent > 0 ? monthlyRent.toLocaleString() : '—'}
                  </span>
                </div>
                {outstandingBalance > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">Outstanding</span>
                    <span className="text-danger-600 font-medium">
                      KES {outstandingBalance.toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Paying Now</span>
                  <span className="text-neutral-900 font-medium">
                    KES {amountToPay > 0 ? amountToPay.toLocaleString() : '—'}
                  </span>
                </div>
              </div>

              <div className="border-t border-neutral-200 pt-3">
                <div className="flex justify-between">
                  <span className="text-base font-medium text-neutral-900">Total</span>
                  <span className="text-lg font-bold text-neutral-900">
                    KES {amountToPay > 0 ? amountToPay.toLocaleString() : '0'}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 bg-primary-50 rounded-md p-3">
              <p className="text-xs text-primary-800">
                <strong>Ref:</strong> {payRef} — use this as your payment reference for all methods.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
