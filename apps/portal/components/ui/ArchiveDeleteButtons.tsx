'use client'

import { useState } from 'react'

interface Props {
  entityName: string        // e.g. "landlord", "tenant", "property"
  entityLabel: string       // e.g. "Anne Musuva", "Unit GWG3-A17"
  archiveUrl: string        // PATCH URL
  deleteUrl: string         // DELETE URL
  isArchived?: boolean      // current state — shows Restore instead of Archive
  onSuccess?: () => void    // called after successful action
  size?: 'sm' | 'md'
}

export default function ArchiveDeleteButtons({
  entityName,
  entityLabel,
  archiveUrl,
  deleteUrl,
  isArchived = false,
  onSuccess,
  size = 'md',
}: Props) {
  const [busy, setBusy] = useState(false)

  const btnBase = size === 'sm'
    ? 'px-2 py-1 text-xs font-medium rounded'
    : 'px-3 py-1.5 text-sm font-medium rounded-lg'

  const archive = async () => {
    const action = isArchived ? 'restore' : 'archive'
    const newStatus = isArchived ? 'INACTIVE' : 'ARCHIVED'
    if (!confirm(`${action === 'archive' ? 'Archive' : 'Restore'} ${entityName} "${entityLabel}"?`)) return
    setBusy(true)
    try {
      const res = await fetch(archiveUrl, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) {
        const err = await res.json()
        alert(err.error || `Failed to ${action}`)
      } else {
        onSuccess?.()
      }
    } catch {
      alert(`Failed to ${action}`)
    } finally {
      setBusy(false)
    }
  }

  const del = async () => {
    if (!confirm(`Permanently delete ${entityName} "${entityLabel}"?\n\nThis cannot be undone.`)) return
    setBusy(true)
    try {
      const res = await fetch(deleteUrl, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json()
        alert(err.error || 'Failed to delete')
      } else {
        onSuccess?.()
      }
    } catch {
      alert('Failed to delete')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex items-center gap-1.5">
      <button
        disabled={busy}
        onClick={archive}
        title={isArchived ? `Restore ${entityName}` : `Archive ${entityName}`}
        className={`${btnBase} bg-neutral-100 text-neutral-600 hover:bg-neutral-200 disabled:opacity-50 transition`}
      >
        {isArchived ? '↩ Restore' : '📦 Archive'}
      </button>
      <button
        disabled={busy}
        onClick={del}
        title={`Delete ${entityName}`}
        className={`${btnBase} bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50 transition`}
      >
        🗑 Delete
      </button>
    </div>
  )
}
