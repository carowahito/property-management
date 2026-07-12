import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { runArrearsScan } from '@/lib/services/arrears-scan'

// Manual (agent-triggered) arrears scan. The scheduled equivalent runs via
// /api/cron/arrears-scan (BR-5). Both share runArrearsScan().
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await runArrearsScan()

    return NextResponse.json({
      message: `Scan complete. ${result.created} new arrears record(s) created, ${result.refreshed} refreshed.`,
      ...result,
    })
  } catch (error) {
    console.error('Error scanning for arrears:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
