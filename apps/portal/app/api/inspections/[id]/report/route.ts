import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'
import { sendEmail } from '@/lib/services/email'
import type { ChecklistData, MatrixRow } from '@/lib/inspection-checklists'
import {
  BEDROOM_ITEMS, BATHROOM_ITEMS,
  RES_SECTION_META, COM_SECTION_META,
} from '@/lib/inspection-checklists'

const NAVY = '#1A3A5C'
const SAFFRON = '#E8960C'
const LIGHT_NAVY = '#e8eef5'

const INSPECTION_TYPE_LABELS: Record<string, string> = {
  MOVE_IN: 'Move-In',
  POST_MOVE_IN: 'Post-Move-In Confirmation (5+ days)',
  THREE_MONTH: '3-Month (New Tenancy)',
  ROUTINE_6_MONTH: '6-Month Routine',
  PRE_MOVE_OUT: 'Pre-Move-Out (2+ weeks before)',
  MOVE_OUT: 'Move-Out',
  ANNUAL: 'Annual Condition Report',
}

function fmtDate(d: string | Date | null | undefined): string {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function condBg(c: string): string {
  if (c === 'P' || c === 'D') return '#fee2e2'
  if (c === 'F') return '#fef9c3'
  if (c === 'M') return '#ffedd5'
  return 'transparent'
}

function cell(content: string, bold = false, bg = 'transparent', align = 'left'): string {
  return `<td style="padding:5px 8px;border:1px solid #ddd;font-size:11px;background:${bg};text-align:${align};${bold ? 'font-weight:600;' : ''}">${content || '&nbsp;'}</td>`
}

function sectionHeader(title: string, subtitle = ''): string {
  return `<tr style="background:${NAVY};color:#fff;">
    <td colspan="4" style="padding:7px 10px;font-size:12px;font-weight:700;">
      ${title}${subtitle ? ` <span style="font-weight:400;font-size:10px;opacity:.85;">${subtitle}</span>` : ''}
    </td>
  </tr>
  <tr style="background:${LIGHT_NAVY};">
    <td style="padding:4px 8px;font-size:10px;font-weight:700;border:1px solid #ddd;width:40%">Item</td>
    <td style="padding:4px 8px;font-size:10px;font-weight:700;border:1px solid #ddd;width:8%">Cond.</td>
    <td style="padding:4px 8px;font-size:10px;font-weight:700;border:1px solid #ddd;width:8%">Action</td>
    <td style="padding:4px 8px;font-size:10px;font-weight:700;border:1px solid #ddd;">Comments / Photo Ref.</td>
  </tr>`
}

function itemRows(items: ChecklistData['items'], section: string): string {
  return items
    .filter(it => it.section === section)
    .map(it => `<tr>
      ${cell(it.item)}
      ${cell(it.condition, false, condBg(it.condition), 'center')}
      ${cell(it.action, false, 'transparent', 'center')}
      ${cell(it.comments)}
    </tr>`)
    .join('')
}

function matrixTable(
  sectionId: string,
  title: string,
  subtitle: string,
  rows: MatrixRow[],
  colLabels: string[],
): string {
  if (!rows?.length) return ''
  const numCols = colLabels.length
  const colWidth = Math.floor(40 / numCols)
  const headerCols = colLabels.map(l =>
    `<td style="padding:4px 8px;font-size:10px;font-weight:700;border:1px solid #ddd;width:${colWidth}%;text-align:center;">${l}</td>`
  ).join('')
  const dataRows = rows.map(r => {
    const condCells = Array(numCols).fill(0).map((_, i) => {
      const c = r.cond[i] ?? '—'
      return `<td style="padding:5px 4px;border:1px solid #ddd;font-size:11px;text-align:center;background:${condBg(c)}">${c}</td>`
    }).join('')
    return `<tr>
      <td style="padding:5px 8px;border:1px solid #ddd;font-size:11px;width:35%">${r.item}</td>
      ${condCells}
      <td style="padding:5px 8px;border:1px solid #ddd;font-size:11px;">${r.comments || '&nbsp;'}</td>
    </tr>`
  }).join('')

  return `<table width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin-bottom:10px;">
    <tr style="background:${NAVY};color:#fff;">
      <td colspan="${numCols + 2}" style="padding:7px 10px;font-size:12px;font-weight:700;">
        ${sectionId} ${title}${subtitle ? ` <span style="font-weight:400;font-size:10px;opacity:.85;">${subtitle}</span>` : ''}
      </td>
    </tr>
    <tr style="background:${LIGHT_NAVY};">
      <td style="padding:4px 8px;font-size:10px;font-weight:700;border:1px solid #ddd;width:35%">Item</td>
      ${headerCols}
      <td style="padding:4px 8px;font-size:10px;font-weight:700;border:1px solid #ddd;">Comments / Photo Ref.</td>
    </tr>
    ${dataRows}
  </table>`
}

function buildHtml(inspection: any, data: ChecklistData): string {
  const isRes = data.propertyCategory === 'RESIDENTIAL'
  const sections = isRes ? RES_SECTION_META : COM_SECTION_META
  const addSectionNum = isRes ? '3.10' : '3.11'

  // Section tables (standard sections)
  const sectionTables = sections.map(s => {
    const sectionKey = `${s.id} ${s.title}`
    const rows = itemRows(data.items, sectionKey)
    if (!rows) return ''
    return `<table width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin-bottom:10px;">
      ${sectionHeader(`${s.id} ${s.title}`, (s as any).subtitle || '')}
      ${rows}
    </table>`
  }).join('')

  // 3.4 Bedrooms matrix (residential)
  const bedColLabels = Array.from({ length: data.numBedrooms || 2 }, (_, i) => `Bed ${i + 1}`)
  const bedMatrix = isRes && data.bedroomMatrix?.length
    ? matrixTable('3.4', 'Bedrooms', 'one column per bedroom; note master/ensuite in comments',
        data.bedroomMatrix, bedColLabels)
    : ''

  // 3.5 Bathrooms matrix (residential)
  const wcColLabels = Array.from({ length: data.numBathrooms || 1 }, (_, i) => `WC ${i + 1}`)
  const bathMatrix = isRes && data.bathroomMatrix?.length
    ? matrixTable('3.5', 'Bathrooms & Toilets', 'one column per bathroom',
        data.bathroomMatrix, wcColLabels)
    : ''

  // Additional areas table
  const extraItems = (data.additionalItems || []).filter(it => it.item?.trim())
  const additionalTable = `<table width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin-bottom:10px;">
    <tr style="background:${NAVY};color:#fff;">
      <td colspan="4" style="padding:7px 10px;font-size:12px;font-weight:700;">${addSectionNum} Additional Areas / Items</td>
    </tr>
    <tr style="background:${LIGHT_NAVY};">
      <td style="padding:4px 8px;font-size:10px;font-weight:700;border:1px solid #ddd;width:40%">Item</td>
      <td style="padding:4px 8px;font-size:10px;font-weight:700;border:1px solid #ddd;width:8%">Cond.</td>
      <td style="padding:4px 8px;font-size:10px;font-weight:700;border:1px solid #ddd;width:8%">Action</td>
      <td style="padding:4px 8px;font-size:10px;font-weight:700;border:1px solid #ddd;">Comments / Photo Ref.</td>
    </tr>
    ${extraItems.length > 0
      ? extraItems.map(it => `<tr>
          ${cell(it.item)}
          ${cell(it.condition, false, condBg(it.condition), 'center')}
          ${cell(it.action, false, 'transparent', 'center')}
          ${cell(it.comments)}
        </tr>`).join('')
      : `<tr><td colspan="4" style="padding:8px;font-size:11px;color:#999;border:1px solid #ddd;">No additional items</td></tr>`
    }
  </table>`

  // Meters
  const metersTable = `<table width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin-bottom:10px;">
    <tr style="background:${NAVY};color:#fff;">
      <td colspan="4" style="padding:7px 10px;font-size:12px;font-weight:700;">Utility Meter Readings <span style="font-weight:400;font-size:10px;opacity:.85;">photograph each meter and reading</span></td>
    </tr>
    <tr style="background:${LIGHT_NAVY};">
      <td style="padding:4px 8px;font-size:10px;font-weight:700;border:1px solid #ddd;width:25%">Meter</td>
      <td style="padding:4px 8px;font-size:10px;font-weight:700;border:1px solid #ddd;width:25%">Meter No.</td>
      <td style="padding:4px 8px;font-size:10px;font-weight:700;border:1px solid #ddd;width:20%">Reading</td>
      <td style="padding:4px 8px;font-size:10px;font-weight:700;border:1px solid #ddd;">Photo Ref. / Notes</td>
    </tr>
    ${(data.meters || []).map(m => `<tr>
      ${cell(m.meter, true)}
      ${cell(m.meterNo)}
      ${cell(m.reading)}
      ${cell(m.notes)}
    </tr>`).join('')}
  </table>`

  // Keys
  const keysTable = `<table width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin-bottom:10px;">
    <tr style="background:${NAVY};color:#fff;">
      <td colspan="4" style="padding:7px 10px;font-size:12px;font-weight:700;">Keys &amp; Access</td>
    </tr>
    <tr style="background:${LIGHT_NAVY};">
      <td style="padding:4px 8px;font-size:10px;font-weight:700;border:1px solid #ddd;width:40%">Item</td>
      <td style="padding:4px 8px;font-size:10px;font-weight:700;border:1px solid #ddd;width:15%">No. Issued</td>
      <td style="padding:4px 8px;font-size:10px;font-weight:700;border:1px solid #ddd;width:15%">No. Returned</td>
      <td style="padding:4px 8px;font-size:10px;font-weight:700;border:1px solid #ddd;">Notes</td>
    </tr>
    ${(data.keys || []).map(k => `<tr>
      ${cell(k.item)}
      ${cell(k.issued, false, 'transparent', 'center')}
      ${cell(k.returned, false, 'transparent', 'center')}
      ${cell(k.notes)}
    </tr>`).join('')}
  </table>`

  // Defects
  const defectsTable = `<table width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin-bottom:10px;">
    <tr style="background:${SAFFRON};color:#fff;">
      <td colspan="4" style="padding:7px 10px;font-size:12px;font-weight:700;">Defects &amp; Actions Summary</td>
    </tr>
    <tr><td colspan="4" style="padding:4px 10px;font-size:10px;color:#555;border:1px solid #ddd;">List every defect identified, who is responsible, and the deadline.</td></tr>
    <tr style="background:${LIGHT_NAVY};">
      <td style="padding:4px 8px;font-size:10px;font-weight:700;border:1px solid #ddd;width:35%">Defect / Item</td>
      <td style="padding:4px 8px;font-size:10px;font-weight:700;border:1px solid #ddd;width:20%">Responsibility</td>
      <td style="padding:4px 8px;font-size:10px;font-weight:700;border:1px solid #ddd;width:15%">Deadline</td>
      <td style="padding:4px 8px;font-size:10px;font-weight:700;border:1px solid #ddd;">Work Order / Notes</td>
    </tr>
    ${(data.defects || []).filter(d => d.item?.trim()).map(d => `<tr>
      ${cell(d.item)}
      ${cell(d.responsibility)}
      ${cell(fmtDate(d.deadline))}
      ${cell(d.notes)}
    </tr>`).join('')}
    ${!(data.defects || []).some(d => d.item?.trim())
      ? `<tr><td colspan="4" style="padding:8px;font-size:11px;color:#999;border:1px solid #ddd;">No defects recorded</td></tr>` : ''}
  </table>`

  // General notes
  const generalNotes = data.notes?.trim()
    ? `<div style="background:#f8fafc;border:1px solid #ddd;border-radius:4px;padding:10px 12px;margin-bottom:10px;">
        <strong style="font-size:11px;color:${NAVY};">General Inspection Notes</strong>
        <p style="font-size:11px;color:#333;margin-top:4px;white-space:pre-wrap;">${data.notes}</p>
      </div>`
    : ''

  // Overall assessment
  const overall = `<table width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin-bottom:10px;">
    <tr style="background:${SAFFRON};color:#fff;">
      <td colspan="2" style="padding:7px 10px;font-size:12px;font-weight:700;">Overall Assessment</td>
    </tr>
    <tr>
      <td style="padding:6px 10px;font-size:11px;font-weight:600;border:1px solid #ddd;width:30%">Overall Condition</td>
      <td style="padding:6px 10px;font-size:11px;border:1px solid #ddd;">${data.overallCondition || '—'}</td>
    </tr>
    <tr>
      <td style="padding:6px 10px;font-size:11px;font-weight:600;border:1px solid #ddd;">Lease Violations Observed?</td>
      <td style="padding:6px 10px;font-size:11px;border:1px solid #ddd;">${data.leaseViolations ? `Yes — ${data.violationDetails || ''}` : 'No'}</td>
    </tr>
  </table>`

  // SOP notices
  const sopBox = (text: string) =>
    `<div style="border-left:4px solid ${SAFFRON};background:#fffbeb;padding:8px 12px;margin:6px 0;font-size:10px;color:#555;">${text}</div>`

  const sop006 = sopBox('<strong>SOP 006</strong> — Digital-first inspection. Photograph every room and every defect; add photo references in the Comments column. If the unit appears unoccupied or the tenant is absent without notice, photograph all accessible areas and notify the landlord in writing within 24 hours.')
  const sop008 = isRes ? sopBox('<strong>SOP 008</strong> — Move-out deductions require evidence — photos, comparison report, and invoices/quotes.') : ''
  const sop009 = !isRes ? sopBox('<strong>SOP 009</strong> — Commercial tenants must restore the premises to original condition at lease end (dilapidations). Assess against the original-condition record from lease start.') : ''

  // Signatures
  const sigBlock = (label: string, name = '', sig = '', date = '') =>
    `<td style="padding:10px;border:1px solid #ddd;width:50%;vertical-align:top;">
      <div style="font-size:11px;font-weight:700;background:${NAVY};color:#fff;padding:4px 8px;margin:-10px -10px 8px -10px;">${label}</div>
      <p style="font-size:11px;margin:4px 0;"><strong>Name:</strong> ${name || '&nbsp;'}</p>
      <p style="font-size:11px;margin:4px 0;"><strong>Signature:</strong> ${sig ? `<span style="font-family:cursive;font-size:14px;">${sig}</span>` : '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'}</p>
      <p style="font-size:11px;margin:4px 0;"><strong>Date:</strong> ${fmtDate(date) || '&nbsp;'}</p>
    </td>`

  const sigTable = `<table width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin-bottom:10px;">
    <tr>
      ${sigBlock('INSPECTOR (Tochi Property)', inspection.inspector || '', inspection.inspectorSignature || '', inspection.completedDate)}
      ${sigBlock('TENANT / OCCUPIER REPRESENTATIVE', inspection.tenant?.name || '', inspection.tenantSignature || '', inspection.tenantSignedAt)}
    </tr>
    <tr>
      <td style="padding:8px 10px;font-size:11px;border:1px solid #ddd;">
        <strong>Report shared with tenant:</strong> ${inspection.tenantSignature ? '☑ Yes' : '☐ Yes'} &nbsp; Date: ${fmtDate(inspection.tenantSignedAt) || '___________'}
      </td>
      <td style="padding:8px 10px;font-size:11px;border:1px solid #ddd;">
        <strong>Uploaded to Toru PropTech:</strong> ☑ Yes
      </td>
    </tr>
  </table>`

  // Inspection details header table
  const detailsTable = `<table width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin-bottom:12px;">
    <tbody>
      <tr><td style="padding:5px 10px;font-size:11px;font-weight:700;background:${LIGHT_NAVY};border:1px solid #ddd;width:35%">Property Address &amp; Unit No.</td><td style="padding:5px 10px;font-size:11px;border:1px solid #ddd;">${inspection.property?.address || '—'}${inspection.unit ? ` · Unit ${inspection.unit.unitNumber}` : ''}</td></tr>
      <tr><td style="padding:5px 10px;font-size:11px;font-weight:700;background:${LIGHT_NAVY};border:1px solid #ddd;">Landlord / Property Ref.</td><td style="padding:5px 10px;font-size:11px;border:1px solid #ddd;">${inspection.property?.name || '—'}</td></tr>
      <tr><td style="padding:5px 10px;font-size:11px;font-weight:700;background:${LIGHT_NAVY};border:1px solid #ddd;">Tenant / Occupier Name(s)</td><td style="padding:5px 10px;font-size:11px;border:1px solid #ddd;">${inspection.tenant?.name || '—'}</td></tr>
      <tr><td style="padding:5px 10px;font-size:11px;font-weight:700;background:${LIGHT_NAVY};border:1px solid #ddd;">Inspection Date &amp; Time</td><td style="padding:5px 10px;font-size:11px;border:1px solid #ddd;">${fmtDate(inspection.scheduledDate)}</td></tr>
      <tr><td style="padding:5px 10px;font-size:11px;font-weight:700;background:${LIGHT_NAVY};border:1px solid #ddd;">Inspector Name</td><td style="padding:5px 10px;font-size:11px;border:1px solid #ddd;">${inspection.inspector || '—'}</td></tr>
      <tr><td style="padding:5px 10px;font-size:11px;font-weight:700;background:${LIGHT_NAVY};border:1px solid #ddd;">Tenant Present?</td><td style="padding:5px 10px;font-size:11px;border:1px solid #ddd;">${data.tenantPresent ? '☑ Yes' : `☐ Yes &nbsp; ☑ No &nbsp; Notice given on: ${fmtDate(data.noticeDate)}`}</td></tr>
      <tr><td style="padding:5px 10px;font-size:11px;font-weight:700;background:${LIGHT_NAVY};border:1px solid #ddd;">${isRes ? 'Property Type' : 'Premises Type'}</td><td style="padding:5px 10px;font-size:11px;border:1px solid #ddd;">${data.premisesType || '—'}</td></tr>
      ${isRes ? `<tr><td style="padding:5px 10px;font-size:11px;font-weight:700;background:${LIGHT_NAVY};border:1px solid #ddd;">Furnished?</td><td style="padding:5px 10px;font-size:11px;border:1px solid #ddd;">${data.furnished || '—'}</td></tr>` : ''}
      ${!isRes ? `<tr><td style="padding:5px 10px;font-size:11px;font-weight:700;background:${LIGHT_NAVY};border:1px solid #ddd;">Business Name &amp; Trading Use</td><td style="padding:5px 10px;font-size:11px;border:1px solid #ddd;">${data.businessName || '—'}</td></tr>
        <tr><td style="padding:5px 10px;font-size:11px;font-weight:700;background:${LIGHT_NAVY};border:1px solid #ddd;">Floor / Unit Area</td><td style="padding:5px 10px;font-size:11px;border:1px solid #ddd;">${data.floorArea || '—'}</td></tr>` : ''}
      <tr><td style="padding:5px 10px;font-size:11px;font-weight:700;background:${LIGHT_NAVY};border:1px solid #ddd;">Inspection Type</td><td style="padding:5px 10px;font-size:11px;border:1px solid #ddd;">${INSPECTION_TYPE_LABELS[inspection.type] || inspection.type}</td></tr>
    </tbody>
  </table>`

  // Assemble the full HTML
  // For residential: inject bed/bath matrices between section 3.3 and 3.6
  let checklistBody = ''
  if (isRes) {
    // Sections before bedrooms (3.1, 3.2, 3.3)
    const beforeBeds = RES_SECTION_META.filter(s => ['3.1', '3.2', '3.3'].includes(s.id))
    const afterBeds = RES_SECTION_META.filter(s => !['3.1', '3.2', '3.3'].includes(s.id))
    const beforeHtml = beforeBeds.map(s => {
      const sectionKey = `${s.id} ${s.title}`
      const rows = itemRows(data.items, sectionKey)
      return rows ? `<table width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin-bottom:10px;">
        ${sectionHeader(`${s.id} ${s.title}`, '')}${rows}</table>` : ''
    }).join('')
    const afterHtml = afterBeds.map(s => {
      const sectionKey = `${s.id} ${s.title}`
      const rows = itemRows(data.items, sectionKey)
      return rows ? `<table width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin-bottom:10px;">
        ${sectionHeader(`${s.id} ${s.title}`, (s as any).subtitle || '')}${rows}</table>` : ''
    }).join('')
    checklistBody = beforeHtml + bedMatrix + bathMatrix + afterHtml
  } else {
    checklistBody = sectionTables
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<title>Tochi Property — ${isRes ? 'Residential' : 'Commercial'} Inspection Report</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #222; background: #fff; }
  @media print {
    body { margin: 0; padding: 10mm; }
    .no-print { display: none !important; }
    table { page-break-inside: avoid; }
    h2 { page-break-before: avoid; }
  }
  .page { max-width: 900px; margin: 0 auto; padding: 20px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid ${SAFFRON}; padding-bottom: 10px; margin-bottom: 16px; }
  .header-left { font-size: 22px; font-weight: 800; color: ${NAVY}; letter-spacing: -0.5px; }
  .header-right { font-size: 10px; color: #888; text-align: right; }
  .report-title { text-align: center; margin-bottom: 12px; }
  .report-title h1 { font-size: 18px; font-weight: 800; color: ${NAVY}; text-transform: uppercase; letter-spacing: 1px; }
  .report-title p { font-size: 12px; color: ${SAFFRON}; font-style: italic; }
  .section-title { font-size: 13px; font-weight: 700; color: ${SAFFRON}; border-bottom: 2px solid ${SAFFRON}; padding-bottom: 4px; margin: 14px 0 6px; }
  .footer-bar { text-align: center; font-size: 10px; color: #aaa; border-top: 1px solid #ddd; padding-top: 6px; margin-top: 16px; }
  .btn { display: inline-block; padding: 8px 18px; background: ${NAVY}; color: #fff; border-radius: 6px; text-decoration: none; font-size: 13px; margin-right: 8px; cursor: pointer; border: none; }
  .btn-saffron { background: ${SAFFRON}; }
</style>
</head>
<body>
<div class="page">
  <!-- Print / download controls -->
  <div class="no-print" style="margin-bottom:16px;text-align:right;">
    <button class="btn" onclick="window.print()">🖨 Print / Save as PDF</button>
  </div>

  <!-- Report header -->
  <div class="header">
    <div style="display:flex;align-items:center;gap:10px;">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="145 75 1210 1350" style="height:40px;width:auto;flex-shrink:0;"><path fill="${SAFFRON}" d="M 1253.820312 663.828125 C 1209.265625 708.382812 1154.863281 739.253906 1095.15625 754.324219 L 1095.15625 1080.085938 C 1095.15625 1172.246094 1059.222656 1258.882812 994.050781 1324.027344 C 928.875 1389.203125 842.210938 1425.082031 750.054688 1425.082031 C 657.894531 1425.082031 571.261719 1389.203125 506.085938 1324.027344 C 440.910156 1258.855469 405.007812 1172.246094 405.007812 1080.085938 L 405.007812 359.390625 L 1034.199219 359.390625 C 1067.820312 359.390625 1095.074219 386.425781 1095.074219 420.046875 C 1095.074219 453.667969 1067.820312 480.707031 1034.199219 480.707031 L 527.304688 480.707031 L 527.304688 1080.085938 C 527.304688 1203.390625 627.320312 1303.65625 750.707031 1303.328125 C 874.09375 1302.976562 972.859375 1201.324219 972.859375 1077.9375 L 972.859375 765.152344 L 810.742188 765.152344 L 810.742188 1100.378906 C 810.742188 1134 783.703125 1161.257812 750.082031 1161.257812 C 716.460938 1161.257812 689.421875 1134 689.421875 1100.378906 L 689.421875 642.855469 L 1009.855469 642.855469 C 1133.15625 642.855469 1233.421875 542.34375 1233.09375 418.960938 C 1232.742188 295.574219 1131.089844 196.34375 1007.703125 196.34375 L 490.335938 196.34375 C 367.058594 196.34375 267.558594 296.582031 267.558594 419.859375 L 267.558594 682.894531 C 259.96875 676.828125 253.304688 670.492188 246.613281 663.828125 C 181.4375 598.679688 145.316406 512.042969 145.316406 419.886719 C 145.316406 327.726562 181.195312 241.117188 246.367188 175.972656 C 311.515625 110.824219 398.152344 75 490.308594 75 L 1009.828125 75 C 1101.984375 75 1188.621094 110.824219 1253.769531 175.972656 C 1318.941406 241.144531 1354.820312 327.699219 1354.820312 419.859375 C 1354.820312 512.015625 1318.96875 598.652344 1253.820312 663.828125 Z"/></svg>
      <div>
        <div class="header-left">TOCHI PROPERTY</div>
        <div style="font-size:10px;color:#888;">info@tochiproperty.com · tochiproperty.com · <em>Your Property. Our Pride.</em></div>
      </div>
    </div>
    <div class="header-right">
      ${isRes ? 'Residential' : 'Commercial'} Inspection Report<br/>
      ${fmtDate(inspection.completedDate || inspection.scheduledDate)}<br/>
      Ref: ${inspection.id.slice(-8).toUpperCase()}
    </div>
  </div>

  <div class="report-title">
    <h1>Property Inspection Report</h1>
    <p>${isRes ? 'Residential Properties' : 'Commercial Properties — Offices · Retail · Warehouses'}</p>
  </div>

  <!-- HOW TO USE -->
  <div style="background:#fffbeb;border-left:4px solid ${SAFFRON};padding:8px 12px;margin-bottom:12px;font-size:10px;color:#555;">
    <strong>HOW TO USE:</strong> All inspections are digital-first — complete this form in the Inspection Module on a mobile device wherever possible (SOP 006); this document mirrors the platform form for offline use. Photograph every room and every defect; photo references go in the comments column. Both the inspector and the tenant sign on completion and a copy is shared with the tenant.
    ${isRes ? ' For move-out inspections, this report is compared side-by-side against the move-in report and forms the basis of deposit decisions.' : ''}
  </div>

  <!-- 1. Inspection Details -->
  <div class="section-title">1. Inspection Details</div>
  ${detailsTable}

  <!-- 2. Condition & Action Codes -->
  <div class="section-title">2. Condition &amp; Action Codes</div>
  <p style="font-size:11px;margin-bottom:8px;"><strong>Condition:</strong> N = New · G = Good · F = Fair · P = Poor · D = Damaged · M = Missing · N/A = Not applicable<br/>
  <strong>Action:</strong> OK = No action · CL = Cleaning · RP = Repair · RC = Replace · TC = Tenant charge (evidence required)</p>

  <!-- 3. Condition Checklist -->
  <div class="section-title">3. Condition Checklist</div>
  <p style="font-size:10px;color:#666;margin-bottom:8px;">Mark N/A for any item not present.${!isRes ? ' Document the original condition thoroughly at lease start — commercial tenants must restore the premises to original condition at lease end (dilapidations, SOP 009).' : ''}</p>

  ${checklistBody}
  ${additionalTable}
  ${metersTable}
  ${keysTable}
  ${defectsTable}
  ${sop006}${sop008}${sop009}
  ${generalNotes}
  ${overall}

  <!-- Declarations & Signatures -->
  <div class="section-title">Declarations &amp; Signatures</div>
  <p style="font-size:11px;margin-bottom:8px;">The parties confirm that this report is a true and accurate record of the condition of the property at the date of inspection, subject to any comments noted above.</p>
  ${sigTable}

  <div class="footer-bar">Tochi Property · info@tochiproperty.com · tochiproperty.com · <em>Your Property. Our Pride.</em></div>
</div>
</body>
</html>`
}

async function fetchInspection(id: string) {
  return prisma.inspection.findUnique({
    where: { id },
    include: {
      property: {
        select: { id: true, name: true, address: true, landlordId: true },
      },
      unit: { select: { id: true, unitNumber: true } },
      tenant: { select: { id: true, name: true, email: true } },
    },
  })
}

// GET — return the HTML report
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const inspection = await fetchInspection(id)
    if (!inspection) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const rooms = inspection.rooms as any
    if (!rooms || rooms._v !== 2) {
      return NextResponse.json({ error: 'No checklist data for this inspection' }, { status: 400 })
    }

    const html = buildHtml(inspection, rooms as ChecklistData)
    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  } catch (error) {
    console.error('Report generation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST — email the report to a recipient
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const { to } = await request.json()
    if (!to) return NextResponse.json({ error: 'Recipient email required' }, { status: 400 })

    const inspection = await fetchInspection(id)
    if (!inspection) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const rooms = inspection.rooms as any
    if (!rooms || rooms._v !== 2) {
      return NextResponse.json({ error: 'No checklist data for this inspection' }, { status: 400 })
    }

    const data = rooms as ChecklistData
    const html = buildHtml(inspection, data)
    const typeLabel = INSPECTION_TYPE_LABELS[inspection.type] || inspection.type
    const propName = inspection.property?.name || 'Property'
    const unitStr = inspection.unit ? ` Unit ${inspection.unit.unitNumber}` : ''
    const dateStr = fmtDate(inspection.scheduledDate)

    await sendEmail({
      to,
      subject: `Inspection Report — ${typeLabel} — ${propName}${unitStr} — ${dateStr}`,
      html: `<p>Please find the inspection report attached below.</p>
<p><strong>Property:</strong> ${propName}${unitStr}<br/>
<strong>Type:</strong> ${typeLabel}<br/>
<strong>Date:</strong> ${dateStr}<br/>
<strong>Inspector:</strong> ${inspection.inspector || 'Tochi Property'}</p>
<hr/>
${html}`,
    })

    return NextResponse.json({ success: true, sentTo: to })
  } catch (error) {
    console.error('Email report error:', error)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
