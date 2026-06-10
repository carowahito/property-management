import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'
import { generateLeasePDF, type LeaseData } from '@/lib/services/lease-pdf-generator'

export async function GET(
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
            company: true,
            landlord: true,
          },
        },
        unitRef: {
          include: {
            landlord: true,
          },
        },
      },
    })

    if (!lease) {
      return NextResponse.json({ error: 'Lease not found' }, { status: 404 })
    }

    const company = lease.property.company
    const landlord = lease.unitRef?.landlord ?? lease.property.landlord

    const data: LeaseData = {
      companyName: company.name,
      companyEmail: company.email || 'info@tochiproperty.com',
      companyPhone: company.phone || '',
      companyWebsite: company.website || 'tochiproperty.com',

      propertyName: lease.property.name,
      propertyAddress: lease.property.address,
      unitNumber: lease.unitRef?.unitNumber || lease.unit || '',

      tenantName: lease.tenant.name,
      tenantIdNumber: lease.tenant.idNumber || 'N/A',
      tenantEmail: lease.tenant.email,
      tenantPhone: lease.tenant.phone,

      monthlyRent: parseFloat(lease.monthlyRent.toString()),
      securityDeposit: parseFloat(lease.securityDeposit.toString()),
      startDate: lease.startDate,
      endDate: lease.endDate,
      noticePeriodMonths: lease.noticePeriod ?? 1,
      rentEscalation: lease.rentEscalation
        ? parseFloat(lease.rentEscalation.toString())
        : 10,
      gracePeriodDays: lease.gracePeriodDays ?? 5,
      latePenaltyPerDay: parseFloat(lease.latePenaltyPerDay.toString()),
      rentDueDay: lease.rentDueDay ?? 1,
      petPolicy: lease.petPolicy || 'No pets allowed without prior written consent.',

      // Payment details from query params or landlord bank info
      mpesaPaybill: request.nextUrl.searchParams.get('mpesaPaybill') || undefined,
      mpesaAccountRef: request.nextUrl.searchParams.get('mpesaAccountRef') || lease.unitRef?.unitNumber || undefined,
      bankName: request.nextUrl.searchParams.get('bankName') || landlord?.bankName || undefined,
      bankAccountNo: request.nextUrl.searchParams.get('bankAccountNo') || landlord?.bankAccount || undefined,
      bankBranch: request.nextUrl.searchParams.get('bankBranch') || undefined,
      emergencyPhone: request.nextUrl.searchParams.get('emergencyPhone') || company.phone || undefined,
      signatoryName: request.nextUrl.searchParams.get('signatoryName') || undefined,
      signatoryTitle: request.nextUrl.searchParams.get('signatoryTitle') || undefined,

      landlordSignature: lease.landlordSignature,
      landlordSignedAt: lease.landlordSignedAt,
      tenantSignature: lease.tenantSignature,
      tenantSignedAt: lease.tenantSignedAt,
    }

    const pdfBuffer = await generateLeasePDF(data)

    const unitLabel = data.unitNumber || 'lease'
    const download = request.nextUrl.searchParams.get('download') === 'true'
    const disposition = download
      ? `attachment; filename="Tenancy-Agreement-${unitLabel}.pdf"`
      : `inline; filename="Tenancy-Agreement-${unitLabel}.pdf"`

    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': disposition,
        'Content-Length': pdfBuffer.length.toString(),
      },
    })
  } catch (error) {
    console.error('Error generating lease PDF:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
