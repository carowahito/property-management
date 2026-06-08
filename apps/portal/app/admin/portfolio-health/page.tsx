'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface TenantScore {
  id: string
  tenantId: string
  leaseId: string
  propertyId: string
  tenantName?: string
  tenantEmail?: string
  propertyName?: string
  paymentScore: string
  paymentNotes: string
  arrearsScore: string
  arrearsNotes: string
  contactScore: string
  contactNotes: string
  inspectionScore: string
  inspectionNotes: string
  overallRisk: string
  redCount: number
  flaggedForDirector: boolean
  recommendedAction: string
  agentNotes?: string
  directorApproved: boolean
  directorApprovedAt?: string
  latePaymentCount: number
  currentBalance: number
  monthlyRent: number
  daysSinceContact?: number
  daysSinceInspection?: number
}

interface PortfolioReview {
  id: string
  period: string
  reviewDate: string
  completedAt?: string
  directorSignedOffAt?: string
  directorSignedOffBy?: string
  directorNotes?: string
  summary: { green: number; amber: number; red: number; flaggedForDirector: number; total: number }
  tenantScores: TenantScore[]
  _count?: { tenantScores: number }
}

const RISK_COLORS: Record<string, string> = {
  GREEN: 'bg-green-100 text-green-800',
  AMBER: 'bg-yellow-100 text-yellow-800',
  RED: 'bg-red-100 text-red-800',
}

const RISK_DOT: Record<string, string> = {
  GREEN: 'bg-green-500',
  AMBER: 'bg-yellow-500',
  RED: 'bg-red-500',
}

