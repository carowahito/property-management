import Link from 'next/link'
import s from '@/styles/shared.module.css'

type Props = {
  headline?: React.ReactNode
  body?: React.ReactNode
  primaryHref?: string
  primaryLabel?: string
  secondaryHref?: string
  secondaryLabel?: string
}

export function TaglineBlock({
  headline = (
    <>
      Your Property.
      <br />
      <span className={s.em}>Our Pride.</span>
    </>
  ),
  body = 'A free valuation, delivered within 48 hours of your enquiry. No obligation, no commitment, no hidden terms. Just an honest assessment from a manager who knows your suburb.',
  primaryHref = '/contact',
  primaryLabel = 'Request a valuation',
  secondaryHref = 'https://wa.me/254700000000',
  secondaryLabel = 'WhatsApp Tochi',
}: Props = {}) {
  return (
    <section className={s.taglineBlock}>
      <div className={s.taglineWatermark} aria-hidden="true">
        <svg viewBox="0 0 560 400" xmlns="http://www.w3.org/2000/svg">
          <text
            x="50%"
            y="54%"
            textAnchor="middle"
            dominantBaseline="middle"
            fontFamily="'Noto Sans JP', 'Yu Gothic', 'Hiragino Sans', sans-serif"
            fontWeight={700}
            fontSize={380}
            letterSpacing={-16}
            fill="rgba(0,36,68,0.08)"
          >
            土地
          </text>
        </svg>
      </div>
      <div className={`${s.container} ${s.taglineInner}`}>
        <h2>{headline}</h2>
        <div className={s.right}>
          <p>{body}</p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link className={`${s.btn} ${s.btnPrimary} ${s.btnLg}`} href={primaryHref}>
              {primaryLabel} <span className={s.arrow}>→</span>
            </Link>
            <a
              className={`${s.btn} ${s.btnGhostNavy} ${s.btnLg}`}
              href={secondaryHref}
              target={secondaryHref.startsWith('http') ? '_blank' : undefined}
              rel={secondaryHref.startsWith('http') ? 'noopener' : undefined}
            >
              {secondaryLabel}
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
