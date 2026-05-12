import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🗑️  Clearing all existing data...')

  // Truncate all tables in dependency order
  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE
      rent_distribution_items,
      rent_transactions,
      payouts,
      landlord_statements,
      payments,
      work_orders,
      maintenance_requests,
      inspections,
      viewings,
      leases,
      tenants,
      units,
      properties,
      landlords,
      messages,
      notes,
      communications,
      tasks,
      leads,
      enquiries,
      vendors,
      leave_requests,
      performance_reviews,
      attendance,
      team_members,
      sessions,
      accounts,
      verification_tokens,
      users,
      companies
    CASCADE
  `)

  console.log('✅ All data cleared')

  // ── Company: Tochi Property Ltd ───────────────────────────────────────────
  const company = await prisma.company.create({
    data: {
      name: 'Tochi Property Ltd',
      slug: 'tochi-property',
      email: 'info@tochipropertyltd.com',
      phone: '+254700000000',
      address: 'Nairobi',
      city: 'Nairobi',
      country: 'Kenya',
      status: 'ACTIVE',
      plan: 'PROFESSIONAL',
    },
  })
  console.log('✅ Company created:', company.name)

  // ── Admin User ────────────────────────────────────────────────────────────
  const hashedPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.create({
    data: {
      companyId: company.id,
      email: 'admin@tochipropertyltd.com',
      password: hashedPassword,
      name: 'Tochi Admin',
      role: 'ADMIN',
      active: true,
    },
  })
  console.log('✅ Admin user created:', admin.email)

  // ── Sales Agent: Rose Chege ───────────────────────────────────────────────
  const rosePassword = await bcrypt.hash('rose123', 10)
  const rose = await prisma.user.create({
    data: {
      companyId: company.id,
      email: 'rose@tochipropertyltd.com',
      password: rosePassword,
      name: 'Rose Chege',
      role: 'AGENT',
      active: true,
    },
  })
  await prisma.teamMember.create({
    data: {
      userId: rose.id,
      employeeId: 'TOCHI-001',
      department: 'SALES',
      position: 'Sales Agent',
      hireDate: new Date('2025-01-01'),
      status: 'ACTIVE',
      skills: ['property-management', 'tenant-relations', 'mpesa-reconciliation'],
      certifications: [],
    },
  })
  console.log('✅ Sales agent created:', rose.name)

  // ── Landlord: Ann Karuga ──────────────────────────────────────────────────
  const landlord = await prisma.landlord.create({
    data: {
      companyId: company.id,
      name: 'Ann Karuga',
      email: 'carowahito@gmail.com',
      phone: '+254721998499',
      idNumber: '27206034',
      address: 'Nyeri',
      bankName: 'Family Bank',
      bankAccount: '055000000204',
      status: 'ACTIVE',
    },
  })
  console.log('✅ Landlord created:', landlord.name)

  // ── Property: Greatwall Gardens II ───────────────────────────────────────
  const property = await prisma.property.create({
    data: {
      companyId: company.id,
      name: 'Greatwall Gardens II',
      address: 'Shanghai Road',
      city: 'Athi River',
      state: 'Machakos',
      country: 'Kenya',
      type: 'APARTMENT',
      totalUnits: 1,
      status: 'ACTIVE',
      landlordId: landlord.id,
    },
  })
  console.log('✅ Property created:', property.name)

  // ── Unit: GWG2-A55 ───────────────────────────────────────────────────────
  const unit = await prisma.unit.create({
    data: {
      unitNumber: 'GWG2-A55',
      propertyId: property.id,
      landlordId: landlord.id,
      bedrooms: 3,
      bathrooms: 2,
      status: 'OCCUPIED',
      monthlyRent: 30000,
      serviceCharge: 2000,
      managementFee: 1500,
    },
  })
  console.log('✅ Unit created:', unit.unitNumber)

  // ── Tenant: Faridah Achieng Kassim ───────────────────────────────────────
  const tenant = await prisma.tenant.create({
    data: {
      companyId: company.id,
      name: 'Faridah Achieng Kassim',
      email: 'faridahkassim592@gmail.com',
      phone: '+254721656564',
      idNumber: '23836035',
      propertyId: property.id,
      unitId: unit.id,
      unit: 'GWG2-A55',
      moveInDate: new Date('2025-01-30'),
      status: 'ACTIVE',
    },
  })
  console.log('✅ Tenant created:', tenant.name)

  // ── Lease 1 (expired) — original 12-month term ───────────────────────────
  const expiredLease = await prisma.lease.create({
    data: {
      tenantId: tenant.id,
      propertyId: property.id,
      unitId: unit.id,
      unit: 'GWG2-A55',
      startDate: new Date('2025-02-01'),
      endDate: new Date('2026-01-31'),
      monthlyRent: 30000,
      securityDeposit: 30000,
      status: 'EXPIRED',
      terms: 'Late payment penalty: KES 500 per day fixed. Rent due 5th of each month.',
    },
  })

  // ── Lease 2 (active) — current renewal ───────────────────────────────────
  const activeLease = await prisma.lease.create({
    data: {
      tenantId: tenant.id,
      propertyId: property.id,
      unitId: unit.id,
      unit: 'GWG2-A55',
      startDate: new Date('2026-02-01'),
      endDate: new Date('2027-01-31'),
      monthlyRent: 30000,
      securityDeposit: 30000,
      status: 'ACTIVE',
      terms: 'Late payment penalty: KES 500 per day fixed. Rent due 5th of each month.',
    },
  })
  console.log('✅ Leases created (expired + active)')

  // ── Transaction history ───────────────────────────────────────────────────
  // Gross rent: 30,000 | Service charge: 2,000 | Management fee: 1,500 | Net to landlord: 26,500
  //
  // Source: GWG2-A55.xlsx — "Transactions History" sheet
  //   Column D = Rent deposit from tenant (M-Pesa inflow to manager)
  //   Column F = Rent Payment to Landlord (payout receipt number used as payout reference)
  //
  // One Payment + RentTransaction + Payout record per paid month.
  // Payment references use the tenant's M-Pesa deposit receipt where known;
  // otherwise a synthetic ref is used (funds were covered by a prior lump deposit).

  type MonthRecord = {
    period: string
    dueDate: string
    paidDate: string
    paymentRef: string        // tenant → manager receipt
    payoutRef: string         // manager → landlord receipt
    payoutDate: string
    leaseId: string
  }

  const months: MonthRecord[] = [
    // ── Under expired lease ─────────────────────────────────────────────────
    {
      period: 'July 2025',
      dueDate: '2025-07-05',
      paidDate: '2025-07-05',     // covered by earlier deposit (not in workbook window)
      paymentRef: 'DEP-GWG2A55-202507',
      payoutRef: 'TGA8D6O33O',
      payoutDate: '2025-07-10',
      leaseId: expiredLease.id,
    },
    {
      period: 'August 2025',
      dueDate: '2025-08-05',
      paidDate: '2025-08-05',     // TH583BXHG8: 60,000 lump (covers Aug + Sep)
      paymentRef: 'TH583BXHG8',
      payoutRef: 'TH654YJC83',
      payoutDate: '2025-08-06',
      leaseId: expiredLease.id,
    },
    {
      period: 'September 2025',
      dueDate: '2025-09-05',
      paidDate: '2025-09-05',     // TI56LIZ3L8: 30,000
      paymentRef: 'TI56LIZ3L8',
      payoutRef: 'TI80YR8X26',
      payoutDate: '2025-09-08',
      leaseId: expiredLease.id,
    },
    {
      period: 'October 2025',
      dueDate: '2025-10-05',
      paidDate: '2025-10-18',     // TJI6F7O2V4: 20,000 + TJR6F8I2LB: 40,000
      paymentRef: 'TJI6F7O2V4',
      payoutRef: 'TJGSN2HOKX',
      payoutDate: '2025-10-16',
      leaseId: expiredLease.id,
    },
    {
      period: 'November 2025',
      dueDate: '2025-11-05',
      paidDate: '2025-11-05',     // covered by Oct lump overpayment
      paymentRef: 'DEP-GWG2A55-202511',
      payoutRef: 'TK8SN3B9YB',
      payoutDate: '2025-11-08',
      leaseId: expiredLease.id,
    },
    {
      period: 'December 2025',
      dueDate: '2025-12-05',
      paidDate: '2025-12-27',     // TLR6F23HDO: 50,000 (covers Dec + Jan)
      paymentRef: 'TLR6F23HDO',
      payoutRef: 'TLNSN4WOOF',
      payoutDate: '2025-12-23',
      leaseId: expiredLease.id,
    },
    {
      period: 'January 2026',
      dueDate: '2026-01-05',
      paidDate: '2026-01-03',     // covered by Dec lump deposit
      paymentRef: 'DEP-GWG2A55-202601',
      payoutRef: 'UA3SN5A4CS',
      payoutDate: '2026-01-03',
      leaseId: expiredLease.id,
    },
    // ── Under active lease ──────────────────────────────────────────────────
    {
      period: 'February 2026',
      dueDate: '2026-02-05',
      paidDate: '2026-02-16',
      paymentRef: 'DEP-GWG2A55-202602',
      payoutRef: 'UBGSN6UZUE',
      payoutDate: '2026-02-16',
      leaseId: activeLease.id,
    },
    {
      period: 'March 2026',
      dueDate: '2026-03-05',
      paidDate: '2026-03-06',
      paymentRef: 'DEP-GWG2A55-202603',
      payoutRef: 'UC6SN7KEF6',
      payoutDate: '2026-03-06',
      leaseId: activeLease.id,
    },
  ]

  for (const m of months) {
    // Payment: tenant pays 30,000 gross rent to manager
    const payment = await prisma.payment.create({
      data: {
        tenantId: tenant.id,
        leaseId: m.leaseId,
        amount: 30000,
        type: 'RENT',
        method: 'MPESA',
        status: 'PAID',
        dueDate: new Date(m.dueDate),
        paidDate: new Date(m.paidDate),
        reference: m.paymentRef,
      },
    })

    // Payout: manager pays 26,500 net to landlord
    const payout = await prisma.payout.create({
      data: {
        landlordId: landlord.id,
        unitId: unit.id,
        amount: 26500,
        period: m.period,
        status: 'PAID',
        method: 'BANK_TRANSFER',
        reference: m.payoutRef,
        paidDate: new Date(m.payoutDate),
      },
    })

    // RentTransaction: reconciliation record
    await prisma.rentTransaction.create({
      data: {
        paymentId: payment.id,
        tenantId: tenant.id,
        unitId: unit.id,
        leaseId: m.leaseId,
        landlordId: landlord.id,
        propertyId: property.id,
        grossRent: 30000,
        rentPeriod: m.period,
        dueDate: new Date(m.dueDate),
        paidDate: new Date(m.paidDate),
        serviceCharge: 2000,
        managementFee: 1500,
        maintenanceFees: 0,
        otherDeductions: 0,
        totalDeductions: 3500,
        netAmount: 26500,
        lateFees: 0,
        payoutId: payout.id,
        payoutStatus: 'PAID',
        payoutDate: new Date(m.payoutDate),
        payoutMethod: 'BANK_TRANSFER',
        payoutReference: m.payoutRef,
        processed: true,
        processedAt: new Date(m.payoutDate),
        processedBy: admin.id,
      },
    })
  }

  console.log(`✅ Created ${months.length} months of payment history (Jul 2025 – Mar 2026)`)

  console.log('\n🎉 Seed complete — Tochi Property Ltd')
  console.log('   Company:  Tochi Property Ltd (tochi-property)')
  console.log('   Admin:    admin@tochipropertyltd.com / admin123')
  console.log('   Agent:    rose@tochipropertyltd.com / rose123 (Rose Chege)')
  console.log('   Landlord: Ann Karuga')
  console.log('   Tenant:   Faridah Achieng Kassim')
  console.log('   Unit:     GWG2-A55 @ Greatwall Gardens II')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
