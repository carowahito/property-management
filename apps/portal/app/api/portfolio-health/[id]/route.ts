import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const review = await prisma.portfolioHealthReview.findUnique({
      where: { id },
      include: {
        tenantScores: {
          orderBy: [{ flaggedForDirector: 'desc' }, { overallRisk: 'asc' }],
        },
      },
    })

    if (!review) return NextResponse.json({ error: 'Review not found' }, { status: 404 })

    // Enrich with tenant and property names
    const enriched = await Promise.all(
      review.tenantScores.map(async (score) => {
        const [tenant, property] = await Promise.all([
          prisma.tenant.findUnique({ where: { id: score.tenantId }, select: { name: true, email: true } }),
          prisma.property.findUnique({ where: { id: score.propertyId }, select: { name: true } }),
        ])
        return { ...score, tenantName: tenant?.name, tenantEmail: tenant?.email, propertyName: property?.name }
      })
    )

    return NextResponse.json({ ...review, tenantScores: enriched })
  } catch (error) {
    console.error('Error fetching portfolio health review:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const body = await request.json()
    const { directorSignedOffBy, directorNotes, scoreId, agentNotes, directorApproved } = body

    // Director sign-off on the whole review
    if (directorSignedOffBy) {
      const review = await prisma.portfolioHealthReview.update({
        where: { id },
        data: {
          directorSignedOffAt: new Date(),
          directorSignedOffBy,
          directorNotes,
          completedAt: new Date(),
        },
      })
      return NextResponse.json(review)
    }

    // Agent notes or director approval on a single score row
    if (scoreId) {
      const score = await prisma.tenantHealthScore.update({
        where: { id: scoreId },
        data: {
          ...(agentNotes !== undefined && { agentNotes }),
          ...(directorApproved !== undefined && {
            directorApproved,
            directorApprovedAt: directorApproved ? new Date() : null,
          }),
        },
      })
      return NextResponse.json(score)
    }

    return NextResponse.json({ error: 'No valid update provided' }, { status: 400 })
  } catch (error) {
    console.error('Error updating portfolio health review:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
