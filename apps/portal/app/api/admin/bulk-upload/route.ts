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
  const validateOnly = searchParams.get('validate') === 'true'
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
        return await uploadLandlords(rows, validateOnly)
      case 'properties':
        return await uploadProperties(rows, validateOnly)
      case 'tenants':
        return await uploadTenants(rows, validateOnly)
      case 'units':
        return await uploadUnits(rows, validateOnly)
      case 'leases':
        return await uploadLeases(rows, validateOnly)
      case 'transactions':
        return await uploadTransactions(rows, validateOnly)
      default:
        return NextResponse.json({ error: `Unknown type: ${type}. Use: landlords, properties, tenants, leases` }, { status: 400 })
    }
  } catch (error) {
    console.error('Bulk upload error:', error)
    return NextResponse.json({ error: 'Upload failed', detail: String(error) }, { status: 500 })
  }
}

// Resolve the company for bulk operations.
// TODO: derive from session.user.companyId once auth is wired.
async function getCompanyId(): Promise<string> {
  const company = await prisma.company.findFirst({ where: { status: 'ACTIVE' } })
  if (!company) throw new Error('No active company found')
  return company.id
}

async function uploadLandlords(rows: Record<string, string>[], validateOnly = false) {
  const results = { created: 0, updated: 0, skipped: 0, errors: [] as string[] }
  const rowValidations: RowValidation[] = []
  const companyId = await getCompanyId()

  const validStatuses = ['ACTIVE', 'INACTIVE', 'SUSPENDED']

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const rowNum = i + 1
    const ref = row.referenceId || ''

    if (!row.name || !row.email || !row.phone) {
      const missing = ['name', 'email', 'phone'].filter(f => !row[f]).join(', ')
      const err = `Missing required fields: ${missing}`
      results.errors.push(`Row ${rowNum}: ${err}`)
      results.skipped++
      rowValidations.push({ row: rowNum, referenceId: ref, name: row.name || '', email: row.email || '', status: 'error', error: err })
      continue
    }

    if (row.status && !validStatuses.includes(row.status.toUpperCase())) {
      const err = `Invalid status "${row.status}". Use: ${validStatuses.join(', ')}`
      results.errors.push(`Row ${rowNum}: ${err}`)
      results.skipped++
      rowValidations.push({ row: rowNum, referenceId: ref, name: row.name, email: row.email, status: 'error', error: err })
      continue
    }

    const existing = await prisma.landlord.findFirst({ where: { companyId, email: row.email } })
    const rowStatus = existing ? 'update' as const : 'valid' as const

    if (validateOnly) {
      rowValidations.push({ row: rowNum, referenceId: ref, name: row.name, email: row.email, status: rowStatus })
      if (existing) results.updated++
      else results.created++
      continue
    }

    try {
      const landlordData = {
        name: row.name,
        phone: row.phone,
        idNumber: row.idNumber || null,
        address: row.address || null,
        bankName: row.bankName || null,
        bankAccount: row.bankAccount || null,
        taxId: row.taxId || null,
        status: ((row.status?.toUpperCase() || 'ACTIVE') as 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'),
      }
      if (existing) {
        await prisma.landlord.update({ where: { id: existing.id }, data: landlordData })
        results.updated++
      } else {
        await prisma.landlord.create({ data: { companyId, email: row.email, ...landlordData } })
        results.created++
      }
      rowValidations.push({ row: rowNum, referenceId: ref, name: row.name, email: row.email, status: rowStatus })
    } catch (e) {
      const err = String(e)
      results.errors.push(`Row ${rowNum} (${row.email}): ${err}`)
      results.skipped++
      rowValidations.push({ row: rowNum, referenceId: ref, name: row.name, email: row.email, status: 'error', error: err })
    }
  }

  return NextResponse.json({ type: 'landlords', validateOnly, rows: rowValidations, ...results })
}

