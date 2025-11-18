import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create Admin User
  const hashedPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@propmanage.com' },
    update: {},
    create: {
      email: 'admin@propmanage.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'ADMIN',
      active: true,
    },
  })

  console.log('✅ Admin user created:', admin.email)

  // Create additional team members
  const alice = await prisma.user.upsert({
    where: { email: 'alice@propmanage.com' },
    update: {},
    create: {
      email: 'alice@propmanage.com',
      password: await bcrypt.hash('password123', 10),
      name: 'Alice Johnson',
      role: 'MANAGER',
      active: true,
    },
  })

  const bob = await prisma.user.upsert({
    where: { email: 'bob@propmanage.com' },
    update: {},
    create: {
      email: 'bob@propmanage.com',
      password: await bcrypt.hash('password123', 10),
      name: 'Bob Smith',
      role: 'AGENT',
      active: true,
    },
  })

  console.log('✅ Team members created')

  // Create sample landlords
  const landlord1 = await prisma.landlord.create({
    data: {
      name: 'Robert Johnson',
      email: 'robert.j@example.com',
      phone: '+254712345678',
      idNumber: 'ID12345678',
      address: '123 Main St, Nairobi',
      bankName: 'KCB Bank',
      bankAccount: '1234567890',
      status: 'ACTIVE',
    },
  })

  const landlord2 = await prisma.landlord.create({
    data: {
      name: 'Sarah Davis',
      email: 'sarah.d@example.com',
      phone: '+254723456789',
      idNumber: 'ID23456789',
      status: 'ACTIVE',
    },
  })

  console.log('✅ Landlords created')

  // Create sample properties
  const property1 = await prisma.property.create({
    data: {
      name: 'Sunset Apartments',
      address: '456 Oak Avenue',
      city: 'Nairobi',
      state: 'Nairobi County',
      postalCode: '00100',
      type: 'APARTMENT',
      units: 20,
      yearBuilt: 2015,
      status: 'ACTIVE',
      landlordId: landlord1.id,
      description: 'Modern apartments in the heart of Nairobi',
    },
  })

  const property2 = await prisma.property.create({
    data: {
      name: 'Vista Plaza',
      address: '789 Elm Street',
      city: 'Nairobi',
      state: 'Nairobi County',
      postalCode: '00200',
      type: 'APARTMENT',
      units: 15,
      yearBuilt: 2018,
      status: 'ACTIVE',
      landlordId: landlord2.id,
    },
  })

  const property3 = await prisma.property.create({
    data: {
      name: 'Riverside Tower',
      address: '321 River Road',
      city: 'Mombasa',
      state: 'Mombasa County',
      postalCode: '80100',
      type: 'CONDO',
      units: 30,
      yearBuilt: 2020,
      status: 'ACTIVE',
      landlordId: landlord1.id,
    },
  })

  console.log('✅ Properties created')

  // Create sample tenants
  const tenant1 = await prisma.tenant.create({
    data: {
      name: 'John Smith',
      email: 'john.smith@example.com',
      phone: '+254734567890',
      idNumber: 'ID34567890',
      emergencyContact: 'Jane Smith',
      emergencyPhone: '+254745678901',
      propertyId: property1.id,
      unit: 'Unit 101',
      moveInDate: new Date('2023-01-15'),
      status: 'ACTIVE',
    },
  })

  const tenant2 = await prisma.tenant.create({
    data: {
      name: 'Sarah Johnson',
      email: 'sarah.j@example.com',
      phone: '+254756789012',
      idNumber: 'ID45678901',
      propertyId: property2.id,
      unit: 'Unit 3B',
      moveInDate: new Date('2023-03-01'),
      status: 'ACTIVE',
    },
  })

  console.log('✅ Tenants created')

  // Create sample leases
  const lease1 = await prisma.lease.create({
    data: {
      tenantId: tenant1.id,
      propertyId: property1.id,
      unit: 'Unit 101',
      startDate: new Date('2023-01-15'),
      endDate: new Date('2024-01-14'),
      monthlyRent: 50000,
      securityDeposit: 50000,
      status: 'ACTIVE',
    },
  })

  const lease2 = await prisma.lease.create({
    data: {
      tenantId: tenant2.id,
      propertyId: property2.id,
      unit: 'Unit 3B',
      startDate: new Date('2023-03-01'),
      endDate: new Date('2024-02-29'),
      monthlyRent: 45000,
      securityDeposit: 45000,
      status: 'ACTIVE',
    },
  })

  console.log('✅ Leases created')

  // Create sample vendors
  const vendor1 = await prisma.vendor.create({
    data: {
      name: 'Quick Repairs Ltd',
      email: 'info@quickrepairs.com',
      phone: '+254767890123',
      specialization: 'General Maintenance',
      rating: 4.5,
      status: 'ACTIVE',
    },
  })

  const vendor2 = await prisma.vendor.create({
    data: {
      name: 'Mike HVAC Repairs',
      email: 'mike@hvacrepairs.com',
      phone: '+254778901234',
      specialization: 'HVAC',
      rating: 4.8,
      status: 'ACTIVE',
    },
  })

  console.log('✅ Vendors created')

  // Create sample leads
  const lead1 = await prisma.lead.create({
    data: {
      name: 'Sarah Mitchell',
      email: 'sarah.mitchell@example.com',
      phone: '+254789012345',
      type: 'TENANT',
      status: 'QUALIFIED',
      source: 'WEBSITE',
      budget: 'KES 40,000 - 55,000',
      moveInDate: new Date('2024-12-01'),
      preferences: '2BR, pet-friendly, parking',
      notes: 'Very interested, has good credit',
      assignedTo: alice.id,
      lastContact: new Date(),
    },
  })

  const lead2 = await prisma.lead.create({
    data: {
      name: 'James Kamau',
      email: 'james.k@example.com',
      phone: '+254790123456',
      type: 'TENANT',
      status: 'CONTACTED',
      source: 'REFERRAL',
      budget: 'KES 35,000 - 45,000',
      moveInDate: new Date('2024-11-25'),
      assignedTo: bob.id,
      notes: 'Referred by current tenant',
    },
  })

  console.log('✅ Leads created')

  // Create sample enquiries
  const enquiry1 = await prisma.enquiry.create({
    data: {
      name: 'Grace Wanjiru',
      email: 'grace.w@example.com',
      phone: '+254701234567',
      subject: 'Early lease termination',
      message: 'Can I terminate my lease 2 months early? What are the penalties?',
      status: 'RESOLVED',
      priority: 'MEDIUM',
      assignedTo: alice.id,
      resolvedAt: new Date(),
    },
  })

  console.log('✅ Enquiries created')

  // Create sample tasks
  await prisma.task.create({
    data: {
      title: 'Schedule follow-up call with Sarah Mitchell',
      description: 'Call to discuss property options and schedule viewing',
      priority: 'HIGH',
      status: 'PENDING',
      dueDate: new Date('2024-11-25T10:00:00'),
      reminderDate: new Date('2024-11-24T09:00:00'),
      assignedToId: alice.id,
      assignedById: admin.id,
      stakeholderType: 'LEAD',
      leadId: lead1.id,
      notes: 'Lead is very interested. Has budget ready.',
    },
  })

  await prisma.task.create({
    data: {
      title: 'Send lease renewal terms to John Smith',
      description: 'Prepare and send lease renewal offer with updated terms',
      priority: 'MEDIUM',
      status: 'IN_PROGRESS',
      dueDate: new Date('2024-11-27T15:00:00'),
      assignedToId: bob.id,
      assignedById: alice.id,
      stakeholderType: 'TENANT',
      notes: 'Tenant requested early renewal. Offer 2% increase.',
    },
  })

  console.log('✅ Tasks created')

  // Create sample payments
  await prisma.payment.create({
    data: {
      tenantId: tenant1.id,
      leaseId: lease1.id,
      amount: 50000,
      type: 'RENT',
      method: 'MPESA',
      status: 'PAID',
      dueDate: new Date('2024-11-01'),
      paidDate: new Date('2024-11-01'),
      reference: 'MPESA-REF-123456',
    },
  })

  await prisma.payment.create({
    data: {
      tenantId: tenant2.id,
      leaseId: lease2.id,
      amount: 45000,
      type: 'RENT',
      method: 'BANK_TRANSFER',
      status: 'OVERDUE',
      dueDate: new Date('2024-11-01'),
    },
  })

  console.log('✅ Payments created')

  console.log('🎉 Database seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
