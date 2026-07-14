'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal'

interface Condition { key: string; label: string; met: boolean; detail?: string }
interface ClearanceState {
  ready: boolean
  arrearsAmount: number
  balanceDue: number
  conditions: Condition[]
  clearance: {
    id: string
    status: string
    issuedAt: string | null
    officeEmail: string | null
    documentUrl: string | null
  } | null
}

// Conditions the agent can confirm on-site (the rest come from tenant approvals).
const AGENT_CONFIRMABLE = new Set(['balanceSettled', 'keysReturned', 'metersRecorded', 'rentCleared'])

export function ClearancePanel({
  leaseId,
  open,
  onClose,
}: {
  leaseId: string
  open: boolean
  onClose: () => void
}) {
  const [state, setState] = useState<ClearanceState | null>(null)
  const [loading, setLoading] = useState(false)
  const [busy, setBusy] = useState(false)
  const [showIssue, setShowIssue] = useState(false)
  const [toTenant, setToTenant] = useState(true)
  const [toLandlord, setToLandlord] = useState(true)
  const [extraEmails, setExtraEmails] = useState<string[]>([])
  const [emailDraft, setEmailDraft] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/leases/${leaseId}/clearance`)
      if (res.ok) setState(await res.json())
      else setState(null)
    } finally {
      setLoading(false)
    }
  }, [leaseId])

  useEffect(() => {
    if (open) load()
  }, [open, load])

  const issued = state?.clearance?.status === 'ISSUED'

  async function confirmCondition(key: string) {
    setBusy(true)
    try {
      const res = await fetch(`/api/leases/${leaseId}/clearance`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: true }),
      })
      if (res.ok) setState(await res.json())
      else alert((await res.json()).error || 'Failed to update')
    } finally {
      setBusy(false)
    }
  }

  function addEmail() {
    const e = emailDraft.trim()
    if (e && !extraEmails.includes(e)) setExtraEmails([...extraEmails, e])
    setEmailDraft('')
  }

  async function issue() {
    setBusy(true)
    try {
      const res = await fetch(`/api/leases/${leaseId}/clearance/issue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toTenant, toLandlord, extraEmails }),
      })
      const d = await res.json()
      if (res.ok) {
        alert(`Clearance issued and sent to: ${d.sentTo.join(', ')}`)
        setShowIssue(false)
        setState(d.state)
      } else {
        alert(d.error || (d.unmet ? `Conditions not met: ${d.unmet.join(', ')}` : 'Failed to issue'))
      }
    } finally {
      setBusy(false)
    }
  }

  const noRecipients = !toTenant && !toLandlord && extraEmails.length === 0

  return (
    <Modal open={open} onClose={onClose} className="max-w-2xl">
      <ModalHeader>
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold">Clearance to Vacate</h2>
          {issued && <Badge variant="success">ISSUED</Badge>}
          {state && !issued && <Badge variant={state.ready ? 'success' : 'warning'}>{state.ready ? 'READY' : 'BLOCKED'}</Badge>}
        </div>
        <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600">✕</button>
      </ModalHeader>

      <ModalBody>
        {loading && <p className="text-sm text-neutral-500">Loading…</p>}
        {!loading && !state?.clearance && (
          <p className="text-sm text-neutral-600">
            A completed move-out inspection with an approved Statement of Repair Costs is required before a clearance can be prepared.
          </p>
        )}

        {state && state.clearance && (
          <div className="space-y-4">
            <p className="text-sm text-neutral-600">
              A Clearance to Vacate can be issued once all conditions below are met (lease clause 8.4).
            </p>

            <ul className="space-y-2">
              {state.conditions.map((c) => (
                <li key={c.key} className="flex items-center justify-between gap-3 border border-neutral-200 rounded-lg px-3 py-2">
                  <div className="flex items-start gap-2">
                    <span className={c.met ? 'text-success-600' : 'text-neutral-300'}>{c.met ? '✓' : '○'}</span>
                    <div>
                      <p className={`text-sm ${c.met ? 'text-neutral-900' : 'text-neutral-600'}`}>{c.label}</p>
                      {c.detail && <p className="text-xs text-danger-600">{c.detail}</p>}
                    </div>
                  </div>
                  {!c.met && !issued && AGENT_CONFIRMABLE.has(c.key) && (
                    <Button variant="outline" size="sm" onClick={() => confirmCondition(c.key)} disabled={busy}>
                      Mark confirmed
                    </Button>
                  )}
                </li>
              ))}
            </ul>

            {issued && (
              <div className="bg-success-50 border border-success-100 rounded-lg p-4 text-sm text-success-700">
                Clearance issued{state.clearance.issuedAt ? ` on ${new Date(state.clearance.issuedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}` : ''}.
                {state.clearance.officeEmail && <><br />Sent to: {state.clearance.officeEmail}</>}
                {state.clearance.documentUrl && (
                  <><br /><a className="underline" href={state.clearance.documentUrl} target="_blank" rel="noopener noreferrer">View clearance notice</a></>
                )}
              </div>
            )}
          </div>
        )}
      </ModalBody>

      <ModalFooter>
        {state && state.clearance && !issued && (
          <Button
            variant="primary"
            className="mr-auto"
            disabled={!state.ready || busy}
            onClick={() => setShowIssue(true)}
            title={state.ready ? '' : 'All conditions must be met first'}
          >
            Clear Tenant &amp; Issue Clearance Notice
          </Button>
        )}
        <Button variant="outline" onClick={onClose}>Close</Button>
      </ModalFooter>

      {/* Issue + choose recipients */}
      <Modal open={showIssue} onClose={() => setShowIssue(false)} className="max-w-md">
        <ModalHeader>
          <h2 className="text-lg font-semibold">Send Clearance Notice</h2>
          <button onClick={() => setShowIssue(false)} className="text-neutral-400 hover:text-neutral-600">✕</button>
        </ModalHeader>
        <ModalBody>
          <p className="text-sm text-neutral-600 mb-3">Choose who to send the Clearance to Vacate to:</p>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={toTenant} onChange={(e) => setToTenant(e.target.checked)} /> Tenant
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={toLandlord} onChange={(e) => setToLandlord(e.target.checked)} /> Landlord
            </label>
          </div>

          <div className="mt-4">
            <p className="text-sm text-neutral-600 mb-1">Other recipients (e.g. estate management office)</p>
            <div className="flex gap-2">
              <input
                type="email"
                value={emailDraft}
                onChange={(e) => setEmailDraft(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addEmail())}
                placeholder="name@example.com"
                className="flex-1 border border-neutral-300 rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-primary-500"
              />
              <Button variant="outline" size="sm" onClick={addEmail}>Add</Button>
            </div>
            {extraEmails.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {extraEmails.map((e) => (
                  <span key={e} className="inline-flex items-center gap-1 bg-neutral-100 rounded px-2 py-0.5 text-xs">
                    {e}
                    <button className="text-neutral-400 hover:text-danger-600" onClick={() => setExtraEmails(extraEmails.filter((x) => x !== e))}>✕</button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowIssue(false)}>Cancel</Button>
          <Button variant="primary" onClick={issue} disabled={busy || noRecipients}>
            {busy ? 'Sending…' : 'Issue & Send'}
          </Button>
        </ModalFooter>
      </Modal>
    </Modal>
  )
}
