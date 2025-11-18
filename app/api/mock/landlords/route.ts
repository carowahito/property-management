import { NextResponse } from 'next/server'
import { mockLandlords } from '@/lib/mock-data'

export async function GET() {
  return NextResponse.json(mockLandlords)
}
