import { brandedNoticeHtml } from '@/lib/services/brand'
import type { ClearanceState } from '@/lib/services/clearance'

export interface ClearanceDocContext {
  tenantName: string
  propertyName: string
  unitLabel: string
  issuedDate: string
}

/**
 * Branded Clearance to Vacate document (lease clause 8.4), confirming the
 * landlord/agent has cleared the tenant to vacate. Rendered as HTML for the
 * estate management office.
 */
export function buildClearanceHtml(ctx: ClearanceDocContext, state: ClearanceState): string {
  const rows = state.conditions
    .map(
      (c) => `<tr>
        <td style="padding:6px 10px;border-bottom:1px solid #eef1f4;">${c.label}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #eef1f4;color:${c.met ? '#15803d' : '#b91c1c'};font-weight:600;">${c.met ? 'Met' : 'Not met'}</td>
      </tr>`
    )
    .join('')

  const inner = `
    <p>This confirms that the landlord/agent has cleared the following tenant to vacate the property. All conditions of the tenancy move-out process (clause 8.4) have been satisfied.</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:14px;">
      <tr><td style="padding:4px 0;color:#6b7280;width:140px;">Tenant</td><td style="padding:4px 0;font-weight:600;">${ctx.tenantName}</td></tr>
      <tr><td style="padding:4px 0;color:#6b7280;">Property</td><td style="padding:4px 0;font-weight:600;">${ctx.propertyName}${ctx.unitLabel}</td></tr>
      <tr><td style="padding:4px 0;color:#6b7280;">Date issued</td><td style="padding:4px 0;font-weight:600;">${ctx.issuedDate}</td></tr>
    </table>
    <div style="font-family:'Montserrat',Arial,sans-serif;font-size:13px;font-weight:700;color:#1A3A5C;margin:18px 0 8px;">Conditions</div>
    <table style="width:100%;border-collapse:collapse;font-size:14px;border:1px solid #eef1f4;border-radius:6px;overflow:hidden;">
      ${rows}
    </table>
    <p style="margin-top:20px;">The tenant is hereby cleared to vacate.</p>
  `
  return brandedNoticeHtml('Clearance to Vacate', inner)
}
