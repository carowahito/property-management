'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { formatDate } from '@/lib/utils';

interface OwnerStatement {
  id: string;
  landlordId: string;
  propertyId: string | null;
  month: number;
  year: number;
  rentDue: number;
  rentReceived: number;
  managementFee: number;
  managementFeeRate: number;
  maintenanceCosts: number;
  otherDeductions: number;
  netDisbursement: number;
  depositsHeld: number;
  lineItems: LineItem[] | null;
  status: string;
  generatedAt: string;
  sentAt: string | null;
  landlord: {
    id: string;
    name: string;
    email: string;
  };
  property: {
    id: string;
    name: string;
    address: string;
  } | null;
}

interface LineItem {
  description: string;
  amount: number;
  type: 'income' | 'deduction';
  category?: string;
}

async function fetchStatements(): Promise<{ statements: OwnerStatement[] }> {
  const res = await fetch('/api/owner-statements');
  if (!res.ok) throw new Error('Failed to fetch statements');
  return res.json();
}

export default function LandlordStatementsPage() {
  const [selectedStatement, setSelectedStatement] = useState<OwnerStatement | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['landlord-owner-statements'],
    queryFn: fetchStatements,
  });

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'FINALIZED': return 'bg-success-100 text-success-800';
      case 'SENT': return 'bg-primary-100 text-primary-800';
      case 'DRAFT': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-neutral-100 text-neutral-800';
    }
  };

  const exportToPDF = () => {
    window.print();
  };

  // Download the full landlord statement via the statement API
  const handleDownloadStatement = () => {
    // Use the first statement's landlordId
    const landlordId = statements[0]?.landlordId;
    if (!landlordId) return;
    window.open(
      `/api/landlords/${landlordId}/statement?format=html&startDate=2025-07-01&endDate=2026-04-30`,
      '_blank'
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-danger-600">Failed to load statements.</p>
      </div>
    );
  }

  const statements = data?.statements || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link href="/landlord/financials" className="text-primary-600 hover:text-primary-800 mb-2 inline-block">
          &larr; Back to Financials
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Rent Statements</h1>
            <p className="text-neutral-600 mt-2">View detailed breakdown of rent collected and deductions</p>
          </div>
          {statements.length > 0 && (
            <button
              onClick={handleDownloadStatement}
              className="px-4 py-2 bg-neutral-800 text-white text-sm font-medium rounded-md hover:bg-neutral-700 transition-colors"
            >
              Download Full Statement
            </button>
          )}
        </div>
      </div>

      {/* Statements Table */}
      {!selectedStatement ? (
        <div className="bg-surface rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Period</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Property</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase">Rent Due</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase">Rent Received</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase">Mgmt Fee</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase">Net Disbursement</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-surface divide-y divide-neutral-200">
              {statements.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-neutral-500">
                    No statements found
                  </td>
                </tr>
              )}
              {statements.map((stmt) => (
                <tr key={stmt.id} className="hover:bg-neutral-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                    {months[stmt.month - 1]} {stmt.year}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                    {stmt.property?.name || 'All Properties'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 text-right font-mono">
                    KES {Number(stmt.rentDue).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-success-600 text-right font-mono">
                    KES {Number(stmt.rentReceived).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-danger-600 text-right font-mono">
                    -KES {Number(stmt.managementFee).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-700 text-right font-mono font-bold">
                    KES {Number(stmt.netDisbursement).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(stmt.status)}`}>
                      {stmt.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => setSelectedStatement(stmt)}
                      className="text-primary-600 hover:text-primary-800"
                    >
                      View Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Statement Detail View */
        <>
          <div className="mb-4">
            <button
              onClick={() => setSelectedStatement(null)}
              className="text-primary-600 hover:text-primary-800 text-sm"
            >
              &larr; Back to Statements List
            </button>
          </div>

          {/* Financial Summary */}
          <div className="bg-surface rounded-lg shadow overflow-hidden mb-6">
            <div className="px-6 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
              <h2 className="text-xl font-bold">
                Statement for {months[selectedStatement.month - 1]} {selectedStatement.year}
              </h2>
              <p className="text-primary-100 text-sm">
                {selectedStatement.property?.name || 'All Properties'} - {selectedStatement.landlord.name}
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Income Section */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-neutral-700 text-sm uppercase tracking-wider">Income</h3>
                  <div className="flex justify-between py-2 border-b border-neutral-200">
                    <span className="text-neutral-700">Rent Due</span>
                    <span className="font-semibold text-neutral-900 font-mono">
                      KES {Number(selectedStatement.rentDue).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-neutral-200">
                    <span className="text-neutral-700">Rent Received</span>
                    <span className="font-semibold text-success-600 font-mono">
                      KES {Number(selectedStatement.rentReceived).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Deductions Section */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-neutral-700 text-sm uppercase tracking-wider">Deductions</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between py-1">
                      <span className="text-neutral-600">Management Fee ({Number(selectedStatement.managementFeeRate)}%)</span>
                      <span className="text-danger-600 font-mono">
                        -KES {Number(selectedStatement.managementFee).toLocaleString()}
                      </span>
                    </div>
                    {Number(selectedStatement.maintenanceCosts) > 0 && (
                      <div className="flex justify-between py-1">
                        <span className="text-neutral-600">Maintenance Costs</span>
                        <span className="text-danger-600 font-mono">
                          -KES {Number(selectedStatement.maintenanceCosts).toLocaleString()}
                        </span>
                      </div>
                    )}
                    {Number(selectedStatement.otherDeductions) > 0 && (
                      <div className="flex justify-between py-1">
                        <span className="text-neutral-600">Other Deductions</span>
                        <span className="text-danger-600 font-mono">
                          -KES {Number(selectedStatement.otherDeductions).toLocaleString()}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between py-2 border-t border-neutral-200 font-semibold">
                      <span className="text-neutral-700">Total Deductions</span>
                      <span className="text-danger-600 font-mono">
                        -KES {(Number(selectedStatement.managementFee) + Number(selectedStatement.maintenanceCosts) + Number(selectedStatement.otherDeductions)).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Net Amount */}
              <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg p-6 mt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-700">Net Disbursement</h3>
                    <p className="text-sm text-neutral-600">Generated: {formatDate(selectedStatement.generatedAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-primary-700 font-mono">
                      KES {Number(selectedStatement.netDisbursement).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Line Items */}
              {selectedStatement.lineItems && selectedStatement.lineItems.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold text-neutral-700 text-sm uppercase tracking-wider mb-3">Line Items</h3>
                  <div className="border border-neutral-200 rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-neutral-200">
                      <thead className="bg-neutral-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500 uppercase">Description</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500 uppercase">Type</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-neutral-500 uppercase">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-200">
                        {selectedStatement.lineItems.map((item, idx) => (
                          <tr key={idx} className="hover:bg-neutral-50">
                            <td className="px-4 py-2 text-sm text-neutral-900">{item.description}</td>
                            <td className="px-4 py-2 text-sm">
                              <span className={`px-2 py-0.5 text-xs rounded-full ${
                                item.type === 'income' ? 'bg-success-100 text-success-800' : 'bg-danger-100 text-danger-800'
                              }`}>
                                {item.type}
                              </span>
                            </td>
                            <td className={`px-4 py-2 text-sm text-right font-mono ${
                              item.type === 'income' ? 'text-success-600' : 'text-danger-600'
                            }`}>
                              {item.type === 'deduction' ? '-' : ''}KES {item.amount.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Export Button */}
              <div className="flex justify-end pt-4">
                <button
                  onClick={exportToPDF}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium"
                >
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
