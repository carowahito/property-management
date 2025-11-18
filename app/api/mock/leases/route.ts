import { NextResponse } from 'next/server'

const mockLeases = [
  {
    id: '1',
    tenantId: '1',
    tenantName: 'John Smith',
    propertyId: '1',
    propertyName: 'Sunset Apartments',
    unit: '5A',
    startDate: '2023-06-15',
    endDate: '2025-06-14',
    monthlyRent: 40000,
    deposit: 80000,
    status: 'Active',
  },
  {
    id: '2',
    tenantId: '2',
    tenantName: 'Sarah Johnson',
    propertyId: '2',
    propertyName: 'Vista Plaza',
    unit: '3B',
    startDate: '2023-08-22',
    endDate: '2025-08-21',
    monthlyRent: 40000,
    deposit: 80000,
    status: 'Active',
  },
  {
    id: '3',
    tenantId: '3',
    tenantName: 'Michael Chen',
    propertyId: '3',
    propertyName: 'Highland House',
    unit: '2C',
    startDate: '2024-01-10',
    endDate: '2025-01-09',
    monthlyRent: 30000,
    deposit: 60000,
    status: 'Active',
  },
]

export async function GET() {
  return NextResponse.json(mockLeases)
}
