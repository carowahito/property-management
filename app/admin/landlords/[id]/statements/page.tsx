'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
}

interface Transaction {
  id: string;
  propertyName: string;
  unitId: string | null;
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
  paidDate?: string | null;
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
  const params = useParams();
  const router = useRouter();
  const landlordId = params.id as string;

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

  const exportToPDF = async () => {
    try {
      const response = await fetch(
        `/api/landlords/${landlordId}/statement?year=${selectedYear}&month=${selectedMonth}&format=html`
      );
      const html = await response.text();
      
      // Open in new window for printing/saving
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
        }, 250);
      }
    } catch (error) {
      console.error('Error exporting PDF:', error);
    }
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'bg-success-100 text-green-800';
      case 'PROCESSING': return 'bg-primary-100 text-primary-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-neutral-100 text-neutral-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-neutral-600">Loading statement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Link
              href={`/admin/landlords/${landlordId}`}
              className="text-neutral-600 hover:text-neutral-900"
            >
              ← Back to Landlord
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-neutral-900 mt-2 flex items-center gap-2">
            <span className="text-3xl">📊</span> Landlord Statements
          </h1>
          {statement && (
            <p className="text-neutral-600 mt-1">{statement.landlordName}</p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportToPDF}
            className="px-4 py-2 bg-success-600 text-white rounded-lg hover:bg-success-700 transition flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export PDF
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-surface rounded-lg shadow">
        <div className="border-b border-neutral-200">
          <div className="flex gap-4 px-6">
            <button
              onClick={() => setActiveTab('current')}
              className={`py-4 px-2 border-b-2 transition ${
                activeTab === 'current'
                  ? 'border-primary-600 text-primary-600 font-medium'
                  : 'border-transparent text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Current Statement
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-4 px-2 border-b-2 transition ${
                activeTab === 'history'
                  ? 'border-primary-600 text-primary-600 font-medium'
                  : 'border-transparent text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Statement History
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'current' && statement && (
        <>
          {/* Period Selector */}
          <div className="bg-surface rounded-lg shadow p-6">
            <h3 className="font-semibold text-neutral-900 mb-4">Select Period</h3>
            <div className="flex gap-4">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                {months.map((month, index) => (
                  <option key={month} value={index + 1}>
                    {month}
                  </option>
                ))}
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="bg-surface rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-neutral-900 mb-4">Financial Summary - {statement.period}</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-3 border-b border-neutral-200">
                <span className="text-neutral-700 font-medium">Total Gross Rent</span>
                <span className="text-lg font-bold text-success-600">
                  KES {statement.totalGrossRent.toLocaleString()}
                </span>
              </div>
              
              <div className="flex justify-between items-center py-2">
                <span className="text-neutral-600">Service Charges</span>
                <span className="text-danger-600 font-medium">
                  -KES {statement.totalServiceCharges.toLocaleString()}
                </span>
              </div>
              
              <div className="flex justify-between items-center py-2">
                <span className="text-neutral-600">Management Fees</span>
                <span className="text-danger-600 font-medium">
                  -KES {statement.totalManagementFees.toLocaleString()}
                </span>
              </div>
              
              <div className="flex justify-between items-center py-2">
                <span className="text-neutral-600">Maintenance & Repairs</span>
                <span className="text-danger-600 font-medium">
                  -KES {statement.totalMaintenanceFees.toLocaleString()}
                </span>
              </div>
              
              {statement.totalOtherDeductions > 0 && (
                <div className="flex justify-between items-center py-2">
                  <span className="text-neutral-600">Other Deductions</span>
                  <span className="text-danger-600 font-medium">
                    -KES {statement.totalOtherDeductions.toLocaleString()}
                  </span>
                </div>
              )}
              
              <div className="flex justify-between items-center py-4 border-t-2 border-primary-600 mt-2">
                <span className="text-neutral-900 font-bold text-lg">Net Amount Payable</span>
                <span className="text-2xl font-bold text-primary-600">
                  KES {statement.totalNetAmount.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="ml-3">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> Late payment fees collected from tenants are not included in this statement 
                    as they represent additional income retained by the property management company.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Property Breakdown */}
          {statement.propertyBreakdown.length > 1 && (
            <div className="bg-surface rounded-lg shadow overflow-hidden">
              <div className="p-6 border-b border-neutral-200">
                <h2 className="text-xl font-bold text-neutral-900">Property Breakdown</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-neutral-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Property
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
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
                    {statement.propertyBreakdown.map((prop) => (
                      <tr key={prop.propertyId} className="hover:bg-neutral-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                          {prop.propertyName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600 text-right">
                          {prop.unitCount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 text-right font-mono">
                          KES {prop.grossRent.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-danger-600 text-right font-mono">
                          -KES {prop.deductions.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-success-600 text-right font-mono font-bold">
                          KES {prop.netAmount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Transaction Details */}
          <div className="bg-surface rounded-lg shadow overflow-hidden">
            <div className="p-6 border-b border-neutral-200">
              <h2 className="text-xl font-bold text-neutral-900">Transaction Details</h2>
              <p className="text-sm text-neutral-600 mt-1">{statement.transactionCount} transactions</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
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
        </>
      )}

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
                    <h3 className="font-semibold text-neutral-900">{stmt.period}</h3>
                    <p className="text-sm text-neutral-600 mt-1">
                      {stmt.transactionCount} transactions • Net: KES {Number(stmt.totalNetAmount).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-neutral-600">
                      Generated: {new Date(stmt.generatedAt).toLocaleDateString()}
                    </p>
                    {stmt.sent && (
                      <p className="text-xs text-success-600 mt-1">✓ Sent to landlord</p>
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
