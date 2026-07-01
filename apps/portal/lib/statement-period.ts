export type StatementPeriod = '3' | '6' | '12' | 'full';

export const STATEMENT_PERIOD_OPTIONS: { value: StatementPeriod; label: string }[] = [
  { value: '3', label: 'Last 3 Months' },
  { value: '6', label: 'Last 6 Months' },
  { value: '12', label: 'Last 1 Year' },
  { value: 'full', label: 'Full Statement' },
];

// Earlier than any realistic tenancy start, used as the lower bound for "Full Statement".
const FULL_STATEMENT_START_DATE = '2000-01-01';

export function getStatementDateRange(period: StatementPeriod): { startDate: string; endDate: string } {
  const endDate = new Date().toISOString().split('T')[0];

  if (period === 'full') {
    return { startDate: FULL_STATEMENT_START_DATE, endDate };
  }

  const months = parseInt(period, 10);
  const startDate = new Date(new Date().setMonth(new Date().getMonth() - months))
    .toISOString()
    .split('T')[0];

  return { startDate, endDate };
}
