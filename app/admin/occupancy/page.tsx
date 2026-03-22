'use client';

import { useState, useEffect } from 'react';
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
  const [properties, setProperties] = useState<PropertyOccupancy[]>([]);

  useEffect(() => {
    fetch('/api/properties?limit=100')
      .then(r => r.json())
      .then(data => {
        const mapped = (data.properties || []).map((p: any) => {
          const total = p.totalUnits || 0;
          const occupied = p._count?.leases || 0;
          const vacant = Math.max(0, total - occupied);
          const rate = total > 0 ? Math.round((occupied / total) * 1000) / 10 : 0;
          return {
            id: p.id,
            propertyName: p.name,
            totalUnits: total,
            occupiedUnits: occupied,
            vacantUnits: vacant,
            occupancyRate: rate,
            avgVacancyDays: 0,
            monthlyRevenue: 0,
          };
        });
        setProperties(mapped);
      })
      .catch(() => {});
  }, []);

  const stats = {
    totalUnits: properties.reduce((sum, p) => sum + p.totalUnits, 0),
    totalOccupied: properties.reduce((sum, p) => sum + p.occupiedUnits, 0),
    totalVacant: properties.reduce((sum, p) => sum + p.vacantUnits, 0),
    avgOccupancyRate: properties.length > 0
      ? (properties.reduce((sum, p) => sum + p.occupancyRate, 0) / properties.length).toFixed(1)
      : '0.0',
  };

  const monthlyTrend: { month: string; rate: number }[] = [];

  return (
    <div className='p-6 space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-neutral-900'>Occupancy Analytics</h1>
          <p className='text-neutral-600 mt-1'>Track occupancy rates and vacancy trends</p>
        </div>
        <Button variant="primary" size="lg">Download Report</Button>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
        <div className='bg-surface shadow rounded-lg p-6'>
          <p className='text-sm text-neutral-600'>Total Units</p>
          <p className='text-3xl font-bold text-neutral-900'>{stats.totalUnits}</p>
        </div>
        <div className='bg-surface shadow rounded-lg p-6'>
          <p className='text-sm text-neutral-600'>Occupied Units</p>
          <p className='text-3xl font-bold text-success-600'>{stats.totalOccupied}</p>
        </div>
        <div className='bg-surface shadow rounded-lg p-6'>
          <p className='text-sm text-neutral-600'>Vacant Units</p>
          <p className='text-3xl font-bold text-danger-600'>{stats.totalVacant}</p>
        </div>
        <div className='bg-surface shadow rounded-lg p-6'>
          <p className='text-sm text-neutral-600'>Avg Occupancy Rate</p>
          <p className='text-3xl font-bold text-primary-600'>{stats.avgOccupancyRate}%</p>
        </div>
      </div>

      <div className='bg-surface shadow rounded-lg p-6'>
        <h2 className='text-xl font-semibold text-neutral-900 mb-4'>6-Month Occupancy Trend</h2>
        <div className='flex items-end space-x-4 h-48'>
          {monthlyTrend.map((item) => (
            <div key={item.month} className='flex-1 flex flex-col items-center'>
              <div
                className='w-full bg-primary-500 rounded-t'
                style={{ height: `${item.rate}%` }}
              ></div>
              <p className='text-xs text-neutral-600 mt-2'>{item.month}</p>
              <p className='text-xs font-semibold text-neutral-900'>{item.rate}%</p>
            </div>
          ))}
        </div>
      </div>

      <div className='bg-surface shadow rounded-lg overflow-hidden'>
        <table className='min-w-full divide-y divide-neutral-200'>
          <thead className='bg-neutral-50'>
            <tr>
              <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase'>
                Property
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase'>
                Total Units
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase'>
                Occupied
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase'>
                Vacant
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase'>
                Occupancy Rate
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase'>
                Avg Vacancy Days
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase'>
                Monthly Revenue
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase'>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className='bg-surface divide-y divide-neutral-200'>
            {properties.map((property) => (
              <tr key={property.id} className='hover:bg-neutral-50'>
                <td className='px-6 py-4 text-sm font-medium text-neutral-900'>
                  {property.propertyName}
                </td>
                <td className='px-6 py-4 text-sm text-neutral-900'>{property.totalUnits}</td>
                <td className='px-6 py-4 text-sm text-success-600 font-semibold'>
                  {property.occupiedUnits}
                </td>
                <td className='px-6 py-4 text-sm text-danger-600 font-semibold'>
                  {property.vacantUnits}
                </td>
                <td className='px-6 py-4'>
                  <div className='flex items-center'>
                    <span
                      className={`text-sm font-semibold ${
                        property.occupancyRate >= 95
                          ? 'text-success-600'
                          : property.occupancyRate >= 85
                            ? 'text-yellow-600'
                            : 'text-danger-600'
                      }`}
                    >
                      {property.occupancyRate.toFixed(1)}%
                    </span>
                  </div>
                </td>
                <td className='px-6 py-4 text-sm text-neutral-900'>{property.avgVacancyDays} days</td>
                <td className='px-6 py-4 text-sm font-semibold text-neutral-900'>
                  KES {property.monthlyRevenue.toLocaleString()}
                </td>
                <td className='px-6 py-4 text-sm'>
                  <Button variant="primary" size="sm">
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