async function uploadProperties(rows: Record<string, string>[], validateOnly = false) {
  const results = { created: 0, skipped: 0, errors: [] as string[] }
  const companyId = await getCompanyId()

  for (const row of rows) {
    if (!row.name || !row.landlordEmail || !row.address || !row.type) {
      results.errors.push(`Skipping row: missing required fields (name, landlordEmail, address, type) — ${JSON.stringify(row)}`)
      results.skipped++
      continue
    }

    const landlord = await prisma.landlord.findFirst({ where: { companyId, email: row.landlordEmail } })
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
          companyId,
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

async function uploadUnits(rows: Record<string, string>[], validateOnly = false) {
  const results = { created: 0, skipped: 0, errors: [] as string[] }

  for (const row of rows) {
    if (!row.unitNumber || !row.propertyName || !row.landlordEmail) {
      results.errors.push(`Skipping row: missing required fields (unitNumber, propertyName, landlordEmail) — ${JSON.stringify(row)}`)
      results.skipped++
      continue
    }

    const companyId = await getCompanyId()
    const property = await prisma.property.findFirst({ where: { companyId, name: row.propertyName } })
    if (!property) {
      results.errors.push(`Unit "${row.unitNumber}": property "${row.propertyName}" not found — upload properties first`)
      results.skipped++
      continue
    }

    const landlord = await prisma.landlord.findFirst({ where: { companyId, email: row.landlordEmail } })
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

interface RowValidation {
  row: number
  referenceId: string
  name: string
  email: string
  status: 'valid' | 'error' | 'update'
  error?: string
}

async function uploadTenants(rows: Record<string, string>[], validateOnly = false) {
  const results = { created: 0, updated: 0, skipped: 0, errors: [] as string[] }
  const rowValidations: RowValidation[] = []

  const companyId = await getCompanyId()

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const rowNum = i + 1
    const ref = row.referenceId || ''

    if (!row.name || !row.email || !row.phone || !row.propertyName) {
      const missing = ['name', 'email', 'phone', 'propertyName'].filter(f => !row[f]).join(', ')
      const err = `Missing required fields: ${missing}`
      results.errors.push(`Row ${rowNum}: ${err}`)
      results.skipped++
      rowValidations.push({ row: rowNum, referenceId: ref, name: row.name || '', email: row.email || '', status: 'error', error: err })
      continue
    }

    const property = await prisma.property.findFirst({ where: { companyId, name: row.propertyName } })
    if (!property) {
      const err = `Property "${row.propertyName}" not found`
      results.errors.push(`Row ${rowNum}: ${err}`)
      results.skipped++
      rowValidations.push({ row: rowNum, referenceId: ref, name: row.name, email: row.email, status: 'error', error: err })
      continue
    }

    const unitRecord = row.unit
      ? await prisma.unit.findFirst({ where: { propertyId: property.id, unitNumber: row.unit } })
      : null

    if (row.unit && !unitRecord) {
      const err = `Unit "${row.unit}" not found in property "${row.propertyName}"`
      results.errors.push(`Row ${rowNum}: ${err}`)
      results.skipped++
      rowValidations.push({ row: rowNum, referenceId: ref, name: row.name, email: row.email, status: 'error', error: err })
      continue
    }

    if (row.moveInDate && isNaN(Date.parse(row.moveInDate))) {
      const err = `Invalid moveInDate format: "${row.moveInDate}"`
      results.errors.push(`Row ${rowNum}: ${err}`)
      results.skipped++
      rowValidations.push({ row: rowNum, referenceId: ref, name: row.name, email: row.email, status: 'error', error: err })
      continue
    }

    if (row.moveOutDate && isNaN(Date.parse(row.moveOutDate))) {
      const err = `Invalid moveOutDate format: "${row.moveOutDate}"`
      results.errors.push(`Row ${rowNum}: ${err}`)
      results.skipped++
      rowValidations.push({ row: rowNum, referenceId: ref, name: row.name, email: row.email, status: 'error', error: err })
      continue
    }

    const validStatuses = ['ACTIVE', 'INACTIVE', 'PENDING', 'EVICTED']
    if (row.status && !validStatuses.includes(row.status.toUpperCase())) {
      const err = `Invalid status "${row.status}". Use: ${validStatuses.join(', ')}`
      results.errors.push(`Row ${rowNum}: ${err}`)
      results.skipped++
      rowValidations.push({ row: rowNum, referenceId: ref, name: row.name, email: row.email, status: 'error', error: err })
      continue
    }

    // Optional lease fields — a lease is created when rent + both lease dates are provided
    if (row.monthlyRent && isNaN(Number(row.monthlyRent))) {
      const err = `Invalid monthlyRent: "${row.monthlyRent}"`
      results.errors.push(`Row ${rowNum}: ${err}`)
      results.skipped++
      rowValidations.push({ row: rowNum, referenceId: ref, name: row.name, email: row.email, status: 'error', error: err })
      continue
    }
    if (row.securityDeposit && isNaN(Number(row.securityDeposit))) {
      const err = `Invalid securityDeposit: "${row.securityDeposit}"`
      results.errors.push(`Row ${rowNum}: ${err}`)
      results.skipped++
      rowValidations.push({ row: rowNum, referenceId: ref, name: row.name, email: row.email, status: 'error', error: err })
      continue
    }
    if (row.leaseStartDate && isNaN(Date.parse(row.leaseStartDate))) {
      const err = `Invalid leaseStartDate: "${row.leaseStartDate}"`
      results.errors.push(`Row ${rowNum}: ${err}`)
      results.skipped++
      rowValidations.push({ row: rowNum, referenceId: ref, name: row.name, email: row.email, status: 'error', error: err })
      continue
    }
    if (row.leaseEndDate && isNaN(Date.parse(row.leaseEndDate))) {
      const err = `Invalid leaseEndDate: "${row.leaseEndDate}"`
      results.errors.push(`Row ${rowNum}: ${err}`)
      results.skipped++
      rowValidations.push({ row: rowNum, referenceId: ref, name: row.name, email: row.email, status: 'error', error: err })
      continue
    }
    // If rent is provided, we need both lease dates to build a lease
    if (row.monthlyRent && (!row.leaseStartDate || !row.leaseEndDate)) {
      const err = 'monthlyRent provided but leaseStartDate/leaseEndDate missing — a lease needs both dates'
      results.errors.push(`Row ${rowNum}: ${err}`)
      results.skipped++
      rowValidations.push({ row: rowNum, referenceId: ref, name: row.name, email: row.email, status: 'error', error: err })
      continue
    }

    const existing = await prisma.tenant.findFirst({ where: { companyId, email: row.email } })
    const rowStatus = existing ? 'update' as const : 'valid' as const

    if (validateOnly) {
      rowValidations.push({ row: rowNum, referenceId: ref, name: row.name, email: row.email, status: rowStatus })
      if (existing) results.updated++
      else results.created++
      continue
    }

    try {
      const tenantData = {
        name: row.name,
        phone: row.phone,
        idNumber: row.idNumber || null,
        emergencyContact: row.emergencyContact || null,
        emergencyPhone: row.emergencyPhone || null,
        propertyId: property.id,
        unitId: unitRecord?.id ?? null,
        unit: row.unit || null,
        moveInDate: row.moveInDate ? new Date(row.moveInDate) : null,
        moveOutDate: row.moveOutDate ? new Date(row.moveOutDate) : null,
        status: ((row.status?.toUpperCase() || 'ACTIVE') as 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'EVICTED'),
      }
      let tenantId: string
      if (existing) {
        await prisma.tenant.update({ where: { id: existing.id }, data: tenantData })
        tenantId = existing.id
        results.updated++
      } else {
        const created = await prisma.tenant.create({ data: { companyId, email: row.email, ...tenantData } })
        tenantId = created.id
        results.created++
      }

      // Create a lease when rent + both lease dates are supplied
      if (row.monthlyRent && row.leaseStartDate && row.leaseEndDate) {
        const startDate = new Date(row.leaseStartDate)
        const endDate = new Date(row.leaseEndDate)
        // Avoid duplicating a lease on re-import: skip if one already exists for
        // this tenant + unit + start date.
        const dupLease = await prisma.lease.findFirst({
          where: {
            tenantId,
            unitId: unitRecord?.id ?? null,
            startDate,
          },
        })
        if (!dupLease) {
          await prisma.lease.create({
            data: {
              tenantId,
              propertyId: property.id,
              unitId: unitRecord?.id ?? null,
              startDate,
              endDate,
              monthlyRent: Number(row.monthlyRent),
              securityDeposit: row.securityDeposit ? Number(row.securityDeposit) : 0,
              status: endDate < new Date() ? 'EXPIRED' : 'ACTIVE',
            },
          })
        }
      }

      rowValidations.push({ row: rowNum, referenceId: ref, name: row.name, email: row.email, status: rowStatus })
    } catch (e) {
      const err = String(e)
      results.errors.push(`Row ${rowNum} (${row.email}): ${err}`)
      results.skipped++
      rowValidations.push({ row: rowNum, referenceId: ref, name: row.name, email: row.email, status: 'error', error: err })
    }
  }

  return NextResponse.json({ type: 'tenants', validateOnly, rows: rowValidations, ...results })
}

async function uploadLeases(rows: Record<string, string>[], validateOnly = false) {
  const results = { created: 0, skipped: 0, errors: [] as string[] }

  for (const row of rows) {
    if (!row.tenantEmail || !row.propertyName || !row.startDate || !row.endDate || !row.monthlyRent) {
      results.errors.push(`Skipping row: missing required fields (tenantEmail, propertyName, startDate, endDate, monthlyRent) — ${JSON.stringify(row)}`)
      results.skipped++
      continue
    }

    const companyId = await getCompanyId()
    const tenant = await prisma.tenant.findFirst({ where: { companyId, email: row.tenantEmail } })
    if (!tenant) {
      results.errors.push(`Lease: tenant "${row.tenantEmail}" not found — upload tenants first`)
      results.skipped++
      continue
    }

    const property = await prisma.property.findFirst({ where: { companyId, name: row.propertyName } })
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

async function uploadTransactions(rows: Record<string, string>[], validateOnly = false) {
  const results = { created: 0, skipped: 0, errors: [] as string[] }

  for (const row of rows) {
    if (!row.transactionDate || !row.unitNumber) {
      results.errors.push(`Skipping row: missing transactionDate or unitNumber — ${JSON.stringify(row)}`)
      results.skipped++
      continue
    }

    const txDate = new Date(row.transactionDate)
    // SOP 004 / BR-12: no cash. Reject any imported cash receipt outright.
    const rawMethod = (row.paymentMethod || '').trim().toUpperCase()
    if (rawMethod === 'CASH') {
      results.errors.push(`Transaction ${row.receiptNo || '(no ref)'}: cash payments are not permitted (SOP 004 BR-12)`)
      results.skipped++
      continue
    }
    const method = (rawMethod as 'BANK_TRANSFER' | 'MPESA' | 'CARD' | 'CHEQUE') || 'BANK_TRANSFER'
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
