'use client'

import { Button } from '@/components/ui/button'

export default function DepositsPage() {
  const deposits = [
    {
      id: '1',
      tenant: 'John Mwangi',
      property: 'Sunset Apartments',
      unit: '5A',
      amount: 90000,
      status: 'held',
      date: '2024-01-01',
    },
    {
      id: '2',
      tenant: 'Jane Achieng',
      property: 'Highland House',
      unit: '12',
      amount: 150000,
      status: 'held',
      date: '2024-03-15',
    },
    {
      id: '3',
      tenant: 'Peter Omondi',
      property: 'Vista Plaza',
      unit: '8B',
      amount: 240000,
      status: 'held',
      date: '2024-02-01',
    },
  ];

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
                <td className='px-6 py-4 text-sm font-medium text-gray-900'>{deposit.tenant}</td>
                <td className='px-6 py-4 text-sm text-gray-900'>
                  {deposit.property}
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
