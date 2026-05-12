import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const q = request.nextUrl.searchParams.get('q')?.trim()
  if (!q || q.length < 2) return NextResponse.json({ results: [] })

  const filter = { contains: q, mode: 'insensitive' as const }

  const [landlords, properties, units, tenants] = await Promise.all([
    prisma.landlord.findMany({
      where: { OR: [{ name: filter }, { email: filter }, { phone: filter }] },
      select: { id: true, name: true, email: true, phone: true, status: true },
      take: 5,
    }),
    prisma.property.findMany({
      where: { OR: [{ name: filter }, { address: filter }, { city: filter }] },
      select: { id: true, name: true, address: true, city: true, type: true, status: true },
      take: 5,
    }),
    prisma.unit.findMany({
      where: {
        OR: [
          { unitNumber: filter },
          { description: filter },
          { property: { name: filter } },
        ],
      },
      select: {
        id: true,
        unitNumber: true,
        status: true,
        bedrooms: true,
        bathrooms: true,
        monthlyRent: true,
        property: { select: { name: true } },
        landlord: { select: { name: true } },
      },
      take: 5,
    }),
    prisma.tenant.findMany({
      where: { OR: [{ name: filter }, { email: filter }, { phone: filter }] },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        status: true,
        unitRef: { select: { unitNumber: true } },
        property: { select: { name: true } },
      },
      take: 5,
    }),
  ])

  return NextResponse.json({
    results: {
      landlords: landlords.map(l => ({
        id: l.id,
        label: l.name,
        sub: l.email,
        meta: l.status,
        href: `/admin/landlords/${l.id}`,
        type: 'landlord',
      })),
      properties: properties.map(p => ({
        id: p.id,
        label: p.name,
        sub: [p.address, p.city].filter(Boolean).join(', '),
        meta: p.type,
        href: `/admin/properties/${p.id}`,
        type: 'property',
      })),
      units: units.map(u => ({
        id: u.id,
        label: u.unitNumber,
        sub: u.property?.name ?? '',
        meta: `${u.bedrooms ?? '?'}bd · ${u.status}`,
        href: `/admin/units/${u.unitNumber}`,
        type: 'unit',
      })),
      tenants: tenants.map(t => ({
        id: t.id,
        label: t.name,
        sub: t.unitRef?.unitNumber ? `Unit ${t.unitRef.unitNumber} · ${t.property?.name ?? ''}` : (t.property?.name ?? ''),
        meta: t.status,
        href: `/admin/tenants/${t.id}`,
        type: 'tenant',
      })),
    },
  })
}
