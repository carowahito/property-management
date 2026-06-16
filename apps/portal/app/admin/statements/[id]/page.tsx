'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface OwnerStatement {
  id: string;
  landlordId: string;
  propertyId: string | null;
  month: number;
  year: number;
  rentDue: string;
  rentReceived: string;
  managementFee: string;
  managementFeeRate: string;
  maintenanceCosts: string;
  otherDeductions: string;
  netDisbursement: string;
  depositsHeld: string;
  lineItems: LineItem[] | null;
  status: string;
  generatedAt: string;
  sentAt: string | null;
  landlord: {
    id: string;
    name: string;
    email: string;
    phone: string;
    bankName: string | null;
    bankAccount: string | null;
  };
  property: {
    id: string;
    name: string;
    address: string;
    city: string | null;
  } | null;
}

interface LineItem {
  description: string;
  amount: number;
  type: 'income' | 'deduction';
  category: string;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function StatementPrintPage() {
  const params = useParams();
  const router = useRouter();
  const [statement, setStatement] = useState<OwnerStatement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params.id) return;
    fetch(`/api/owner-statements/${params.id}`)
      .then((r) => {
        if (!r.ok) throw new Error('Failed to fetch statement');
        return r.json();
      })
      .then((data) => {
        setStatement(data);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setIsLoading(false);
      });
  }, [params.id]);

  const fmt = (n: number) =>
    `KES ${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-neutral-500">Loading statement...</p>
      </div>
    );
  }

  if (error || !statement) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-danger-600">{error || 'Statement not found'}</p>
        <Button variant="outline" onClick={() => router.push('/admin/statements')}>
          Back to Statements
        </Button>
      </div>
    );
  }

  const incomeItems = (statement.lineItems || []).filter((li) => li.type === 'income');
  const deductionItems = (statement.lineItems || []).filter((li) => li.type === 'deduction');
  const totalDeductions =
    Number(statement.managementFee) +
    Number(statement.maintenanceCosts) +
    Number(statement.otherDeductions);

  return (
    <>
      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          nav, aside, header,
          .no-print {
            display: none !important;
          }
          body {
            background: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .print-container {
            padding: 0 !important;
            max-width: 100% !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }
        }
      `}</style>

      {/* Action Bar (hidden on print) */}
      <div className="no-print p-4 bg-neutral-50 border-b border-neutral-200 flex items-center gap-3">
        <Button variant="outline" onClick={() => router.push('/admin/statements')}>
          Back to Statements
        </Button>
        <Button
          onClick={() => window.print()}
          className="bg-primary-600 hover:bg-primary-700 text-white"
        >
          Print Statement
        </Button>
      </div>

      {/* Printable Statement */}
      <div className="print-container max-w-3xl mx-auto p-8 bg-white">
        {/* Company Header */}
        <div className="text-center border-b-2 border-neutral-800 pb-4 mb-6">
          <h1 className="text-2xl font-bold text-neutral-900">Tochi Realty</h1>
          <p className="text-sm text-neutral-600">Property Management Services</p>
          <p className="text-xs text-neutral-500 mt-1">
            P.O. Box 12345, Nairobi, Kenya | info@tochirealty.co.ke
          </p>
        </div>

        {/* Statement Title */}
        <div className="text-center mb-6">
          <h2 className="text-lg font-bold text-neutral-900 uppercase tracking-wide">
            Owner Statement
          </h2>
          <p className="text-neutral-600">
            Period: {MONTH_NAMES[statement.month - 1]} {statement.year}
          </p>
          <p className="text-xs text-neutral-500 mt-1">
            Generated: {new Date(statement.generatedAt).toLocaleDateString()}
          </p>
        </div>

        {/* Landlord & Property Details */}
        <div className="grid grid-cols-2 gap-6 mb-8 text-sm">
          <div className="border border-neutral-200 rounded-lg p-4">
            <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">
              Landlord Details
            </h3>
            <p className="font-medium text-neutral-900">{statement.landlord.name}</p>
            {(statement.landlord as any).type === 'JOINT_OWNERSHIP' && (statement.landlord as any).members?.length > 0 && (
              <p className="text-xs text-neutral-400">& {(statement.landlord as any).members.map((m: any) => m.name).join(' & ')}</p>
            )}
            <p className="text-neutral-600">{statement.landlord.email}</p>
            <p className="text-neutral-600">{statement.landlord.phone}</p>
            {statement.landlord.bankName && (
              <p className="text-neutral-600 mt-1">
                Bank: {statement.landlord.bankName} - {statement.landlord.bankAccount}
              </p>
            )}
          </div>
          <div className="border border-neutral-200 rounded-lg p-4">
            <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">
              Property Details
            </h3>
            {statement.property ? (
              <>
                <p className="font-medium text-neutral-900">{statement.property.name}</p>
                <p className="text-neutral-600">{statement.property.address}</p>
                {statement.property.city && (
                  <p className="text-neutral-600">{statement.property.city}</p>
                )}
              </>
            ) : (
              <p className="text-neutral-600">Consolidated Portfolio Statement</p>
            )}
          </div>
        </div>

        {/* Income Table */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wide mb-2 border-b border-neutral-300 pb-1">
            Income
          </h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="text-left py-2 font-medium text-neutral-600">Description</th>
                <th className="text-right py-2 font-medium text-neutral-600">Amount</th>
              </tr>
            </thead>
            <tbody>
              {incomeItems.length > 0 ? (
                incomeItems.map((li, i) => (
                  <tr key={i} className="border-b border-neutral-100">
                    <td className="py-2 text-neutral-700">{li.description}</td>
                    <td className="py-2 text-right text-neutral-900">{fmt(li.amount)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={2} className="py-2 text-neutral-500 italic">No income items</td>
                </tr>
              )}
              <tr className="border-t-2 border-neutral-300 font-semibold">
                <td className="py-2 text-neutral-900">Total Rent Due</td>
                <td className="py-2 text-right text-neutral-900">{fmt(Number(statement.rentDue))}</td>
              </tr>
              <tr className="font-semibold">
                <td className="py-2 text-neutral-900">Total Rent Received</td>
                <td className="py-2 text-right text-success-700">{fmt(Number(statement.rentReceived))}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Deductions Table */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wide mb-2 border-b border-neutral-300 pb-1">
            Deductions
          </h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="text-left py-2 font-medium text-neutral-600">Description</th>
                <th className="text-right py-2 font-medium text-neutral-600">Amount</th>
              </tr>
            </thead>
            <tbody>
              {deductionItems.length > 0 ? (
                deductionItems.map((li, i) => (
                  <tr key={i} className="border-b border-neutral-100">
                    <td className="py-2 text-neutral-700">{li.description}</td>
                    <td className="py-2 text-right text-danger-600">({fmt(li.amount)})</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={2} className="py-2 text-neutral-500 italic">No deductions</td>
                </tr>
              )}
              <tr className="border-t-2 border-neutral-300 font-semibold">
                <td className="py-2 text-neutral-900">Total Deductions</td>
                <td className="py-2 text-right text-danger-600">({fmt(totalDeductions)})</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="border-2 border-neutral-800 rounded-lg p-4 mb-6">
          <table className="w-full text-sm">
            <tbody>
              <tr>
                <td className="py-1 text-neutral-700">Total Rent Received</td>
                <td className="py-1 text-right font-medium">{fmt(Number(statement.rentReceived))}</td>
              </tr>
              <tr>
                <td className="py-1 text-neutral-700">Total Deductions</td>
                <td className="py-1 text-right font-medium text-danger-600">({fmt(totalDeductions)})</td>
              </tr>
              <tr className="border-t-2 border-neutral-800">
                <td className="py-2 text-lg font-bold text-neutral-900">Net Disbursement</td>
                <td className="py-2 text-right text-lg font-bold text-neutral-900">
                  {fmt(Number(statement.netDisbursement))}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Deposits Note */}
        {Number(statement.depositsHeld) > 0 && (
          <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3 mb-6 text-sm">
            <p className="text-neutral-600">
              <span className="font-medium">Deposits Held:</span>{' '}
              {fmt(Number(statement.depositsHeld))}
            </p>
            <p className="text-xs text-neutral-500 mt-1 italic">
              Deposits held are not included in disbursable amounts.
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-neutral-300 pt-4 mt-8 text-center text-xs text-neutral-500">
          <p>This statement was generated by Tochi Property Management System.</p>
          <p className="mt-1">
            For questions, please contact: info@tochiproperty.com | +254 721 998 499
          </p>
        </div>
      </div>
    </>
  );
}
