'use client';

import { Button } from '@/components/ui/button';

export default function WorkOrdersPage() {
  const workOrders = [
    {
      id: '1',
      title: 'Fix leaking pipe',
      property: 'Sunset Apartments',
      unit: '5A',
      status: 'open',
      priority: 'high',
      created: '2024-11-10',
    },
    {
      id: '2',
      title: 'Paint exterior walls',
      property: 'Highland House',
      unit: 'Building',
      status: 'in-progress',
      priority: 'medium',
      created: '2024-11-08',
    },
    {
      id: '3',
      title: 'Replace door lock',
      property: 'Vista Plaza',
      unit: '8B',
      status: 'completed',
      priority: 'low',
      created: '2024-11-05',
    },
  ];

  return (
    <div className='p-4 md:p-6 space-y-4 md:space-y-6'>
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <div>
          <h1 className='text-xl md:text-2xl font-bold text-neutral-900'>Work Orders</h1>
          <p className='text-neutral-600 mt-1'>Create and manage maintenance work orders</p>
        </div>
        <Button variant="primary" size="lg">+ Create Work Order</Button>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6'>
        <div className='bg-surface shadow rounded-lg p-4 md:p-6'>
          <p className='text-sm text-neutral-600'>Open</p>
          <p className='text-3xl font-bold text-yellow-600'>1</p>
        </div>
        <div className='bg-surface shadow rounded-lg p-4 md:p-6'>
          <p className='text-sm text-neutral-600'>In Progress</p>
          <p className='text-3xl font-bold text-primary-600'>1</p>
        </div>
        <div className='bg-surface shadow rounded-lg p-4 md:p-6'>
          <p className='text-sm text-neutral-600'>Completed</p>
          <p className='text-3xl font-bold text-success-600'>1</p>
        </div>
      </div>

      <div className='bg-surface shadow rounded-lg overflow-hidden overflow-x-auto'>
        <table className='min-w-full divide-y divide-neutral-200'>
          <thead className='bg-neutral-50'>
            <tr>
              <th className='px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-neutral-500 uppercase'>
                Title
              </th>
              <th className='px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-neutral-500 uppercase hidden md:table-cell'>
                Property/Unit
              </th>
              <th className='px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-neutral-500 uppercase'>
                Priority
              </th>
              <th className='px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-neutral-500 uppercase'>
                Status
              </th>
              <th className='px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-neutral-500 uppercase hidden md:table-cell'>
                Created
              </th>
              <th className='px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-neutral-500 uppercase'>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className='bg-surface divide-y divide-neutral-200'>
            {workOrders.map((order) => (
              <tr key={order.id} className='hover:bg-neutral-50'>
                <td className='px-3 md:px-6 py-2 md:py-4 text-sm font-medium text-neutral-900'>{order.title}</td>
                <td className='px-3 md:px-6 py-2 md:py-4 text-sm text-neutral-900 hidden md:table-cell'>
                  {order.property}
                  <br />
                  <span className='text-neutral-500'>Unit {order.unit}</span>
                </td>
                <td className='px-3 md:px-6 py-2 md:py-4'>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${order.priority === 'high' ? 'bg-danger-100 text-red-800' : order.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-neutral-100 text-neutral-800'}`}
                  >
                    {order.priority}
                  </span>
                </td>
                <td className='px-3 md:px-6 py-2 md:py-4'>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${order.status === 'completed' ? 'bg-success-100 text-green-800' : order.status === 'in-progress' ? 'bg-primary-100 text-primary-800' : 'bg-yellow-100 text-yellow-800'}`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className='px-3 md:px-6 py-2 md:py-4 text-sm text-neutral-900 hidden md:table-cell'>{order.created}</td>
                <td className='px-3 md:px-6 py-2 md:py-4 text-sm space-x-2'>
                  <button  >
                    View
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
