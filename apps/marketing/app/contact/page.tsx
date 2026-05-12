import type { Metadata } from 'next'
import { Nav } from '@/components/Nav'
import { Footer } from '@/components/Footer'
import s from '@/styles/shared.module.css'
import p from './page.module.css'

export const metadata: Metadata = {
  title: 'Contact — Tochi Property',
  description:
    'Talk to a real person. One number, one reply, within a business day. Get a free property valuation or ask about a Nairobi listing.',
}

const PURPOSES = [
  {
    icon: '⌂',
    title: 'Managing my property',
    body: 'Get a free valuation and quote.',
    active: true,
  },
  { icon: '⌕', title: 'Renting a home', body: 'Book a viewing or ask about a listing.' },
  { icon: '$', title: 'Buying or selling', body: 'Speak to our sales brokerage team.' },
  { icon: '?', title: 'Something else', body: 'Press, partnerships, careers.' },
]

const FAQS = [
  {
    q: 'How much do you charge to manage a property?',
    a: '8% of monthly rent for full management — covering tenant sourcing, rent collection, maintenance coordination, monthly statements and lease renewals. No hidden fees, no commission on repairs.',
  },
  {
    q: 'What if I live overseas?',
    a: 'About a third of our owners do. Same dashboard, calls scheduled to your time zone, payouts in KSh or settled in USD/GBP/EUR via partner banks. No flight to Nairobi required, ever.',
  },
  {
    q: 'How quickly do you find a tenant?',
    a: 'Median fourteen days from listing to signed lease. Slower in December, faster in February. We refuse to fill a unit with the wrong tenant just to hit a number.',
  },
  {
    q: 'Do you sell properties too?',
    a: 'Yes — our brokerage arm handles sales for owners who decide to exit. Same standards, full RICS-aligned valuation, full disclosure to buyers.',
  },
  {
    q: 'Can I see a sample owner report?',
    a: 'Ask in the form and we’ll send a redacted real one. You’ll see how transparent the monthly statements actually are — down to the bolt the plumber bought.',
  },
  {
    q: 'How do tenants pay rent?',
    a: 'M-Pesa paybill, bank transfer, or card via the tenant app. Owner is paid the same day rent clears. Receipts are automatic.',
  },
]

