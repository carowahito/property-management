'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'

export default function PaymentReceiptPage() {
  const params = useParams()
  const paymentId = params.id as string

  // Mock payment receipt data - would be fetched based on paymentId
  const receipt = {
    id: paymentId,
    receiptNumber: `RCP-2025-${paymentId}`,
    paymentDate: '2025-10-05',
    paidBy: 'John Doe',
    propertyAddress: '123 Main Street, Apt 4B, Nairobi',
    paymentFor: 'Monthly Rent - October 2025',
    amount: 45000,
    paymentMethod: 'M-Pesa',
    transactionId: 'QGH7K2M9P4',
    status: 'Paid',
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    // TODO: Implement PDF download
    alert('Receipt download will be implemented with PDF generation')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Action Buttons - Hidden in print */}
        <div className="mb-6 flex justify-between items-center print:hidden">
          <Link
            href="/tenant/payments"
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Payments
          </Link>
          <div className="flex space-x-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              🖨️ Print
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
            >
              ⬇️ Download PDF
            </button>
          </div>
        </div>

        {/* Receipt */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 text-white">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold">Payment Receipt</h1>
                <p className="mt-1 text-blue-100">Receipt #{receipt.receiptNumber}</p>
              </div>
              <div className="text-right">
                <div className="text-4xl mb-2">✓</div>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  {receipt.status}
                </span>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="px-8 py-8">
            {/* Company & Tenant Info */}
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <h2 className="text-sm font-semibold text-gray-900 mb-2">FROM:</h2>
                <div className="text-sm text-gray-600">
                  <p className="font-medium text-gray-900">Catalyst Property Management</p>
                  <p>456 Business Avenue</p>
                  <p>Nairobi, Kenya</p>
                  <p>Phone: +254 700 000 000</p>
                  <p>Email: billing@catalyst-suite.com</p>
                </div>
              </div>

              <div>
                <h2 className="text-sm font-semibold text-gray-900 mb-2">TO:</h2>
                <div className="text-sm text-gray-600">
                  <p className="font-medium text-gray-900">{receipt.paidBy}</p>
                  <p>{receipt.propertyAddress}</p>
                </div>
              </div>
            </div>

            {/* Payment Details */}
            <div className="border-t border-gray-200 pt-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Details</h2>
              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                <div>
                  <p className="text-sm text-gray-600">Receipt Number</p>
                  <p className="font-medium text-gray-900">{receipt.receiptNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Payment Date</p>
                  <p className="font-medium text-gray-900">{receipt.paymentDate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Payment Method</p>
                  <p className="font-medium text-gray-900">{receipt.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Transaction ID</p>
                  <p className="font-medium text-gray-900">{receipt.transactionId}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-600">Payment For</p>
                  <p className="font-medium text-gray-900">{receipt.paymentFor}</p>
                </div>
              </div>
            </div>

            {/* Amount Table */}
            <div className="border-t border-gray-200 pt-6">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 text-sm font-semibold text-gray-900">
                      Description
                    </th>
                    <th className="text-right py-3 text-sm font-semibold text-gray-900">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-200">
                    <td className="py-4 text-sm text-gray-900">{receipt.paymentFor}</td>
                    <td className="py-4 text-sm text-gray-900 text-right">
                      KES {receipt.amount.toLocaleString()}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 text-right font-semibold text-gray-900">
                      Total Paid
                    </td>
                    <td className="py-4 text-right">
                      <span className="text-2xl font-bold text-gray-900">
                        KES {receipt.amount.toLocaleString()}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Footer Notes */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-green-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800">
                      Payment Successfully Processed
                    </p>
                    <p className="mt-1 text-sm text-green-700">
                      Thank you for your payment. This receipt confirms that your payment has been received and processed.
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-xs text-gray-500 space-y-1">
                <p>
                  <strong>Note:</strong> This is an official receipt. Please keep it for your records.
                </p>
                <p>
                  For any queries regarding this receipt, please contact us at billing@catalyst-suite.com
                  or call +254 700 000 000
                </p>
                <p className="mt-4">
                  Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>

          {/* Footer Watermark */}
          <div className="bg-gray-50 px-8 py-4 border-t border-gray-200">
            <p className="text-center text-xs text-gray-500">
              © 2025 Catalyst Property Management. All rights reserved.
            </p>
          </div>
        </div>

        {/* Additional Actions - Hidden in print */}
        <div className="mt-6 text-center print:hidden">
          <p className="text-sm text-gray-600">
            Need help? <Link href="/tenant/support" className="text-blue-600 hover:text-blue-800 font-medium">Contact Support</Link>
          </p>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            background: white;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}
