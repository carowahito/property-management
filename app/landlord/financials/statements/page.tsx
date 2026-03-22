'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Statement {
  landlordId: string;
  landlordName: string;
  period: string;
  startDate: string;
  endDate: string;
  totalGrossRent: number;
  totalServiceCharges: number;
  totalManagementFees: number;
  totalMaintenanceFees: number;
  totalOtherDeductions: number;
  totalDeductions: number;
  totalNetAmount: number;
  transactionCount: number;
  transactions: Transaction[];
  propertyBreakdown: PropertyBreakdown[];
  generatedAt: string;
}

interface Transaction {
  id: string;
  propertyName: string;
  unitId: string;
  tenantName: string;
  rentPeriod: string;
  grossRent: number;
  deductions: {
    serviceCharge: number;
    managementFee: number;
    maintenance: number;
    other: number;
    total: number;
  };
  netAmount: number;
  payoutStatus: string;
}

interface PropertyBreakdown {
  propertyId: string;
  propertyName: string;
  unitCount: number;
  grossRent: number;
  deductions: number;
  netAmount: number;
}

export default function LandlordStatementsPage() {
  const router = useRouter();
  // Mock landlord ID - in real app, this would come from auth session
  const landlordId = '1'; // James K. Johnson
  
  const [statement, setStatement] = useState<Statement | null>(null);
  const [statementHistory, setStatementHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');

  useEffect(() => {
    fetchStatement();
    fetchHistory();
  }, [landlordId, selectedYear, selectedMonth]);

  const fetchStatement = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/landlords/${landlordId}/statement?year=${selectedYear}&month=${selectedMonth}&type=generate`
      );
      const data = await response.json();
      setStatement(data.success ? data.statement : null);
    } catch (error) {
      console.error('Error fetching statement:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await fetch(
        `/api/landlords/${landlordId}/statement?type=history`
      );
      const data = await response.json();
      setStatementHistory(data.success ? data.statements : []);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const exportToPDF = () => {
    window.print();
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'bg-success-100 text-success-800';
      case 'PROCESSING': return 'bg-primary-100 text-primary-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-neutral-100 text-neutral-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const landlordName = statement?.landlordName || 'Landlord';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link href="/landlord/financials" className="text-primary-600 hover:text-primary-800 mb-2 inline-block">
          ← Back to Financials
        </Link>
        <h1 className="text-3xl font-bold text-neutral-900">Rent Statements</h1>
        <p className="text-neutral-600 mt-2">View detailed breakdown of rent collected and deductions</p>
      </div>

      {/* Period Selector */}
      <div className="bg-surface rounded-lg shadow p-6 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Month</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="px-4 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-500"
            >
              {months.map((month, index) => (
                <option key={month} value={index + 1}>{month}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-4 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-500"
            >
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-surface rounded-lg shadow mb-6">
        <div className="border-b border-neutral-200">
          <nav className="flex space-x-4 px-6 pt-4">
            <button
              onClick={() => setActiveTab('current')}
              className={`pb-4 px-2 font-medium text-sm border-b-2 transition ${
                activeTab === 'current'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700'
              }`}
            >
              Current Statement
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`pb-4 px-2 font-medium text-sm border-b-2 transition ${
                activeTab === 'history'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700'
              }`}
            >
              Statement History
            </button>
          </nav>
        </div>
      </div>

      {/* Current Statement Tab */}
      {activeTab === 'current' && (
        <>
          {!statement ? (
            <div className="bg-surface rounded-lg shadow p-12 text-center">
              <p className="text-neutral-500 text-lg">No statement available for {months[selectedMonth - 1]} {selectedYear}</p>
              <p className="text-neutral-400 text-sm mt-2">Please select a different period or check back later.</p>
            </div>
          ) : (
            <>
              {/* Financial Summary */}
              <div className="bg-surface rounded-lg shadow overflow-hidden mb-6">
                <div className="px-6 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
                  <h2 className="text-xl font-bold">Statement for {statement.period}</h2>
                  <p className="text-primary-100 text-sm">
                    {new Date(statement.startDate).toLocaleDateString()} - {new Date(statement.endDate).toLocaleDateString()}
                  </p>
                </div>

                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Income Section */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-neutral-700 text-sm uppercase tracking-wider">Income</h3>
                      <div className="flex justify-between py-2 border-b border-neutral-200">
                        <span className="text-neutral-700">Total Gross Rent</span>
                        <span className="font-semibold text-success-600 font-mono">
                          KES {statement.totalGrossRent.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Deductions Section */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-neutral-700 text-sm uppercase tracking-wider">Deductions</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between py-1">
                          <span className="text-neutral-600">Service Charges</span>
                          <span className="text-danger-600 font-mono">
                            -KES {statement.totalServiceCharges.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-neutral-600">Management Fees</span>
                          <span className="text-danger-600 font-mono">
                            -KES {statement.totalManagementFees.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-neutral-600">Maintenance & Repairs</span>
                          <span className="text-danger-600 font-mono">
                            -KES {statement.totalMaintenanceFees.toLocaleString()}
                          </span>
                        </div>
                        {statement.totalOtherDeductions > 0 && (
                          <div className="flex justify-between py-1">
                            <span className="text-neutral-600">Other Deductions</span>
                            <span className="text-danger-600 font-mono">
                              -KES {statement.totalOtherDeductions.toLocaleString()}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between py-2 border-t border-neutral-200 font-semibold">
                          <span className="text-neutral-700">Total Deductions</span>
                          <span className="text-danger-600 font-mono">
                            -KES {statement.totalDeductions.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Net Amount - Prominent Display */}
                  <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg p-6 mt-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-semibold text-neutral-700">Net Amount Payable</h3>
                        <p className="text-sm text-neutral-600">{statement.transactionCount} transaction{statement.transactionCount !== 1 ? 's' : ''}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-primary-700 font-mono">
                          KES {statement.totalNetAmount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Export Button */}
                  <div className="flex justify-end pt-4">
                    <button
                      onClick={exportToPDF}
                      className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium"
                    >
                      📄 Download PDF
                    </button>
                  </div>
                </div>
              </div>

              {/* Property Breakdown (if multiple properties) */}
              {statement.propertyBreakdown && statement.propertyBreakdown.length > 1 && (
                <div className="bg-surface rounded-lg shadow overflow-hidden mb-6">
                  <div className="px-6 py-4 border-b border-neutral-200">
                    <h2 className="text-lg font-semibold text-neutral-900">Property Breakdown</h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-neutral-200">
                      <thead className="bg-neutral-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                            Property
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                            Units
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                            Gross Rent
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                            Deductions
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                            Net Amount
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-surface divide-y divide-neutral-200">
                        {statement.propertyBreakdown.map((property) => (
                          <tr key={property.propertyId} className="hover:bg-neutral-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                              {property.propertyName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                              {property.unitCount}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 text-right font-mono">
                              KES {property.grossRent.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-danger-600 text-right font-mono">
                              -KES {property.deductions.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-success-600 text-right font-mono font-bold">
                              KES {property.netAmount.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Transaction Details */}
              {statement.transactions && statement.transactions.length > 0 && (
                <div className="bg-surface rounded-lg shadow overflow-hidden">
                  <div className="px-6 py-4 border-b border-neutral-200">
                    <h2 className="text-lg font-semibold text-neutral-900">Transaction Details</h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-neutral-200">
                      <thead className="bg-neutral-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                            Property
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                            Unit
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                            Tenant
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                            Period
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                            Gross Rent
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                            Deductions
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                            Net Amount
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-surface divide-y divide-neutral-200">
                        {statement.transactions.map((txn) => (
                          <tr key={txn.id} className="hover:bg-neutral-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                              {txn.propertyName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                              {txn.unitId || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                              {txn.tenantName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                              {txn.rentPeriod}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 text-right font-mono">
                              KES {txn.grossRent.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-danger-600 text-right font-mono">
                              -KES {txn.deductions.total.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-success-600 text-right font-mono font-bold">
                              KES {txn.netAmount.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(txn.payoutStatus)}`}>
                                {txn.payoutStatus}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Statement History Tab */}
      {activeTab === 'history' && (
        <div className="bg-surface rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-neutral-200">
            <h2 className="text-xl font-bold text-neutral-900">Statement History</h2>
          </div>
          <div className="divide-y divide-neutral-200">
            {statementHistory.map((stmt) => (
              <div
                key={stmt.id}
                className="p-6 hover:bg-neutral-50 cursor-pointer transition"
                onClick={() => {
                  const date = new Date(stmt.startDate);
                  setSelectedYear(date.getFullYear());
                  setSelectedMonth(date.getMonth() + 1);
                  setActiveTab('current');
                }}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-neutral-900 text-lg">{stmt.period}</h3>
                    <p className="text-sm text-neutral-600 mt-1">
                      {stmt.transactionCount} transaction{stmt.transactionCount !== 1 ? 's' : ''} • 
                      Net: KES {Number(stmt.totalNetAmount).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-neutral-600">
                      Generated: {new Date(stmt.generatedAt).toLocaleDateString()}
                    </p>
                    {stmt.sentAt && (
                      <p className="text-xs text-success-600 mt-1">✓ Delivered</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {statementHistory.length === 0 && (
              <div className="p-12 text-center text-neutral-500">
                No statement history available
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
