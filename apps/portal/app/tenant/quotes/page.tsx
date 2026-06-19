'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface Quote {
  id: string;
  maintenanceRequestId: string;
  issue: string;
  description: string;
  vendor: {
    name: string;
    rating: number;
    completedJobs: number;
  };
  materials: {
    item: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  labor: {
    description: string;
    hours: number;
    rate: number;
    total: number;
  }[];
  materialsTotal: number;
  laborTotal: number;
  totalAmount: number;
  estimatedDays: number;
  status: 'pending-approval' | 'approved' | 'declined' | 'completed';
  submittedDate: string;
  validUntil: string;
  responsibleParty: 'tenant' | 'landlord';
  paymentMethod?: 'deposit-deduction' | 'direct-payment' | 'split';
  tenantPortion?: number;
  reason?: string; // Reason why tenant is responsible
}

export default function TenantQuotesPage() {
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'all'>('pending');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'deposit-deduction' | 'direct-payment'>('direct-payment');

  // Mock data - tenant-responsible quotes only
  const quotes: Quote[] = [
    {
      id: 'Q-2024-101',
      maintenanceRequestId: 'MR-2024-301',
      issue: 'Broken Window',
      description: 'Living room window cracked - accidental damage',
      vendor: {
        name: 'QuickFix Glass Services',
        rating: 4.8,
        completedJobs: 156,
      },
      materials: [
        { item: 'Double-pane window glass (1.2m x 1.5m)', quantity: 1, unitPrice: 8500, total: 8500 },
        { item: 'Window sealant', quantity: 2, unitPrice: 450, total: 900 },
        { item: 'Mounting hardware', quantity: 1, unitPrice: 300, total: 300 },
      ],
      labor: [
        { description: 'Window removal and installation', hours: 3, rate: 1500, total: 4500 },
        { description: 'Cleanup and disposal', hours: 1, rate: 1000, total: 1000 },
      ],
      materialsTotal: 9700,
      laborTotal: 5500,
      totalAmount: 15200,
      estimatedDays: 1,
      status: 'pending-approval',
      submittedDate: '2024-11-14',
      validUntil: '2024-11-21',
      responsibleParty: 'tenant',
      reason: 'Accidental damage - per lease agreement Section 7.2',
    },
    {
      id: 'Q-2024-087',
      maintenanceRequestId: 'MR-2024-275',
      issue: 'Carpet Stain Removal',
      description: 'Red wine stain on bedroom carpet',
      vendor: {
        name: 'ProClean Services',
        rating: 4.6,
        completedJobs: 203,
      },
      materials: [
        { item: 'Professional cleaning solution', quantity: 1, unitPrice: 1200, total: 1200 },
        { item: 'Stain remover concentrate', quantity: 1, unitPrice: 800, total: 800 },
      ],
      labor: [
        { description: 'Deep carpet cleaning', hours: 2, rate: 1200, total: 2400 },
      ],
      materialsTotal: 2000,
      laborTotal: 2400,
      totalAmount: 4400,
      estimatedDays: 1,
      status: 'pending-approval',
      submittedDate: '2024-11-13',
      validUntil: '2024-11-20',
      responsibleParty: 'tenant',
      reason: 'Tenant-caused damage - cosmetic repair',
    },
    {
      id: 'Q-2024-065',
      maintenanceRequestId: 'MR-2024-198',
      issue: 'Door Lock Replacement',
      description: 'Lost keys - requested lock change for security',
      vendor: {
        name: 'SecureLock Ltd',
        rating: 4.9,
        completedJobs: 312,
      },
      materials: [
        { item: 'High-security deadbolt', quantity: 1, unitPrice: 4500, total: 4500 },
        { item: 'Door handle set', quantity: 1, unitPrice: 2800, total: 2800 },
        { item: 'Keys (set of 4)', quantity: 1, unitPrice: 400, total: 400 },
      ],
      labor: [
        { description: 'Lock removal and installation', hours: 1.5, rate: 2000, total: 3000 },
      ],
      materialsTotal: 7700,
      laborTotal: 3000,
      totalAmount: 10700,
      estimatedDays: 1,
      status: 'approved',
      submittedDate: '2024-11-10',
      validUntil: '2024-11-17',
      responsibleParty: 'tenant',
      paymentMethod: 'deposit-deduction',
      reason: 'Tenant-requested service - lost keys',
    },
  ];

  const stats = {
    pendingApproval: quotes.filter(q => q.status === 'pending-approval').length,
    totalValue: quotes.filter(q => q.status === 'pending-approval').reduce((sum, q) => sum + q.totalAmount, 0),
    approvedValue: quotes.filter(q => q.status === 'approved').reduce((sum, q) => sum + q.totalAmount, 0),
  };

  const filteredQuotes = quotes.filter(quote => {
    if (activeTab === 'pending') return quote.status === 'pending-approval';
    if (activeTab === 'approved') return quote.status === 'approved' || quote.status === 'completed';
    return true;
  });

  const handleApprove = (quote: Quote) => {
    setSelectedQuote(quote);
    setShowDetailModal(true);
  };

  const confirmApproval = () => {
    console.log('Approving quote:', selectedQuote?.id, 'Payment method:', paymentMethod);
    // Here you would make API call to approve quote
    setShowDetailModal(false);
    setSelectedQuote(null);
  };

  const handleDecline = (quoteId: string) => {
    if (confirm('Are you sure you want to decline this quote? You may need to wait for an alternative quote.')) {
      console.log('Declining quote:', quoteId);
      // API call to decline
    }
  };

  return (
    <div className="py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">Repair Quotes</h1>
        <p className="mt-2 text-neutral-600">
          Review and approve quotes for repairs you&apos;re responsible for
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-surface rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
              <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-neutral-600">Pending Approval</p>
              <p className="text-2xl font-semibold text-neutral-900">{stats.pendingApproval}</p>
            </div>
          </div>
        </div>

        <div className="bg-surface rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-warning-100 rounded-md p-3">
              <svg className="h-6 w-6 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-neutral-600">Pending Value</p>
              <p className="text-2xl font-semibold text-neutral-900">KES {stats.totalValue.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-surface rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-success-100 rounded-md p-3">
              <svg className="h-6 w-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-neutral-600">Approved Value</p>
              <p className="text-2xl font-semibold text-neutral-900">KES {stats.approvedValue.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-surface rounded-lg shadow">
        <div className="border-b border-neutral-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('pending')}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === 'pending'
                  ? 'border-b-2 border-primary-500 text-primary-600'
                  : 'text-neutral-500 hover:text-neutral-700'
              }`}
            >
              Pending Approval ({quotes.filter(q => q.status === 'pending-approval').length})
            </button>
            <button
              onClick={() => setActiveTab('approved')}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === 'approved'
                  ? 'border-b-2 border-primary-500 text-primary-600'
                  : 'text-neutral-500 hover:text-neutral-700'
              }`}
            >
              Approved
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === 'all'
                  ? 'border-b-2 border-primary-500 text-primary-600'
                  : 'text-neutral-500 hover:text-neutral-700'
              }`}
            >
              All Quotes
            </button>
          </nav>
        </div>

        {/* Quotes List */}
        <div className="p-6">
          {filteredQuotes.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-neutral-900">No quotes</h3>
              <p className="mt-1 text-sm text-neutral-500">
                {activeTab === 'pending' ? 'No quotes pending your approval' : 'No quotes found'}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredQuotes.map((quote) => (
                <div key={quote.id} className="border border-neutral-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-neutral-900">{quote.issue}</h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          quote.status === 'pending-approval' ? 'bg-yellow-100 text-yellow-800' :
                          quote.status === 'approved' ? 'bg-success-100 text-success-800' :
                          quote.status === 'declined' ? 'bg-danger-100 text-danger-800' :
                          'bg-neutral-100 text-neutral-800'
                        }`}>
                          {quote.status === 'pending-approval' ? 'Awaiting Your Approval' :
                           quote.status === 'approved' ? 'Approved' :
                           quote.status === 'declined' ? 'Declined' : 'Completed'}
                        </span>
                      </div>
                      <p className="text-sm text-neutral-600 mb-2">{quote.description}</p>
                      <div className="flex items-center gap-4 text-xs text-neutral-500">
                        <span>Quote ID: {quote.id}</span>
                        <span>•</span>
                        <span>Request: {quote.maintenanceRequestId}</span>
                        <span>•</span>
                        <span>Submitted: {new Date(quote.submittedDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-neutral-900">KES {quote.totalAmount.toLocaleString()}</p>
                      <p className="text-sm text-neutral-500">{quote.estimatedDays} day{quote.estimatedDays > 1 ? 's' : ''}</p>
                    </div>
                  </div>

                  {/* Responsibility Notice */}
                  <div className="bg-primary-50 border border-primary-200 rounded-lg p-3 mb-4">
                    <div className="flex items-start">
                      <svg className="h-5 w-5 text-primary-600 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-primary-900">You are responsible for this repair</p>
                        <p className="text-xs text-primary-700 mt-1">{quote.reason}</p>
                      </div>
                    </div>
                  </div>

                  {/* Vendor Info */}
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-neutral-200">
                    <div className="flex items-center">
                      <div className="bg-warning-100 rounded-full p-2 mr-3">
                        <svg className="h-5 w-5 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-neutral-900">{quote.vendor.name}</p>
                        <div className="flex items-center text-sm text-neutral-600">
                          <span className="text-yellow-500 mr-1">★</span>
                          <span>{quote.vendor.rating}/5.0</span>
                          <span className="mx-2">•</span>
                          <span>{quote.vendor.completedJobs} jobs completed</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cost Breakdown */}
                  <div className="grid grid-cols-2 gap-6 mb-4">
                    <div>
                      <h4 className="text-sm font-medium text-neutral-700 mb-2">Materials</h4>
                      <div className="space-y-1">
                        {quote.materials.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span className="text-neutral-600">
                              {item.item} (x{item.quantity})
                            </span>
                            <span className="text-neutral-900">KES {item.total.toLocaleString()}</span>
                          </div>
                        ))}
                        <div className="flex justify-between text-sm font-medium border-t border-neutral-200 pt-1 mt-1">
                          <span>Subtotal</span>
                          <span>KES {quote.materialsTotal.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-neutral-700 mb-2">Labor</h4>
                      <div className="space-y-1">
                        {quote.labor.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span className="text-neutral-600">
                              {item.description} ({item.hours}h)
                            </span>
                            <span className="text-neutral-900">KES {item.total.toLocaleString()}</span>
                          </div>
                        ))}
                        <div className="flex justify-between text-sm font-medium border-t border-neutral-200 pt-1 mt-1">
                          <span>Subtotal</span>
                          <span>KES {quote.laborTotal.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  {quote.status === 'pending-approval' && (
                    <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
                      <p className="text-sm text-neutral-500">
                        Valid until: {new Date(quote.validUntil).toLocaleDateString()}
                      </p>
                      <div className="flex gap-3">
                        <Button
                          onClick={() => handleDecline(quote.id)}
                          variant="danger"
                          size="sm"
                        >
                          Decline
                        </Button>
                        <Button
                          onClick={() => handleApprove(quote)}
                          variant="primary"
                          size="sm"
                        >
                          Approve & Proceed
                        </Button>
                      </div>
                    </div>
                  )}

                  {quote.status === 'approved' && quote.paymentMethod && (
                    <div className="pt-4 border-t border-neutral-200">
                      <div className="bg-success-50 border border-success-200 rounded-lg p-3">
                        <p className="text-sm text-success-800">
                          <span className="font-medium">Payment Method:</span>{' '}
                          Direct Payment Required
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Approval Modal */}
      {showDetailModal && selectedQuote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-2xl font-bold text-neutral-900">Approve Quote</h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-neutral-400 hover:text-neutral-600"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">{selectedQuote.issue}</h3>
                <p className="text-neutral-600 mb-4">{selectedQuote.description}</p>
                
                <div className="bg-neutral-50 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-neutral-600">Quote Amount</p>
                      <p className="text-2xl font-bold text-neutral-900">KES {selectedQuote.totalAmount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-neutral-600">Estimated Duration</p>
                      <p className="text-lg font-semibold text-neutral-900">{selectedQuote.estimatedDays} day(s)</p>
                    </div>
                  </div>
                </div>

                <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
                  <h4 className="font-medium text-primary-900 mb-2">Payment Required</h4>
                  <p className="text-sm text-neutral-600">
                    Pay KES {selectedQuote.totalAmount.toLocaleString()} directly via M-Pesa or bank transfer.
                    At least 50% must be paid upfront before work can be confirmed and scheduled.
                  </p>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <svg className="h-5 w-5 text-yellow-600 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-yellow-900">Important</p>
                      <p className="text-xs text-yellow-800 mt-1">
                        By approving this quote, you agree to pay for this repair directly. Your security deposit
                        is only applied at end of tenancy and cannot be used to cover repair costs.
                        Work will begin once payment is confirmed.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setShowDetailModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmApproval}
                  variant="primary"
                  className="flex-1"
                >
                  Confirm Approval
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
