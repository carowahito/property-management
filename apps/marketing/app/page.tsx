import styles from './page.module.css'
import { Nav } from '@/components/Nav'

// Cross-app links resolve against the portal. Configure via NEXT_PUBLIC_PORTAL_URL;
// defaults to localhost:3001 for dev. In production this points at the portal's domain
// (e.g. https://app.tochiproperty.com).
const PORTAL_URL = process.env.NEXT_PUBLIC_PORTAL_URL ?? 'http://localhost:3001'
const portal = (path: string) => `${PORTAL_URL}${path}`

export default function HomePage() {
  return (
    <div className={styles.page}>
      <Nav />
      <HeroSplit />
      <HeroStatsBand />
      <TrustStrip />
      <Services />
      <DashboardPreview />
      <Listings />
      <Testimonial />
      <Diaspora />
      <TaglineBlock />
      <Footer />
    </div>
  )
}

/* ─────────────────────────────────────────────
   NAV
   ───────────────────────────────────────────── */
/* ─────────────────────────────────────────────
   DUAL-AUDIENCE HERO (Option C)
   ───────────────────────────────────────────── */
function HeroSplit() {
  return (
    <section className={styles.heroSplit}>
      <div className={`${styles.heroHalf} ${styles.heroOwners}`}>
        <div className={styles.heroHalfInner}>
          <span className={styles.eyebrow}>For property owners</span>
          <h1>
            Your property.
            <br />
            <span className={styles.accent}>Our pride.</span>
          </h1>
          <p className={styles.heroSub}>
            Full-service management to RICS standards — for landlords in Nairobi and across the
            diaspora.
          </p>
          <div className={styles.ctas}>
            <a className={`${styles.btn} ${styles.btnSaffron} ${styles.btnLg}`} href="/contact">
              Get a free valuation <span className={styles.arrow}>→</span>
            </a>
            <a className={styles.btnLink} href="/owners#services">
              How we work
            </a>
          </div>
          <div className={styles.mini}>
            <div className={styles.swatch} />
            <div className={styles.info}>
              <p className={styles.t}>Lenana Court · Apt 4B</p>
              <p className={styles.s}>March rent received · Statement ready</p>
            </div>
            <span className={styles.pill}>Paid</span>
          </div>
        </div>
      </div>

      <div className={`${styles.heroHalf} ${styles.heroTenants}`}>
        <div className={styles.heroHalfInner}>
          <span className={styles.eyebrow}>For renters &amp; buyers</span>
          <h1>
            Find a home
            <br />
            that <span className={styles.accent}>fits.</span>
          </h1>
          <p className={styles.heroSub}>
            240 vetted listings across Nairobi. One landlord, one app — from first viewing to
            move-in day.
          </p>
          <div className={styles.ctas}>
            <a className={`${styles.btn} ${styles.btnPrimary} ${styles.btnLg}`} href="/listings">
              Browse 240 homes <span className={styles.arrow}>→</span>
            </a>
            <a className={styles.btnLink} href={portal('/tenant/login')}>
              Tenant portal
            </a>
          </div>
          <div className={styles.mini}>
            <div className={styles.swatch} />
            <div className={styles.info}>
              <p className={styles.t}>Lavington · 3 bed villa</p>
              <p className={styles.s}>KSh 150,000 / month · Available now</p>
            </div>
            <span className={styles.pill}>For rent</span>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────
   STATS BAND
   ───────────────────────────────────────────── */
function HeroStatsBand() {
  const stats = [
    { v: '240', l: 'Live listings' },
    { v: '14 days', l: 'Avg. vacancy fill' },
    { v: '100%', l: 'Statements on the 5th' },
    { v: 'KSh 2.4B', l: 'Under management' },
  ]
  return (
    <div className={styles.heroStatsBand}>
      {stats.map((s) => (
        <div key={s.l} className={styles.stat}>
          <div className={styles.v}>{s.v}</div>
          <div className={styles.l}>{s.l}</div>
        </div>
      ))}
    </div>
  )
}

/* ─────────────────────────────────────────────
   TRUST STRIP
   ───────────────────────────────────────────── */
function TrustStrip() {
  return (
    <div className={styles.trust}>
      <div className={`${styles.container} ${styles.trustInner}`}>
        <div className={styles.trustLabel}>Built to standard</div>
        <div className={styles.trustItems}>
          <span>RICS aligned</span>
          <span>M-Pesa enabled</span>
          <span>Bank-grade reporting</span>
          <span>Diaspora support · UK · Gulf · US</span>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   MEANING / TRILINGUAL
   ───────────────────────────────────────────── */
function Meaning() {
  return (
    <section className={`${styles.block} ${styles.bgCream}`}>
      <div className={styles.container}>
        <div className={styles.sectionHead}>
          <div>
            <span className={styles.label}>The name</span>
            <h2>One word. Three meanings. One promise.</h2>
          </div>
          <p className={styles.lede}>
            Tochi is not a name chosen for how it sounds. It is a name chosen for what it means —
            and across three languages, what it means is precisely what we do.
          </p>
        </div>

        <div className={styles.meaning}>
          <div className={styles.meaningItem}>
            <div className={styles.lang}>Japanese · 日本語</div>
            <div className={styles.glyph}>土地</div>
            <div className={styles.word}>Tochi</div>
            <p className={styles.meaningText}>
              Land. Property. The most direct possible brand name — in a language of precision, the
              company name is the business.
            </p>
          </div>
          <div className={styles.meaningItem}>
            <div className={styles.lang}>Igbo · West Africa</div>
            <div className={`${styles.glyph} ${styles.glyphLatin}`}>
              T<span className={styles.accent}>ọ</span>chi
            </div>
            <div className={styles.word}>Praise · Glorify</div>
            <p className={styles.meaningText}>
              A given name expressing gratitude — fitting for a company built on stewardship and
              trust.
            </p>
          </div>
          <div className={styles.meaningItem}>
            <div className={styles.lang}>Swahili · East Africa</div>
            <div className={`${styles.glyph} ${styles.glyphLatin}`}>
              T<span className={styles.accent}>o</span>chi
            </div>
            <div className={styles.word}>Torch · Light</div>
            <p className={styles.meaningText}>
              Clarity, guidance, illumination. The lingua franca of the region we serve — and what
              we bring to property ownership.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────
   SERVICES
   ───────────────────────────────────────────── */
function Services() {
  const services = [
    {
      num: '01',
      name: 'Tenant finding',
      desc: 'Marketing, viewings, vetting, references, lease — start to signed in fourteen days, on average across the portfolio.',
    },
    {
      num: '02',
      name: 'Rent collection',
      desc: 'M-Pesa, bank, direct deposit. Funds settled to you by the seventh of every month. Every shilling reconciled.',
    },
    {
      num: '03',
      name: 'Maintenance',
      desc: 'A 24-hour line, in-house coordination, vetted contractors. Photographed before and after, costed before approval.',
    },
    {
      num: '04',
      name: 'Inspections',
      desc: 'Quarterly walk-throughs with condition reports and timestamped photos. Owners see the property between visits.',
    },
    {
      num: '05',
      name: 'Reporting',
      desc: 'Itemised monthly statements delivered on the fifth. An annual portfolio review benchmarked against Nairobi market data.',
    },
  ]
  return (
    <section className={styles.block}>
      <div className={styles.container}>
        <div className={styles.sectionHead}>
          <div>
            <span className={styles.label}>What we do</span>
            <h2>Five disciplines. One in-house team.</h2>
          </div>
          <p className={styles.lede}>
            Nothing is brokered out. Nothing slips between cracks. Every property is run by the same
            hands, to the same standard, every month.
          </p>
        </div>

        <div className={styles.services}>
          {services.map((s) => (
            <a key={s.num} className={styles.service} href="/owners#services">
              <div className={styles.num}>{s.num}</div>
              <div className={styles.name}>{s.name}</div>
              <div className={styles.desc}>{s.desc}</div>
              <div className={styles.arrow}>→</div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────
   DASHBOARD PREVIEW
   ───────────────────────────────────────────── */
function DashboardPreview() {
  return (
    <section className={`${styles.block} ${styles.bgCream2}`}>
      <div className={styles.container}>
        <div className={styles.dashPreview}>
          <div>
            <span className={styles.label}>The owner platform</span>
            <h2 className={styles.dashHeadline}>
              Your portfolio,
              <br />
              open at a glance.
            </h2>
            <p className={styles.dashLede}>
              Every property, every payment, every job — refreshed in real time on every device,
              wherever in the world you are.
            </p>

            <div className={styles.dashFeatures}>
              <Feature icon="★" title="Real-time rent tracker">
                See every tenant, every payment, every arrears flag — as it happens, not at month
                end.
              </Feature>
              <Feature icon="✓" title="Maintenance audit trail">
                Every job logged with photos before and after, contractor details, cost approval —
                always reviewable.
              </Feature>
              <Feature icon="⇣" title="Statements you can act on">
                Itemised, exportable, and delivered on the fifth. No waiting, no chasing, no
                surprises.
              </Feature>
            </div>
          </div>

          <DashMock />
        </div>
      </div>
    </section>
  )
}

function Feature({
  icon,
  title,
  children,
}: {
  icon: string
  title: string
  children: React.ReactNode
}) {
  return (
    <div className={styles.feature}>
      <div className={styles.ico}>{icon}</div>
      <div>
        <h4>{title}</h4>
        <p>{children}</p>
      </div>
    </div>
  )
}

function DashMock() {
  return (
    <div className={styles.dash}>
      <div className={styles.head}>
        <div className={styles.greet}>
          Karibu, Wanjiku
          <small>3 properties · March statement ready</small>
        </div>
        <div className={styles.chip}>All paid</div>
      </div>
      <div className={styles.kpis}>
        <div className={`${styles.kpi} ${styles.kpiAccent}`}>
          <div className={styles.v}>KSh 487k</div>
          <div className={styles.l}>Rent · Mar</div>
        </div>
        <div className={styles.kpi}>
          <div className={styles.v}>100%</div>
          <div className={styles.l}>Occupancy</div>
        </div>
        <div className={styles.kpi}>
          <div className={styles.v}>2 open</div>
          <div className={styles.l}>Maintenance</div>
        </div>
      </div>
      <div className={styles.row}>
        <div className={styles.thumb} />
        <div className={styles.info}>
          <div className={styles.t}>Lenana Court · Apt 4B</div>
          <div className={styles.s}>Wanjiru M. · Lease 11 mo · Renews 12 Aug</div>
        </div>
        <span className={`${styles.pill} ${styles.pillPaid}`}>Paid</span>
      </div>
      <div className={styles.row}>
        <div
          className={styles.thumb}
          style={{ background: 'linear-gradient(135deg,#8a9bb0,#5a7390)' }}
        />
        <div className={styles.info}>
          <div className={styles.t}>Kilimani Heights · Unit 12B</div>
          <div className={styles.s}>Otieno J. · Lease 4 mo · Renews 03 Dec</div>
        </div>
        <span className={`${styles.pill} ${styles.pillDue}`}>Due 5d</span>
      </div>
      <div className={styles.row}>
        <div
          className={styles.thumb}
          style={{ background: 'linear-gradient(135deg,#b08a6a,#855d3f)' }}
        />
        <div className={styles.info}>
          <div className={styles.t}>Lavington · 22 Riverside Dr.</div>
          <div className={styles.s}>Kamau A. · Lease 23 mo · Renews 18 Jun</div>
        </div>
        <span className={`${styles.pill} ${styles.pillPaid}`}>Paid</span>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   LISTINGS
   ───────────────────────────────────────────── */
function Listings() {
  return (
    <section id="listings" className={styles.block}>
      <div className={styles.container}>
        <div className={styles.sectionHead}>
          <div>
            <span className={styles.label}>Now letting</span>
            <h2>Featured Nairobi homes.</h2>
          </div>
          <div style={{ textAlign: 'right', alignSelf: 'end' }}>
            <a className={styles.btnLink} href="/listings">
              Browse all 240 listings →
            </a>
          </div>
        </div>

        <div className={styles.listings}>
          <a className={styles.listing} href="/listings">
            <div className={styles.photo}>
              <span className={styles.tag}>For rent</span>
              <div className={styles.price}>KSh 95,000 / mo</div>
            </div>
            <div className={styles.body}>
              <h3>Lenana Court, Apt 4B</h3>
              <p className={styles.addr}>Westlands, Nairobi</p>
              <div className={styles.specs}>
                <span>2 beds</span>
                <span>2 baths</span>
                <span>112 sqm</span>
              </div>
            </div>
          </a>
          <a className={`${styles.listing} ${styles.listingV2}`} href="/listings">
            <div className={styles.photo}>
              <span className={styles.tag}>For rent</span>
              <div className={styles.price}>KSh 150,000 / mo</div>
            </div>
            <div className={styles.body}>
              <h3>Riverside Gardens, 7C</h3>
              <p className={styles.addr}>Kilimani, Nairobi</p>
              <div className={styles.specs}>
                <span>3 beds</span>
                <span>3 baths</span>
                <span>168 sqm</span>
              </div>
            </div>
          </a>
          <a className={`${styles.listing} ${styles.listingV3}`} href="/listings">
            <div className={styles.photo}>
              <span className={styles.tag}>For sale</span>
              <div className={styles.price}>KSh 38,000,000</div>
            </div>
            <div className={styles.body}>
              <h3>The Heritage Villas</h3>
              <p className={styles.addr}>Lavington, Nairobi</p>
              <div className={styles.specs}>
                <span>4 beds</span>
                <span>4 baths</span>
                <span>3,200 sq ft</span>
              </div>
            </div>
          </a>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────
   TESTIMONIAL
   ───────────────────────────────────────────── */
function Testimonial() {
  return (
    <section className={`${styles.block} ${styles.bgNavy}`}>
      <div className={styles.container}>
        <div className={styles.testimonial}>
          <div className={styles.labelBlock}>
            <span className={styles.label} style={{ color: 'var(--saffron)' }}>
              In their words
            </span>
            <h3>Owner of three properties · Westlands</h3>
          </div>
          <div>
            <div className={styles.quote}>
              <p>
                &ldquo;First statement arrived on the fifth. Every shilling accounted for. After
                eighteen years of property in this city, I had stopped expecting that.&rdquo;
              </p>
            </div>
            <div className={styles.quoteMeta}>
              <div className={styles.avatar} />
              <div>
                <div className={styles.who}>Mr. M. Kariuki</div>
                <div className={styles.role}>Owner since 2026 · Westlands</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────
   DIASPORA
   ───────────────────────────────────────────── */
function Diaspora() {
  return (
    <section className={`${styles.block} ${styles.bgCream}`}>
      <div className={styles.container}>
        <div className={styles.diaspora}>
          <div className={styles.mapCard}>
            <div className={styles.gridBg} />
            <div className={`${styles.ring} ${styles.ringR2}`} />
            <div className={`${styles.ring} ${styles.ringR1}`} />
            <div className={`${styles.pin} ${styles.pinCenter}`} style={{ left: '48%', top: '54%' }} />
            <div className={styles.pin} style={{ left: '18%', top: '30%' }} />
            <div className={styles.pinLabel} style={{ left: '22%', top: '24%' }}>
              London
            </div>
            <div className={styles.pin} style={{ left: '30%', top: '38%' }} />
            <div className={styles.pinLabel} style={{ left: '14%', top: '46%' }}>
              Toronto
            </div>
            <div className={styles.pin} style={{ left: '8%', top: '50%' }} />
            <div className={styles.pin} style={{ left: '62%', top: '28%' }} />
            <div className={styles.pinLabel} style={{ left: '60%', top: '22%' }}>
              Dubai
            </div>
            <div className={styles.pin} style={{ left: '78%', top: '42%' }} />
            <div className={styles.pinLabel} style={{ left: '74%', top: '36%' }}>
              Singapore
            </div>
            <div className={styles.pin} style={{ left: '84%', top: '68%' }} />
            <div className={styles.pinLabel} style={{ left: '80%', top: '74%' }}>
              Sydney
            </div>
          </div>
          <div>
            <span className={styles.label}>For diaspora owners</span>
            <h2 className={styles.diasporaHeadline}>
              Your property in Nairobi, managed from anywhere.
            </h2>
            <p className={styles.diasporaLede}>
              We work across UK, US, Canada and Gulf time zones. Statements in your local time.
              Payouts in your bank. Video walk-throughs on request — and a manager who picks up the
              phone.
            </p>
            <div className={styles.diasporaCtas}>
              <a className={`${styles.btn} ${styles.btnPrimary}`} href="/contact">
                Schedule a call <span className={styles.arrow}>→</span>
              </a>
              <a className={`${styles.btn} ${styles.btnGhostNavy}`} href="/owners#diaspora">
                Diaspora services
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────
   TAGLINE BLOCK
   ───────────────────────────────────────────── */
function TaglineBlock() {
  return (
    <section className={styles.taglineBlock}>
<div className={`${styles.container} ${styles.taglineInner}`}>
        <h2>
          Your Property.
          <br />
          <span className={styles.em}>Our Pride.</span>
        </h2>
        <div className={styles.right}>
          <p>
            A free valuation, delivered within 48 hours of your enquiry. No obligation, no
            commitment, no hidden terms. Just an honest assessment from a manager who knows your
            suburb.
          </p>
          <div className={styles.taglineCtas}>
            <a className={`${styles.btn} ${styles.btnPrimary} ${styles.btnLg}`} href="/contact">
              Request a valuation <span className={styles.arrow}>→</span>
            </a>
            <a className={`${styles.btn} ${styles.btnGhostNavy} ${styles.btnLg}`} href="https://wa.me/254700000000">
              WhatsApp Tochi
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────
   FOOTER
   ───────────────────────────────────────────── */
function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.footerTop}>
          <div className={styles.footerBrand}>
            <a href="/" className={styles.logoLink}>
              <img src="/tochi-icon.svg" alt="" height={48} className={styles.logoIcon} style={{ display: 'block' }} />
              <div className={styles.logoText}>
                <span className={styles.logoName}>TOCHI PROPERTY</span>
                <span className={styles.logoTagline}>Your Property. Our Pride.</span>
              </div>
            </a>
            <p>
              Property management and sales across Nairobi, Mombasa and Kisumu — operating to the
              standards of the Royal Institution of Chartered Surveyors.
            </p>
          </div>
          <div className={styles.footerCol}>
            <h5>Owners</h5>
            <ul>
              <li>
                <a href="/contact">Get a valuation</a>
              </li>
              <li>
                <a href="/owners#services">Management services</a>
              </li>
              <li>
                <a href={portal('/landlord')}>Owner dashboard</a>
              </li>
              <li>
                <a href="/owners#diaspora">Diaspora support</a>
              </li>
              <li>
                <a href="/owners">Pricing</a>
              </li>
            </ul>
          </div>
          <div className={styles.footerCol}>
            <h5>Tenants</h5>
            <ul>
              <li>
                <a href="/listings">Find a home</a>
              </li>
              <li>
                <a href={portal('/tenant/login')}>Tenant portal</a>
              </li>
              <li>
                <a href="/tenants#maintenance">Maintenance</a>
              </li>
              <li>
                <a href="/contact#faq">FAQ</a>
              </li>
            </ul>
          </div>
          <div className={styles.footerCol}>
            <h5>Company</h5>
            <ul>
              <li>
                <a href="/about">About</a>
              </li>
              <li>
                <a href="/about#name">Brand story</a>
              </li>
              <li>
                <a href="/owners#standards">RICS standards</a>
              </li>
              <li>
                <a href="/about#team">Careers</a>
              </li>
              <li>
                <a href="/contact">Press</a>
              </li>
            </ul>
          </div>
          <div className={styles.footerCol}>
            <h5>Get in touch</h5>
            <ul>
              <li>
                <a href="mailto:info@tochiproperty.com">info@tochiproperty.com</a>
              </li>
              <li>
                <a href="tel:+254700000000">+254 700 000 000</a>
              </li>
              <li>
                <a href="/contact#office">Delta Corner, Westlands</a>
              </li>
              <li>
                <a href="https://wa.me/254700000000" target="_blank" rel="noopener">WhatsApp →</a>
              </li>
            </ul>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <span>© 2026 Tochi Property Ltd. · Nairobi, Kenya</span>
          <div className={styles.seals}>
            <span className={styles.seal}>RICS aligned</span>
            <span className={styles.seal}>ISO-ready</span>
            <span className={styles.seal}>M-Pesa partner</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
