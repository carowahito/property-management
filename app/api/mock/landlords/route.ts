import { NextResponse } from 'next/server'
import { mockLandlords } from '@/lib/mock-data'

export async function GET() {
  // Add _count fields for compatibility with the UI
  const landlordsWithCounts = mockLandlords.map(landlord => ({
    ...landlord,
    status: landlord.status.toUpperCase(),
    _count: {
      properties: Math.floor(Math.random() * 5) + 1,
      units: Math.floor(Math.random() * 20) + 5,
      tenants: Math.floor(Math.random() * 15) + 3,
    }
  }))
  
  return NextResponse.json({ landlords: landlordsWithCounts })
}
