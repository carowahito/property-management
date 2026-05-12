import * as XLSX from 'xlsx'
import path from 'path'

// ---------------------------------------------------------------------------
// Sheet data
// ---------------------------------------------------------------------------

const sheets: Record<string, (string | number | null)[][]> = {
  Instructions: [
    ['PROPERTY MANAGEMENT — BULK UPLOAD TEMPLATE'],
    [],
    ['GAP ANALYSIS: Fields in your source data vs the database schema'],
    [],
    ['Source Field', 'Maps To', 'Status', 'Notes'],
    ['Landlord name', 'landlords.name', '✅ Mapped', ''],
    ['Landlord ID / Passport', 'landlords.idNumber', '✅ Mapped', ''],
    ['Landlord phone', 'landlords.phone', '⚠️ Fix format', 'Must include country code e.g. +254721998499'],
    ['Landlord email', 'landlords.email', '✅ Mapped', ''],
    ['Physical address', 'landlords.address', '✅ Mapped', ''],
    ['Bank name', 'landlords.bankName', '✅ Mapped', ''],
    ['Account number', 'landlords.bankAccount', '✅ Mapped', ''],
    ['Preferred communication', '—', '❌ Not in schema', 'No field exists — add to notes/description'],
    ['Postal address', '—', '❌ Not in schema', 'No separate postal address field'],
    ['Ownership type', '—', '❌ Not in schema', 'No field exists'],
    [],
    ['Property name', 'properties.name', '✅ Mapped', ''],
    ['Street address', 'properties.address', '✅ Mapped', ''],
    ['County', 'properties.state', '✅ Mapped', 'Use state column for county'],
    ['Country', 'properties.country', '✅ Mapped', ''],
    ['Property type (Residential)', 'properties.type = APARTMENT', '⚠️ Converted', 'Source says "Residential Property/Apartments" → use APARTMENT'],
    ['Bedrooms / Bathrooms', 'units.bedrooms / units.bathrooms', '✅ Mapped', 'Now captured on the Unit model'],
    ['Property subtype', '—', '❌ Not in schema', 'No subtype field'],
    ['Management type', '—', '❌ Not in schema', 'No management type field'],
    ['Monthly rent', 'leases.monthlyRent', '✅ Mapped', ''],
    ['Security deposit', 'leases.securityDeposit', '⚠️ Fix value', 'Source says "1 month rent" — enter number 30000'],
    ['Service charge', 'units.serviceCharge + leases.terms', '✅ Mapped', 'Stored on Unit; also in lease terms'],
    ['Management fee', 'units.managementFee + leases.terms', '✅ Mapped', 'Stored on Unit; also in lease terms'],
    ['Rent collection method', '—', '❌ Not in schema', 'No payment preference field on landlord'],
    [],
    ['Tenant name', 'tenants.name', '✅ Mapped', ''],
    ['Tenant email', 'tenants.email', '✅ Mapped', ''],
    ['Tenant ID / Passport', 'tenants.idNumber', '✅ Mapped', ''],
    ['Mobile phone', 'tenants.phone', '⚠️ Fix format', 'Add +254 prefix e.g. +254721656564'],
    ['Work phone', '—', '❌ Not in schema', 'Only one phone field — use mobile'],
    ['Move-in date', 'tenants.moveInDate', '✅ Mapped', 'Format: YYYY-MM-DD'],
    ['Lease start date', 'leases.startDate', '✅ Mapped', 'Format: YYYY-MM-DD'],
    ['Lease end date', 'leases.endDate', '✅ Mapped', 'Format: YYYY-MM-DD'],
    ['Lease term (months)', '—', '❌ Not in schema', 'Derive from start/end dates'],
    ['Rent payment deadline', 'leases.terms', '⚠️ Partial', 'No dedicated field — include in terms'],
    ['Late payment penalty type', 'leases.terms', '⚠️ Partial', 'No dedicated field — include in terms'],
    ['Late payment penalty rate', 'leases.terms', '⚠️ Partial', 'No dedicated field — include in terms'],
    [],
    ['Transaction receipt no', 'payments.reference', '✅ Mapped', ''],
    ['Transaction date', 'payments.paidDate / payouts.paidDate', '✅ Mapped', ''],
    ['Rent deposit from tenant', 'payments (type=RENT)', '✅ Mapped', ''],
    ['Rent payment to landlord', 'payouts.amount', '✅ Mapped', ''],
    ['Service charge payment', 'rent_transactions.serviceCharge', '✅ Mapped', ''],
    ['Repairs cost', 'rent_transactions.maintenanceFees', '✅ Mapped', ''],
    ['Agent commission', 'rent_transactions.managementFee', '✅ Mapped', ''],
    ['Mpesa charges', '—', '❌ Not in schema', 'No M-Pesa fee field'],
    ['Miscellaneous deposit/expense', 'rent_transactions.otherDeductions', '⚠️ Partial', 'Combined into otherDeductions'],
    [],
    ['UPLOAD ORDER', '', '', ''],
    ['1', 'Landlords', 'No dependencies', ''],
    ['2', 'Properties', 'Requires: landlords uploaded first', ''],
    ['3', 'Units', 'Requires: landlords + properties uploaded first', 'Links landlord to specific unit in a property'],
    ['4', 'Tenants', 'Requires: units + properties uploaded first', ''],
    ['5', 'Leases', 'Requires: tenants + units uploaded first', ''],
    ['6', 'Transactions', 'Requires: leases uploaded first', ''],
    [],
    ['ENTITY RELATIONSHIPS', '', '', ''],
    ['Landlord', '──owns──▶', 'Unit', '(one landlord can own multiple units across properties)'],
    ['Property', '──contains──▶', 'Unit', '(one property has many units)'],
    ['Unit', '──occupied by──▶', 'Tenant', '(one active tenant per unit at a time)'],
    ['Tenant', '──has──▶', 'Lease', '(lease links tenant + unit + property)'],
    ['Lease', '──generates──▶', 'Transactions', '(payments and payouts per lease)'],
    [],
    ['API ENDPOINT', 'POST /api/admin/bulk-upload?type={type}', '', ''],
    ['Valid types', 'landlords | properties | units | tenants | leases | transactions', '', ''],
    ['Auth required', 'ADMIN session cookie', '', ''],
    [],
    ['VALID ENUM VALUES', '', '', ''],
    ['Property type', 'APARTMENT | HOUSE | CONDO | TOWNHOUSE | STUDIO | COMMERCIAL', '', ''],
    ['Landlord/Vendor status', 'ACTIVE | INACTIVE | SUSPENDED', '', ''],
    ['Tenant status', 'ACTIVE | INACTIVE | PENDING | EVICTED', '', ''],
    ['Lease status', 'ACTIVE | EXPIRED | TERMINATED | PENDING', '', ''],
    ['Payment method', 'CASH | BANK_TRANSFER | MPESA | CARD | CHEQUE', '', ''],
    ['Date format', 'YYYY-MM-DD  e.g. 2026-02-01', '', ''],
  ],

  Landlords: [
    ['name', 'email', 'phone', 'idNumber', 'address', 'bankName', 'bankAccount', 'taxId', 'status'],
    ['Ann Karuga', 'carowahito@gmail.com', '+254721998499', '27206034', 'Nyeri', 'Family Bank', '055000000204', '', 'ACTIVE'],
  ],

  Properties: [
    ['name', 'landlordEmail', 'address', 'city', 'state', 'country', 'type', 'units', 'yearBuilt', 'postalCode', 'status', 'description'],
    ['Greatwall Gardens II', 'carowahito@gmail.com', 'Shanghai Road', 'Athi River', 'Machakos', 'Kenya', 'APARTMENT', 1, null, null, 'ACTIVE', '3 bedroom 2 bathroom apartment - Unit GWG2-A55'],
  ],

  // Units: one row per unit — links Landlord → Property → Unit
  // unitNumber   = unique identifier within the property e.g. GWG2-A55
  // landlordEmail = must match a Landlords row (a landlord can own individual units in a building)
  // propertyName  = must match a Properties row
  // bedrooms/bathrooms/sizeSqm = captured here (not on Property)
  // serviceCharge/managementFee = stored per unit for automatic rent calculation
  Units: [
    ['unitNumber', 'propertyName', 'landlordEmail', 'floor', 'bedrooms', 'bathrooms', 'sizeSqm', 'monthlyRent', 'serviceCharge', 'managementFee', 'status', 'description'],
    // status: VACANT | OCCUPIED | MAINTENANCE | RESERVED
    ['GWG2-A55', 'Greatwall Gardens II', 'carowahito@gmail.com', null, 3, 2, null, 30000, 2000, 1500, 'OCCUPIED', '3 bed 2 bath apartment'],
  ],

  Tenants: [
    ['name', 'email', 'phone', 'idNumber', 'emergencyContact', 'emergencyPhone', 'propertyName', 'unit', 'moveInDate', 'status'],
    ['Faridah Achieng Kassim', 'faridahkassim592@gmail.com', '+254721656564', '23836035', '', '', 'Greatwall Gardens II', 'GWG2-A55', '2025-01-30', 'ACTIVE'],
  ],

  Leases: [
    ['tenantEmail', 'propertyName', 'unit', 'startDate', 'endDate', 'monthlyRent', 'securityDeposit', 'status', 'terms'],
    [
      'faridahkassim592@gmail.com',
      'Greatwall Gardens II',
      'GWG2-A55',
      '2026-02-01',
      '2027-02-01',
      30000,
      30000,
      'ACTIVE',
      'Rent due 5th of each month. Late payment penalty: KES 500/day (fixed). Service charge: KES 2000/month. Management fee: KES 1500/month. Preferred payment: Bank Transfer.',
    ],
  ],

  // Transactions maps to Payment (tenant side) and Payout (landlord side)
  // receiptNo        → payments.reference / payouts.reference
  // transactionDate  → payments.paidDate / payouts.paidDate
  // rentDeposit      → Payment amount (type=RENT, tenant paying)
  // landlordPayment  → Payout amount
  // serviceCharge    → RentTransaction.serviceCharge
  // repairsCost      → RentTransaction.maintenanceFees
  // agentCommission  → RentTransaction.managementFee
  Transactions: [
    [
      'receiptNo', 'transactionDate', 'unitNumber',
      'rentDepositFromTenant', 'rentDepositRefund',
      'landlordPayment', 'serviceChargePayment',
      'repairsCost', 'agentCommission',
      'miscDeposit', 'miscExpenses',
      'paymentMethod', 'notes',
    ],
    // ↓ Prefilled from GWG2-A55 transaction history
    ['UC6SN7KEF6',  '2026-03-06', 'GWG2-A55', 0,     0, 26500, 0,    0, 0, 0, 0, 'BANK_TRANSFER', ''],
    ['UBGSN6UZUE',  '2026-02-16', 'GWG2-A55', 0,     0, 26500, 0,    0, 0, 0, 0, 'BANK_TRANSFER', ''],
    ['UA3SN5A4CS',  '2026-01-03', 'GWG2-A55', 0,     0, 26500, 0,    0, 0, 0, 0, 'BANK_TRANSFER', ''],
    ['TLR6F23HDO',  '2025-12-27', 'GWG2-A55', 50000, 0, 0,     0,    0, 0, 0, 0, 'MPESA',         ''],
    ['TLNSN4WOOF',  '2025-12-23', 'GWG2-A55', 0,     0, 26500, 0,    0, 0, 0, 0, 'BANK_TRANSFER', ''],
    ['TK8SN3B9YB',  '2025-11-08', 'GWG2-A55', 0,     0, 26500, 0,    0, 0, 0, 0, 'BANK_TRANSFER', ''],
    ['TJR6F8I2LB',  '2025-10-27', 'GWG2-A55', 40000, 0, 0,     0,    0, 0, 0, 0, 'MPESA',         ''],
    ['TJISN2KQJA',  '2025-10-18', 'GWG2-A55', 0,     0, 0,     4000, 0, 0, 0, 0, 'BANK_TRANSFER', 'Service charge x2 months'],
    ['TJI6F7O2V4',  '2025-10-18', 'GWG2-A55', 20000, 0, 0,     0,    0, 0, 0, 0, 'MPESA',         ''],
    ['TJGSN2HOKX',  '2025-10-16', 'GWG2-A55', 0,     0, 26500, 0,    0, 0, 0, 0, 'BANK_TRANSFER', ''],
    ['TI925ZDS60',  '2025-09-09', 'GWG2-A55', 0,     0, 0,     2000, 0, 0, 0, 0, 'BANK_TRANSFER', ''],
    ['TI80YR8X26',  '2025-09-08', 'GWG2-A55', 0,     0, 26500, 0,    0, 0, 0, 0, 'BANK_TRANSFER', ''],
    ['TI56LIZ3L8',  '2025-09-05', 'GWG2-A55', 30000, 0, 0,     0,    0, 0, 0, 0, 'MPESA',         ''],
    ['TH654YJC83',  '2025-08-06', 'GWG2-A55', 0,     0, 26500, 0,    0, 0, 0, 0, 'BANK_TRANSFER', ''],
    ['TH583BXHG8',  '2025-08-05', 'GWG2-A55', 60000, 0, 0,     0,    0, 0, 0, 0, 'MPESA',         ''],
    ['TGA8D6O33O',  '2025-07-10', 'GWG2-A55', 0,     0, 26500, 0,    0, 0, 0, 0, 'BANK_TRANSFER', ''],
  ],
}

