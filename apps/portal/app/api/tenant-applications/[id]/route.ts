import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'
import { updateTenantApplicationSchema } from '@/lib/validations/tenant-application'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    const { id } = await params

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const application = await prisma.tenantApplication.findUnique({
      where: { id },
      include: {
        property: {
          select: {
            id: true,
            name: true,
            address: true,
            type: true,
            landlord: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        unit: {
          select: {
            id: true,
            unitNumber: true,
            monthlyRent: true,
            bedrooms: true,
            bathrooms: true,
          },
        },
      },
    })

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    return NextResponse.json(application)
  } catch (error) {
    console.error('Error fetching tenant application:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    const { id } = await params

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updateTenantApplicationSchema.parse(body)

    const updateData: any = { ...validatedData }

    // Convert date strings to Date objects
    if (validatedData.crbCheckDate) {
      updateData.crbCheckDate = new Date(validatedData.crbCheckDate)
    }
    if (validatedData.decidedAt) {
      updateData.decidedAt = new Date(validatedData.decidedAt)
    }
    if (validatedData.landlordApprovalDate) {
      updateData.landlordApprovalDate = new Date(validatedData.landlordApprovalDate)
    }

    // Convert monthlyIncome to number
    if (validatedData.monthlyIncome !== undefined) {
      updateData.monthlyIncome = validatedData.monthlyIncome ? Number(validatedData.monthlyIncome) : null
    }

    // If status is being set to APPROVED or REJECTED, record the decision
    if (validatedData.status === 'APPROVED' || validatedData.status === 'REJECTED') {
      if (!updateData.decidedAt) {
        updateData.decidedAt = new Date()
      }
      if (!updateData.decidedBy) {
        updateData.decidedBy = (session as any).user?.name || (session as any).user?.email || 'System'
      }
    }

    // Auto-check income if income or unit changes
    if (validatedData.monthlyIncome !== undefined || validatedData.unitId !== undefined) {
      const existing = await prisma.tenantApplication.findUnique({
        where: { id },
        include: { unit: { select: { monthlyRent: true } } },
      })

      if (existing) {
        const unitId = validatedData.unitId !== undefined ? validatedData.unitId : existing.unitId
        let unitRent: number | null = null

        if (unitId) {
          const unit = await prisma.unit.findUnique({ where: { id: unitId } })
          unitRent = unit?.monthlyRent ? Number(unit.monthlyRent) : null
        }

        const income = validatedData.monthlyIncome !== undefined
          ? (validatedData.monthlyIncome ? Number(validatedData.monthlyIncome) : null)
          : (existing.monthlyIncome ? Number(existing.monthlyIncome) : null)

        if (income !== null && unitRent !== null) {
          updateData.incomeCheckPassed = income >= unitRent * 3
        }
      }
    }

    const application = await prisma.tenantApplication.update({
      where: { id },
      data: updateData,
      include: {
        property: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
        unit: {
          select: {
            id: true,
            unitNumber: true,
            monthlyRent: true,
          },
        },
      },
    })

    return NextResponse.json(application)
  } catch (error: any) {
    console.error('Error updating tenant application:', error)

    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
