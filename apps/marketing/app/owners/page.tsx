import type { Metadata } from 'next'
import Link from 'next/link'
import { Nav } from '@/components/Nav'
import { Footer } from '@/components/Footer'
import { TaglineBlock } from '@/components/TaglineBlock'
import s from '@/styles/shared.module.css'
import p from './page.module.css'

export const metadata: Metadata = {
  title: 'For Owners — Tochi Property',
  description:
    'Full-service property management for Nairobi landlords — built to the reporting standards trusted by owners in London, Dubai and Toronto.',
}

const PROBLEMS = [
  'Statements that arrive late, if at all',
  'Undisclosed deductions and silent fees',
  'Slow maintenance with no audit trail',
  'No owner visibility between months',
  'Tenants left to chase their own repairs',
]

const SERVICES = [
  {
    num: '01',
    title: 'Tenant finding',
    body: 'Marketing, viewings, vetting, references and lease — start to signed in fourteen days on average across the portfolio.',
  },
  {
    num: '02',
    title: 'Rent collection',
    body: 'M-Pesa, bank, direct deposit. Funds settled to you by the seventh of every month. Every shilling reconciled.',
  },
  {
    num: '03',
    title: 'Maintenance',
    body: 'A 24-hour line, in-house coordination, vetted contractors. Photographed before and after, costed before approval.',
  },
  {
    num: '04',
    title: 'Inspections',
    body: 'Quarterly walk-throughs with condition reports and timestamped photos. Owners see the property between visits.',
  },
  {
    num: '05',
    title: 'Reporting',
    body: 'Itemised monthly statements delivered on the fifth. An annual portfolio review benchmarked against market data.',
  },
  {
    num: '06',
    title: 'Owner relations',
    body: 'One named manager. Your call answered, every time. Updates arrive before you ask — and questions get same-day replies.',
  },
]

const PROMISES = [
  {
    num: '5th',
    title: 'Statement day',
    body: 'Itemised statements arrive on the fifth of every month. Always.',
  },
  {
    num: '7th',
    title: 'Rent settled',
    body: 'Funds in your account by the seventh, reconciled to every tenant.',
  },
  {
    num: '24h',
    title: 'Maintenance response',
    body: 'Every tenant report acknowledged within 24 hours, often within one.',
  },
  {
    num: '1',
    title: 'Named manager',
    body: 'One person handles your property. The same person picks up the phone.',
  },
]

