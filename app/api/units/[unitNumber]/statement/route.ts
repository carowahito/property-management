import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/units/:unitNumber/statement?from=2025-07-01&to=2026-03-31
//
// Accessible by:
//   ADMIN / MANAGER — full view (all columns including agent commission, late fees)
//   LANDLORD        — net view (gross rent, deductions, net payout — no internal fees shown)
//   TENANT          — payment view (only their own rent deposits and service charges)
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

  // Load unit with all linked data
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

  const role = session.user.role // ADMIN | MANAGER | AGENT | STAFF
  const isAdmin = role === 'ADMIN' || role === 'MANAGER'

  // Tenant access: only their own unit
  // (Extend this when tenant portal auth is added)

  // ── Payments from tenant (rent deposits) ──────────────────────────────────
  const payments = await prisma.payment.findMany({
    where: {
      lease: { unitId: unit.id },
      paidDate: { gte: from, lte: to },
    },
    orderBy: { paidDate: 'asc' },
    select: {
      id: true,
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

  // ── Payouts to landlord ───────────────────────────────────────────────────
  const payouts = await prisma.payout.findMany({
    where: {
      unitId: unit.id,
      paidDate: { gte: from, lte: to },
    },
    orderBy: { paidDate: 'asc' },
    select: {
      id: true,
      reference: true,
      amount: true,
      period: true,
      method: true,
      status: true,
      paidDate: true,
      notes: true,
    },
  })

  // ── Distribution line items (service charge, repairs, commission) ─────────
  const distributionItems = await prisma.rentDistributionItem.findMany({
    where: {
      unitId: unit.id,
      createdAt: { gte: from, lte: to },
    },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
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

  // ── Totals ────────────────────────────────────────────────────────────────
  const totalRentDeposited = payments
    .filter(p => p.type === 'RENT' && p.status === 'PAID')
    .reduce((sum, p) => sum + Number(p.amount), 0)

  const totalPaidToLandlord = payouts
    .filter(p => p.status === 'PAID')
    .reduce((sum, p) => sum + Number(p.amount), 0)

  const totalServiceCharges = distributionItems
    .filter(d => d.type === 'SERVICE_CHARGE')
    .reduce((sum, d) => sum + Number(d.amount), 0)

  const totalRepairs = distributionItems
    .filter(d => d.type === 'MAINTENANCE_FEE' || d.type === 'REPAIR_COST')
    .reduce((sum, d) => sum + Number(d.amount), 0)

  const totalManagementFees = distributionItems
    .filter(d => d.type === 'MANAGEMENT_FEE')
    .reduce((sum, d) => sum + Number(d.amount), 0)

  const totalDeductions = totalServiceCharges + totalRepairs + totalManagementFees

  // ── Build response based on role ──────────────────────────────────────────
  const unitInfo = {
    unitNumber: unit.unitNumber,
    property: { name: unit.property.name, address: unit.property.address, city: unit.property.city },
    landlord: { name: unit.landlord.name, email: unit.landlord.email, phone: unit.landlord.phone },
    activeTenant: unit.tenants[0] ?? null,
    activeLease: unit.leases[0] ?? null,
    bedrooms: unit.bedrooms,
    bathrooms: unit.bathrooms,
    monthlyRent: unit.monthlyRent,
    serviceCharge: unit.serviceCharge,
    managementFee: unit.managementFee,
  }

  const period = { from: from.toISOString(), to: to.toISOString() }

  // Admin / Manager — full picture
  if (isAdmin) {
    return NextResponse.json({
      unit: unitInfo,
      period,
      summary: {
        totalRentDeposited,
        totalPaidToLandlord,
        totalServiceCharges,
        totalRepairs,
        totalManagementFees,
        totalDeductions,
        balance: totalRentDeposited - totalPaidToLandlord - totalDeductions,
      },
      transactions: {
        payments,
        payouts,
        distributionItems,
      },
    })
  }

  // Landlord view — no internal fees (management fee hidden)
  return NextResponse.json({
    unit: {
      unitNumber: unitInfo.unitNumber,
      property: unitInfo.property,
      activeTenant: unitInfo.activeTenant
        ? { name: unitInfo.activeTenant.name, moveInDate: unitInfo.activeTenant.moveInDate }
        : null,
      activeLease: unitInfo.activeLease,
      bedrooms: unitInfo.bedrooms,
      bathrooms: unitInfo.bathrooms,
      monthlyRent: unitInfo.monthlyRent,
      serviceCharge: unitInfo.serviceCharge,
    },
    period,
    summary: {
      totalRentReceived: totalRentDeposited,
      totalServiceCharges,
      totalRepairs,
      totalDeductions: totalServiceCharges + totalRepairs,
      totalNetPaidToYou: totalPaidToLandlord,
    },
    transactions: {
      payments: payments.map(p => ({
        reference: p.reference,
        amount: p.amount,
        type: p.type,
        method: p.method,
        status: p.status,
        paidDate: p.paidDate,
        notes: p.notes,
      })),
      payouts,
      charges: distributionItems
        .filter(d => d.type !== 'MANAGEMENT_FEE') // hide management fee from landlord
        .map(d => ({
          reference: d.reference,
          type: d.type,
          description: d.description,
          amount: d.amount,
          paid: d.paid,
          paidDate: d.paidDate,
        })),
    },
  })
}
