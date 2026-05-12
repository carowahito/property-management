import type { Metadata } from 'next'
import Link from 'next/link'
import { Nav } from '@/components/Nav'
import { Footer } from '@/components/Footer'
import s from '@/styles/shared.module.css'
import p from './page.module.css'

export const metadata: Metadata = {
  title: 'About — Tochi Property',
  description:
    'A Nairobi property firm with one obsession: take the chaos out of owning and renting Kenyan homes — and replace it with something quiet, honest, and accountable.',
}

const PRINCIPLES = [
  {
    num: '01 — Honesty',
    ja: '正直 · shōjiki',
    title: 'Honesty over flattery.',
    body: 'If your roof needs replacing, we will say so — even if it costs us the listing. If your asking price is a fantasy, we will quote you a real one. Owners come to us because their previous agent told them what they wanted to hear. We will tell you what is true.',
  },
  {
    num: '02 — Craft',
    ja: '手仕事 · teshigoto',
    title: 'Craft over scale.',
    body: 'We grow slowly, on purpose. A property manager who covers eighty units cannot know them. We cap each manager at thirty so the building, its quirks, and the people inside it are still in one head — not lost in a system.',
  },
  {
    num: '03 — Quiet',
    ja: '静けさ · shizukesa',
    title: 'Quiet over showmanship.',
    body: 'Good property management is invisible. The rent arrives. The boiler is serviced before it breaks. The lease renewal lands a fortnight before it’s needed. If you ever forget we’re there, we’re doing our job.',
  },
]

const TEAM = [
  {
    initials: 'KM',
    name: 'Kibwe Mwangi',
    role: 'Co-founder · CEO',
    bio: 'Fifteen years in London commercial property. RICS chartered. Returned to Nairobi in 2022.',
  },
  {
    initials: 'AS',
    name: 'Aiko Saito-Otieno',
    role: 'Co-founder · Operations',
    bio: 'Previously at Mitsui Fudosan, Tokyo. Designed the Tochi operating manual end to end.',
  },
  {
    initials: 'WK',
    name: 'Wanjiku Karanja',
    role: 'Head of Lettings',
    bio: 'Westlands and Kilimani portfolio. Will visit a unit before signing a single owner.',
  },
  {
    initials: 'JO',
    name: 'James Ouko',
    role: 'Head of Sales',
    bio: 'Eight years as an estate agent in Nairobi. Knows every architect, planner and notary in town.',
  },
]

const CREDS = [
  {
    seal: 'RICS',
    title: 'RICS-aligned operations',
    body: 'Royal Institution of Chartered Surveyors valuation and management standards.',
  },
  {
    seal: 'EAK',
    title: 'Estate Agents Act 2024',
    body: 'Fully registered with the Estate Agents Registration Board of Kenya.',
  },
  {
    seal: 'ISO',
    title: 'ISO 9001 working draft',
    body: 'Internal QMS audited quarterly. Public certification scheduled 2026.',
  },
  {
    seal: 'MPS',
    title: 'M-Pesa Business Partner',
    body: 'Direct paybill integration. Same-day rent settlement to owner accounts.',
  },
]

