'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface PropertyOccupancy {
  id: string;
  propertyName: string;
  totalUnits: number;
  occupiedUnits: number;
  vacantUnits: number;
  occupancyRate: number;
  avgVacancyDays: number;
  monthlyRevenue: number;
}

export default function OccupancyPage() {
  const [properties] = useState<PropertyOccupancy[]>([
    {
      id: '1',
      propertyName: 'Sunset Apartments',
      totalUnits: 24,
      occupiedUnits: 22,
      vacantUnits: 2,
      occupancyRate: 91.7,
      avgVacancyDays: 12,
      monthlyRevenue: 990000,
    },
    {
      id: '2',
      propertyName: 'Highland House',
      totalUnits: 16,
      occupiedUnits: 16,
      vacantUnits: 0,
      occupancyRate: 100,
      avgVacancyDays: 0,
      monthlyRevenue: 960000,
    },
    {
      id: '3',
      propertyName: 'Vista Plaza',
      totalUnits: 30,
      occupiedUnits: 27,
      vacantUnits: 3,
      occupancyRate: 90,
      avgVacancyDays: 18,
      monthlyRevenue: 2160000,
    },
    {
      id: '4',
      propertyName: 'Garden Estate',
      totalUnits: 12,
      occupiedUnits: 10,
      vacantUnits: 2,
      occupancyRate: 83.3,
      avgVacancyDays: 25,
      monthlyRevenue: 400000,
    },
    {
      id: '5',
      propertyName: 'Riverside Towers',
      totalUnits: 20,
      occupiedUnits: 18,
      vacantUnits: 2,
      occupancyRate: 90,
      avgVacancyDays: 15,
      monthlyRevenue: 1260000,
    },
  ]);

  const stats = {
    totalUnits: properties.reduce((sum, p) => sum + p.totalUnits, 0),
    totalOccupied: properties.reduce((sum, p) => sum + p.occupiedUnits, 0),
    totalVacant: properties.reduce((sum, p) => sum + p.vacantUnits, 0),
    avgOccupancyRate: (
      properties.reduce((sum, p) => sum + p.occupancyRate, 0) / properties.length
    ).toFixed(1),
  };

  const monthlyTrend = [
    { month: 'Oct', rate: 88 },
    { month: 'Nov', rate: 90 },
    { month: 'Dec', rate: 92 },
    { month: 'Jan', rate: 91 },
    { month: 'Feb', rate: 93 },
    { month: 'Mar', rate: parseFloat(stats.avgOccupancyRate) },
  ];

  return (
    <div className='p-6 space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>Occupancy Analytics</h1>
          <p className='text-gray-600 mt-1'>Track occupancy rates and vacancy trends</p>
        </div>
        <Button className='bg-blue-600 hover:bg-blue-700'>Download Report</Button>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
        <div className='bg-white shadow rounded-lg p-6'>
          <p className='text-sm text-gray-600'>Total Units</p>
          <p className='text-3xl font-bold text-gray-900'>{stats.totalUnits}</p>
        </div>
        <div className='bg-white shadow rounded-lg p-6'>
          <p className='text-sm text-gray-600'>Occupied Units</p>
          <p className='text-3xl font-bold text-green-600'>{stats.totalOccupied}</p>
        </div>
        <div className='bg-white shadow rounded-lg p-6'>
          <p className='text-sm text-gray-600'>Vacant Units</p>
          <p className='text-3xl font-bold text-red-600'>{stats.totalVacant}</p>
        </div>
        <div className='bg-white shadow rounded-lg p-6'>
          <p className='text-sm text-gray-600'>Avg Occupancy Rate</p>
          <p className='text-3xl font-bold text-blue-600'>{stats.avgOccupancyRate}%</p>
        </div>
      </div>

      <div className='bg-white shadow rounded-lg p-6'>
        <h2 className='text-xl font-semibold text-gray-900 mb-4'>6-Month Occupancy Trend</h2>
        <div className='flex items-end space-x-4 h-48'>
          {monthlyTrend.map((item) => (
            <div key={item.month} className='flex-1 flex flex-col items-center'>
              <div
                className='w-full bg-blue-500 rounded-t'
                style={{ height: `${item.rate}%` }}
              ></div>
              <p className='text-xs text-gray-600 mt-2'>{item.month}</p>
              <p className='text-xs font-semibold text-gray-900'>{item.rate}%</p>
            </div>
          ))}
        </div>
      </div>

      <div className='bg-white shadow rounded-lg overflow-hidden'>
        <table className='min-w-full divide-y divide-gray-200'>
          <thead className='bg-gray-50'>
            <tr>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                Property
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                Total Units
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                Occupied
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                Vacant
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                Occupancy Rate
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                Avg Vacancy Days
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                Monthly Revenue
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {properties.map((property) => (
              <tr key={property.id} className='hover:bg-gray-50'>
                <td className='px-6 py-4 text-sm font-medium text-gray-900'>
                  {property.propertyName}
                </td>
                <td className='px-6 py-4 text-sm text-gray-900'>{property.totalUnits}</td>
                <td className='px-6 py-4 text-sm text-green-600 font-semibold'>
                  {property.occupiedUnits}
                </td>
                <td className='px-6 py-4 text-sm text-red-600 font-semibold'>
                  {property.vacantUnits}
                </td>
                <td className='px-6 py-4'>
                  <div className='flex items-center'>
                    <span
                      className={`text-sm font-semibold ${
                        property.occupancyRate >= 95
                          ? 'text-green-600'
                          : property.occupancyRate >= 85
                            ? 'text-yellow-600'
                            : 'text-red-600'
                      }`}
                    >
                      {property.occupancyRate.toFixed(1)}%
                    </span>
                  </div>
                </td>
                <td className='px-6 py-4 text-sm text-gray-900'>{property.avgVacancyDays} days</td>
                <td className='px-6 py-4 text-sm font-semibold text-gray-900'>
                  KES {property.monthlyRevenue.toLocaleString()}
                </td>
                <td className='px-6 py-4 text-sm'>
                  <Button variant='outline' size='sm'>
                    Details
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
