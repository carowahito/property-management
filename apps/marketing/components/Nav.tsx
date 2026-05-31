import Link from 'next/link'
import s from '@/styles/shared.module.css'
import { portal } from './portal'
import { MobileMenu } from './MobileMenu'

type NavKey = 'home' | 'owners' | 'tenants' | 'listings' | 'about' | 'contact'

const LINKS: Array<{ key: NavKey; label: string; href: string }> = [
  { key: 'owners', label: 'Owners', href: '/owners' },
  { key: 'tenants', label: 'Tenants', href: '/tenants' },
  { key: 'listings', label: 'Listings', href: '/listings' },
  { key: 'about', label: 'About', href: '/about' },
  { key: 'contact', label: 'Contact', href: '/contact' },
]

export function Nav({ current }: { current?: NavKey } = {}) {
  return (
    <header className={s.nav}>
      <div className={`${s.container} ${s.navInner}`}>
        <Link href="/" className={s.logoLink}>
          <img src="/tochi-icon.svg" alt="" height={48} className={s.logoIcon} style={{ display: 'block' }} />
          <div className={s.logoText}>
            <span className={s.logoName}>TOCHI PROPERTY</span>
            <span className={s.logoTagline}>Your Property. Our Pride.</span>
          </div>
        </Link>
        <nav className={s.navLinks}>
          {LINKS.map((link) => (
            <Link
              key={link.key}
              href={link.href}
              className={`${s.navLink} ${current === link.key ? s.navLinkActive : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className={s.navActions}>
          <a className={`${s.btn} ${s.btnGhostNavy}`} href={portal('/')}>
            Sign in
          </a>
          <Link className={`${s.btn} ${s.btnSaffron}`} href="/contact">
            Get a valuation <span className={s.arrow}>→</span>
          </Link>
        </div>
        <MobileMenu />
      </div>
    </header>
  )
}
