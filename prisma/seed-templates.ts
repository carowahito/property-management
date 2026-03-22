import { PrismaClient } from '@prisma/client'
import { DEFAULT_RESIDENTIAL_TEMPLATE } from '../lib/default-lease-template'

const prisma = new PrismaClient()

async function main() {
  // Check if template already exists
  const existing = await prisma.leaseTemplate.findFirst({
    where: { type: 'RESIDENTIAL_STANDARD', isDefault: true },
  })

  if (existing) {
    console.log('Default residential template already exists, updating...')
    await prisma.leaseTemplate.update({
      where: { id: existing.id },
      data: { content: DEFAULT_RESIDENTIAL_TEMPLATE },
    })
    console.log('Template updated.')
  } else {
    await prisma.leaseTemplate.create({
      data: {
        name: 'Standard Residential Tenancy Agreement',
        type: 'RESIDENTIAL_STANDARD',
        content: DEFAULT_RESIDENTIAL_TEMPLATE,
        isDefault: true,
        isActive: true,
        clauses: [
          { id: 'rent', title: 'Rent Payment', text: 'Standard rent payment terms', required: true, enabled: true },
          { id: 'escalation', title: 'Rent Escalation', text: '10% annual increase', required: true, enabled: true },
          { id: 'deposit', title: 'Security Deposit', text: 'One month deposit', required: true, enabled: true },
          { id: 'subletting', title: 'Subletting Prohibition', text: 'No subletting without consent', required: true, enabled: true },
          { id: 'pets', title: 'Pet Policy', text: 'No pets without consent', required: false, enabled: true },
          { id: 'maintenance', title: 'Maintenance Responsibilities', text: 'Tenant reports, landlord repairs', required: true, enabled: true },
          { id: 'termination', title: 'Early Termination', text: 'Notice period applies', required: true, enabled: true },
          { id: 'dispute', title: 'Dispute Resolution', text: 'Mediation then arbitration', required: true, enabled: true },
        ],
      },
    })
    console.log('Default residential template created.')
  }

  console.log('Seed complete.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
