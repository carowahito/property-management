export interface ChecklistItem {
  section: string
  item: string
  condition: string // N | G | F | P | D | M | NA
  action: string    // OK | CL | RP | RC | TC
  comments: string
}

export interface MeterReading {
  meter: string
  meterNo: string
  reading: string
  notes: string
}

export interface KeyEntry {
  item: string
  issued: string
  returned: string
  notes: string
}

export interface DefectEntry {
  item: string
  responsibility: 'LANDLORD' | 'TENANT'
  deadline: string
  notes: string
}

export interface ChecklistData {
  _v: 2
  propertyCategory: 'RESIDENTIAL' | 'COMMERCIAL'
  premisesType: string
  furnished: string         // residential
  businessName: string      // commercial
  floorArea: string         // commercial
  tenantPresent: boolean
  noticeDate: string
  numBedrooms: number       // residential
  numBathrooms: number      // residential
  overallCondition: string  // EXCELLENT | GOOD | FAIR | POOR
  leaseViolations: boolean
  violationDetails: string
  items: ChecklistItem[]
  meters: MeterReading[]
  keys: KeyEntry[]
  defects: DefectEntry[]
}

export const CONDITION_CODES = [
  { value: 'G',  label: 'G — Good' },
  { value: 'N',  label: 'N — New' },
  { value: 'F',  label: 'F — Fair' },
  { value: 'P',  label: 'P — Poor' },
  { value: 'D',  label: 'D — Damaged' },
  { value: 'M',  label: 'M — Missing' },
  { value: 'NA', label: 'N/A' },
]

export const ACTION_CODES = [
  { value: 'OK', label: 'OK' },
  { value: 'CL', label: 'CL — Clean' },
  { value: 'RP', label: 'RP — Repair' },
  { value: 'RC', label: 'RC — Replace' },
  { value: 'TC', label: 'TC — Tenant' },
]

// ── Residential sections ──────────────────────────────────────────────────────

const RES_STATIC: { id: string; title: string; items: string[] }[] = [
  {
    id: '3.1', title: 'Entrance & Hallway',
    items: [
      'Main door, frame & locks', 'Doorbell / intercom',
      'Walls & paintwork', 'Ceiling', 'Flooring / skirting',
      'Lighting & switches', 'Power sockets', 'Windows, locks & screens',
    ],
  },
  {
    id: '3.2', title: 'Living / Dining Room',
    items: [
      'Walls & paintwork', 'Ceiling', 'Flooring / skirting',
      'Windows, locks & screens', 'Curtains / blinds / rails',
      'Lighting & switches', 'Power sockets & TV/data points',
      'Balcony door & locks', 'Built-in units / shelving',
    ],
  },
  {
    id: '3.3', title: 'Kitchen',
    items: [
      'Cabinets & drawers', 'Worktops', 'Sink, taps & water pressure',
      'Drainage under sink', 'Wall tiles / splashback', 'Cooker / oven / hob',
      'Cooker hood / extractor', 'Fridge space & appliances (if provided)',
      'Flooring', 'Lighting & switches', 'Power sockets',
      'Gas point / cylinder area (if applicable)',
    ],
  },
]

const BEDROOM_ITEMS = [
  'Door, frame & locks', 'Walls & paintwork', 'Ceiling', 'Flooring / skirting',
  'Windows, locks & screens', 'Curtains / blinds / rails', 'Wardrobes / closets',
  'Lighting & switches', 'Power sockets',
]

const BATHROOM_ITEMS = [
  'Toilet pan & cistern', 'Wash basin & taps', 'Shower / bathtub & screen',
  'Water pressure & hot water', 'Wall & floor tiles / grout',
  'Drainage (sink, shower, floor trap)', 'Mirror / cabinet / fittings',
  'Extractor fan / ventilation', 'Door & lock', 'Lighting & switches',
]

