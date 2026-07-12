import { NextRequest, NextResponse } from 'next/server'
import { generateInvoicesForPeriod } from '@/lib/services/invoice-generator'

// SOP 004 / BR-1 — scheduled monthly invoice generation (Day 1).
// Runs via Vercel Cron (see vercel.json), authed by CRON_SECRET.
export const dynamic = 'force-dynamic'
export const maxDuration = 300

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret) {
    console.error('[cron] CRON_SECRET is not configured — refusing to run')
    return NextResponse.json({ error: 'Cron not configured' }, { status: 503 })
  }
  if (request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await generateInvoicesForPeriod()
    return NextResponse.json({ ok: true, ...result })
  } catch (error) {
    console.error('[cron] invoice generation failed:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
