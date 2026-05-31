import Link from 'next/link'
import s from '@/styles/shared.module.css'
import { portal } from './portal'

export function Footer() {
  return (
    <footer className={s.footer}>
      <div className={s.container}>
        <div className={s.footerTop}>
          <div className={s.footerBrand}>
            <Link href="/" className={s.logoLink}>
              <img src="/tochi-icon.svg" alt="" height={44} className={s.logoIcon} style={{ display: 'block' }} />
              <div className={s.logoText}>
                <span className={s.logoName}>TOCHI PROPERTY</span>
                <span className={s.logoTagline}>Your Property. Our Pride.</span>
              </div>
            </Link>
            <p>
              Property management and sales across Nairobi, Mombasa and Kisumu — operating to the
              standards of the Royal Institution of Chartered Surveyors.
            </p>
          </div>
          <div className={s.footerCol}>
            <h5>Owners</h5>
            <ul>
              <li>
                <Link href="/contact">Get a valuation</Link>
              </li>
              <li>
                <Link href="/owners#services">Management services</Link>
              </li>
              <li>
                <a href={portal('/landlord')}>Owner dashboard</a>
              </li>
              <li>
                <Link href="/owners#diaspora">Diaspora support</Link>
              </li>
              <li>
                <Link href="/owners">Pricing</Link>
              </li>
            </ul>
          </div>
          <div className={s.footerCol}>
            <h5>Tenants</h5>
            <ul>
              <li>
                <Link href="/listings">Find a home</Link>
              </li>
              <li>
                <a href={portal('/tenant/login')}>Tenant portal</a>
              </li>
              <li>
                <Link href="/tenants#maintenance">Maintenance</Link>
              </li>
              <li>
                <Link href="/contact#faq">FAQ</Link>
              </li>
            </ul>
          </div>
          <div className={s.footerCol}>
            <h5>Company</h5>
            <ul>
              <li>
                <Link href="/about">About</Link>
              </li>
              <li>
                <Link href="/about#name">Brand story</Link>
              </li>
              <li>
                <Link href="/owners#standards">RICS standards</Link>
              </li>
              <li>
                <Link href="/about#team">Careers</Link>
              </li>
              <li>
                <Link href="/contact">Press</Link>
              </li>
            </ul>
          </div>
          <div className={s.footerCol}>
            <h5>Get in touch</h5>
            <ul>
              <li>
                <a href="mailto:info@tochiproperty.com">info@tochiproperty.com</a>
              </li>
              <li>
                <a href="tel:+254700000000">+254 700 000 000</a>
              </li>
              <li>
                <Link href="/contact#office">Delta Corner, Westlands</Link>
              </li>
              <li>
                <a href="https://wa.me/254700000000" target="_blank" rel="noopener">
                  WhatsApp →
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className={s.footerBottom}>
          <span>© 2026 Tochi Property Ltd. · Nairobi, Kenya</span>
          <div className={s.seals}>
            <span className={s.seal}>RICS aligned</span>
            <span className={s.seal}>ISO-ready</span>
            <span className={s.seal}>M-Pesa partner</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
