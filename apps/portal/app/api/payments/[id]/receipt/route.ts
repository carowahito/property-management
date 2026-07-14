import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { sendEmail } from '@/lib/services/email'
import { fetchPayment, buildReceiptHtml, receiptNumberFor } from '@/lib/services/receipt'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const payment = await fetchPayment(id)

  if (!payment) {
    return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
  }

  const receiptNumber = receiptNumberFor(payment)
  const html = buildReceiptHtml(payment, receiptNumber)

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const payment = await fetchPayment(id)

  if (!payment) {
    return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
  }

  if (!payment.tenant.email) {
    return NextResponse.json({ error: 'Tenant has no email address on file' }, { status: 422 })
  }

  const receiptNumber = receiptNumberFor(payment)
  const html = buildReceiptHtml(payment, receiptNumber)

  const sent = await sendEmail({
    to: payment.tenant.email,
    subject: `Payment Receipt — ${receiptNumber}`,
    html,
  })

  if (!sent) {
    return NextResponse.json({ error: 'Email could not be sent. Check email configuration.' }, { status: 500 })
  }

  return NextResponse.json({ success: true, sentTo: payment.tenant.email })
}
