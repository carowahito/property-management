'use client';

import { StatementPeriod, STATEMENT_PERIOD_OPTIONS } from '@/lib/statement-period';

interface StatementPeriodSelectProps {
  value: StatementPeriod;
  onChange: (period: StatementPeriod) => void;
  className?: string;
}

export function StatementPeriodSelect({ value, onChange, className }: StatementPeriodSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as StatementPeriod)}
      className={className || 'border border-neutral-300 rounded-md px-3 py-2 text-sm bg-white'}
    >
      {STATEMENT_PERIOD_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
