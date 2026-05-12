import type { Metadata } from 'next'
import Link from 'next/link'
import { Nav } from '@/components/Nav'
import { Footer } from '@/components/Footer'
import s from '@/styles/shared.module.css'
import p from './page.module.css'

export const metadata: Metadata = {
  title: 'For Tenants — Tochi Property',
  description:
    '240 vetted listings across Nairobi. One landlord, one number, one app — from first viewing to move-in day.',
}

const FEATURED = [
  {
    href: '/listings/the-crescent-3a',
    variant: '',
    price: 'KSh 65,000 / mo',
    title: 'Apt 3A · The Crescent',
    addr: 'Kileleshwa, Nairobi',
    specs: ['1 bed', '1 bath', '72 sqm'],
  },
  {
    href: '/listings/lenana-court-4b',
    variant: 'V2',
    price: 'KSh 95,000 / mo',
    title: 'Lenana Court, 4B',
    addr: 'Westlands, Nairobi',
    specs: ['2 beds', '2 baths', '112 sqm'],
  },
  {
    href: '/listings/riverside-gardens-7c',
    variant: 'V3',
    price: 'KSh 150,000 / mo',
    title: 'Riverside Gardens 7C',
    addr: 'Kilimani, Nairobi',
    specs: ['3 beds', '3 baths', '168 sqm'],
  },
  {
    href: '/listings/heritage-villas-14',
    variant: 'V4',
    price: 'KSh 220,000 / mo',
    title: 'Heritage Villas, 14',
    addr: 'Lavington, Nairobi',
    specs: ['4 beds', '4 baths', '3,200 sqft'],
  },
] as const

const APP_FEATURES = [
  {
    icon: '$',
    title: 'Pay rent with M-Pesa or card',
    body: 'Instant receipts, automatic reminders, zero paper-chasing.',
  },
  {
    icon: '⚒',
    title: 'Log maintenance with photos',
    body: 'Snap a picture, attach a voice note — and watch the ticket close.',
  },
  {
    icon: '⎘',
    title: 'All your documents',
    body: 'Lease, inspection report, deposit receipt — always to hand.',
  },
  {
    icon: '⌨',
    title: 'Replies within one business day',
    body: 'A real person answers. Same time zone, same week.',
  },
]

const STEPS = [
  {
    num: '01',
    title: 'Find',
    body: 'Filter by area, beds, budget. Save what you like. Compare side by side.',
  },
  {
    num: '02',
    title: 'View',
    body: 'Book online. Confirmed in hours, not days. In-person or video walk-through.',
  },
  {
    num: '03',
    title: 'Apply',
    body: 'A ten-minute form. ID, references, deposit — all from the app.',
  },
  {
    num: '04',
    title: 'Move in',
    body: 'Digital lease, keys, welcome pack. We meet you on the day.',
  },
]

