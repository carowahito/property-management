'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

type Step = 'landlord' | 'property' | 'units' | 'tenant' | 'lease' | 'done'

const STEPS: { key: Step; label: string; num: number }[] = [
  { key: 'landlord', label: 'Landlord', num: 1 },
  { key: 'property', label: 'Property', num: 2 },
  { key: 'units', label: 'Units', num: 3 },
  { key: 'tenant', label: 'Tenant', num: 4 },
  { key: 'lease', label: 'Lease', num: 5 },
]

const PROPERTY_TYPES = ['APARTMENT', 'HOUSE', 'CONDO', 'TOWNHOUSE', 'STUDIO'] as const

interface CreatedIds {
  landlordId: string
  landlordName: string
  propertyId: string
  propertyName: string
  units: { id: string; unitNumber: string; monthlyRent: number }[]
  tenantId: string
  tenantName: string
}

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('landlord')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [created, setCreated] = useState<Partial<CreatedIds>>({})

  // --- Landlord form ---
  const [landlord, setLandlord] = useState({
    name: '', email: '', phone: '', idNumber: '', address: '',
    bankName: '', bankAccount: '', taxId: '', managementFeePercent: '10',
  })

  // --- Property form ---
  const [property, setProperty] = useState({
    name: '', address: '', type: 'APARTMENT' as string, city: 'Nairobi',
    totalUnits: '1', description: '',
  })
  const [existingProperties, setExistingProperties] = useState<{ id: string; name: string; address: string; type: string; city: string | null; totalUnits: number }[]>([])
  const [propertySuggestions, setPropertySuggestions] = useState<typeof existingProperties>([])
  const [selectedExistingProperty, setSelectedExistingProperty] = useState<string | null>(null)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // --- Unit form ---
  const [unit, setUnit] = useState({
    unitNumber: '', floor: '', bedrooms: '', bathrooms: '',
    monthlyRent: '', serviceCharge: '', description: '',
  })

  // --- Tenant form ---
  const [tenant, setTenant] = useState({
    name: '', email: '', phone: '', idNumber: '',
    emergencyContact: '', emergencyPhone: '', unitId: '',
  })

  // --- Lease form ---
  const [lease, setLease] = useState({
    unitId: '', startDate: '', endDate: '', monthlyRent: '',
    securityDeposit: '', terms: '',
  })

  // Fetch existing properties when entering property step
  useEffect(() => {
    if (step === 'property') {
      fetch('/api/properties')
        .then(res => res.json())
        .then(data => setExistingProperties(data.properties || []))
        .catch(() => {})
    }
  }, [step])

  // Filter suggestions as user types property name
  useEffect(() => {
    if (property.name.length >= 2 && !selectedExistingProperty) {
      const query = property.name.toLowerCase()
      const matches = existingProperties.filter(p => p.name.toLowerCase().includes(query))
      setPropertySuggestions(matches)
      setShowSuggestions(matches.length > 0)
    } else {
      setShowSuggestions(false)
    }
  }, [property.name, existingProperties, selectedExistingProperty])

  // Close suggestions on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const selectExistingProperty = (p: typeof existingProperties[0]) => {
    setSelectedExistingProperty(p.id)
    setProperty({ name: p.name, address: p.address, type: p.type, city: p.city || 'Nairobi', totalUnits: String(p.totalUnits), description: '' })
    setShowSuggestions(false)
  }

  const clearSelectedProperty = () => {
    setSelectedExistingProperty(null)
    setProperty({ name: '', address: '', type: 'APARTMENT', city: 'Nairobi', totalUnits: '1', description: '' })
  }

  const handleInput = (setter: any) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setter((prev: any) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const save = async (url: string, body: any) => {
    setError('')
    setSaving(true)
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || data.details?.[0]?.message || 'Something went wrong')
        return null
      }
      return data
    } catch {
      setError('Network error. Please try again.')
      return null
    } finally {
      setSaving(false)
    }
  }

  const saveLandlord = async () => {
    const data = await save('/api/landlords', {
      ...landlord,
      managementFeePercent: parseFloat(landlord.managementFeePercent) || 10,
    })
    if (data) {
      setCreated(prev => ({ ...prev, landlordId: data.id, landlordName: data.name }))
      setStep('property')
    }
  }

  const saveProperty = async () => {
    if (selectedExistingProperty) {
      // Use existing property — skip creation
      setCreated(prev => ({ ...prev, propertyId: selectedExistingProperty, propertyName: property.name, units: [] }))
      setStep('units')
      return
    }
    const data = await save('/api/properties', {
      ...property,
      landlordId: created.landlordId,
      totalUnits: parseInt(property.totalUnits) || 1,
    })
    if (data) {
      setCreated(prev => ({ ...prev, propertyId: data.id, propertyName: data.name, units: [] }))
      setStep('units')
    }
  }

  const addUnit = async () => {
    const data = await save('/api/units', {
      ...unit,
      propertyId: created.propertyId,
      landlordId: created.landlordId,
      monthlyRent: parseFloat(unit.monthlyRent) || 0,
      floor: unit.floor ? parseInt(unit.floor) : undefined,
      bedrooms: unit.bedrooms ? parseInt(unit.bedrooms) : undefined,
      bathrooms: unit.bathrooms ? parseInt(unit.bathrooms) : undefined,
      serviceCharge: unit.serviceCharge ? parseFloat(unit.serviceCharge) : undefined,
    })
    if (data) {
      setCreated(prev => ({
        ...prev,
        units: [...(prev.units || []), { id: data.id, unitNumber: data.unitNumber, monthlyRent: Number(data.monthlyRent) }],
      }))
      setUnit({ unitNumber: '', floor: '', bedrooms: '', bathrooms: '', monthlyRent: '', serviceCharge: '', description: '' })
      setError('')
    }
  }

  const saveTenant = async () => {
    const selectedUnit = created.units?.find(u => u.id === tenant.unitId)
    const data = await save('/api/tenants', {
      ...tenant,
      propertyId: created.propertyId,
      unit: selectedUnit?.unitNumber || '',
      moveInDate: new Date().toISOString(),
    })
    if (data) {
      setCreated(prev => ({ ...prev, tenantId: data.id, tenantName: data.name }))
      setLease(prev => ({
        ...prev,
        unitId: tenant.unitId,
        monthlyRent: selectedUnit ? String(selectedUnit.monthlyRent) : '',
        securityDeposit: selectedUnit ? String(selectedUnit.monthlyRent) : '',
      }))
      setStep('lease')
    }
  }

  const saveLease = async () => {
    const selectedUnit = created.units?.find(u => u.id === lease.unitId)
    const data = await save('/api/leases', {
      tenantId: created.tenantId,
      propertyId: created.propertyId,
      unitId: lease.unitId || undefined,
      unit: selectedUnit?.unitNumber || '',
      startDate: lease.startDate,
      endDate: lease.endDate,
      monthlyRent: parseFloat(lease.monthlyRent) || 0,
      securityDeposit: parseFloat(lease.securityDeposit) || 0,
      terms: lease.terms || undefined,
      status: 'ACTIVE',
    })
    if (data) {
      setStep('done')
    }
  }

  const stepIndex = STEPS.findIndex(s => s.key === step)

  const inputClass = 'w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm'
  const labelClass = 'block text-sm font-medium text-neutral-700 mb-1'

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">Property Onboarding</h1>
        <p className="text-neutral-600 mt-1">Add a landlord, their property, units, and tenants step by step.</p>
      </div>

      {/* Progress bar */}
      {step !== 'done' && (
        <div className="flex items-center mb-8">
          {STEPS.map((s, i) => (
            <div key={s.key} className="flex items-center flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                i < stepIndex ? 'bg-success-600 text-white' :
                i === stepIndex ? 'bg-primary-600 text-white' :
                'bg-neutral-200 text-neutral-500'
              }`}>
                {i < stepIndex ? '✓' : s.num}
              </div>
              <span className={`ml-2 text-sm font-medium hidden sm:inline ${
                i === stepIndex ? 'text-primary-700' : 'text-neutral-500'
              }`}>
                {s.label}
              </span>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-3 ${i < stepIndex ? 'bg-success-600' : 'bg-neutral-200'}`} />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-danger-50 border border-danger-200 rounded-lg text-sm text-danger-700">
          {error}
        </div>
      )}

      {/* STEP 1: Landlord */}
      {step === 'landlord' && (
        <div className="bg-surface rounded-lg border border-neutral-200 p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-1">Step 1: Add Landlord</h2>
          <p className="text-sm text-neutral-500 mb-6">The property owner. Their details are used for statements and payouts.</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Full Name *</label>
              <input name="name" value={landlord.name} onChange={handleInput(setLandlord)} className={inputClass} placeholder="Ann Karuga" required />
            </div>
            <div>
              <label className={labelClass}>Email *</label>
              <input name="email" type="email" value={landlord.email} onChange={handleInput(setLandlord)} className={inputClass} placeholder="ann@example.com" />
            </div>
            <div>
              <label className={labelClass}>Phone *</label>
              <input name="phone" type="tel" value={landlord.phone} onChange={handleInput(setLandlord)} className={inputClass} placeholder="+254 7XX XXX XXX" />
            </div>
            <div>
              <label className={labelClass}>ID / Passport Number</label>
              <input name="idNumber" value={landlord.idNumber} onChange={handleInput(setLandlord)} className={inputClass} />
            </div>
            <div className="col-span-2">
              <label className={labelClass}>Address</label>
              <input name="address" value={landlord.address} onChange={handleInput(setLandlord)} className={inputClass} placeholder="P.O. Box 12345, Nairobi" />
            </div>
            <div>
              <label className={labelClass}>Bank Name</label>
              <input name="bankName" value={landlord.bankName} onChange={handleInput(setLandlord)} className={inputClass} placeholder="Equity Bank" />
            </div>
            <div>
              <label className={labelClass}>Bank Account</label>
              <input name="bankAccount" value={landlord.bankAccount} onChange={handleInput(setLandlord)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>KRA PIN</label>
              <input name="taxId" value={landlord.taxId} onChange={handleInput(setLandlord)} className={inputClass} placeholder="A123456789B" />
            </div>
            <div>
              <label className={labelClass}>Management Fee (%)</label>
              <input name="managementFeePercent" type="number" min="0" max="100" value={landlord.managementFeePercent} onChange={handleInput(setLandlord)} className={inputClass} />
            </div>
          </div>
          <div className="flex justify-end mt-6">
            <Button variant="primary" onClick={saveLandlord} disabled={saving || !landlord.name || !landlord.email || !landlord.phone}>
              {saving ? 'Saving...' : 'Save & Continue →'}
            </Button>
          </div>
        </div>
      )}

      {/* STEP 2: Property */}
      {step === 'property' && (
        <div className="bg-surface rounded-lg border border-neutral-200 p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-1">Step 2: Add Property</h2>
          <p className="text-sm text-neutral-500 mb-6">
            The building owned by <span className="font-medium text-neutral-700">{created.landlordName}</span>.
            If the property already exists, start typing to select it.
          </p>

          {/* Selected existing property banner */}
          {selectedExistingProperty && (
            <div className="mb-4 p-3 bg-primary-50 border border-primary-200 rounded-lg flex items-center justify-between">
              <span className="text-sm text-primary-800">
                Using existing property: <strong>{property.name}</strong> — {property.address}
              </span>
              <button onClick={clearSelectedProperty} className="text-primary-600 hover:text-primary-800 text-sm font-medium">
                Change
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="relative" ref={suggestionsRef}>
              <label className={labelClass}>Property Name *</label>
              <input
                name="name"
                value={property.name}
                onChange={(e) => {
                  setProperty(prev => ({ ...prev, name: e.target.value }))
                  if (selectedExistingProperty) setSelectedExistingProperty(null)
                }}
                onFocus={() => {
                  if (propertySuggestions.length > 0 && !selectedExistingProperty) setShowSuggestions(true)
                }}
                className={inputClass}
                placeholder="Start typing to search or enter a new name..."
                disabled={!!selectedExistingProperty}
              />
              {showSuggestions && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-neutral-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  <p className="px-3 py-1.5 text-xs text-neutral-500 border-b border-neutral-100">Existing properties</p>
                  {propertySuggestions.map(p => (
                    <button
                      key={p.id}
                      onClick={() => selectExistingProperty(p)}
                      className="w-full text-left px-3 py-2 hover:bg-primary-50 transition text-sm"
                    >
                      <span className="font-medium text-neutral-900">{p.name}</span>
                      <span className="text-neutral-500 ml-2">— {p.address}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className={labelClass}>Type *</label>
              <select name="type" value={property.type} onChange={handleInput(setProperty)} className={inputClass} disabled={!!selectedExistingProperty}>
                {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className={labelClass}>Address *</label>
              <input name="address" value={property.address} onChange={handleInput(setProperty)} className={inputClass} placeholder="Athi River, Machakos County" disabled={!!selectedExistingProperty} />
            </div>
            <div>
              <label className={labelClass}>City</label>
              <input name="city" value={property.city} onChange={handleInput(setProperty)} className={inputClass} disabled={!!selectedExistingProperty} />
            </div>
            <div>
              <label className={labelClass}>Total Units</label>
              <input name="totalUnits" type="number" min="1" value={property.totalUnits} onChange={handleInput(setProperty)} className={inputClass} disabled={!!selectedExistingProperty} />
            </div>
            {!selectedExistingProperty && (
              <div className="col-span-2">
                <label className={labelClass}>Description</label>
                <textarea name="description" value={property.description} onChange={handleInput(setProperty)} className={inputClass} rows={2} placeholder="Brief description of the property..." />
              </div>
            )}
          </div>
          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={() => setStep('landlord')}>← Back</Button>
            <Button variant="primary" onClick={saveProperty} disabled={saving || !property.name || !property.address}>
              {saving ? 'Saving...' : selectedExistingProperty ? 'Use This Property →' : 'Save & Continue →'}
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3: Units */}
      {step === 'units' && (
        <div className="bg-surface rounded-lg border border-neutral-200 p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-1">Step 3: Add Units</h2>
          <p className="text-sm text-neutral-500 mb-6">
            Add units to <span className="font-medium text-neutral-700">{created.propertyName}</span>. You can add multiple units before continuing.
          </p>

          {/* Added units */}
          {created.units && created.units.length > 0 && (
            <div className="mb-6">
              <p className="text-sm font-medium text-neutral-700 mb-2">{created.units.length} unit{created.units.length !== 1 ? 's' : ''} added:</p>
              <div className="flex flex-wrap gap-2">
                {created.units.map(u => (
                  <span key={u.id} className="px-3 py-1 bg-success-50 text-success-700 rounded-full text-sm font-medium">
                    {u.unitNumber} — KES {u.monthlyRent.toLocaleString()}/mo
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Unit Number *</label>
              <input name="unitNumber" value={unit.unitNumber} onChange={handleInput(setUnit)} className={inputClass} placeholder="A-101" />
            </div>
            <div>
              <label className={labelClass}>Monthly Rent (KES) *</label>
              <input name="monthlyRent" type="number" min="1" value={unit.monthlyRent} onChange={handleInput(setUnit)} className={inputClass} placeholder="25000" />
            </div>
            <div>
              <label className={labelClass}>Floor</label>
              <input name="floor" type="number" value={unit.floor} onChange={handleInput(setUnit)} className={inputClass} placeholder="1" />
            </div>
            <div>
              <label className={labelClass}>Bedrooms</label>
              <input name="bedrooms" type="number" value={unit.bedrooms} onChange={handleInput(setUnit)} className={inputClass} placeholder="2" />
            </div>
            <div>
              <label className={labelClass}>Bathrooms</label>
              <input name="bathrooms" type="number" value={unit.bathrooms} onChange={handleInput(setUnit)} className={inputClass} placeholder="1" />
            </div>
            <div>
              <label className={labelClass}>Service Charge (KES)</label>
              <input name="serviceCharge" type="number" value={unit.serviceCharge} onChange={handleInput(setUnit)} className={inputClass} placeholder="3000" />
            </div>
          </div>
          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={() => setStep('property')}>← Back</Button>
            <div className="flex gap-3">
              <Button variant="outline" onClick={addUnit} disabled={saving || !unit.unitNumber || !unit.monthlyRent}>
                {saving ? 'Adding...' : '+ Add Unit'}
              </Button>
              <Button variant="primary" onClick={() => { setError(''); setStep('tenant') }} disabled={!created.units?.length}>
                Continue →
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: Tenant */}
      {step === 'tenant' && (
        <div className="bg-surface rounded-lg border border-neutral-200 p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-1">Step 4: Add Tenant</h2>
          <p className="text-sm text-neutral-500 mb-6">
            Assign a tenant to a unit in <span className="font-medium text-neutral-700">{created.propertyName}</span>.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Full Name *</label>
              <input name="name" value={tenant.name} onChange={handleInput(setTenant)} className={inputClass} placeholder="Jane Doe" />
            </div>
            <div>
              <label className={labelClass}>Email *</label>
              <input name="email" type="email" value={tenant.email} onChange={handleInput(setTenant)} className={inputClass} placeholder="jane@example.com" />
            </div>
            <div>
              <label className={labelClass}>Phone *</label>
              <input name="phone" type="tel" value={tenant.phone} onChange={handleInput(setTenant)} className={inputClass} placeholder="+254 7XX XXX XXX" />
            </div>
            <div>
              <label className={labelClass}>ID Number</label>
              <input name="idNumber" value={tenant.idNumber} onChange={handleInput(setTenant)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Assign to Unit *</label>
              <select name="unitId" value={tenant.unitId} onChange={handleInput(setTenant)} className={inputClass}>
                <option value="">Select unit...</option>
                {created.units?.map(u => (
                  <option key={u.id} value={u.id}>{u.unitNumber} — KES {u.monthlyRent.toLocaleString()}/mo</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Emergency Contact</label>
              <input name="emergencyContact" value={tenant.emergencyContact} onChange={handleInput(setTenant)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Emergency Phone</label>
              <input name="emergencyPhone" value={tenant.emergencyPhone} onChange={handleInput(setTenant)} className={inputClass} />
            </div>
          </div>
          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={() => setStep('units')}>← Back</Button>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => { setError(''); setStep('done') }}>Skip (no tenant yet)</Button>
              <Button variant="primary" onClick={saveTenant} disabled={saving || !tenant.name || !tenant.email || !tenant.phone || !tenant.unitId}>
                {saving ? 'Saving...' : 'Save & Continue →'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 5: Lease */}
      {step === 'lease' && (
        <div className="bg-surface rounded-lg border border-neutral-200 p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-1">Step 5: Create Lease</h2>
          <p className="text-sm text-neutral-500 mb-6">
            Set up the lease for <span className="font-medium text-neutral-700">{created.tenantName}</span>.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Unit</label>
              <select name="unitId" value={lease.unitId} onChange={handleInput(setLease)} className={inputClass}>
                <option value="">Select unit...</option>
                {created.units?.map(u => (
                  <option key={u.id} value={u.id}>{u.unitNumber}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Monthly Rent (KES) *</label>
              <input name="monthlyRent" type="number" value={lease.monthlyRent} onChange={handleInput(setLease)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Start Date *</label>
              <input name="startDate" type="date" value={lease.startDate} onChange={handleInput(setLease)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>End Date *</label>
              <input name="endDate" type="date" value={lease.endDate} onChange={handleInput(setLease)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Security Deposit (KES) *</label>
              <input name="securityDeposit" type="number" value={lease.securityDeposit} onChange={handleInput(setLease)} className={inputClass} />
            </div>
            <div className="col-span-2">
              <label className={labelClass}>Special Terms</label>
              <textarea name="terms" value={lease.terms} onChange={handleInput(setLease)} className={inputClass} rows={2} placeholder="Any special conditions..." />
            </div>
          </div>
          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={() => setStep('tenant')}>← Back</Button>
            <Button variant="primary" onClick={saveLease} disabled={saving || !lease.startDate || !lease.endDate || !lease.monthlyRent || !lease.securityDeposit}>
              {saving ? 'Saving...' : 'Create Lease & Finish ✓'}
            </Button>
          </div>
        </div>
      )}

      {/* DONE */}
      {step === 'done' && (
        <div className="bg-surface rounded-lg border border-neutral-200 p-6 text-center">
          <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✓</span>
          </div>
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">Onboarding Complete</h2>
          <p className="text-neutral-600 mb-6">
            {created.landlordName && <span>Landlord <strong>{created.landlordName}</strong></span>}
            {created.propertyName && <span> → Property <strong>{created.propertyName}</strong></span>}
            {created.units && created.units.length > 0 && <span> → {created.units.length} unit{created.units.length !== 1 ? 's' : ''}</span>}
            {created.tenantName && <span> → Tenant <strong>{created.tenantName}</strong></span>}
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => {
              setStep('landlord')
              setCreated({})
              setLandlord({ name: '', email: '', phone: '', idNumber: '', address: '', bankName: '', bankAccount: '', taxId: '', managementFeePercent: '10' })
              setProperty({ name: '', address: '', type: 'APARTMENT', city: 'Nairobi', totalUnits: '1', description: '' })
              setSelectedExistingProperty(null)
              setUnit({ unitNumber: '', floor: '', bedrooms: '', bathrooms: '', monthlyRent: '', serviceCharge: '', description: '' })
              setTenant({ name: '', email: '', phone: '', idNumber: '', emergencyContact: '', emergencyPhone: '', unitId: '' })
              setLease({ unitId: '', startDate: '', endDate: '', monthlyRent: '', securityDeposit: '', terms: '' })
              setError('')
            }}>
              + Onboard Another
            </Button>
            <Button variant="primary" onClick={() => router.push('/admin')}>
              Go to Dashboard
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
