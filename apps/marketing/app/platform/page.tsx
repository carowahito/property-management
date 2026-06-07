import type { Metadata } from 'next'
import Link from 'next/link'
import { Nav } from '@/components/Nav'
import { Footer } from '@/components/Footer'
import { portal } from '@/components/portal'
import s from '@/styles/shared.module.css'
import p from './page.module.css'

export const metadata: Metadata = {
  title: 'For Property Managers — Tochi Platform',
  description:
    'The property management platform built for East Africa. Collect rent, manage tenants, track maintenance, and generate statements — all in one place.',
}

const FEATURES = [
  {
    icon: '💰',
    title: 'Rent collection & reconciliation',
    body: 'M-Pesa, bank transfers, and card payments — automatically matched to tenants. No more spreadsheet reconciliation.',
  },
  {
    icon: '👥',
    title: 'Tenant & landlord portals',
    body: 'Self-service portals for tenants to pay rent and request maintenance. Landlords see real-time statements and occupancy.',
  },
  {
    icon: '🔧',
    title: 'Maintenance tracking',
    body: 'Tenants raise requests, you triage, assign vendors, and track to completion. Full audit trail with photos.',
  },
  {
    icon: '📊',
    title: 'Owner statements',
    body: 'Itemised monthly statements generated automatically. Deductions, service charges, and payouts — all reconciled.',
  },
  {
    icon: '📋',
    title: 'Lease management',
    body: 'Digital leases with templates, e-signatures, renewal tracking, and automated expiry alerts.',
  },
  {
    icon: '🏠',
    title: 'Property & unit management',
    body: 'Track every property, unit, floor, and amenity. Occupancy rates, vacancy tracking, and bulk onboarding.',
  },
]

const PLANS = [
  {
    name: 'Starter',
    price: 'Free',
    period: '',
    description: 'For property managers getting started',
    units: 'Up to 20 units',
    features: [
      'Tenant & landlord management',
      'Rent collection tracking',
      'Basic maintenance requests',
      'Monthly statements',
      'Email support',
    ],
    cta: 'Get started free',
    highlighted: false,
  },
  {
    name: 'Professional',
    price: 'KES 5,000',
    period: '/month',
    description: 'For growing property management firms',
    units: 'Up to 200 units',
    features: [
      'Everything in Starter',
      'Tenant & landlord portals',
      'M-Pesa integration',
      'Lease templates & e-signatures',
      'Automated owner statements',
      'Bulk tenant onboarding (CSV)',
      'Priority support',
    ],
    cta: 'Start 14-day trial',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For large portfolios and management companies',
    units: 'Unlimited units',
    features: [
      'Everything in Professional',
      'Multiple team members & roles',
      'API access',
      'Custom reporting',
      'Dedicated account manager',
      'SLA & uptime guarantee',
      'White-label option',
    ],
    cta: 'Talk to sales',
    highlighted: false,
  },
]

const PAIN_POINTS = [
  'Reconciling rent payments in spreadsheets',
  'Chasing statements across WhatsApp groups',
  'No visibility into maintenance spend',
  'Tenants calling you for every update',
  'Manual lease renewals that slip through',
]

export default function PlatformPage() {
  return (
    <>
      <Nav current="platform" />

      {/* HERO */}
      <section className={p.hero}>
        <div className={s.container}>
          <span className={s.label}>For property managers</span>
          <h1>
            Stop managing properties
            <br />
            from a <span className={p.accent}>spreadsheet.</span>
          </h1>
          <p className={p.lede}>
            Tochi is the property management platform built for East Africa. Collect rent,
            manage tenants, track maintenance, and generate owner statements — all in one place.
          </p>
          <div className={p.ctas}>
            <a className={`${s.btn} ${s.btnPrimary} ${s.btnLg}`} href={portal('/admin/signup')}>
              Get started free <span className={s.arrow}>→</span>
            </a>
            <a className={`${s.btn} ${s.btnGhostNavy} ${s.btnLg}`} href="#pricing">
              View pricing
            </a>
          </div>
        </div>
      </section>

      {/* PAIN POINTS */}
      <section className={p.pain}>
        <div className={`${s.container} ${p.painGrid}`}>
          <div>
            <span className={`${s.label} ${s.labelCream}`}>Sound familiar?</span>
            <h2>Most property managers in Nairobi are running on duct tape.</h2>
          </div>
          <div>
            <div className={p.painList}>
              {PAIN_POINTS.map((point) => (
                <div key={point} className={p.painItem}>
                  {point}
                </div>
              ))}
            </div>
            <span className={p.conclusion}>
              Tochi replaces the chaos with one system your whole team can use.
            </span>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className={s.block} id="features">
        <div className={s.container}>
          <div className={s.sectionHead}>
            <div>
              <span className={s.label}>What you get</span>
              <h2>Everything you need to run a portfolio.</h2>
            </div>
            <p className={s.lede}>
              One platform for rent collection, tenant management, maintenance, reporting,
              and owner communications. No more juggling five different tools.
            </p>
          </div>
          <div className={p.featuresGrid}>
            {FEATURES.map((feature) => (
              <div key={feature.title} className={p.featureCard}>
                <span className={p.featureIcon}>{feature.icon}</span>
                <h3>{feature.title}</h3>
                <p>{feature.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className={p.pricing} id="pricing">
        <div className={s.container}>
          <div className={p.pricingHead}>
            <span className={s.label}>Pricing</span>
            <h2>Simple pricing that grows with your portfolio.</h2>
            <p>No hidden fees. No per-tenant charges. Just one flat monthly price.</p>
          </div>
          <div className={p.pricingGrid}>
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`${p.planCard} ${plan.highlighted ? p.planHighlighted : ''}`}
              >
                {plan.highlighted && <span className={p.badge}>Most popular</span>}
                <h3>{plan.name}</h3>
                <p className={p.planDesc}>{plan.description}</p>
                <div className={p.priceRow}>
                  <span className={p.price}>{plan.price}</span>
                  {plan.period && <span className={p.period}>{plan.period}</span>}
                </div>
                <p className={p.units}>{plan.units}</p>
                <ul className={p.featureList}>
                  {plan.features.map((f) => (
                    <li key={f}>
                      <span className={p.check}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                {plan.name === 'Enterprise' ? (
                  <Link
                    className={`${s.btn} ${s.btnGhostNavy} ${p.planCta}`}
                    href="/contact"
                  >
                    {plan.cta}
                  </Link>
                ) : (
                  <a
                    className={`${s.btn} ${plan.highlighted ? s.btnPrimary : s.btnGhostNavy} ${p.planCta}`}
                    href={portal('/admin/signup')}
                  >
                    {plan.cta}
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className={p.finalCta}>
        <div className={s.container}>
          <h2>Ready to run your portfolio properly?</h2>
          <p>
            Join property managers across Nairobi who are replacing spreadsheets
            with a system that actually works.
          </p>
          <div className={p.ctas}>
            <a className={`${s.btn} ${s.btnSaffron} ${s.btnLg}`} href={portal('/admin/signup')}>
              Get started free <span className={s.arrow}>→</span>
            </a>
            <Link className={`${s.btn} ${s.btnGhostCream} ${s.btnLg}`} href="/contact">
              Book a demo
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
