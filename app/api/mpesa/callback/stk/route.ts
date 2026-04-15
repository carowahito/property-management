import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * STK Push Callback
 * Called by Safaricom after tenant completes (or cancels) the STK Push prompt.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const callback = body?.Body?.stkCallback;

    if (!callback) {
      return NextResponse.json({ ResultCode: 0 });
    }

    const { ResultCode, ResultDesc, CallbackMetadata } = callback;

    // ResultCode 0 = success, anything else = failed/cancelled
    if (ResultCode !== 0) {
      console.log(`STK Push cancelled/failed: ${ResultDesc}`);
      return NextResponse.json({ ResultCode: 0 });
    }

    // Extract metadata items
    const items = CallbackMetadata?.Item || [];
    const getMeta = (name: string) => items.find((i: any) => i.Name === name)?.Value;

    const amount = getMeta('Amount');
    const mpesaReceipt = getMeta('MpesaReceiptNumber');
    const transactionDate = getMeta('TransactionDate'); // YYYYMMDDHHmmss
    const phoneNumber = String(getMeta('PhoneNumber'));

    if (!mpesaReceipt || !amount) {
      return NextResponse.json({ ResultCode: 0 });
    }

    // Parse date
    const dt = String(transactionDate);
    const parsedDate = new Date(
      `${dt.slice(0, 4)}-${dt.slice(4, 6)}-${dt.slice(6, 8)}T${dt.slice(8, 10)}:${dt.slice(10, 12)}:${dt.slice(12, 14)}+03:00`
    );

    const company = await prisma.company.findFirst({ where: { status: 'ACTIVE' } });
    if (!company) return NextResponse.json({ ResultCode: 0 });

    await prisma.gatewayTransaction.create({
      data: {
        companyId: company.id,
        gateway: 'MPESA',
        transactionType: 'INBOUND',
        receiptNumber: mpesaReceipt,
        transactionDate: parsedDate,
        amount: parseFloat(amount),
        senderIdentifier: phoneNumber,
        transactionDesc: 'STK Push payment',
        rawPayload: body,
        reconciliationStatus: 'UNMATCHED',
      },
    });

    return NextResponse.json({ ResultCode: 0 });
  } catch (error) {
    console.error('STK callback error:', error);
    return NextResponse.json({ ResultCode: 0 });
  }
}
