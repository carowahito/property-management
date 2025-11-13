'use client';

import { useState } from 'react';

interface Property {
  id: string;
  name: string;
  address: string;
  units: number;
  occupancy: number;
  monthlyRevenue: number;
  status: 'active' | 'maintenance' | 'vacant';
}

export default function PropertiesPage() {
  const [properties] = useState<Property[]>([
    {
      id: '1',
      name: 'Downtown Apartments',
      address: '123 Main St, City',
      units: 12,
      occupancy: 10,
      monthlyRevenue: 45000,
      status: 'active'
    },
    {
      id: '2',
      name: 'Suburban Residences',
      address: '456 Oak Ave, Suburb',
      units: 8,
      occupancy: 6,
      monthlyRevenue: 28000,
      status: 'active'
    }
  ]);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Properties</h1>
        <p className="text-gray-600">Manage your property portfolio</p>
      </div>

      <button className="mb-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded">+ Add Property</button>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => (
          <div key={property.id} className="border rounded-lg p-4 hover:shadow-lg transition">
            <h3 className="font-bold text-lg mb-2">{property.name}</h3>
            <p className="text-sm text-gray-600 mb-4">{property.address}</p>
            <div className="space-y-2 text-sm">
              <p><strong>Units:</strong> {property.units}</p>
              <p><strong>Occupancy:</strong> {property.occupancy}/{property.units}</p>
              <p><strong>Monthly Revenue:</strong> KES {property.monthlyRevenue.toLocaleString()}</p>
              <p><strong>Status:</strong> <span className="px-2 py-1 bg-green-100 text-green-800 rounded">{property.status}</span></p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