export default function ContactPage() {
  return (
    <>
      <Nav current="contact" />

      {/* HERO */}
      <section className={p.contactHero}>
        <div className={`${s.container} ${p.heroGrid}`}>
          <div>
            <span className={s.label}>Talk to a real person</span>
            <h1>
              One number. <span className={p.accent}>One reply</span>, within a business day.
            </h1>
          </div>
          <p className={p.lede}>
            Whether you&apos;re listing your first property, sourcing your next home, or stuck
            somewhere in between — we&apos;ll route you to the person who can actually help.
          </p>
        </div>
      </section>

      {/* MAIN */}
      <section className={p.contactMain}>
        <div className={`${s.container} ${p.mainGrid}`}>
          <div>
            <span className={s.label}>I&apos;m reaching out about…</span>
            <div className={p.purposeRow}>
              {PURPOSES.map((purpose) => (
                <button
                  key={purpose.title}
                  type="button"
                  className={`${p.purpose} ${purpose.active ? p.purposeActive : ''}`}
                >
                  <div className={p.ico}>{purpose.icon}</div>
                  <h4>{purpose.title}</h4>
                  <p>{purpose.body}</p>
                </button>
              ))}
            </div>

            <form className={p.formCard} id="form" action="/api/contact" method="post">
              <h2>Get a free property valuation.</h2>
              <p className={p.sub}>
                Fill in a few details — we&apos;ll send a written valuation within 48 hours and
                propose a management quote tailored to your building.
              </p>

              <div className={p.formGrid}>
                <Field label="Full name" name="name" type="text" placeholder="Aiko Otieno" required />
                <Field label="Email" name="email" type="email" placeholder="aiko@example.com" required />
                <Field
                  label="Phone (with country code)"
                  name="phone"
                  type="tel"
                  placeholder="+254 700 000 000"
                />
                <SelectField
                  label="I currently live in"
                  name="country"
                  options={[
                    'Kenya',
                    'United Kingdom',
                    'United States',
                    'UAE',
                    'South Africa',
                    'Elsewhere',
                  ]}
                />
                <SelectField
                  label="Property type"
                  name="propertyType"
                  options={[
                    'Apartment',
                    'Townhouse',
                    'Standalone house',
                    'Plot / land',
                    'Small portfolio (2–10 units)',
                    'Commercial',
                  ]}
                />
                <SelectField
                  label="Location"
                  name="location"
                  options={[
                    'Westlands',
                    'Kilimani',
                    'Kileleshwa',
                    'Lavington',
                    'Karen',
                    'Spring Valley',
                    'Other Nairobi',
                    'Mombasa',
                    'Kisumu',
                  ]}
                />
                <div className={`${p.fieldGroup} ${p.full}`}>
                  <label htmlFor="notes">Anything we should know?</label>
                  <textarea
                    id="notes"
                    name="notes"
                    placeholder="Current tenant situation, previous management, deadline, particular concerns…"
                  />
                </div>
                <div className={p.full}>
                  <div className={p.checkboxRow}>
                    <input type="checkbox" id="consent" name="consent" defaultChecked />
                    <label htmlFor="consent">
                      I&apos;d like Tochi to contact me about a valuation and ongoing market
                      updates. You can unsubscribe at any time. See our{' '}
                      <a
                        href="#privacy"
                        style={{ color: 'var(--saffron-dark)', textDecoration: 'underline' }}
                      >
                        privacy notice
                      </a>
                      .
                    </label>
                  </div>
                </div>
              </div>

              <div className={p.submitRow}>
                <span className={p.responseTime}>
                  ⌚ Typical reply: <strong>within one business day</strong>
                </span>
                <button className={`${s.btn} ${s.btnPrimary} ${s.btnLg}`} type="submit">
                  Request valuation <span className={s.arrow}>→</span>
                </button>
              </div>
            </form>
          </div>

          <aside className={p.side}>
            <div className={p.infoCard} id="office">
              <span className={`${s.label} ${s.labelCream}`}>Direct lines</span>
              <h3>The shortest way to a person.</h3>
              <InfoRow
                icon="☎"
                label="Phone · 24/7 for tenants"
                value={<a href="tel:+254700000000">+254 700 000 000</a>}
                sub="Owners: Mon–Sat 8:00–18:00"
              />
              <InfoRow
                icon="✉"
                label="Email"
                value={<a href="mailto:info@tochiproperty.com">info@tochiproperty.com</a>}
                sub="For owners: owners@tochiproperty.com"
              />
              <InfoRow
                icon="▣"
                label="WhatsApp · preferred"
                value={
                  <a href="https://wa.me/254700000000" target="_blank" rel="noopener">
                    +254 700 000 000
                  </a>
                }
                sub="Voice notes welcome, replies in English or Kiswahili"
              />
              <InfoRow
                icon="⌘"
                label="Diaspora line · toll-free"
                value={<a href="tel:+18000000000">+1 (800) 000 0000</a>}
                sub="UK, US, UAE — routed to a Nairobi associate within hours"
              />
            </div>

            <div className={p.officeCard}>
              <span className={s.label} style={{ color: 'var(--saffron-dark)' }}>
                Our office
              </span>
              <h3>Delta Corner, Westlands.</h3>
              <p className={p.officeAddress}>
                4th Floor, Delta Corner Annex
                <br />
                Ring Road Westlands, Nairobi
                <br />
                Walk-ins welcome on weekdays.
              </p>
              <div className={p.mapMini}>
                <div className={p.pin}>⌂</div>
              </div>
              <div className={p.hours}>
                <div className={p.hoursRow}>
                  <span>Mon — Fri</span>
                  <strong>8:00 — 18:00</strong>
                </div>
                <div className={p.hoursRow}>
                  <span>Saturday</span>
                  <strong>9:00 — 13:00</strong>
                </div>
                <div className={p.hoursRow}>
                  <span>Sunday</span>
                  <strong>By appointment</strong>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* FAQ */}
      <section className={p.faqStrip} id="faq">
        <div className={s.container}>
          <div className={s.sectionHead}>
            <div>
              <span className={s.label}>Before you write</span>
              <h2 className={p.faqHeading}>Six things owners and tenants ask first.</h2>
            </div>
            <a className={`${s.btn} ${s.btnGhostNavy}`} href="#faq">
              Full FAQ →
            </a>
          </div>
          <div className={p.faqGrid}>
            {FAQS.map((faq) => (
              <div key={faq.q} className={p.faqItem}>
                <h4>
                  {faq.q}
                  <span className={p.caret}>＋</span>
                </h4>
                <p>{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}

function Field({
  label,
  name,
  type = 'text',
  placeholder,
  required,
}: {
  label: string
  name: string
  type?: string
  placeholder?: string
  required?: boolean
}) {
  return (
    <div className={p.fieldGroup}>
      <label htmlFor={name}>{label}</label>
      <input id={name} name={name} type={type} placeholder={placeholder} required={required} />
    </div>
  )
}

function SelectField({
  label,
  name,
  options,
}: {
  label: string
  name: string
  options: readonly string[]
}) {
  return (
    <div className={p.fieldGroup}>
      <label htmlFor={name}>{label}</label>
      <select id={name} name={name} defaultValue={options[0]}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  )
}

function InfoRow({
  icon,
  label,
  value,
  sub,
}: {
  icon: string
  label: string
  value: React.ReactNode
  sub: string
}) {
  return (
    <div className={p.infoRow}>
      <div className={p.ico}>{icon}</div>
      <div>
        <div className={p.l}>{label}</div>
        <div className={p.v}>{value}</div>
        <div className={p.s}>{sub}</div>
      </div>
    </div>
  )
}
