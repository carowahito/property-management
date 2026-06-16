'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { StatementPeriod, STATEMENT_PERIOD_OPTIONS } from '@/lib/statement-period';

interface StatementMenuButtonProps {
  onSelect: (period: StatementPeriod) => void;
  label?: string;
  variant?: 'outline' | 'dark';
}

export function StatementMenuButton({ onSelect, label = '📄 Statement', variant = 'outline' }: StatementMenuButtonProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block" ref={containerRef}>
      {variant === 'dark' ? (
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-neutral-800 text-white text-sm font-medium rounded-md hover:bg-neutral-700 transition-colors"
        >
          {label} <span className="text-xs">▾</span>
        </button>
      ) : (
        <Button type="button" variant="outline" onClick={() => setOpen((o) => !o)}>
          {label} <span className="text-xs ml-1">▾</span>
        </Button>
      )}
      {open && (
        <div className="absolute right-0 z-20 mt-1 w-44 bg-white border border-neutral-200 rounded-md shadow-lg py-1">
          {STATEMENT_PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                setOpen(false);
                onSelect(opt.value);
              }}
              className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
