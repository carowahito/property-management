const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

function excelDate(serial) {
  return new Date((serial - 25569) * 86400 * 1000)
}

async function main() {
  console.log('Clearing existing data...')
  await prisma.rentDistributionItem.deleteMany()
  await prisma.rentTransaction.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.payout.deleteMany()
  await prisma.lease.deleteMany()
  await prisma.tenant.deleteMany()
  await prisma.unit.deleteMany()
  await prisma.property.deleteMany()
  await prisma.landlord.deleteMany()
  await prisma.user.deleteMany()
  console.log('Cleared.')

  // 1. Landlord
  const landlord = await prisma.landlord.create({
    data: {
      name: 'Ann Karuga',
      email: 'carowahito@gmail.com',
      phone: '+254721998499',
      idNumber: '27206034',
      address: 'Nyeri',
      bankName: 'Family Bank',
      bankAccount: '055000000204',
      status: 'ACTIVE',
    }
  })
  console.log('Landlord:', landlord.id)

  // 2. Property
  const property = await prisma.property.create({
    data: {
      name: 'Greatwall Gardens II',
      address: 'Shanghai Road',
      city: 'Athi River',
      state: 'Machakos',
      country: 'Kenya',
      type: 'APARTMENT',
      totalUnits: 1,
      status: 'ACTIVE',
    }
  })
  console.log('Property:', property.id)

  // 3. Unit
  const unit = await prisma.unit.create({
    data: {
      unitNumber: 'GWG2-A55',
      propertyId: property.id,
      landlordId: landlord.id,
      bedrooms: 3,
      bathrooms: 2,
      monthlyRent: 30000,
      serviceCharge: 2000,
      managementFee: 1500,
      status: 'OCCUPIED',
      description: '3 bed 2 bath apartment',
    }
  })
  console.log('Unit:', unit.id)

  // 4. Tenant
  const tenant = await prisma.tenant.create({
    data: {
      name: 'Faridah Achieng Kassim',
      email: 'faridahkassim592@gmail.com',
      phone: '+254721656564',
      idNumber: '23836035',
      unitId: unit.id,
      propertyId: property.id,
      moveInDate: excelDate(45687),
      status: 'ACTIVE',
    }
  })
  console.log('Tenant:', tenant.id)

  // 5. Lease
  const lease = await prisma.lease.create({
    data: {
      tenantId: tenant.id,
      unitId: unit.id,
      propertyId: property.id,
      startDate: excelDate(46054),
      endDate: excelDate(46419),
      monthlyRent: 30000,
      securityDeposit: 30000,
      status: 'ACTIVE',
      terms: 'Rent due 5th of each month. Late payment penalty: KES 500/day. Service charge: KES 2000/month. Management fee: KES 1500/month. Preferred payment: Bank Transfer.',
    }
  })
  console.log('Lease:', lease.id)

  // 6. Transactions — from source xlsx
  // Tenant deposits (Rent deposit from tenant > 0)
  const tenantDeposits = [
    { ref: 'TLR6F23HDO', date: new Date('2025-12-27'), amount: 50000 },
    { ref: 'TJR6F8I2LB', date: new Date('2025-10-27'), amount: 40000 },
    { ref: 'TJI6F7O2V4', date: new Date('2025-10-18'), amount: 20000 },
    { ref: 'TI56LIZ3L8', date: new Date('2025-09-05'), amount: 30000 },
    { ref: 'TH583BXHG8', date: new Date('2025-08-05'), amount: 60000 },
  ]

  for (const d of tenantDeposits) {
    await prisma.payment.create({
      data: {
        reference: d.ref,
        tenantId: tenant.id,
        leaseId: lease.id,
        amount: d.amount,
        type: 'RENT',
        method: 'MPESA',
        status: 'PAID',
        dueDate: d.date,
        paidDate: d.date,
      }
    })
  }
  console.log('Tenant deposits created:', tenantDeposits.length)

  // Service charge payments
  const serviceCharges = [
    { ref: 'TJISN2KQJA', date: new Date('2025-10-18'), amount: 4000, notes: 'Service charge x2 months' },
    { ref: 'TI925ZDS60', date: new Date('2025-09-09'), amount: 2000, notes: 'Service charge' },
  ]

  for (const sc of serviceCharges) {
    await prisma.payment.create({
      data: {
        reference: sc.ref,
        tenantId: tenant.id,
        leaseId: lease.id,
        amount: sc.amount,
        type: 'OTHER',
        method: 'BANK_TRANSFER',
        status: 'PAID',
        paidDate: sc.date,
        dueDate: sc.date,
        notes: sc.notes,
      }
    })
  }
  console.log('Service charges created:', serviceCharges.length)

  // Landlord payouts
  const payouts = [
    { ref: 'UC6SN7KEF6', date: new Date('2026-03-06'), amount: 26500, period: '2026-03' },
    { ref: 'UBGSN6UZUE', date: new Date('2026-02-16'), amount: 26500, period: '2026-02' },
    { ref: 'UA3SN5A4CS', date: new Date('2026-01-03'), amount: 26500, period: '2026-01' },
    { ref: 'TLNSN4WOOF', date: new Date('2025-12-23'), amount: 26500, period: '2025-12' },
    { ref: 'TK8SN3B9YB', date: new Date('2025-11-08'), amount: 26500, period: '2025-11' },
    { ref: 'TJGSN2HOKX', date: new Date('2025-10-16'), amount: 26500, period: '2025-10' },
    { ref: 'TI80YR8X26', date: new Date('2025-09-08'), amount: 26500, period: '2025-09' },
    { ref: 'TH654YJC83', date: new Date('2025-08-06'), amount: 26500, period: '2025-08' },
    { ref: 'TGA8D6O33O', date: new Date('2025-07-10'), amount: 26500, period: '2025-07' },
  ]

  for (const p of payouts) {
    await prisma.payout.create({
      data: {
        reference: p.ref,
        landlordId: landlord.id,
        unitId: unit.id,
        amount: p.amount,
        period: p.period,
        method: 'BANK_TRANSFER',
        status: 'PAID',
        paidDate: p.date,
      }
    })
  }
  console.log('Payouts created:', payouts.length)

  console.log('\n✅ Seed complete!')
  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
