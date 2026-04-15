import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * B2C Result Callback
 * Called by Safaricom after a Business-to-Customer payout completes.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = body?.Result;

    if (!result) {
      return NextResponse.json({ ResultCode: 0 });
    }

    const { ResultCode, ResultDesc, ResultParameters } = result;

    if (ResultCode !== 0) {
      console.log(`B2C payout failed: ${ResultDesc}`);
      return NextResponse.json({ ResultCode: 0 });
    }

    const params = ResultParameters?.ResultParameter || [];
    const getParam = (name: string) => params.find((p: any) => p.Key === name)?.Value;

    const amount = getParam('TransactionAmount');
    const mpesaReceipt = getParam('TransactionReceipt');
    const receiverPhone = String(getParam('ReceiverPartyPublicName') || '').split(' - ')[0];
    const transactionDate = getParam('TransactionCompletedDateTime'); // DD.MM.YYYY HH:mm:ss
    const receiverName = getParam('ReceiverPartyPublicName');

    if (!mpesaReceipt || !amount) {
      return NextResponse.json({ ResultCode: 0 });
    }

    // Parse date: "DD.MM.YYYY HH:mm:ss"
    let parsedDate = new Date();
    if (transactionDate) {
      const [datePart, timePart] = transactionDate.split(' ');
      const [dd, mm, yyyy] = datePart.split('.');
      parsedDate = new Date(`${yyyy}-${mm}-${dd}T${timePart}+03:00`);
    }

    const company = await prisma.company.findFirst({ where: { status: 'ACTIVE' } });
    if (!company) return NextResponse.json({ ResultCode: 0 });

    await prisma.gatewayTransaction.create({
      data: {
        companyId: company.id,
        gateway: 'MPESA',
        transactionType: 'OUTBOUND',
        receiptNumber: mpesaReceipt,
        transactionDate: parsedDate,
        amount: parseFloat(amount),
        recipientIdentifier: receiverPhone,
        recipientName: receiverName || null,
        rawPayload: body,
        reconciliationStatus: 'UNMATCHED',
      },
    });

    return NextResponse.json({ ResultCode: 0 });
  } catch (error) {
    console.error('B2C callback error:', error);
    return NextResponse.json({ ResultCode: 0 });
  }
}
