import { prisma } from '../lib/prisma'

async function clearAll() {
  console.log('Clearing all data...')

  // Delete in dependency order (children first)
  await prisma.verificationToken.deleteMany()
  await prisma.session.deleteMany()
  await prisma.account.deleteMany()

  await prisma.workOrder.deleteMany()
  await prisma.inspection.deleteMany()
  await prisma.maintenanceRequest.deleteMany()

  await prisma.rentDistributionItem.deleteMany()
  await prisma.rentTransaction.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.payout.deleteMany()
  await prisma.landlordStatement.deleteMany()

  await prisma.leaveRequest.deleteMany()
  await prisma.attendance.deleteMany()
  await prisma.performanceReview.deleteMany()

  await prisma.task.deleteMany()
  await prisma.communication.deleteMany()
  await prisma.message.deleteMany()
  await prisma.note.deleteMany()

  await prisma.lead.deleteMany()
  await prisma.enquiry.deleteMany()
  await prisma.viewing.deleteMany()

  await prisma.lease.deleteMany()
  await prisma.tenant.deleteMany()
  await prisma.unit.deleteMany()
  await prisma.property.deleteMany()
  await prisma.landlord.deleteMany()
  await prisma.vendor.deleteMany()
  await prisma.teamMember.deleteMany()
  await prisma.user.deleteMany()

  console.log('✅ All data cleared.')
  await prisma.$disconnect()
}

clearAll().catch(e => { console.error(e); process.exit(1) })
