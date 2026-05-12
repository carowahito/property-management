import { NextRequest, NextResponse } from 'next/server';
import { rentProcessor } from '@/lib/services/rent-processor';

// Payouts are now created atomically inside processRentPayment().
// This POST endpoint is kept for backward compatibility but returns a notice.
export async function POST() {
  return NextResponse.json(
    { success: false, message: 'Payouts are now created automatically when processing rent payments. Use POST /api/rent/process instead.' },
    { status: 410 }
  );
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
