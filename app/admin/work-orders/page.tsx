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
    <div className='p-6 space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>Work Orders</h1>
          <p className='text-gray-600 mt-1'>Create and manage maintenance work orders</p>
        </div>
        <Button variant="primary" size="lg">+ Create Work Order</Button>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <div className='bg-white shadow rounded-lg p-6'>
          <p className='text-sm text-gray-600'>Open</p>
          <p className='text-3xl font-bold text-yellow-600'>1</p>
        </div>
        <div className='bg-white shadow rounded-lg p-6'>
          <p className='text-sm text-gray-600'>In Progress</p>
          <p className='text-3xl font-bold text-blue-600'>1</p>
        </div>
        <div className='bg-white shadow rounded-lg p-6'>
          <p className='text-sm text-gray-600'>Completed</p>
          <p className='text-3xl font-bold text-green-600'>1</p>
        </div>
      </div>

      <div className='bg-white shadow rounded-lg overflow-hidden'>
        <table className='min-w-full divide-y divide-gray-200'>
          <thead className='bg-gray-50'>
            <tr>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                Title
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                Property/Unit
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                Priority
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                Status
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                Created
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {workOrders.map((order) => (
              <tr key={order.id} className='hover:bg-gray-50'>
                <td className='px-6 py-4 text-sm font-medium text-gray-900'>{order.title}</td>
                <td className='px-6 py-4 text-sm text-gray-900'>
                  {order.property}
                  <br />
                  <span className='text-gray-500'>Unit {order.unit}</span>
                </td>
                <td className='px-6 py-4'>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${order.priority === 'high' ? 'bg-red-100 text-red-800' : order.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}
                  >
                    {order.priority}
                  </span>
                </td>
                <td className='px-6 py-4'>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${order.status === 'completed' ? 'bg-green-100 text-green-800' : order.status === 'in-progress' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className='px-6 py-4 text-sm text-gray-900'>{order.created}</td>
                <td className='px-6 py-4 text-sm space-x-2'>
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