const RES_TRAILING: { id: string; title: string; items: string[] }[] = [
  {
    id: '3.6', title: 'Laundry / Service Area & DSQ',
    items: [
      'Washing machine point / plumbing', 'Drying lines / area',
      'Service sink & taps', 'DSQ room condition', 'DSQ bathroom', 'DSQ door & locks',
    ],
  },
  {
    id: '3.7', title: 'Exterior, Balcony & Compound',
    items: [
      'Balcony / terrace floor & railings', 'External walls & paintwork',
      'Roof / gutters (visible condition)', 'Garden / lawn / landscaping',
      'Gate & perimeter wall / fence', 'Parking space(s) — condition & oil stains',
      'External lighting', 'Mailbox', 'Water tank & stand', 'Septic / drainage covers',
    ],
  },
  {
    id: '3.8', title: 'Utilities, Safety & Security',
    items: [
      'Distribution board / breakers', 'Electricity meter condition',
      'Water meter condition', 'Water heater / instant shower units',
      'Water pump / borehole supply (if any)', 'Smoke detector(s)',
      'Fire extinguisher / fire blanket', 'Security alarm / panic button',
      'CCTV (if any)', 'Intercom / gate access', 'Generator / backup power (if any)',
    ],
  },
  {
    id: '3.9', title: 'Furnishings & Inventory',
    items: [
      'Sofas / seating', 'Tables & chairs', 'Beds & mattresses',
      'Appliances per inventory', 'Kitchenware per inventory',
      'Other inventory items (list in comments)',
    ],
  },
]

// ── Commercial sections ───────────────────────────────────────────────────────

const COM_SECTIONS: { id: string; title: string; items: string[] }[] = [
  {
    id: '3.1', title: 'Exterior & Frontage',
    items: [
      'Shopfront / façade & glazing', 'External signage & sign boards',
      'Entrance doors & locks', 'Roller shutters / grilles',
      'External walls & paintwork', 'Roof / gutters (visible condition)',
      'Loading bay / ramps', 'Parking & marked bays',
      'External lighting', 'Drainage & gullies', 'Waste / refuse area',
    ],
  },
  {
    id: '3.2', title: 'Internal Areas',
    items: [
      'Walls & partitions', 'Ceilings / suspended ceiling tiles',
      'Flooring & floor coverings', 'Internal doors, frames & locks',
      'Windows, glazing & blinds', 'Staircases & handrails',
      'Reception / front-of-house area', 'Storage rooms', 'Kitchenette / staff area',
    ],
  },
  {
    id: '3.3', title: 'Electrical, Lighting & Data',
    items: [
      'Distribution board(s) & breakers', 'General lighting', 'Emergency lighting',
      'Power sockets & floor boxes', 'Data / network points & trunking',
      'Three-phase supply (if applicable)',
    ],
  },
  {
    id: '3.4', title: 'HVAC, Plumbing & Washrooms',
    items: [
      'Air conditioning units', 'Ventilation / extraction systems',
      'Washroom toilets & cisterns', 'Washroom basins & taps',
      'Hot water supply', 'Wall & floor tiles / grout',
      'Drainage & floor traps', 'Water storage tanks',
    ],
  },
  {
    id: '3.5', title: 'Fire & Life Safety',
    items: [
      'Fire extinguishers (type & service date)', 'Hose reels / hydrants',
      'Fire / smoke alarm system', 'Smoke detectors',
      'Sprinkler system (if any)', 'Emergency exits & escape routes (unobstructed)',
      'Exit signage', 'Fire assembly point signage',
    ],
  },
  {
    id: '3.6', title: 'Security',
    items: [
      'Alarm system & panic buttons', 'CCTV cameras & recorder',
      'Access control / card readers', 'Safes / strongroom (if any)',
      'Security grilles & padlocks', 'Perimeter fence / wall & gates',
    ],
  },
  {
    id: '3.7', title: 'Warehouse / Industrial',
    items: [
      'Racking & shelving condition', 'Warehouse floor surface & load wear',
      'Dock levellers / loading equipment', 'High-level lighting',
      'Skylights / roof lights', 'Mezzanine structures', 'Weighbridge / yard surface',
    ],
  },
  {
    id: '3.8', title: 'Lifts & Common Areas',
    items: [
      'Lifts / elevators (note service certificate)', 'Common corridors & lobbies',
      'Common washrooms', 'Common area lighting', 'Building signage / directory',
    ],
  },
  {
    id: '3.9', title: 'Tenant Alterations & Fit-Out',
    items: [
      'Approved alterations match consents on file',
      'Unauthorised alterations observed', 'Fit-out condition',
      'Reinstatement / dilapidations items (list in comments)',
    ],
  },
  {
    id: '3.10', title: 'Compliance Certificates',
    items: [
      'Fire safety certificate', 'Electrical installation certificate',
      'Lift inspection certificate (if any)', 'Occupancy / business permits displayed',
      'Insurance (building / public liability)',
    ],
  },
]

