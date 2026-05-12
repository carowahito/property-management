import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Nav } from '@/components/Nav'
import { Footer } from '@/components/Footer'
import { LISTINGS, findListing, type Listing } from '@/lib/listings'
import s from '@/styles/shared.module.css'
import p from './page.module.css'

type Params = Promise<{ slug: string }>

export function generateStaticParams() {
  return LISTINGS.map((listing) => ({ slug: listing.slug }))
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params
  const listing = findListing(slug)
  if (!listing) return { title: 'Listing not found — Tochi Property' }
  return {
    title: `${listing.title} · ${listing.area} — Tochi Property`,
    description: `${listing.beds}, ${listing.baths}, ${listing.size}. ${listing.addr}. ${listing.price}.`,
  }
}

const INSIDE_AMENITIES = [
  'Furnished · IKEA + local',
  'Fibre internet ready',
  'Back-up generator',
  '24/7 borehole water',
  'Gas hob, electric oven',
  'In-unit washing machine',
  'Air conditioning (both rooms)',
  'Balcony, west-facing',
  'Built-in wardrobes',
]

const BUILDING_AMENITIES = [
  '24-hour manned gate',
  'CCTV common areas',
  'Rooftop terrace',
  'Lift access',
  'Visitor parking',
  'On-site caretaker',
]

const POIS = [
  { label: 'Sarit Centre · 4 min', top: '18%', left: '22%' },
  { label: 'Brookhouse School · 8 min', top: '60%', left: '60%' },
  { label: 'The Mall · 9 min', top: '30%', left: '70%' },
  { label: 'K1 bus stop · 2 min', top: '75%', left: '25%' },
  { label: 'M.P. Shah Hospital · 6 min', top: '50%', left: '78%' },
]

