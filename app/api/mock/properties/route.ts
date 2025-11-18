import { NextResponse } from 'next/server'
import { mockProperties } from '@/lib/mock-data'

export async function GET() {
  return NextResponse.json(mockProperties)
}