export default function OwnersPage() {
  return (
    <>
      <Nav current="owners" />

      {/* HERO */}
      <section className={p.ownersHero}>
        <div className={s.container}>
          <span className={s.label}>For property owners</span>
          <h1>
            We manage the ground
            <br />
            beneath your <span className={p.accent}>investment.</span>
          </h1>
          <p className={p.lede}>
            Full-service property management for Nairobi landlords — built to the reporting
            standards trusted by owners in London, Dubai and Toronto.
          </p>
          <div className={p.ctas}>
            <Link className={`${s.btn} ${s.btnPrimary} ${s.btnLg}`} href="/contact">
              Get a free valuation <span className={s.arrow}>→</span>
            </Link>
            <a className={`${s.btn} ${s.btnGhostNavy} ${s.btnLg}`} href="#services">
              See what we do
            </a>
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section className={p.problem}>
        <div className={`${s.container} ${p.problemGrid}`}>
          <div>
            <span className={`${s.label} ${s.labelCream}`}>The status quo</span>
            <h2>Most Nairobi managers operate in the dark.</h2>
          </div>
          <div>
            <div className={p.problemList}>
              {PROBLEMS.map((problem) => (
                <div key={problem} className={p.item}>
                  {problem}
                </div>
              ))}
            </div>
            <span className={p.conclusion}>
              Tochi exists to replace that standard. Not improve it. Replace it.
            </span>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className={s.block} id="services">
        <div className={s.container}>
          <div className={s.sectionHead}>
            <div>
              <span className={s.label}>What we do</span>
              <h2>Six services. One in-house team.</h2>
            </div>
            <p className={s.lede}>
              Nothing brokered out. Nothing slips between cracks. Every property is run by the same
              hands, to the same standard, every month.
            </p>
          </div>
          <div className={p.servicesGrid}>
            {SERVICES.map((service) => (
              <div key={service.num} className={p.serviceCard}>
                <span className={p.num}>{service.num}</span>
                <h3>{service.title}</h3>
                <p>{service.body}</p>
                <a className={p.readMore} href="#services">
                  More <span>→</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DIASPORA */}
      <section className={p.diaspora} id="diaspora">
        <div className={`${s.container} ${p.diasporaGrid}`}>
          <div className={p.mapCard}>
            <div className={p.gridBg} />
            <div className={`${p.ring} ${p.ringR2}`} />
            <div className={`${p.ring} ${p.ringR1}`} />
            <div
              className={`${p.pin} ${p.pinCenter}`}
              style={{ left: '48%', top: '54%' }}
            />
            <div className={p.pin} style={{ left: '18%', top: '30%' }} />
            <div className={p.pinLabel} style={{ left: '22%', top: '24%' }}>
              London
            </div>
            <div className={p.pin} style={{ left: '30%', top: '38%' }} />
            <div className={p.pinLabel} style={{ left: '14%', top: '46%' }}>
              Toronto
            </div>
            <div className={p.pin} style={{ left: '8%', top: '50%' }} />
            <div className={p.pin} style={{ left: '62%', top: '28%' }} />
            <div className={p.pinLabel} style={{ left: '60%', top: '22%' }}>
              Dubai
            </div>
            <div className={p.pin} style={{ left: '78%', top: '42%' }} />
            <div className={p.pinLabel} style={{ left: '74%', top: '36%' }}>
              Singapore
            </div>
            <div className={p.pin} style={{ left: '84%', top: '68%' }} />
            <div className={p.pinLabel} style={{ left: '80%', top: '74%' }}>
              Sydney
            </div>
          </div>
          <div>
            <span className={s.label}>For diaspora owners</span>
            <h2 className={p.diasporaHeadline}>Your property in Nairobi, managed from anywhere.</h2>
            <p className={p.diasporaLede}>
              We work across UK, US, Canada and Gulf time zones. Statements in your local time.
              Payouts in your bank. Video walk-throughs on request — and a manager who picks up
              the phone.
            </p>
            <div className={p.diasporaCtas}>
              <Link className={`${s.btn} ${s.btnPrimary}`} href="/contact">
                Schedule a call <span className={s.arrow}>→</span>
              </Link>
              <a className={`${s.btn} ${s.btnGhostNavy}`} href="#diaspora">
                Diaspora services
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className={p.pricing} id="pricing">
        <div className={s.container}>
          <div className={p.pricingHead}>
            <span className={`${s.label} ${s.labelNoRule}`} style={{ justifyContent: 'center' }}>
              Pricing
            </span>
            <h2>One transparent fee. No surprises.</h2>
          </div>
          <div className={p.tiers}>
            <div className={p.tier}>
              <h3>Letting only</h3>
              <div className={p.price}>
                1 month <small>· of rent</small>
              </div>
              <p className={p.desc}>
                A one-off fee for finding and onboarding your tenant. We hand back to you.
              </p>
              <ul>
                <li>Listing across all major Kenyan portals</li>
                <li>Viewings handled in-house</li>
                <li>Tenant vetting &amp; references</li>
                <li>Lease drafted &amp; signed</li>
                <li>Inventory &amp; condition report</li>
              </ul>
              <Link className={`${s.btn} ${s.btnGhostNavy} ${p.tierCta}`} href="/contact">
                Choose Letting <span className={s.arrow}>→</span>
              </Link>
            </div>
            <div className={`${p.tier} ${p.tierFeatured}`}>
              <span className={p.ribbon}>Most popular</span>
              <h3>Full management</h3>
              <div className={p.price}>
                8% <small>· of monthly rent</small>
              </div>
              <p className={p.desc}>
                Everything in Letting, plus end-to-end management of your property and tenant.
              </p>
              <ul>
                <li>Everything in Letting</li>
                <li>Rent collection by the 7th</li>
                <li>24/7 maintenance line</li>
                <li>Quarterly inspections</li>
                <li>Itemised monthly statements</li>
                <li>Named property manager</li>
              </ul>
              <Link className={`${s.btn} ${s.btnSaffron} ${p.tierCta}`} href="/contact">
                Choose Full <span className={s.arrow}>→</span>
              </Link>
            </div>
            <div className={p.tier}>
              <h3>Premium portfolio</h3>
              <div className={p.price}>Talk to us</div>
              <p className={p.desc}>
                For owners with four or more properties. Bespoke pricing and reporting.
              </p>
              <ul>
                <li>Everything in Full Management</li>
                <li>Dedicated senior manager</li>
                <li>Quarterly portfolio review</li>
                <li>Bespoke reporting cadence</li>
                <li>Annual market benchmarking</li>
                <li>Priority maintenance</li>
              </ul>
              <Link className={`${s.btn} ${s.btnGhostNavy} ${p.tierCta}`} href="/contact">
                Talk to us <span className={s.arrow}>→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* PROMISE */}
      <section className={p.promise} id="standards">
        <div className={`${s.container} ${p.promiseGrid}`}>
          {PROMISES.map((promise) => (
            <div key={promise.title} className={p.promiseItem}>
              <div className={p.num}>{promise.num}</div>
              <h4>{promise.title}</h4>
              <p>{promise.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TAGLINE */}
      <TaglineBlock
        headline={
          <>
            Free valuation.
            <br />
            <span>48 hours.</span>
          </>
        }
        body="An honest assessment from a manager who knows your suburb. No obligation, no commitment, no hidden terms."
      />

      <Footer />
    </>
  )
}