function RiskBadge({ score }: { score: string }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${RISK_COLORS[score]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${RISK_DOT[score]}`} />
      {score}
    </span>
  )
}

function DimensionCell({ score, notes }: { score: string; notes: string }) {
  return (
    <td className="px-3 py-2 text-center" title={notes}>
      <RiskBadge score={score} />
    </td>
  )
}

export default function PortfolioHealthPage() {
  const { data: session } = useSession()
  const [reviews, setReviews] = useState<PortfolioReview[]>([])
  const [activeReview, setActiveReview] = useState<PortfolioReview | null>(null)
  const [generating, setGenerating] = useState(false)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState(() => {
    const now = new Date()
    return now.toLocaleString('default', { month: 'long', year: 'numeric' })
  })
  const [directorSignOff, setDirectorSignOff] = useState('')
  const [directorNotes, setDirectorNotes] = useState('')
  const [signingOff, setSigningOff] = useState(false)
  const [filter, setFilter] = useState<'ALL' | 'RED' | 'AMBER' | 'GREEN' | 'DIRECTOR'>('ALL')

  useEffect(() => {
    fetchReviews()
  }, [])

  async function fetchReviews() {
    setLoading(true)
    const res = await fetch('/api/portfolio-health')
    if (res.ok) setReviews(await res.json())
    setLoading(false)
  }

  async function openReview(id: string) {
    const res = await fetch(`/api/portfolio-health/${id}`)
    if (res.ok) setActiveReview(await res.json())
  }

  async function handleGenerate() {
    setGenerating(true)
    const res = await fetch('/api/portfolio-health/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ period, reviewDate: new Date().toISOString() }),
    })
    const data = await res.json()
    if (res.ok) {
      await fetchReviews()
      openReview(data.review.id)
    } else {
      alert(data.error)
    }
    setGenerating(false)
  }

  async function handleDirectorSignOff() {
    if (!activeReview || !directorSignOff.trim()) return
    setSigningOff(true)
    const res = await fetch(`/api/portfolio-health/${activeReview.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ directorSignedOffBy: directorSignOff, directorNotes }),
    })
    if (res.ok) {
      await fetchReviews()
      openReview(activeReview.id)
    }
    setSigningOff(false)
  }

  async function handleAgentNotes(scoreId: string, agentNotes: string) {
    if (!activeReview) return
    await fetch(`/api/portfolio-health/${activeReview.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scoreId, agentNotes }),
    })
  }

  const filteredScores = activeReview?.tenantScores.filter((s) => {
    if (filter === 'ALL') return true
    if (filter === 'DIRECTOR') return s.flaggedForDirector
    return s.overallRisk === filter
  }) ?? []

  return (
    <div className="p-6 max-w-screen-xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Portfolio Health Review</h1>
          <p className="text-sm text-gray-500 mt-0.5">SOP 015 — Monthly tenant risk scoring</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            className="border rounded-lg px-3 py-2 text-sm"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            placeholder="Period (e.g. June 2026)"
          />
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {generating ? 'Generating…' : 'Generate Review'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Review list */}
        <div className="col-span-3">
          <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">Past Reviews</h2>
          {loading ? (
            <p className="text-sm text-gray-400">Loading…</p>
          ) : reviews.length === 0 ? (
            <p className="text-sm text-gray-400">No reviews yet. Generate the first one.</p>
          ) : (
            <ul className="space-y-2">
              {reviews.map((r) => (
                <li key={r.id}>
                  <button
                    onClick={() => openReview(r.id)}
                    className={`w-full text-left p-3 rounded-lg border text-sm transition ${
                      activeReview?.id === r.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <p className="font-medium">{r.period}</p>
                    <p className="text-gray-500 text-xs">
                      {r._count?.tenantScores ?? r.tenantScores?.length ?? 0} tenants
                    </p>
                    <div className="flex gap-2 mt-1">
                      <span className="text-xs text-green-600">{r.summary?.green ?? 0}G</span>
                      <span className="text-xs text-yellow-600">{r.summary?.amber ?? 0}A</span>
                      <span className="text-xs text-red-600">{r.summary?.red ?? 0}R</span>
                    </div>
                    {r.directorSignedOffAt && (
                      <span className="text-xs text-gray-400 block mt-1">✓ Signed off</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Review detail */}
        <div className="col-span-9">
          {!activeReview ? (
            <div className="border-2 border-dashed border-gray-200 rounded-xl h-64 flex items-center justify-center text-gray-400">
              Select a review or generate a new one
            </div>
          ) : (
            <div>
              {/* Summary cards */}
              <div className="grid grid-cols-5 gap-3 mb-6">
                {[
                  { label: 'Total', value: activeReview.summary.total, color: 'gray' },
                  { label: 'Green', value: activeReview.summary.green, color: 'green' },
                  { label: 'Amber', value: activeReview.summary.amber, color: 'yellow' },
                  { label: 'Red', value: activeReview.summary.red, color: 'red' },
                  { label: 'Director', value: activeReview.summary.flaggedForDirector, color: 'purple' },
                ].map(({ label, value, color }) => (
                  <div key={label} className={`p-3 rounded-lg bg-${color}-50 border border-${color}-100`}>
                    <p className={`text-2xl font-bold text-${color}-700`}>{value}</p>
                    <p className={`text-xs text-${color}-600`}>{label}</p>
                  </div>
                ))}
              </div>

              {/* Director sign-off banner */}
              {activeReview.directorSignedOffAt ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 text-sm text-green-800">
                  Signed off by <strong>{activeReview.directorSignedOffBy}</strong> on{' '}
                  {new Date(activeReview.directorSignedOffAt).toLocaleDateString()}
                  {activeReview.directorNotes && (
                    <p className="mt-1 text-green-700">Note: {activeReview.directorNotes}</p>
                  )}
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 text-sm">
                  <p className="font-medium text-amber-800 mb-2">Director Sign-off Required</p>
                  <div className="flex gap-2">
                    <input
                      className="border rounded px-2 py-1 text-sm flex-1"
                      placeholder="Director's name"
                      value={directorSignOff}
                      onChange={(e) => setDirectorSignOff(e.target.value)}
                    />
                    <input
                      className="border rounded px-2 py-1 text-sm flex-1"
                      placeholder="Notes (optional)"
                      value={directorNotes}
                      onChange={(e) => setDirectorNotes(e.target.value)}
                    />
                    <button
                      onClick={handleDirectorSignOff}
                      disabled={signingOff || !directorSignOff.trim()}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
                    >
                      {signingOff ? 'Saving…' : 'Sign Off'}
                    </button>
                  </div>
                </div>
              )}

              {/* Filter tabs */}
              <div className="flex gap-2 mb-4">
                {(['ALL', 'RED', 'AMBER', 'GREEN', 'DIRECTOR'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1 text-xs rounded-full font-medium transition ${
                      filter === f
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {f === 'DIRECTOR' ? 'Director Flagged' : f}
                    {f === 'RED' && activeReview.summary.red > 0 && (
                      <span className="ml-1 bg-red-200 text-red-800 rounded-full px-1">
                        {activeReview.summary.red}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Scores table */}
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">Tenant</th>
                      <th className="px-3 py-2 text-left font-medium">Property</th>
                      <th className="px-3 py-2 text-center font-medium">Payment</th>
                      <th className="px-3 py-2 text-center font-medium">Arrears</th>
                      <th className="px-3 py-2 text-center font-medium">Contact</th>
                      <th className="px-3 py-2 text-center font-medium">Inspection</th>
                      <th className="px-3 py-2 text-center font-medium">Overall</th>
                      <th className="px-3 py-2 text-left font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredScores.map((score) => (
                      <tr key={score.id} className={score.flaggedForDirector ? 'bg-red-50' : ''}>
                        <td className="px-3 py-2">
                          <p className="font-medium">{score.tenantName ?? score.tenantId}</p>
                          {score.flaggedForDirector && (
                            <span className="text-xs text-red-600 font-medium">Director Escalated</span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-gray-500">{score.propertyName ?? '—'}</td>
                        <DimensionCell score={score.paymentScore} notes={score.paymentNotes} />
                        <DimensionCell score={score.arrearsScore} notes={score.arrearsNotes} />
                        <DimensionCell score={score.contactScore} notes={score.contactNotes} />
                        <DimensionCell score={score.inspectionScore} notes={score.inspectionNotes} />
                        <td className="px-3 py-2 text-center">
                          <RiskBadge score={score.overallRisk} />
                        </td>
                        <td className="px-3 py-2 text-xs text-gray-600 max-w-[200px]">
                          {score.recommendedAction}
                        </td>
                      </tr>
                    ))}
                    {filteredScores.length === 0 && (
                      <tr>
                        <td colSpan={8} className="px-3 py-8 text-center text-gray-400">
                          No tenants match this filter
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