export default function AboutPage() {
  return (
    <>
      <Nav current="about" />

      {/* HERO */}
      <section className={p.aboutHero} id="name">
        <div className={`${s.container} ${p.heroGrid}`}>
          <div>
            <span className={`${s.label} ${s.labelCream}`}>About Tochi Property</span>
            <h1>
              Light, on the <span className={p.accent}>land</span> you own.
            </h1>
          </div>
          <p className={p.lede}>
            We&apos;re a Nairobi property firm with one obsession: take the chaos out of owning and
            renting Kenyan homes — and replace it with something quiet, honest, and accountable.
          </p>
        </div>
      </section>

      {/* MEANING */}
      <section className={p.meaningSection}>
        <div className={`${s.container} ${p.meaningGrid}`}>
          <div className={p.kanjiBlock}>
            <div className={p.bigMark}>土地</div>
            <div className={p.romaji}>tochi · 土地</div>
          </div>
          <div>
            <span className={s.label}>The name</span>
            <h2>
              Tochi means <span className={p.accent}>land</span> — and{' '}
              <span className={p.accent}>light</span>.
            </h2>
            <p>
              Our name reads three ways at once, by design. In Japanese, 土地 (<em>tochi</em>) means
              earth, ground, the land itself. In Hausa and Yoruba it carries the sense of light and
              praise. We chose a word that sat at the meeting point — because property work, done
              well, is both the ground beneath a family and the clarity that lets them rest on it.
            </p>
            <div className={p.etymology}>
              <EtymologyRow lang="Japanese" word="土地 · tochi" gloss="Land · ground · earth" />
              <EtymologyRow lang="Hausa" word="tochi" gloss="Light · lamp · flame" />
              <EtymologyRow lang="Yoruba" word="tóchi" gloss="Praise · gratitude" />
            </div>
          </div>
        </div>
      </section>

      {/* STORY */}
      <section className={p.story}>
        <div className={`${s.container} ${p.storyGrid}`}>
          <div>
            <span className={s.label}>Founders&apos; note</span>
            <h2>Why we started Tochi.</h2>
          </div>
          <div className={p.storyBody}>
            <p>
              Both of us grew up in households where &ldquo;the property manager&rdquo; was a verb
              you said with a sigh. Receipts arrived months late, repair bills doubled overnight,
              and the only way to know what was happening to your own building was to fly home.
            </p>
            <p>
              When we returned to Nairobi in 2022 — one of us from London, the other from Tokyo —
              we expected things had moved on. They had, in places. The good agents were good. But
              the spread between best and average was enormous, and the average was where most
              owners and tenants lived.
            </p>
            <p className={p.pullquote}>
              &ldquo;We didn&apos;t want to make another estate agency. We wanted to make the
              boring, repeatable parts so quiet that the work becomes invisible.&rdquo;
            </p>
            <p>
              <strong>That&apos;s the brief.</strong> Operate to the same Royal Institution of
              Chartered Surveyors standards a London family office would expect. Speak the language
              a diaspora owner in Boston speaks. Pay rent the way a 28-year-old in Kileleshwa
              actually pays for everything else — through M-Pesa, in their phone, in three seconds.
            </p>
            <p>
              We launched in 2022 with eleven properties and a borrowed desk in Westlands. Today we
              look after 187 units for 64 owners — about a third of whom live outside Kenya — and
              have sold a further 53 homes through our brokerage arm. Every owner has the same
              dashboard. Every tenant has the same app. Every month closes on the same schedule.
            </p>
            <p>
              The Japanese for land, the Hausa for light, the Yoruba for praise. Three meanings,
              one job: make ownership feel as solid as the ground, and as light as a lamp.
            </p>
          </div>
        </div>
      </section>

      {/* PRINCIPLES */}
      <section className={p.principles}>
        <div className={s.container}>
          <div className={s.sectionHead}>
            <div>
              <span className={s.label}>How we work</span>
              <h2 className={p.principlesHead}>Three principles, repeated weekly.</h2>
            </div>
            <p className={s.lede}>
              Borrowed from the trades we admire — the surveyors, the carpenters, the watchmakers.
            </p>
          </div>
          <div className={p.principleGrid}>
            {PRINCIPLES.map((principle) => (
              <div key={principle.num} className={p.principle}>
                <div className={p.num}>{principle.num}</div>
                <div className={p.ja}>{principle.ja}</div>
                <h3>{principle.title}</h3>
                <p>{principle.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TEAM */}
      <section className={p.team} id="team">
        <div className={s.container}>
          <span className={`${s.label} ${s.labelCream}`}>The Tochi team</span>
          <h2>Twenty-six people. One office in Westlands.</h2>
          <div className={p.teamGrid}>
            {TEAM.map((member) => (
              <div key={member.name} className={p.member}>
                <div className={p.avatar}>{member.initials}</div>
                <p className={p.name}>{member.name}</p>
                <p className={p.role}>{member.role}</p>
                <p className={p.bio}>{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CREDS */}
      <section className={p.creds}>
        <div className={s.container}>
          <div className={s.sectionHead}>
            <span className={s.label}>Standards we hold ourselves to</span>
          </div>
          <div className={p.credsGrid}>
            {CREDS.map((cred) => (
              <div key={cred.seal} className={p.cred}>
                <div className={p.seal}>{cred.seal}</div>
                <h4>{cred.title}</h4>
                <p>{cred.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={p.aboutCta}>
        <div className={s.container}>
          <div className={p.aboutCtaInner}>
            <span className={s.label} style={{ color: 'var(--saffron-dark)' }}>
              Work with us
            </span>
            <h2>
              Land you can <span className={p.accent}>trust</span>. People who{' '}
              <span className={p.accent}>answer</span>.
            </h2>
            <p className={p.lede}>
              Whether you own a single flat or a small portfolio — or you&apos;re looking for
              somewhere to live — we&apos;d like to hear from you.
            </p>
            <div className={p.btnRow}>
              <Link className={`${s.btn} ${s.btnPrimary} ${s.btnLg}`} href="/contact">
                Get a free valuation <span className={s.arrow}>→</span>
              </Link>
              <Link className={`${s.btn} ${s.btnGhostNavy} ${s.btnLg}`} href="/listings">
                Browse 240 homes
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}

function EtymologyRow({ lang, word, gloss }: { lang: string; word: string; gloss: string }) {
  return (
    <div className={p.row}>
      <span className={p.lang}>{lang}</span>
      <span className={p.word}>{word}</span>
      <span className={p.gloss}>{gloss}</span>
    </div>
  )
}
