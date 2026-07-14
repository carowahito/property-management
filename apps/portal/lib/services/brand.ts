// Shared Tochi Property brand assets for tenant-facing documents/emails.
// Email-safe by design: a hosted PNG logo (email clients strip inline SVG) and
// a table-based header (email clients ignore flexbox).

export const LOGO_URL = 'https://cmztpieifqohbathtnti.supabase.co/storage/v1/object/public/brand/tochi-icon.png'
export const brandTagline = 'Your Property. Our Pride.'
// Phone omitted for now (number pending confirmation).
export const brandContactLine = 'info@tochiproperty.com&nbsp;&nbsp;|&nbsp;&nbsp;tochiproperty.com'

/**
 * Email-safe branded header: logo image + wordmark on the left, optional
 * rightHtml on the right (e.g. a document title), followed by the tagline,
 * contact line and divider. Uses a table + inline styles so it renders
 * consistently in Gmail, Outlook, Apple Mail, etc.
 */
export function brandHeaderTable(rightHtml = ''): string {
  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
    <tr>
      <td style="vertical-align:middle;">
        <img src="${LOGO_URL}" width="42" height="42" alt="Tochi Property" style="display:inline-block;vertical-align:middle;border:0;">
        <span style="font-family:'Montserrat',Arial,sans-serif;font-weight:700;font-size:20px;color:#1A3A5C;letter-spacing:0.5px;vertical-align:middle;padding-left:10px;">TOCHI PROPERTY</span>
      </td>
      <td style="vertical-align:middle;text-align:right;">${rightHtml}</td>
    </tr>
  </table>
  <div style="font-size:11px;color:#6b7280;font-style:italic;margin-top:6px;">${brandTagline}</div>
  <div style="font-size:11px;color:#6b7280;margin-top:2px;">${brandContactLine}</div>
  <hr style="border:none;border-top:3px solid #1A3A5C;margin:14px 0 18px;">`
}

/**
 * Wrap simple notice content in the branded email shell (logo, tagline and
 * contact line). All inline-styled for email-client compatibility.
 */
export function brandedNoticeHtml(title: string, innerHtml: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700&family=Open+Sans:wght@400;600&display=swap" rel="stylesheet">
  <title>${title} - Tochi Property</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f8;font-family:'Open Sans',Arial,sans-serif;color:#1a1a1a;">
  <div style="max-width:680px;margin:24px auto;background:#ffffff;border-radius:6px;padding:32px;box-shadow:0 2px 12px rgba(0,0,0,0.1);">
    ${brandHeaderTable()}
    <div style="font-family:'Montserrat',Arial,sans-serif;font-size:16px;font-weight:700;color:#1A3A5C;margin-bottom:12px;">${title}</div>
    <div style="font-size:14px;color:#374151;line-height:1.6;">${innerHtml}</div>
  </div>
</body>
</html>`
}
