import { NextRequest, NextResponse } from 'next/server';
import { rentProcessor } from '@/lib/services/rent-processor';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { landlordId, transactionIds, paymentMethod, reference } = body;

    if (!landlordId || !transactionIds || !paymentMethod) {
      return NextResponse.json(
        { success: false, message: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const result = await rentProcessor.createLandlordPayout(
      landlordId,
      transactionIds,
      paymentMethod,
      reference
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error creating payout:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Failed to create payout' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { payoutId, paidDate, reference } = body;

    if (!payoutId || !paidDate || !reference) {
      return NextResponse.json(
        { success: false, message: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const result = await rentProcessor.markPayoutAsPaid(
      payoutId,
      new Date(paidDate),
      reference
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error marking payout as paid:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update payout' },
      { status: 500 }
    );
  }
}
