// Shared move-out guards. A move-out is recorded on Tenant.moveOutDate but does
// not (yet) terminate the lease, so time-driven jobs that iterate ACTIVE leases
// must consult these helpers to avoid chasing or billing a former tenant.

/** True if the tenant had moved out on or before the given day. */
export function hasMovedOutBy(moveOutDate: Date | string | null | undefined, asOf: Date): boolean {
  if (!moveOutDate) return false
  return new Date(moveOutDate) <= asOf
}

/**
 * True if the tenant moved out before the start of the given YYYY-MM period,
 * i.e. the move-out month is earlier than the period month. The move-out month
 * itself is still billable (the tenant occupied part or all of it).
 */
export function movedOutBeforePeriodMonth(
  moveOutDate: Date | string | null | undefined,
  year: number,
  month: number
): boolean {
  if (!moveOutDate) return false
  const mo = new Date(moveOutDate)
  const moMonthStart = new Date(mo.getFullYear(), mo.getMonth(), 1)
  const periodMonthStart = new Date(year, month - 1, 1)
  return periodMonthStart > moMonthStart
}
