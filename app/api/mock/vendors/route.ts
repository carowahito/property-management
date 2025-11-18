import { NextResponse } from 'next/server'
import { mockVendors } from '@/lib/mock-data'

export async function GET() {
  return NextResponse.json(mockVendors)
}