// ---------------------------------------------------------------------------
// Build workbook
// ---------------------------------------------------------------------------

const wb = XLSX.utils.book_new()
const sheetOrder = ['Instructions', 'Landlords', 'Properties', 'Units', 'Tenants', 'Leases', 'Transactions']

for (const name of sheetOrder) {
  const data = sheets[name]
  const ws = XLSX.utils.aoa_to_sheet(data)
  const range = XLSX.utils.decode_range(ws['!ref'] ?? 'A1')

  // Bold header / title rows
  const boldRows = name === 'Instructions' ? [0, 2, 44, 50, 56] : [0]
  for (const r of boldRows) {
    for (let c = range.s.c; c <= range.e.c; c++) {
      const cell = ws[XLSX.utils.encode_cell({ r, c })]
      if (cell) cell.s = { font: { bold: true } }
    }
  }

  // Column widths
  const colWidth = name === 'Instructions' ? 42 : 30
  ws['!cols'] = Array(range.e.c + 1).fill({ wch: colWidth })

  XLSX.utils.book_append_sheet(wb, ws, name)
}

const outPath = path.join(process.cwd(), 'public', 'templates', 'property-management-upload-template.xlsx')
XLSX.writeFile(wb, outPath)
console.log(`✅ Workbook written to: ${outPath}`)