// ── Keys lists ────────────────────────────────────────────────────────────────

export const RESIDENTIAL_KEY_ITEMS = [
  'Front door keys', 'Bedroom / internal keys', 'Gate / compound keys',
  'Mailbox keys', 'Access cards / fobs / remotes', 'Other',
]

export const COMMERCIAL_KEY_ITEMS = [
  'Main entrance keys', 'Roller shutter keys / remotes', 'Internal / office keys',
  'Access cards / fobs', 'Alarm codes handed over', 'Other',
]

export const DEFAULT_METERS = ['Electricity', 'Water', 'Gas (if applicable)', 'Other']

// ── Builders ─────────────────────────────────────────────────────────────────

function makeItem(section: string, item: string): ChecklistItem {
  return { section, item, condition: 'G', action: 'OK', comments: '' }
}

export function buildResidentialItems(numBedrooms = 2, numBathrooms = 1): ChecklistItem[] {
  const out: ChecklistItem[] = []
  for (const s of RES_STATIC) {
    for (const item of s.items) out.push(makeItem(`${s.id} ${s.title}`, item))
  }
  for (let b = 1; b <= numBedrooms; b++) {
    for (const item of BEDROOM_ITEMS) out.push(makeItem(`3.4 Bedroom ${b}`, item))
  }
  for (let b = 1; b <= numBathrooms; b++) {
    for (const item of BATHROOM_ITEMS) out.push(makeItem(`3.5 Bathroom / WC ${b}`, item))
  }
  for (const s of RES_TRAILING) {
    for (const item of s.items) out.push(makeItem(`${s.id} ${s.title}`, item))
  }
  return out
}

export function buildCommercialItems(): ChecklistItem[] {
  const out: ChecklistItem[] = []
  for (const s of COM_SECTIONS) {
    for (const item of s.items) out.push(makeItem(`${s.id} ${s.title}`, item))
  }
  return out
}

export function defaultChecklistData(
  propertyCategory: 'RESIDENTIAL' | 'COMMERCIAL',
  numBedrooms = 2,
  numBathrooms = 1,
): ChecklistData {
  const keyItems = propertyCategory === 'RESIDENTIAL' ? RESIDENTIAL_KEY_ITEMS : COMMERCIAL_KEY_ITEMS
  return {
    _v: 2,
    propertyCategory,
    premisesType: '',
    furnished: '',
    businessName: '',
    floorArea: '',
    tenantPresent: true,
    noticeDate: '',
    numBedrooms,
    numBathrooms,
    overallCondition: 'GOOD',
    leaseViolations: false,
    violationDetails: '',
    items: propertyCategory === 'RESIDENTIAL'
      ? buildResidentialItems(numBedrooms, numBathrooms)
      : buildCommercialItems(),
    meters: DEFAULT_METERS.map(meter => ({ meter, meterNo: '', reading: '', notes: '' })),
    keys: keyItems.map(item => ({ item, issued: '', returned: '', notes: '' })),
    defects: [{ item: '', responsibility: 'LANDLORD', deadline: '', notes: '' }],
  }
}

export function rebuildItems(data: ChecklistData): ChecklistData {
  const newItems = data.propertyCategory === 'RESIDENTIAL'
    ? buildResidentialItems(data.numBedrooms, data.numBathrooms)
    : buildCommercialItems()
  // Preserve any already-filled data for items that still exist
  const merged = newItems.map(ni => {
    const existing = data.items.find(ei => ei.section === ni.section && ei.item === ni.item)
    return existing || ni
  })
  return { ...data, items: merged }
}
