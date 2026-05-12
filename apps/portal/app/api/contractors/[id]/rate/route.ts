import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'
import { rateContractorSchema } from '@/lib/validations/contractor'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const validatedData = rateContractorSchema.parse(body)

    const existing = await prisma.contractor.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Contractor not found' }, { status: 404 })
    }

    // Calculate running average
    const currentRating = existing.rating ? Number(existing.rating) : 0
    const currentJobs = existing.totalJobs
    const newTotalJobs = currentJobs + 1
    const newRating =
      currentJobs === 0
        ? validatedData.rating
        : (currentRating * currentJobs + validatedData.rating) / newTotalJobs

    const contractor = await prisma.contractor.update({
      where: { id },
      data: {
        rating: Math.round(newRating * 100) / 100, // 2 decimal places
        totalJobs: newTotalJobs,
      },
    })

    return NextResponse.json(contractor)
  } catch (error: any) {
    console.error('Error rating contractor:', error)

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
