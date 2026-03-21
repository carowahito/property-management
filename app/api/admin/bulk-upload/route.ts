import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

// Simple CSV parser that handles quoted fields
function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split('\n').filter(l => l.trim())
  if (lines.length < 2) return []

  const headers = parseCSVLine(lines[0])
  return lines.slice(1).map(line => {
    const values = parseCSVLine(line)
    return headers.reduce((obj, header, i) => {
      obj[header.trim()] = (values[i] ?? '').trim()
      return obj
    }, {} as Record<string, string>)
  }).filter(row => Object.values(row).some(v => v !== ''))
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      inQuotes = !inQuotes
    } else if (ch === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += ch
    }
  }
  result.push(current)
  return result
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type')
  const csvText = await req.text()

  if (!type || !csvText) {
    return NextResponse.json({ error: 'Missing type or CSV data' }, { status: 400 })
  }

  const rows = parseCSV(csvText)
  if (rows.length === 0) {
    return NextResponse.json({ error: 'No valid rows found in CSV' }, { status: 400 })
  }

  try {
    switch (type) {
      case 'landlords':
        return await uploadLandlords(rows)
      case 'properties':
        return await uploadProperties(rows)
      case 'tenants':
        return await uploadTenants(rows)
      case 'units':
        return await uploadUnits(rows)
      case 'leases':
        return await uploadLeases(rows)
      case 'transactions':
        return await uploadTransactions(rows)
      default:
        return NextResponse.json({ error: `Unknown type: ${type}. Use: landlords, properties, tenants, leases` }, { status: 400 })
    }
  } catch (error) {
    console.error('Bulk upload error:', error)
    return NextResponse.json({ error: 'Upload failed', detail: String(error) }, { status: 500 })
  }
}

async function uploadLandlords(rows: Record<string, string>[]) {
  const results = { created: 0, skipped: 0, errors: [] as string[] }

  for (const row of rows) {
    if (!row.name || !row.email || !row.phone) {
      results.errors.push(`Skipping row: missing required fields (name, email, phone) — ${JSON.stringify(row)}`)
      results.skipped++
      continue
    }
    try {
      await prisma.landlord.upsert({
        where: { email: row.email },
        update: {
          name: row.name,
          phone: row.phone,
          idNumber: row.idNumber || null,
          address: row.address || null,
          bankName: row.bankName || null,
          bankAccount: row.bankAccount || null,
          taxId: row.taxId || null,
          status: (row.status as 'ACTIVE' | 'INACTIVE' | 'SUSPENDED') || 'ACTIVE',
        },
        create: {
          name: row.name,
          email: row.email,
          phone: row.phone,
          idNumber: row.idNumber || null,
          address: row.address || null,
          bankName: row.bankName || null,
          bankAccount: row.bankAccount || null,
          taxId: row.taxId || null,
          status: (row.status as 'ACTIVE' | 'INACTIVE' | 'SUSPENDED') || 'ACTIVE',
        },
      })
      results.created++
    } catch (e) {
      results.errors.push(`${row.email}: ${String(e)}`)
      results.skipped++
    }
  }

  return NextResponse.json({ type: 'landlords', ...results })
}

