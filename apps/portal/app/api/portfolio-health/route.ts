import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const reviews = await prisma.portfolioHealthReview.findMany({
      orderBy: { reviewDate: 'desc' },
      include: {
        _count: { select: { tenantScores: true } },
      },
    })

    return NextResponse.json(reviews)
  } catch (error) {
    console.error('Error fetching portfolio health reviews:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
