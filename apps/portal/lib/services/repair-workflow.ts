/**
 * Repairs workflow constants and helpers (brief §6 & §9).
 * All business rules live here so they can be changed in one place.
 */

import { prisma } from '@/lib/db'

// ── Configurable thresholds (§9) ────────────────────────────────────────────

export const DEPOSIT_THRESHOLD = 10_000       // KSh — deposit required at/above this
export const DEPOSIT_PCT       = 0.5          // 50% of quote amount
export const MULTI_QUOTE_THRESHOLD = 15_000   // KSh — minimum 3 quotes required
export const QUOTE_VALIDITY_DAYS   = 7        // days before a quote auto-expires

// ── Status helpers ───────────────────────────────────────────────────────────

export const TERMINAL_STATUSES = ['CLOSED', 'COMPLETED', 'CANCELLED'] as const

/** Statuses that still need the agent to act */
export const ACTIVE_STATUSES = [
  'NEW', 'PENDING',
  'UNDER_REVIEW',
  'RESPONSIBILITY_ASSIGNED',
  'QUOTING',
  'AWAITING_APPROVAL',
  'AWAITING_FUNDS',
  'IN_PROGRESS',
  'COMPLETED_PENDING_CONFIRMATION',
  'DISPUTED',
] as const

// ── Quote helpers ────────────────────────────────────────────────────────────

export function quoteValidUntil(issuedAt = new Date()): Date {
  const d = new Date(issuedAt)
  d.setDate(d.getDate() + QUOTE_VALIDITY_DAYS)
  return d
}

export function isQuoteExpired(validUntil: Date): boolean {
  return new Date() > new Date(validUntil)
}

// ── Deposit calculation ──────────────────────────────────────────────────────

export function calcDeposit(amount: number): { required: boolean; depositAmount: number; balanceAmount: number } {
  const required = amount >= DEPOSIT_THRESHOLD
  const depositAmount = required ? Math.ceil(amount * DEPOSIT_PCT) : 0
  const balanceAmount = required ? amount - depositAmount : amount
  return { required, depositAmount, balanceAmount }
}

// ── Audit log helper ─────────────────────────────────────────────────────────

export async function appendAudit(
  maintenanceRequestId: string,
  actor: string,
  actorName: string | undefined | null,
  fromStatus: string | null,
  toStatus: string | null,
  note?: string
) {
  await prisma.maintenanceAuditLog.create({
    data: {
      maintenanceRequestId,
      actor,
      actorName: actorName ?? undefined,
      fromStatus: fromStatus ?? undefined,
      toStatus: toStatus ?? undefined,
      note,
    },
  })
}
