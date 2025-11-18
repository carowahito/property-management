import { NextResponse } from 'next/server'

const mockMaintenanceRequests = [
  {
    id: '1',
    title: 'Leaking Faucet',
    description: 'Kitchen faucet is dripping constantly',
    status: 'Open',
    priority: 'Medium',
    tenantId: '1',
    tenantName: 'John Smith',
    propertyId: '1',
    propertyName: 'Sunset Apartments',
    unit: '5A',
    createdAt: '2024-11-15T10:30:00',
    category: 'Plumbing',
  },
  {
    id: '2',
    title: 'AC Not Working',
    description: 'Air conditioning unit not cooling',
    status: 'In Progress',
    priority: 'High',
    tenantId: '2',
    tenantName: 'Sarah Johnson',
    propertyId: '2',
    propertyName: 'Vista Plaza',
    unit: '3B',
    createdAt: '2024-11-14T14:20:00',
    category: 'HVAC',
  },
  {
    id: '3',
    title: 'Broken Window',
    description: 'Bedroom window cracked',
    status: 'Completed',
    priority: 'High',
    tenantId: '3',
    tenantName: 'Michael Chen',
    propertyId: '3',
    propertyName: 'Highland House',
    unit: '2C',
    createdAt: '2024-11-10T09:00:00',
    completedAt: '2024-11-12T16:30:00',
    category: 'General',
  },
]

export async function GET() {
  return NextResponse.json(mockMaintenanceRequests)
}