export default function TenantsPage() {
  return (
    <>
      <Nav current="tenants" />

      {/* HERO */}
      <section className={p.tenantsHero}>
        <div className={`${s.container} ${p.heroGrid}`}>
          <div>
            <span className={s.label}>Looking for a home</span>
            <h1>
              Find a place that <span className={p.accent}>feels like home.</span>
            </h1>
            <p className={p.lede}>
              240 vetted listings across Nairobi. One landlord, one number, one app — from first
              viewing to move-in day.
            </p>
            <div className={p.searchBar}>
              <span className={`${p.searchPill} ${p.searchPillActive}`}>For rent</span>
              <span className={p.searchPill}>For sale</span>
              <span className={p.searchPill}>Westlands ▾</span>
              <span className={p.searchPill}>2+ beds ▾</span>
              <span className={p.searchPill}>50–150k ▾</span>
              <Link className={`${s.btn} ${s.btnPrimary} ${p.searchBtn}`} href="/listings">
                Search 240 →
              </Link>
            </div>
          </div>
          <div>
            <TenantPhoneMock />
          </div>
        </div>
      </section>

      {/* FEATURED */}
      <section className={p.featured}>
        <div className={s.container}>
          <div className={p.headRow}>
            <div>
              <span className={s.label}>New this week</span>
              <h2>Homes ready to view.</h2>
            </div>
            <Link className={`${s.btn} ${s.btnGhostNavy}`} href="/listings">
              View all 240 →
            </Link>
          </div>
          <div className={p.featuredGrid}>
            {FEATURED.map((home) => (
              <Link
                key={home.href}
                href={home.href}
                className={`${s.listing} ${home.variant ? s[`listing${home.variant}`] : ''}`}
              >
                <div className={s.photo}>
                  <span className={s.tag}>For rent</span>
                  <div className={s.price}>{home.price}</div>
                </div>
                <div className={s.body}>
                  <h3>{home.title}</h3>
                  <p className={s.addr}>{home.addr}</p>
                  <div className={s.specs}>
                    {home.specs.map((spec) => (
                      <span key={spec}>{spec}</span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* APP */}
      <section className={p.appBlock} id="app">
        <div className={`${s.container} ${p.appGrid}`}>
          <AppPhoneMock />
          <div>
            <span className={`${s.label} ${s.labelCream}`}>The tenant app</span>
            <h2>Rent, repairs and replies — in one place.</h2>
            <div className={p.featureList}>
              {APP_FEATURES.map((f) => (
                <div key={f.title} className={p.item}>
                  <div className={p.ico}>{f.icon}</div>
                  <div>
                    <h4>{f.title}</h4>
                    <p>{f.body}</p>
                  </div>
                </div>
              ))}
            </div>
            <a
              className={`${s.btn} ${s.btnSaffron} ${s.btnLg}`}
              style={{ marginTop: 32 }}
              href="#app"
            >
              Download the app <span className={s.arrow}>→</span>
            </a>
          </div>
        </div>
      </section>

      {/* STEPS */}
      <section className={p.steps} id="maintenance">
        <div className={s.container}>
          <div className={s.sectionHead}>
            <div>
              <span className={s.label}>From browsing to move-in</span>
              <h2>Four steps. About fourteen days.</h2>
            </div>
            <p className={s.lede}>
              A clear path from the moment you open a listing to the moment you turn the key.
            </p>
          </div>
          <div className={p.stepsGrid}>
            {STEPS.map((step) => (
              <div key={step.num} className={p.step}>
                <div className={p.num}>{step.num}</div>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIAL */}
      <section className={p.testi}>
        <div className={s.container}>
          <span className={s.label} style={{ color: 'var(--saffron-dark)' }}>
            In their words
          </span>
          <p className={p.quote}>
            &ldquo;Found my flat on Friday. Viewed on Saturday. Lease signed on Tuesday. I reported
            a leak from the app and someone came that afternoon.&rdquo;
          </p>
          <div className={p.by}>— Aisha N., tenant in Kileleshwa</div>
        </div>
      </section>

      <Footer />
    </>
  )
}

function TenantPhoneMock() {
  return (
    <div className={p.phone}>
      <div className={p.screen}>
        <h4>Karibu, Aisha</h4>
        <p className={p.greet}>Apt 4B · Lenana Court</p>
        <PhoneCard icon="⌂" title="Maintenance ticket #4892" sub="Plumber arrives 2:30 today" />
        <PhoneCard icon="⎙" title="March rent receipt" sub="KSh 95,000 · M-Pesa · paid" />
        <PhoneCard icon="⊞" title="Lease renewal" sub="View terms · sign June 12" />
        <div className={p.pay}>
          <div className={p.labelRow}>April rent · due 1st</div>
          <div className={p.amt}>KSh 95,000</div>
          <button type="button">Pay with M-Pesa</button>
        </div>
      </div>
    </div>
  )
}

function AppPhoneMock() {
  return (
    <div className={p.phone} style={{ margin: 0 }}>
      <div className={p.screen}>
        <h4>Karibu, Aisha</h4>
        <p className={p.greet}>All your renting, one place</p>
        <PhoneCard icon="$" title="Pay rent in seconds" sub="M-Pesa or bank · instant receipt" />
        <PhoneCard icon="⚒" title="Log a repair" sub="Photos, voice notes, status updates" />
        <PhoneCard icon="✎" title="Documents" sub="Lease · receipts · inspections" />
        <PhoneCard icon="⌨" title="Message Tochi" sub="Reply within one business day" />
      </div>
    </div>
  )
}

function PhoneCard({ icon, title, sub }: { icon: string; title: string; sub: string }) {
  return (
    <div className={p.phoneCard}>
      <div className={p.ico}>{icon}</div>
      <div>
        <p className={p.t}>{title}</p>
        <p className={p.s}>{sub}</p>
      </div>
    </div>
  )
}
