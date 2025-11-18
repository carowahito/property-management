import { NextResponse } from 'next/server'
import { mockTenants } from '@/lib/mock-data'

export async function GET() {
  return NextResponse.json(mockTenants)
}
