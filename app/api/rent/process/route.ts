import { NextRequest, NextResponse } from 'next/server';
import { rentProcessor } from '@/lib/services/rent-processor';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentId, paymentIds, config } = body;

    // Process single payment
    if (paymentId) {
      const result = await rentProcessor.processRentPayment(paymentId, config);
      return NextResponse.json(result);
    }

    // Process multiple payments
    if (paymentIds && Array.isArray(paymentIds)) {
      const results = await rentProcessor.processBatchRentPayments(paymentIds, config);
      return NextResponse.json({ results, success: true });
    }

    return NextResponse.json(
      { success: false, message: 'Missing paymentId or paymentIds' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error processing rent:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Failed to process rent' },
      { status: 500 }
    );
  }
}

// Get rent transactions for a period
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const landlordId = searchParams.get('landlordId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!landlordId || !startDate || !endDate) {
      return NextResponse.json(
        { success: false, message: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const transactions = await rentProcessor.getRentTransactionsForPeriod(
      landlordId,
      new Date(startDate),
      new Date(endDate)
    );

    return NextResponse.json({ transactions, success: true });
  } catch (error) {
    console.error('Error fetching rent transactions:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}
