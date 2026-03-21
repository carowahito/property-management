'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { TimeFilter } from '@/components/shared/TimeFilter'

export default function DepositsPage() {
  const [timePeriod, setTimePeriod] = useState('current')
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [deposits, setDeposits] = useState<{ id: string; tenantId: string; tenant: string; propertyId: string; property: string; unit: string; amount: number; status: string; date: string }[]>([]);

  useEffect(() => {
    fetch('/api/leases?status=ACTIVE&limit=100')
      .then(r => r.json())
      .then(data => {
        const mapped = (data.leases || []).map((l: any) => ({
          id: l.id,
          tenantId: l.tenantId,
          tenant: l.tenant?.name || '',
          propertyId: l.propertyId,
          property: l.property?.name || '',
          unit: l.unit || l.unitId || '',
          amount: Number(l.securityDeposit) || 0,
          status: 'held',
          date: l.startDate ? l.startDate.split('T')[0] : '',
        }));
        setDeposits(mapped);
      })
      .catch(() => {});
  }, []);

  const stats = {
    totalHeld: deposits.reduce((sum, d) => sum + d.amount, 0),
    totalDeposits: deposits.length,
    pendingRefunds: 0,
  };

  return (
    <div className='p-6 space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>Security Deposits</h1>
          <p className='text-gray-600 mt-1'>Track and manage tenant security deposits</p>
        </div>
        <Button variant="primary" size="lg">+ Record Deposit</Button>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <div className='bg-white shadow rounded-lg p-6'>
          <p className='text-sm text-gray-600'>Total Held</p>
          <p className='text-3xl font-bold text-blue-600'>KES {stats.totalHeld.toLocaleString()}</p>
        </div>
        <div className='bg-white shadow rounded-lg p-6'>
          <p className='text-sm text-gray-600'>Total Deposits</p>
          <p className='text-3xl font-bold text-gray-900'>{stats.totalDeposits}</p>
        </div>
        <div className='bg-white shadow rounded-lg p-6'>
          <p className='text-sm text-gray-600'>Pending Refunds</p>
          <p className='text-3xl font-bold text-yellow-600'>{stats.pendingRefunds}</p>
        </div>
      </div>

      <div className='bg-white shadow rounded-lg p-4 space-y-4'>
        <div className='flex flex-wrap gap-4 items-end'>
          <TimeFilter
            timePeriod={timePeriod}
            setTimePeriod={setTimePeriod}
            customStartDate={customStartDate}
            setCustomStartDate={setCustomStartDate}
            customEndDate={customEndDate}
            setCustomEndDate={setCustomEndDate}
          />
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
            >
              <option value='all'>All Status</option>
              <option value='held'>Held</option>
              <option value='refunded'>Refunded</option>
              <option value='pending'>Pending</option>
            </select>
          </div>
        </div>
      </div>

      <div className='bg-white shadow rounded-lg overflow-hidden'>
        <table className='min-w-full divide-y divide-gray-200'>
          <thead className='bg-gray-50'>
            <tr>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                Tenant
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                Property/Unit
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                Amount
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                Status
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                Date Received
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {deposits.map((deposit) => (
              <tr key={deposit.id} className='hover:bg-gray-50'>
                <td className='px-6 py-4 text-sm font-medium'>
                  <Link href={`/admin/tenants/${deposit.tenantId}`} className='text-blue-600 hover:text-blue-800 hover:underline'>
                    {deposit.tenant}
                  </Link>
                </td>
                <td className='px-6 py-4 text-sm'>
                  <Link href={`/admin/properties/${deposit.propertyId}`} className='text-blue-600 hover:text-blue-800 hover:underline'>
                    {deposit.property}
                  </Link>
                  <br />
                  <span className='text-gray-500'>Unit {deposit.unit}</span>
                </td>
                <td className='px-6 py-4 text-sm font-semibold text-gray-900'>
                  KES {deposit.amount.toLocaleString()}
                </td>
                <td className='px-6 py-4'>
                  <span className='px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800'>
                    {deposit.status}
                  </span>
                </td>
                <td className='px-6 py-4 text-sm text-gray-900'>{deposit.date}</td>
                <td className='px-6 py-4 text-sm space-x-2'>
                  <button  >
                    View
                  </button>
                  <button  >
                    Refund
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
