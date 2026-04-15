import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * C2B Confirmation Callback
 * Called by Safaricom when a customer pays to our paybill.
 * We store the raw transaction and flag it for reconciliation.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Safaricom C2B callback payload
    const {
      TransactionType,
      TransID,
      TransTime,
      TransAmount,
      BusinessShortCode,
      BillRefNumber, // account reference (e.g. unit number)
      MSISDN,        // phone number
      FirstName,
      MiddleName,
      LastName,
      OrgAccountBalance,
    } = body;

    // Find the company by shortcode (for multi-tenant, each company has its own paybill)
    // For now, use the first active company
    const company = await prisma.company.findFirst({ where: { status: 'ACTIVE' } });
    if (!company) {
      return NextResponse.json({ ResultCode: 1, ResultDesc: 'No company found' });
    }

    // Parse transaction date: YYYYMMDDHHmmss
    const year = TransTime.slice(0, 4);
    const month = TransTime.slice(4, 6);
    const day = TransTime.slice(6, 8);
    const hour = TransTime.slice(8, 10);
    const min = TransTime.slice(10, 12);
    const sec = TransTime.slice(12, 14);
    const transactionDate = new Date(`${year}-${month}-${day}T${hour}:${min}:${sec}+03:00`);

    await prisma.gatewayTransaction.create({
      data: {
        companyId: company.id,
        gateway: 'MPESA',
        transactionType: 'INBOUND',
        receiptNumber: TransID,
        transactionDate,
        amount: parseFloat(TransAmount),
        senderIdentifier: MSISDN,
        senderName: `${FirstName || ''} ${MiddleName || ''} ${LastName || ''}`.trim() || null,
        accountReference: BillRefNumber || null,
        gatewayBalance: OrgAccountBalance ? parseFloat(OrgAccountBalance) : null,
        rawPayload: body,
        reconciliationStatus: 'UNMATCHED',
      },
    });

    // Respond to Safaricom (must return ResultCode 0 to accept)
    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  } catch (error) {
    console.error('C2B callback error:', error);
    // Still return 0 to Safaricom so they don't retry — we'll reconcile later
    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  }
}
