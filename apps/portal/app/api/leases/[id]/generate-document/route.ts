import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'

function formatDate(date: Date): string {
  const d = new Date(date)
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
}

function formatCurrency(amount: number | any): string {
  const num = typeof amount === 'object' ? parseFloat(amount.toString()) : Number(amount)
  return `KES ${num.toLocaleString('en-KE')}`
}

function replacePlaceholders(template: string, data: Record<string, string>): string {
  let result = template
  for (const [key, value] of Object.entries(data)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value || '')
  }
  return result
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const lease = await prisma.lease.findUnique({
      where: { id },
      include: {
        tenant: true,
        property: {
          include: {
            landlord: true,
          },
        },
        unitRef: true,
        template: true,
      },
    })

    if (!lease) {
      return NextResponse.json({ error: 'Lease not found' }, { status: 404 })
    }

    if (!lease.template) {
      return NextResponse.json({ error: 'No template assigned to this lease' }, { status: 400 })
    }

    // Build placeholder data from lease + relations
    const placeholders: Record<string, string> = {
      // Tenant
      tenant_name: lease.tenant.name,
      tenant_email: lease.tenant.email,
      tenant_phone: lease.tenant.phone,
      tenant_id_number: lease.tenant.idNumber || 'N/A',
      tenant_emergency_contact: lease.tenant.emergencyContact || 'N/A',
      tenant_emergency_phone: lease.tenant.emergencyPhone || 'N/A',

      // Property
      property_name: lease.property.name,
      property_address: lease.property.address,
      property_type: lease.property.type,

      // Unit
      unit_number: lease.unitRef?.unitNumber || lease.unit || 'N/A',
      unit_bedrooms: lease.unitRef?.bedrooms?.toString() || 'N/A',
      unit_bathrooms: lease.unitRef?.bathrooms?.toString() || 'N/A',
      unit_size_sqm: lease.unitRef?.sizeSqm?.toString() || 'N/A',

      // Landlord
      landlord_name: lease.property.landlord?.name || 'N/A',
      landlord_email: lease.property.landlord?.email || 'N/A',
      landlord_phone: lease.property.landlord?.phone || 'N/A',

      // Lease terms
      monthly_rent: formatCurrency(lease.monthlyRent),
      monthly_rent_number: parseFloat(lease.monthlyRent.toString()).toLocaleString('en-KE'),
      security_deposit: formatCurrency(lease.securityDeposit),
      lease_start_date: formatDate(lease.startDate),
      lease_end_date: formatDate(lease.endDate),
      lease_duration_months: Math.round((lease.endDate.getTime() - lease.startDate.getTime()) / (1000 * 60 * 60 * 24 * 30)).toString(),
      notice_period: `${lease.noticePeriod || 1} month(s)`,
      rent_escalation: lease.rentEscalation ? `${lease.rentEscalation}% per annum` : '10% per annum',
      rent_due_date: '1st',
      pet_policy: lease.petPolicy || 'No pets allowed without prior written consent from the landlord.',
      special_conditions: lease.specialConditions || 'None.',

      // Company
      company_name: 'Tochi Realty',
      company_tagline: 'Your Property. Our Pride.',

      // Dates
      agreement_date: formatDate(new Date()),
      current_year: new Date().getFullYear().toString(),
    }

    // Render the template
    const documentHtml = replacePlaceholders(lease.template.content, placeholders)

    // Save the rendered document to the lease
    await prisma.lease.update({
      where: { id },
      data: { documentHtml },
    })

    return NextResponse.json({
      message: 'Lease document generated successfully',
      documentHtml,
    })
  } catch (error) {
    console.error('Error generating lease document:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
