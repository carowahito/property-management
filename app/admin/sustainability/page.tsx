'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface SustainabilityMetric {
  id: string;
  propertyName: string;
  energyUsage: number; // kWh
  waterUsage: number; // liters
  wasteRecycled: number; // kg
  carbonFootprint: number; // tons CO2
  solarGeneration?: number; // kWh
  greenCertification?: string;
  month: string;
}

export default function SustainabilityPage() {
  const [metrics] = useState<SustainabilityMetric[]>([
    {
      id: '1',
      propertyName: 'Sunset Apartments',
      energyUsage: 8500,
      waterUsage: 125000,
      wasteRecycled: 450,
      carbonFootprint: 4.2,
      solarGeneration: 2100,
      greenCertification: 'LEED Silver',
      month: 'Feb 2024',
    },
    {
      id: '2',
      propertyName: 'Highland House',
      energyUsage: 6200,
      waterUsage: 95000,
      wasteRecycled: 320,
      carbonFootprint: 3.1,
      month: 'Feb 2024',
    },
    {
      id: '3',
      propertyName: 'Vista Plaza',
      energyUsage: 12000,
      waterUsage: 180000,
      wasteRecycled: 680,
      carbonFootprint: 6.0,
      solarGeneration: 3500,
      greenCertification: 'LEED Gold',
      month: 'Feb 2024',
    },
    {
      id: '4',
      propertyName: 'Garden Estate',
      energyUsage: 4800,
      waterUsage: 72000,
      wasteRecycled: 210,
      carbonFootprint: 2.4,
      month: 'Feb 2024',
    },
  ]);

  const stats = {
    totalEnergy: metrics.reduce((sum, m) => sum + m.energyUsage, 0),
    totalWater: metrics.reduce((sum, m) => sum + m.waterUsage, 0),
    totalWaste: metrics.reduce((sum, m) => sum + m.wasteRecycled, 0),
    totalCarbon: metrics.reduce((sum, m) => sum + m.carbonFootprint, 0),
    totalSolar: metrics.reduce((sum, m) => sum + (m.solarGeneration || 0), 0),
    certifiedProperties: metrics.filter((m) => m.greenCertification).length,
  };

  return (
    <div className='p-6 space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>Sustainability Metrics</h1>
          <p className='text-gray-600 mt-1'>Track environmental impact and green initiatives</p>
        </div>
        <Button variant="primary" size="lg">Download Report</Button>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <div className='bg-white shadow rounded-lg p-6'>
          <p className='text-sm text-gray-600'>Total Energy Usage</p>
          <p className='text-3xl font-bold text-yellow-600'>
            {stats.totalEnergy.toLocaleString()} kWh
          </p>
          {stats.totalSolar > 0 && (
            <p className='text-xs text-green-600 mt-1'>
              Solar: {stats.totalSolar.toLocaleString()} kWh generated
            </p>
          )}
        </div>
        <div className='bg-white shadow rounded-lg p-6'>
          <p className='text-sm text-gray-600'>Total Water Usage</p>
          <p className='text-3xl font-bold text-blue-600'>{stats.totalWater.toLocaleString()} L</p>
        </div>
        <div className='bg-white shadow rounded-lg p-6'>
          <p className='text-sm text-gray-600'>Waste Recycled</p>
          <p className='text-3xl font-bold text-green-600'>
            {stats.totalWaste.toLocaleString()} kg
          </p>
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div className='bg-white shadow rounded-lg p-6'>
          <p className='text-sm text-gray-600'>Carbon Footprint</p>
          <p className='text-3xl font-bold text-red-600'>{stats.totalCarbon.toFixed(1)} tons CO₂</p>
        </div>
        <div className='bg-white shadow rounded-lg p-6'>
          <p className='text-sm text-gray-600'>Green Certified Properties</p>
          <p className='text-3xl font-bold text-green-600'>
            {stats.certifiedProperties} / {metrics.length}
          </p>
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
                Energy (kWh)
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                Water (L)
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                Waste Recycled (kg)
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                Carbon (tons CO₂)
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                Solar Generation
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                Certification
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {metrics.map((metric) => (
              <tr key={metric.id} className='hover:bg-gray-50'>
                <td className='px-6 py-4 text-sm font-medium text-gray-900'>
                  {metric.propertyName}
                </td>
                <td className='px-6 py-4 text-sm text-gray-900'>
                  {metric.energyUsage.toLocaleString()}
                </td>
                <td className='px-6 py-4 text-sm text-gray-900'>
                  {metric.waterUsage.toLocaleString()}
                </td>
                <td className='px-6 py-4 text-sm text-gray-900'>
                  {metric.wasteRecycled.toLocaleString()}
                </td>
                <td className='px-6 py-4 text-sm text-gray-900'>
                  {metric.carbonFootprint.toFixed(1)}
                </td>
                <td className='px-6 py-4 text-sm text-green-600 font-semibold'>
                  {metric.solarGeneration ? `${metric.solarGeneration.toLocaleString()} kWh` : '—'}
                </td>
                <td className='px-6 py-4'>
                  {metric.greenCertification ? (
                    <span className='px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800'>
                      {metric.greenCertification}
                    </span>
                  ) : (
                    <span className='text-xs text-gray-500'>None</span>
                  )}
                </td>
                <td className='px-6 py-4 text-sm'>
                  <button  >
                    View Details
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
