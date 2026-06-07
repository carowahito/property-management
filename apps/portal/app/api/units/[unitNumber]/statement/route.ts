import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'

// GET /api/units/:unitNumber/statement?from=2025-07-01&to=2026-03-31
//
// ┌──────────────────────────────┬──────────┬──────────┬───────┐
// │ Item                         │ Admin    │ Landlord │ Tenant│
// ├──────────────────────────────┼──────────┼──────────┼───────┤
// │ Tenant payment receipts      │ ✅       │ ❌       │ ✅    │
// │ Actual deposit amount        │ ✅       │ ❌       │ ✅    │
// │ Rent due (agreed amount)     │ ✅       │ ✅       │ ✅    │
// │ Service charge               │ ✅       │ ✅       │ ✅    │
// │ Late fees / penalties        │ ✅       │ ❌       │ ✅    │
// │ Repairs & maintenance        │ ✅       │ ✅       │ ✅    │
// │ Management fee               │ ✅       │ ✅       │ ❌    │
// │ Agent commission             │ ✅       │ ❌       │ ❌    │
// │ Deposit refund (move-out)    │ ✅       │ ✅       │ ✅    │
// │ Payout receipt (to landlord) │ ✅       │ ✅       │ ❌    │
// │ Net to landlord              │ ✅       │ ✅       │ ❌    │
// └──────────────────────────────┴──────────┴──────────┴───────┘
//
// Query params:
//   from  — ISO date, start of period (default: first day of current month)
//   to    — ISO date, end of period   (default: today)

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ unitNumber: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { unitNumber } = await params
  const { searchParams } = new URL(req.url)

  const now = new Date()
  const from = searchParams.get('from')
    ? new Date(searchParams.get('from')!)
    : new Date(now.getFullYear(), now.getMonth(), 1)
  const to = searchParams.get('to')
    ? new Date(searchParams.get('to')!)
    : now

  const unit = await prisma.unit.findUnique({
    where: { unitNumber },
    include: {
      property: true,
      landlord: true,
      tenants: {
        where: { status: 'ACTIVE' },
        select: { id: true, name: true, email: true, phone: true, moveInDate: true },
      },
      leases: {
        where: { status: 'ACTIVE' },
        select: {
          id: true, startDate: true, endDate: true,
          monthlyRent: true, securityDeposit: true, terms: true, status: true,
        },
      },
    },
  })

  if (!unit) {
    return NextResponse.json({ error: `Unit "${unitNumber}" not found` }, { status: 404 })
  }

  const role = session.user.role
  const isAdmin  = role === 'ADMIN' || role === 'MANAGER'
  // Tenant role will be added when tenant portal auth is implemented.
  // For now any non-admin session where the user email matches the tenant is treated as tenant.
  const isTenant = !isAdmin && unit.tenants.some(t => t.email === session.user.email)

  const activeLease = unit.leases[0] ?? null
  const agreedMonthlyRent = activeLease ? Number(activeLease.monthlyRent) : Number(unit.monthlyRent ?? 0)

  // ── Rent transactions (the authoritative record per period) ───────────────
  // RentTransaction.grossRent = agreed rent due (from lease), NOT what tenant paid.
  // RentTransaction.lateFees  = company income — never shown to landlord.
  const rentTransactions = await prisma.rentTransaction.findMany({
    where: {
      unitId: unit.id,
      paidDate: { gte: from, lte: to },
    },
    orderBy: { paidDate: 'asc' },
    select: {
      id: true,
      rentPeriod: true,
      grossRent: true,         // agreed rent due
      serviceCharge: true,
      managementFee: true,
      maintenanceFees: true,
      otherDeductions: true,
      totalDeductions: true,
      netAmount: true,         // what landlord gets
      lateFees: true,          // company income — admin only
      payoutStatus: true,
      payoutDate: true,
      payoutMethod: true,
      payoutReference: true,
      dueDate: true,
      paidDate: true,
      notes: true,
      payment: {
        select: {
          reference: true,     // receipt / transaction ID
          amount: true,        // actual deposit — admin only
          method: true,
          status: true,
        },
      },
    },
  })

  // ── Standalone distribution items (service charge, repairs, commission) ───
  const distributionItems = await prisma.rentDistributionItem.findMany({
    where: {
      unitId: unit.id,
      createdAt: { gte: from, lte: to },
    },
    orderBy: { createdAt: 'asc' },
    select: {
      reference: true,
      type: true,
      description: true,
      amount: true,
      recipientType: true,
      recipientName: true,
      paid: true,
      paidDate: true,
      paymentMethod: true,
    },
  })

  // ── Payouts to landlord ───────────────────────────────────────────────────
  const payouts = await prisma.payout.findMany({
    where: {
      unitId: unit.id,
      paidDate: { gte: from, lte: to },
    },
    orderBy: { paidDate: 'asc' },
    select: {
      reference: true,
      amount: true,
      period: true,
      method: true,
      status: true,
      paidDate: true,
      notes: true,
    },
  })

  // ── Totals ────────────────────────────────────────────────────────────────
  const totalRentDue          = rentTransactions.reduce((s, t) => s + Number(t.grossRent), 0)
  const totalActualDeposited  = rentTransactions.reduce((s, t) => s + Number(t.payment?.amount ?? 0), 0)
  const totalLateFees         = rentTransactions.reduce((s, t) => s + Number(t.lateFees), 0)
  const totalServiceCharges   = rentTransactions.reduce((s, t) => s + Number(t.serviceCharge), 0)
  const totalManagementFees   = rentTransactions.reduce((s, t) => s + Number(t.managementFee), 0)
  const totalRepairs          = rentTransactions.reduce((s, t) => s + Number(t.maintenanceFees), 0)
  const totalOtherDeductions  = rentTransactions.reduce((s, t) => s + Number(t.otherDeductions), 0)
  const totalDeductions       = totalServiceCharges + totalManagementFees + totalRepairs + totalOtherDeductions
  const totalNetToLandlord    = rentTransactions.reduce((s, t) => s + Number(t.netAmount), 0)
  const totalPaidToLandlord   = payouts.filter(p => p.status === 'PAID').reduce((s, p) => s + Number(p.amount), 0)

  const unitInfo = {
    unitNumber: unit.unitNumber,
    status:     unit.status,
    floor:      unit.floor,
    sizeSqm:    unit.sizeSqm,
    property:   { name: unit.property.name, address: unit.property.address, city: unit.property.city },
    landlord:   { name: unit.landlord.name, email: unit.landlord.email, phone: unit.landlord.phone },
    activeTenant: unit.tenants[0] ?? null,
    activeLease,
    bedrooms:     unit.bedrooms,
    bathrooms:    unit.bathrooms,
    agreedMonthlyRent,
    monthlyRent:    Number(unit.monthlyRent ?? 0),
    serviceCharge:  Number(unit.serviceCharge ?? 0),
    serviceChargeType: unit.serviceChargeType,
    managementFee:  Number(unit.managementFee ?? 0),
    managementFeeType: unit.managementFeeType,
    description:    unit.description,
  }

  const period = { from: from.toISOString(), to: to.toISOString() }

  // ── ADMIN / MANAGER — full view ───────────────────────────────────────────
  if (isAdmin) {
    return NextResponse.json({
      unit: unitInfo,
      period,
      summary: {
        totalRentDue,
        totalActualDeposited,       // what tenant actually paid (includes late fees)
        totalLateFees,              // company income
        totalServiceCharges,
        totalManagementFees,
        totalRepairs,
        totalOtherDeductions,
        totalDeductions,
        totalNetToLandlord,         // what landlord is owed
        totalPaidToLandlord,        // what has actually been paid out
        outstanding: totalNetToLandlord - totalPaidToLandlord,
      },
      transactions: rentTransactions.map(t => ({
        rentPeriod:      t.rentPeriod,
        receiptNo:       t.payment?.reference ?? null,
        rentDue:         Number(t.grossRent),
        actualDeposit:   Number(t.payment?.amount ?? 0),
        lateFees:        Number(t.lateFees),
        serviceCharge:   Number(t.serviceCharge),
        managementFee:   Number(t.managementFee),
        repairs:         Number(t.maintenanceFees),
        otherDeductions: Number(t.otherDeductions),
        totalDeductions: Number(t.totalDeductions),
        netToLandlord:   Number(t.netAmount),
        payoutStatus:    t.payoutStatus,
        payoutDate:      t.payoutDate,
        payoutReference: t.payoutReference,
        dueDate:         t.dueDate,
        paidDate:        t.paidDate,
        method:          t.payment?.method ?? null,
        notes:           t.notes,
      })),
      distributionItems,
      payouts,
      agentCommissions: distributionItems.filter(d => d.type === 'AGENT_COMMISSION'),
    })
  }

  // Types hidden from landlord — company income only
  const HIDDEN_FROM_LANDLORD: string[] = ['LATE_FEE', 'AGENT_COMMISSION']

  // Types hidden from tenant — internal financial splits
  const HIDDEN_FROM_TENANT: string[] = ['MANAGEMENT_FEE', 'AGENT_COMMISSION', 'NET_PAYOUT']

  // ── TENANT view ───────────────────────────────────────────────────────────
  // Tenant sees: their own payments, service charges, late fees, repairs,
  //              deposit refund due, lease details. NOT landlord financials.
  if (isTenant) {
    // All payments on this tenant's lease (rent, late fees, service charges, repairs)
    const tenantPayments = await prisma.payment.findMany({
      where: {
        tenantId: unit.tenants[0]?.id,
        lease: { unitId: unit.id },
        ...(from || to ? { paidDate: { gte: from, lte: to } } : {}),
      },
      orderBy: { paidDate: 'desc' },
      select: {
        reference: true,
        amount: true,
        type: true,
        method: true,
        status: true,
        dueDate: true,
        paidDate: true,
        notes: true,
      },
    })

    // Deposit refund — any REFUNDED payment or OTHER type after moveOutDate
    const depositRefunds = await prisma.payment.findMany({
      where: {
        tenantId: unit.tenants[0]?.id,
        OR: [{ status: 'REFUNDED' }, { type: 'OTHER', notes: { contains: 'refund' } }],
      },
      orderBy: { paidDate: 'desc' },
      select: { reference: true, amount: true, status: true, paidDate: true, notes: true },
    })

    // Charges on this unit visible to tenant (service charge, repairs, late fees)
    const tenantCharges = distributionItems
      .filter(d => !HIDDEN_FROM_TENANT.includes(d.type))

    const totalPaid      = tenantPayments.filter(p => p.status === 'PAID').reduce((s, p) => s + Number(p.amount), 0)
    const totalDue       = rentTransactions.reduce((s, t) => s + Number(t.grossRent) + Number(t.lateFees), 0)
    const totalLateFees  = rentTransactions.reduce((s, t) => s + Number(t.lateFees), 0)
    const totalRepairs   = tenantCharges.filter(d => d.type === 'MAINTENANCE_FEE' || d.type === 'REPAIR_COST').reduce((s, d) => s + Number(d.amount), 0)
    const totalSvcCharge = tenantCharges.filter(d => d.type === 'SERVICE_CHARGE').reduce((s, d) => s + Number(d.amount), 0)
    const outstanding    = totalDue - totalPaid

    return NextResponse.json({
      unit: {
        unitNumber:  unit.unitNumber,
        property:    { name: unit.property.name, address: unit.property.address, city: unit.property.city },
        bedrooms:    unit.bedrooms,
        bathrooms:   unit.bathrooms,
        agreedMonthlyRent,
        serviceCharge: Number(unit.serviceCharge ?? 0),
      },
      lease: activeLease
        ? {
            startDate:       activeLease.startDate,
            endDate:         activeLease.endDate,
            monthlyRent:     Number(activeLease.monthlyRent),
            securityDeposit: Number(activeLease.securityDeposit),
            status:          activeLease.status,
            terms:           activeLease.terms,
          }
        : null,
      period,
      summary: {
        totalPaid,
        totalDue,
        totalLateFees,
        totalServiceCharges: totalSvcCharge,
        totalRepairs,
        outstanding,          // positive = tenant owes, negative = overpaid
      },
      payments: tenantPayments,
      charges: tenantCharges.map(d => ({
        reference:   d.reference,
        type:        d.type,
        description: d.description,
        amount:      d.amount,
        paid:        d.paid,
        paidDate:    d.paidDate,
      })),
      depositRefunds,
    })
  }

  // ── LANDLORD view ─────────────────────────────────────────────────────────
  // Shows: rent due, deductions, net payout, own payout receipts.
  // Hidden: tenant payment receipts, actual deposit, late fees, agent commission.
  return NextResponse.json({
    unit: {
      unitNumber:   unitInfo.unitNumber,
      property:     unitInfo.property,
      activeTenant: unitInfo.activeTenant
        ? { name: unitInfo.activeTenant.name, moveInDate: unitInfo.activeTenant.moveInDate }
        : null,
      activeLease:  unitInfo.activeLease,
      bedrooms:     unitInfo.bedrooms,
      bathrooms:    unitInfo.bathrooms,
      agreedMonthlyRent: unitInfo.agreedMonthlyRent,
    },
    period,
    summary: {
      totalRentDue,
      totalServiceCharges,
      totalManagementFees,
      totalRepairs,
      totalOtherDeductions,
      totalDeductions,
      totalNetToLandlord,
      totalPaidToLandlord,
      outstanding: totalNetToLandlord - totalPaidToLandlord,
    },
    // Per-period breakdown — no tenant receipt, no actual deposit amount
    statement: rentTransactions.map(t => ({
      rentPeriod:      t.rentPeriod,
      rentDue:         Number(t.grossRent),
      serviceCharge:   Number(t.serviceCharge),
      managementFee:   Number(t.managementFee),
      repairs:         Number(t.maintenanceFees),
      otherDeductions: Number(t.otherDeductions),
      totalDeductions: Number(t.totalDeductions),
      netPayout:       Number(t.netAmount),
      payoutStatus:    t.payoutStatus,
      dueDate:         t.dueDate,
    })),
    // Deposit refunds on move-out — landlord needs to see what was returned
    depositRefunds: await prisma.payment.findMany({
      where: {
        lease: { unitId: unit.id },
        OR: [{ status: 'REFUNDED' }, { type: 'OTHER', notes: { contains: 'refund' } }],
      },
      orderBy: { paidDate: 'desc' },
      select: { reference: true, amount: true, status: true, paidDate: true, notes: true },
    }),
    // Landlord's own payout receipts only
    payouts: payouts.map(p => ({
      reference:  p.reference,
      amount:     p.amount,
      period:     p.period,
      method:     p.method,
      status:     p.status,
      paidDate:   p.paidDate,
    })),
    charges: distributionItems
      .filter(d => !HIDDEN_FROM_LANDLORD.includes(d.type))
      .map(d => ({
        reference:   d.reference,
        type:        d.type,
        description: d.description,
        amount:      d.amount,
        paid:        d.paid,
        paidDate:    d.paidDate,
      })),
  })
}
