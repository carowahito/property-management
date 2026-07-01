import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format date consistently for server and client rendering
 * Prevents hydration errors by using a consistent format
 */
export function formatDate(date: string | Date): string {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${day}/${month}/${year}`
}

/** Format a maintenance request refNumber as a human-readable ID, e.g. SR-0042 */
export function formatRefNumber(refNumber: number): string {
  return `SR-${String(refNumber).padStart(4, '0')}`
}

/** Format a lease refNumber as a human-readable ID, e.g. Lease-0001 */
export function formatLeaseRef(refNumber: number | null | undefined): string {
  if (refNumber == null) return '—'
  return `Lease-${String(refNumber).padStart(4, '0')}`
}

/** Format a payment refNumber as a receipt ID, e.g. Receipt-0001 */
export function formatReceiptRef(refNumber: number | null | undefined): string {
  if (refNumber == null) return '—'
  return `Receipt-${String(refNumber).padStart(4, '0')}`
}

/**
 * Format date in US format (MM/DD/YYYY)
 */
export function formatDateUS(date: string | Date): string {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${month}/${day}/${year}`
}

/**
 * Format date in long format (e.g., "15 June 2023")
 */
export function formatDateLong(date: string | Date): string {
  const d = new Date(date)
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
}