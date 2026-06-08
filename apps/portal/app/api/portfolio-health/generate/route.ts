import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'
import { scoreTenancy } from '@/lib/services/health-scoring'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { period, reviewDate } = body

    if (!period || !reviewDate) {
      return NextResponse.json({ error: 'period and reviewDate are required' }, { status: 400 })
    }

    // Get all active leases with tenant + property info
    const activeLeases = await prisma.lease.findMany({
      where: { status: 'ACTIVE' },
      select: {
        id: true,
        tenantId: true,
        propertyId: true,
        monthlyRent: true,
        tenant: { select: { name: true } },
        property: { select: { name: true } },
      },
    })

    if (activeLeases.length === 0) {
      return NextResponse.json({ error: 'No active leases found' }, { status: 400 })
    }

    // Score all tenants
    const scores = await Promise.all(
      activeLeases.map((lease) =>
        scoreTenancy(
          lease.tenantId,
          lease.id,
          lease.propertyId,
          Number(lease.monthlyRent)
        )
      )
    )

    const summary = {
      total: scores.length,
      green: scores.filter((s) => s.overallRisk === 'GREEN').length,
      amber: scores.filter((s) => s.overallRisk === 'AMBER').length,
      red: scores.filter((s) => s.overallRisk === 'RED').length,
      flaggedForDirector: scores.filter((s) => s.flaggedForDirector).length,
    }

    // Create the review record
    const review = await prisma.portfolioHealthReview.create({
      data: {
        period,
        reviewDate: new Date(reviewDate),
        summary,
        tenantScores: {
          create: scores.map((s) => ({
            tenantId: s.tenantId,
            leaseId: s.leaseId,
            propertyId: s.propertyId,
            monthlyRent: s.monthlyRent,
            paymentScore: s.payment.score,
            paymentNotes: s.payment.notes,
            arrearsScore: s.arrears.score,
            arrearsNotes: s.arrears.notes,
            contactScore: s.contact.score,
            contactNotes: s.contact.notes,
            inspectionScore: s.inspection.score,
            inspectionNotes: s.inspection.notes,
            overallRisk: s.overallRisk,
            redCount: s.redCount,
            flaggedForDirector: s.flaggedForDirector,
            recommendedAction: s.recommendedAction,
            latePaymentCount: s.latePaymentCount,
            currentBalance: s.currentBalance,
            daysSinceContact: s.daysSinceContact,
            daysSinceInspection: s.daysSinceInspection,
          })),
        },
      },
      include: { tenantScores: true },
    })

    // Block renewals for any tenant flagged for Director
    const flaggedTenantIds = scores
      .filter((s) => s.flaggedForDirector)
      .map((s) => s.tenantId)

    if (flaggedTenantIds.length > 0) {
      await prisma.leaseRenewal.updateMany({
        where: {
          tenantId: { in: flaggedTenantIds },
          status: { in: ['PENDING', 'LANDLORD_REVIEW', 'RENT_REVIEW', 'TENANT_NOTIFIED'] },
        },
        data: {
          directorEscalated: true,
          directorEscalatedAt: new Date(),
        },
      })
    }

    return NextResponse.json({ review, summary }, { status: 201 })
  } catch (error) {
    console.error('Error generating portfolio health review:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
