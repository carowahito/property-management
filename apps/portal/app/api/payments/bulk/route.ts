import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'
import { syncPaymentToLedger } from '@/lib/services/tenant-ledger'
import { allocatePaymentToInvoices } from '@/lib/services/payment-allocation'

// Bulk rent-payment upload. Accepts rows keyed by unit number and creates a
// RENT payment (status PAID) for each, resolving unit -> active lease -> tenant.
// Ledger sync + invoice allocation run per payment; receipt emails are NOT sent
// (bulk imports should not blast tenants). SOP 004 / BR-12: no cash.

const ALLOWED_METHODS = ['BANK_TRANSFER', 'MPESA', 'CHEQUE', 'CARD'] as const
type Method = (typeof ALLOWED_METHODS)[number]

interface BulkRow {
  unitNumber?: string
  amount?: string | number
  paidDate?: string
  method?: string
  reference?: string
  notes?: string
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => null)
    const rows: BulkRow[] = Array.isArray(body?.rows) ? body.rows : []
    if (rows.length === 0) {
      return NextResponse.json({ error: 'No rows provided' }, { status: 400 })
    }

    let created = 0
    let skipped = 0
    const errors: string[] = []

    for (let i = 0; i < rows.length; i++) {
      const rowNum = i + 1
      const row = rows[i]
      const unitNumber = (row.unitNumber || '').toString().trim()
      const amount = parseFloat(String(row.amount ?? ''))
      const paidDateStr = (row.paidDate || '').toString().trim()
      const method = (row.method || 'BANK_TRANSFER').toString().trim().toUpperCase()

      // Validation
      if (!unitNumber) { errors.push(`Row ${rowNum}: missing unitNumber`); skipped++; continue }
      if (!amount || amount <= 0 || isNaN(amount)) { errors.push(`Row ${rowNum} (${unitNumber}): invalid amount`); skipped++; continue }
      if (!paidDateStr || isNaN(Date.parse(paidDateStr))) { errors.push(`Row ${rowNum} (${unitNumber}): invalid paidDate (use YYYY-MM-DD)`); skipped++; continue }
      if (method === 'CASH') { errors.push(`Row ${rowNum} (${unitNumber}): cash payments are not permitted (SOP 004)`); skipped++; continue }
      if (!ALLOWED_METHODS.includes(method as Method)) { errors.push(`Row ${rowNum} (${unitNumber}): invalid method "${method}". Use ${ALLOWED_METHODS.join(', ')}`); skipped++; continue }

      // Resolve unit -> active lease -> tenant
      const unit = await prisma.unit.findUnique({ where: { unitNumber } })
      if (!unit) { errors.push(`Row ${rowNum}: unit "${unitNumber}" not found`); skipped++; continue }
      const lease = await prisma.lease.findFirst({
        where: { unitId: unit.id, status: 'ACTIVE' },
        select: { id: true, tenantId: true, propertyId: true },
      })
      if (!lease) { errors.push(`Row ${rowNum} (${unitNumber}): no active lease for this unit`); skipped++; continue }

      const paidDate = new Date(paidDateStr)
      try {
        const payment = await prisma.payment.create({
          data: {
            tenantId: lease.tenantId,
            leaseId: lease.id,
            propertyId: lease.propertyId,
            unitId: unit.id,
            amount,
            type: 'RENT',
            method: method as Method,
            status: 'PAID',
            dueDate: paidDate,
            paidDate,
            reference: row.reference ? String(row.reference).trim() : undefined,
            notes: row.notes ? String(row.notes).trim() : undefined,
          },
        })
        // Keep the ledger and invoice balances consistent. Best-effort; no receipt email.
        await syncPaymentToLedger(payment.id).catch(() => {})
        await allocatePaymentToInvoices(payment.id).catch(() => {})
        created++
      } catch (err: any) {
        if (err?.code === 'P2002') {
          errors.push(`Row ${rowNum} (${unitNumber}): duplicate reference "${row.reference}"`)
        } else {
          errors.push(`Row ${rowNum} (${unitNumber}): ${err?.message || 'failed to create payment'}`)
        }
        skipped++
      }
    }

    return NextResponse.json({ created, skipped, total: rows.length, errors })
  } catch (error) {
    console.error('Error in bulk payment upload:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