async function uploadProperties(rows: Record<string, string>[]) {
  const results = { created: 0, skipped: 0, errors: [] as string[] }

  for (const row of rows) {
    if (!row.name || !row.landlordEmail || !row.address || !row.type) {
      results.errors.push(`Skipping row: missing required fields (name, landlordEmail, address, type) — ${JSON.stringify(row)}`)
      results.skipped++
      continue
    }

    const landlord = await prisma.landlord.findUnique({ where: { email: row.landlordEmail } })
    if (!landlord) {
      results.errors.push(`Property "${row.name}": landlord with email "${row.landlordEmail}" not found — upload landlords first`)
      results.skipped++
      continue
    }

    const validTypes = ['APARTMENT', 'HOUSE', 'CONDO', 'TOWNHOUSE', 'STUDIO', 'COMMERCIAL']
    const propertyType = validTypes.includes(row.type.toUpperCase()) ? row.type.toUpperCase() : 'APARTMENT'

    try {
      await prisma.property.upsert({
        where: {
          id: (await prisma.property.findFirst({ where: { name: row.name, landlordId: landlord.id } }))?.id ?? 'new',
        },
        update: {
          address: row.address,
          city: row.city || null,
          state: row.state || null,
          postalCode: row.postalCode || null,
          country: row.country || 'Kenya',
          type: propertyType as 'APARTMENT' | 'HOUSE' | 'CONDO' | 'TOWNHOUSE' | 'STUDIO' | 'COMMERCIAL',
          totalUnits: row.units ? parseInt(row.units) : 1,
          yearBuilt: row.yearBuilt ? parseInt(row.yearBuilt) : null,
          status: (row.status as 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE') || 'ACTIVE',
          description: row.description || null,
        },
        create: {
          name: row.name,
          landlordId: landlord.id,
          address: row.address,
          city: row.city || null,
          state: row.state || null,
          postalCode: row.postalCode || null,
          country: row.country || 'Kenya',
          type: propertyType as 'APARTMENT' | 'HOUSE' | 'CONDO' | 'TOWNHOUSE' | 'STUDIO' | 'COMMERCIAL',
          totalUnits: row.units ? parseInt(row.units) : 1,
          yearBuilt: row.yearBuilt ? parseInt(row.yearBuilt) : null,
          status: (row.status as 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE') || 'ACTIVE',
          description: row.description || null,
        },
      })
      results.created++
    } catch (e) {
      results.errors.push(`${row.name}: ${String(e)}`)
      results.skipped++
    }
  }

  return NextResponse.json({ type: 'properties', ...results })
}

async function uploadUnits(rows: Record<string, string>[]) {
  const results = { created: 0, skipped: 0, errors: [] as string[] }

  for (const row of rows) {
    if (!row.unitNumber || !row.propertyName || !row.landlordEmail) {
      results.errors.push(`Skipping row: missing required fields (unitNumber, propertyName, landlordEmail) — ${JSON.stringify(row)}`)
      results.skipped++
      continue
    }

    const property = await prisma.property.findFirst({ where: { name: row.propertyName } })
    if (!property) {
      results.errors.push(`Unit "${row.unitNumber}": property "${row.propertyName}" not found — upload properties first`)
      results.skipped++
      continue
    }

    const landlord = await prisma.landlord.findUnique({ where: { email: row.landlordEmail } })
    if (!landlord) {
      results.errors.push(`Unit "${row.unitNumber}": landlord "${row.landlordEmail}" not found — upload landlords first`)
      results.skipped++
      continue
    }

    const validStatuses = ['VACANT', 'OCCUPIED', 'MAINTENANCE', 'RESERVED']
    const status = validStatuses.includes((row.status ?? '').toUpperCase())
      ? row.status.toUpperCase() as 'VACANT' | 'OCCUPIED' | 'MAINTENANCE' | 'RESERVED'
      : 'VACANT'

    try {
      await prisma.unit.upsert({
        where: { unitNumber: row.unitNumber },
        update: {
          landlordId: landlord.id,
          floor: row.floor ? parseInt(row.floor) : null,
          bedrooms: row.bedrooms ? parseInt(row.bedrooms) : null,
          bathrooms: row.bathrooms ? parseInt(row.bathrooms) : null,
          sizeSqm: row.sizeSqm ? parseFloat(row.sizeSqm) : null,
          status,
          monthlyRent: row.monthlyRent ? parseFloat(row.monthlyRent) : null,
          serviceCharge: row.serviceCharge ? parseFloat(row.serviceCharge) : null,
          managementFee: row.managementFee ? parseFloat(row.managementFee) : null,
          description: row.description || null,
        },
        create: {
          unitNumber: row.unitNumber,
          propertyId: property.id,
          landlordId: landlord.id,
          floor: row.floor ? parseInt(row.floor) : null,
          bedrooms: row.bedrooms ? parseInt(row.bedrooms) : null,
          bathrooms: row.bathrooms ? parseInt(row.bathrooms) : null,
          sizeSqm: row.sizeSqm ? parseFloat(row.sizeSqm) : null,
          status,
          monthlyRent: row.monthlyRent ? parseFloat(row.monthlyRent) : null,
          serviceCharge: row.serviceCharge ? parseFloat(row.serviceCharge) : null,
          managementFee: row.managementFee ? parseFloat(row.managementFee) : null,
          description: row.description || null,
        },
      })
      results.created++
    } catch (e) {
      results.errors.push(`${row.unitNumber}: ${String(e)}`)
      results.skipped++
    }
  }

  return NextResponse.json({ type: 'units', ...results })
}

async function uploadTenants(rows: Record<string, string>[]) {
  const results = { created: 0, skipped: 0, errors: [] as string[] }

  for (const row of rows) {
    if (!row.name || !row.email || !row.phone || !row.propertyName) {
      results.errors.push(`Skipping row: missing required fields (name, email, phone, propertyName) — ${JSON.stringify(row)}`)
      results.skipped++
      continue
    }

    const property = await prisma.property.findFirst({ where: { name: row.propertyName } })
    if (!property) {
      results.errors.push(`Tenant "${row.name}": property "${row.propertyName}" not found — upload properties first`)
      results.skipped++
      continue
    }

    const unitRecord = row.unit
      ? await prisma.unit.findFirst({ where: { propertyId: property.id, unitNumber: row.unit } })
      : null

    try {
      await prisma.tenant.upsert({
        where: { email: row.email },
        update: {
          name: row.name,
          phone: row.phone,
          idNumber: row.idNumber || null,
          emergencyContact: row.emergencyContact || null,
          emergencyPhone: row.emergencyPhone || null,
          propertyId: property.id,
          unitId: unitRecord?.id ?? null,
          unit: row.unit || null,
          moveInDate: row.moveInDate ? new Date(row.moveInDate) : null,
          status: (row.status as 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'EVICTED') || 'ACTIVE',
        },
        create: {
          name: row.name,
          email: row.email,
          phone: row.phone,
          idNumber: row.idNumber || null,
          emergencyContact: row.emergencyContact || null,
          emergencyPhone: row.emergencyPhone || null,
          propertyId: property.id,
          unitId: unitRecord?.id ?? null,
          unit: row.unit || null,
          moveInDate: row.moveInDate ? new Date(row.moveInDate) : null,
          status: (row.status as 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'EVICTED') || 'ACTIVE',
        },
      })
      results.created++
    } catch (e) {
      results.errors.push(`${row.email}: ${String(e)}`)
      results.skipped++
    }
  }

  return NextResponse.json({ type: 'tenants', ...results })
}

async function uploadLeases(rows: Record<string, string>[]) {
  const results = { created: 0, skipped: 0, errors: [] as string[] }

  for (const row of rows) {
    if (!row.tenantEmail || !row.propertyName || !row.startDate || !row.endDate || !row.monthlyRent) {
      results.errors.push(`Skipping row: missing required fields (tenantEmail, propertyName, startDate, endDate, monthlyRent) — ${JSON.stringify(row)}`)
      results.skipped++
      continue
    }

    const tenant = await prisma.tenant.findUnique({ where: { email: row.tenantEmail } })
    if (!tenant) {
      results.errors.push(`Lease: tenant "${row.tenantEmail}" not found — upload tenants first`)
      results.skipped++
      continue
    }

    const property = await prisma.property.findFirst({ where: { name: row.propertyName } })
    if (!property) {
      results.errors.push(`Lease: property "${row.propertyName}" not found — upload properties first`)
      results.skipped++
      continue
    }

    const unitRecord = row.unit
      ? await prisma.unit.findFirst({ where: { propertyId: property.id, unitNumber: row.unit } })
      : null

    try {
      const existing = await prisma.lease.findFirst({
        where: { tenantId: tenant.id, propertyId: property.id, status: 'ACTIVE' },
      })

      const leaseData = {
        unit: row.unit || null,
        unitId: unitRecord?.id ?? null,
        startDate: new Date(row.startDate),
        endDate: new Date(row.endDate),
        monthlyRent: parseFloat(row.monthlyRent),
        securityDeposit: row.securityDeposit ? parseFloat(row.securityDeposit) : parseFloat(row.monthlyRent),
        status: (row.status as 'ACTIVE' | 'EXPIRED' | 'TERMINATED' | 'PENDING') || 'ACTIVE',
        terms: row.terms || null,
      }

      if (existing) {
        await prisma.lease.update({ where: { id: existing.id }, data: leaseData })
      } else {
        await prisma.lease.create({
          data: { tenantId: tenant.id, propertyId: property.id, ...leaseData },
        })
      }
      results.created++
    } catch (e) {
      results.errors.push(`${row.tenantEmail} @ ${row.propertyName}: ${String(e)}`)
      results.skipped++
    }
  }

  return NextResponse.json({ type: 'leases', ...results })
}

async function uploadTransactions(rows: Record<string, string>[]) {
  const results = { created: 0, skipped: 0, errors: [] as string[] }

  for (const row of rows) {
    if (!row.transactionDate || !row.unitNumber) {
      results.errors.push(`Skipping row: missing transactionDate or unitNumber — ${JSON.stringify(row)}`)
      results.skipped++
      continue
    }

    const txDate = new Date(row.transactionDate)
    const method = (row.paymentMethod as 'CASH' | 'BANK_TRANSFER' | 'MPESA' | 'CARD' | 'CHEQUE') || 'BANK_TRANSFER'
    const unit = row.unitNumber.trim()

    // Find the unit record then lease linked to it
    const unitRecord = await prisma.unit.findUnique({ where: { unitNumber: unit } })
    const lease = unitRecord
      ? await prisma.lease.findFirst({
          where: { unitId: unitRecord.id, status: 'ACTIVE' },
          include: { tenant: true, property: { include: { landlord: true } } },
        })
      : null

    if (!lease) {
      results.errors.push(`Transaction ${row.receiptNo}: no lease found for unit "${unit}"`)
      results.skipped++
      continue
    }

    try {
      const rentDeposit = parseFloat(row.rentDepositFromTenant || '0')
      const landlordPayment = parseFloat(row.landlordPayment || '0')
      const serviceCharge = parseFloat(row.serviceChargePayment || '0')
      const repairsCost = parseFloat(row.repairsCost || '0')
      const agentCommission = parseFloat(row.agentCommission || '0')
      const miscDeposit = parseFloat(row.miscDeposit || '0')
      const miscExpenses = parseFloat(row.miscExpenses || '0')

      // Record tenant rent payment
      if (rentDeposit > 0) {
        const existing = await prisma.payment.findFirst({
          where: { reference: row.receiptNo, type: 'RENT' },
        })
        if (!existing) {
          await prisma.payment.create({
            data: {
              tenantId: lease.tenantId,
              leaseId: lease.id,
              amount: rentDeposit,
              type: 'RENT',
              method,
              status: 'PAID',
              dueDate: txDate,
              paidDate: txDate,
              reference: row.receiptNo || null,
              notes: row.notes || null,
            },
          })
        }
      }

      // Record landlord payout
      if (landlordPayment > 0 && lease.property.landlordId) {
        const period = txDate.toLocaleString('default', { month: 'long', year: 'numeric' })
        const existing = await prisma.payout.findFirst({
          where: { landlordId: lease.property.landlordId!, paidDate: txDate },
        })
        if (!existing) {
          await prisma.payout.create({
            data: {
              landlordId: lease.property.landlordId!,
              unitId: unitRecord!.id,
              amount: landlordPayment,
              period,
              status: 'PAID',
              method,
              reference: row.receiptNo || null,
              notes: row.notes || null,
              paidDate: txDate,
            },
          })
        }
      }

      // Record deposit refund as payment
      const refund = parseFloat(row.rentDepositRefund || '0')
      if (refund > 0) {
        await prisma.payment.create({
          data: {
            tenantId: lease.tenantId,
            leaseId: lease.id,
            amount: refund,
            type: 'OTHER',
            method,
            status: 'PAID',
            dueDate: txDate,
            paidDate: txDate,
            reference: row.receiptNo ? `${row.receiptNo}-REFUND` : null,
            notes: 'Deposit refund',
          },
        })
      }

      // Record service charge as payment
      if (serviceCharge > 0 || repairsCost > 0 || agentCommission > 0 || miscExpenses > 0) {
        const otherAmount = serviceCharge + repairsCost + agentCommission + miscDeposit + miscExpenses
        if (otherAmount > 0) {
          await prisma.payment.create({
            data: {
              tenantId: lease.tenantId,
              leaseId: lease.id,
              amount: otherAmount,
              type: 'OTHER',
              method,
              status: 'PAID',
              dueDate: txDate,
              paidDate: txDate,
              reference: row.receiptNo ? `${row.receiptNo}-FEES` : null,
              notes: [
                serviceCharge > 0 ? `Service charge: ${serviceCharge}` : '',
                repairsCost > 0 ? `Repairs: ${repairsCost}` : '',
                agentCommission > 0 ? `Commission: ${agentCommission}` : '',
                miscExpenses > 0 ? `Misc expenses: ${miscExpenses}` : '',
                row.notes || '',
              ].filter(Boolean).join('. '),
            },
          })
        }
      }

      results.created++
    } catch (e) {
      results.errors.push(`${row.receiptNo}: ${String(e)}`)
      results.skipped++
    }
  }

  return NextResponse.json({ type: 'transactions', ...results })
}
