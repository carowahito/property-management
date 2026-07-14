import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'
import { syncClearance } from '@/lib/services/clearance'
import { z } from 'zod'

// GET — evaluate and persist the clause 8.4 clearance state for a lease.
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user.role === 'TENANT') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const state = await syncClearance(id)
  return NextResponse.json(state)
}

const confirmSchema = z.object({
  keysReturned: z.boolean().optional(),
  metersRecorded: z.boolean().optional(),
  rentCleared: z.boolean().optional(),
  balanceSettled: z.boolean().optional(),
})

// PATCH — agent confirmation of clause 8.4 conditions that are not fully
// derivable (keys, meters, rent, over-deposit balance). Re-evaluates afterwards.
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user.role === 'TENANT') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  // Ensure a row exists to attach confirmations to.
  const state = await syncClearance(id)
  if (!state.clearance) {
    return NextResponse.json({ error: 'No move-out inspection / statement for this lease yet' }, { status: 400 })
  }

  try {
    const data = confirmSchema.parse(await request.json())
    if (state.clearance.status === 'ISSUED') {
      return NextResponse.json({ error: 'Clearance already issued' }, { status: 400 })
    }
    await prisma.clearanceToVacate.update({
      where: { leaseId: id },
      data: {
        ...(data.keysReturned !== undefined ? { keysReturned: data.keysReturned } : {}),
        ...(data.metersRecorded !== undefined ? { metersRecorded: data.metersRecorded } : {}),
        ...(data.rentCleared !== undefined ? { rentCleared: data.rentCleared } : {}),
        ...(data.balanceSettled !== undefined ? { balanceSettled: data.balanceSettled } : {}),
      },
    })
    return NextResponse.json(await syncClearance(id))
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    console.error('Error confirming clearance conditions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