export default async function ListingDetailPage({ params }: { params: Params }) {
  const { slug } = await params
  const listing = findListing(slug)
  if (!listing) notFound()

  const related = LISTINGS.filter((l) => l.slug !== listing.slug && l.area === listing.area).slice(
    0,
    3,
  )
  // If fewer than 3 in same area, fill with any others.
  const filler = LISTINGS.filter((l) => l.slug !== listing.slug && !related.includes(l)).slice(
    0,
    3 - related.length,
  )
  const relatedFinal = [...related, ...filler]

  return (
    <>
      <Nav current="listings" />

      <div className={p.crumbs}>
        <div className={s.container}>
          <Link href="/">Home</Link>
          <span className={p.sep}>/</span>
          <Link href="/listings">Listings</Link>
          <span className={p.sep}>/</span>
          <Link href="/listings">{listing.area}</Link>
          <span className={p.sep}>/</span>
          <span>{listing.title}</span>
        </div>
      </div>

      <section className={p.gallery}>
        <div className={s.container}>
          <div className={p.galleryGrid}>
            <div className={p.ph} />
            <div className={p.ph} />
            <div className={p.ph} />
            <div className={p.ph} />
            <div className={p.ph}>
              <div className={p.viewAll}>+12 photos · floorplan · video tour</div>
            </div>
          </div>
        </div>
      </section>

      <section className={p.main}>
        <div className={`${s.container} ${p.mainGrid}`}>
          <main>
            <div className={p.title}>
              <div>
                <span className={s.label}>{listing.status} · Available 1 May</span>
                <h1>{listing.title}</h1>
                <div className={p.addr}>⟟ {listing.addr}</div>
              </div>
              <div className={p.actions}>
                <button type="button" className={p.iconBtn} aria-label="Save listing">
                  ♡
                </button>
                <button type="button" className={p.iconBtn} aria-label="Share listing">
                  ⤴
                </button>
              </div>
            </div>

            <div className={p.specRow}>
              <SpecCell value={listing.beds.split(' ')[0]} label="Bedrooms" />
              <SpecCell value={listing.baths.split(' ')[0]} label="Bathrooms" />
              <SpecCell value={listing.size.split(' ')[0]} label={listing.size.includes('sqft') ? 'Sqft' : 'Sqm'} />
              <SpecCell value="4th" label="Floor of 8" />
              <SpecCell value="1" label="Parking" />
            </div>

            <div className={p.section}>
              <h2>About this home</h2>
              <p>
                A quiet two-bedroom on the fourth floor — a 2018 build with covered parking, back-up
                power and a slow-running passenger lift. The living area opens onto a 6-metre balcony
                with morning sun. The second bedroom works equally well as a study; both have built-in
                wardrobes.
              </p>
              <p>
                The building sits one street back from the main road, so you get the {listing.area}
                {' '}
                proximity without the traffic noise. A K1 bus stop is two minutes&apos; walk. The closest
                schools are Brookhouse and Hillcrest. Sarit Centre and The Mall are both within a
                ten-minute walk.
              </p>
            </div>

            <div className={p.section}>
              <h2>Inside</h2>
              <div className={p.amenities}>
                {INSIDE_AMENITIES.map((item) => (
                  <div key={item} className={p.amenity}>
                    <span className={p.dot} />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className={p.section}>
              <h2>Building &amp; estate</h2>
              <div className={p.amenities}>
                {BUILDING_AMENITIES.map((item) => (
                  <div key={item} className={p.amenity}>
                    <span className={p.dot} />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className={p.section}>
              <h2>Floorplan · {listing.size}</h2>
              <div className={p.floorplan}>
                <Floorplan />
              </div>
            </div>

            <div className={p.section}>
              <h2>The neighbourhood</h2>
              <div className={p.mapBlock}>
                <div className={p.mapCanvas}>
                  <div className={p.mapPin}>⌂</div>
                  {POIS.map((poi) => (
                    <div
                      key={poi.label}
                      className={p.mapPoi}
                      style={{ top: poi.top, left: poi.left }}
                    >
                      {poi.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </main>

          <aside>
            <div className={p.ctaCard}>
              <span className={s.label}>Monthly rent</span>
              <div className={p.priceRow}>
                <span className={p.priceLabel}>{listing.price.split(' / ')[0]}</span>
                <span className={p.per}>/ month</span>
              </div>
              <div className={p.field}>
                <label htmlFor="move-in">Move-in date</label>
                <input id="move-in" type="text" defaultValue="1 May 2026" />
              </div>
              <div className={p.field}>
                <label htmlFor="viewing">Viewing slot</label>
                <select id="viewing" defaultValue="sat-10">
                  <option value="sat-10">Sat 18 Apr · 10:00 — available</option>
                  <option value="sat-14">Sat 18 Apr · 14:00 — available</option>
                  <option value="sun-11">Sun 19 Apr · 11:00 — available</option>
                  <option value="mon-17">Mon 20 Apr · 17:30 — available</option>
                </select>
              </div>
              <div className={`${p.field} ${p.fieldRow}`}>
                <div>
                  <label htmlFor="lease">Lease</label>
                  <input id="lease" type="text" defaultValue="12 months" />
                </div>
                <div>
                  <label htmlFor="deposit">Deposit</label>
                  <input id="deposit" type="text" defaultValue="2 months" />
                </div>
              </div>
              <div className={p.btnStack}>
                <Link className={`${s.btn} ${s.btnPrimary} ${p.btnFull}`} href="/contact">
                  Book a viewing <span className={s.arrow}>→</span>
                </Link>
                <Link className={`${s.btn} ${s.btnGhostNavy} ${p.btnFull}`} href="/contact">
                  Ask a question
                </Link>
              </div>
              <p className={p.smallPrint}>
                No application fee. No agent commission. Replies within one business day.
              </p>

              <div className={p.agent}>
                <div className={p.avatar}>WK</div>
                <div>
                  <div className={p.name}>Wanjiku K.</div>
                  <div className={p.role}>{listing.area} portfolio · Tochi</div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className={p.related}>
        <div className={s.container}>
          <div className={p.relatedHead}>
            <div>
              <span className={s.label}>Similar homes nearby</span>
              <h2>More in {listing.area}.</h2>
            </div>
            <div className={p.btnRow}>
              <Link className={`${s.btn} ${s.btnGhostNavy}`} href="/listings">
                View all 41 →
              </Link>
            </div>
          </div>
          <div className={p.relatedGrid}>
            {relatedFinal.map((other) => (
              <RelatedCard key={other.slug} listing={other} />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}

function SpecCell({ value, label }: { value: string; label: string }) {
  return (
    <div className={p.cell}>
      <div className={p.v}>{value}</div>
      <div className={p.l}>{label}</div>
    </div>
  )
}

function RelatedCard({ listing }: { listing: Listing }) {
  const variantClass = listing.variant ? s[`listing${listing.variant}`] : ''
  return (
    <Link href={`/listings/${listing.slug}`} className={`${s.listing} ${variantClass}`}>
      <div className={s.photo}>
        <span className={s.tag}>{listing.status}</span>
        <div className={s.price}>{listing.price}</div>
      </div>
      <div className={s.body}>
        <h3>{listing.title}</h3>
        <p className={s.addr}>
          {listing.area} · {listing.size}
        </p>
        <div className={s.specs}>
          <span>{listing.beds}</span>
          <span>{listing.baths}</span>
        </div>
      </div>
    </Link>
  )
}

function Floorplan() {
  return (
    <svg viewBox="0 0 600 320" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="hatch" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="6" stroke="rgba(15,28,46,0.08)" strokeWidth="1" />
        </pattern>
      </defs>
      <rect x="20" y="20" width="560" height="280" fill="url(#hatch)" stroke="#0F1C2E" strokeWidth="4" rx="4" />
      <rect x="20" y="20" width="320" height="180" fill="#FFF8F0" stroke="#0F1C2E" strokeWidth="3" />
      <line x1="220" y1="20" x2="220" y2="120" stroke="#0F1C2E" strokeWidth="2" />
      <line x1="220" y1="120" x2="340" y2="120" stroke="#0F1C2E" strokeWidth="2" />
      <rect x="340" y="20" width="240" height="160" fill="#FFF8F0" stroke="#0F1C2E" strokeWidth="3" />
      <rect x="340" y="180" width="120" height="120" fill="#FFF8F0" stroke="#0F1C2E" strokeWidth="3" />
      <rect x="20" y="200" width="200" height="100" fill="#FFF8F0" stroke="#0F1C2E" strokeWidth="3" />
      <rect x="220" y="200" width="120" height="100" fill="#FFF8F0" stroke="#0F1C2E" strokeWidth="3" />
      <rect
        x="460"
        y="180"
        width="120"
        height="120"
        fill="#F1B649"
        fillOpacity="0.25"
        stroke="#0F1C2E"
        strokeWidth="3"
        strokeDasharray="6 4"
      />
      <g fontFamily="Montserrat, sans-serif" fontWeight="600" fontSize="11" fill="#0F1C2E">
        <text x="110" y="105" textAnchor="middle">LIVING / DINING</text>
        <text x="110" y="120" textAnchor="middle" fontSize="9" fill="#5C6779">28 sqm</text>
        <text x="280" y="75" textAnchor="middle">KITCHEN</text>
        <text x="460" y="95" textAnchor="middle">BEDROOM 1</text>
        <text x="460" y="110" textAnchor="middle" fontSize="9" fill="#5C6779">18 sqm</text>
        <text x="400" y="240" textAnchor="middle">BATH</text>
        <text x="120" y="250" textAnchor="middle">BEDROOM 2</text>
        <text x="280" y="250" textAnchor="middle">BATH</text>
        <text x="520" y="245" textAnchor="middle">BALCONY</text>
      </g>
      <path d="M 220 100 A 20 20 0 0 1 240 120" fill="none" stroke="#0F1C2E" strokeWidth="1.5" />
      <path d="M 340 100 A 20 20 0 0 1 360 120" fill="none" stroke="#0F1C2E" strokeWidth="1.5" />
    </svg>
  )
}
