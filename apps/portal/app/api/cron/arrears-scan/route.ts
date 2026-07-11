import { NextRequest, NextResponse } from 'next/server'
import { runArrearsScan } from '@/lib/services/arrears-scan'

// SOP 004 / BR-5 — scheduled arrears scan.
// Runs daily via Vercel Cron (see vercel.json). Vercel sends the request with
// an `Authorization: Bearer <CRON_SECRET>` header; we reject anything else so
// the endpoint can't be triggered by the public.
export const dynamic = 'force-dynamic'
export const maxDuration = 300

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret) {
    console.error('[cron] CRON_SECRET is not configured — refusing to run')
    return NextResponse.json({ error: 'Cron not configured' }, { status: 503 })
  }

  const auth = request.headers.get('authorization')
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await runArrearsScan()
    return NextResponse.json({ ok: true, ...result })
  } catch (error) {
    console.error('[cron] arrears scan failed:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
