import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '500')

    const transactions = await prisma.rentTransaction.findMany({
      select: {
        id: true,
        grossRent: true,
        serviceCharge: true,
        managementFee: true,
        maintenanceFees: true,
        otherDeductions: true,
        totalDeductions: true,
        netAmount: true,
        lateFees: true,
        rentPeriod: true,
        dueDate: true,
        paidDate: true,
        payoutStatus: true,
        processed: true,
        tenant: { select: { id: true, name: true } },
        unit: { select: { unitNumber: true } },
        landlord: { select: { id: true, name: true } },
        property: { select: { id: true, name: true } },
      },
      orderBy: { paidDate: 'desc' },
      take: limit,
    })

    return NextResponse.json({ transactions })
  } catch (error) {
    console.error('Error fetching rent transactions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
