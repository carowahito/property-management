'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import s from '@/styles/shared.module.css'
import m from './MobileMenu.module.css'
import { portal } from './portal'

const LINKS = [
  { label: 'Owners', href: '/owners' },
  { label: 'Tenants', href: '/tenants' },
  { label: 'Listings', href: '/listings' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

export function MobileMenu() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      <button
        className={m.burger}
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
      >
        <span className={`${m.bar} ${open ? m.barTop : ''}`} />
        <span className={`${m.bar} ${open ? m.barMid : ''}`} />
        <span className={`${m.bar} ${open ? m.barBot : ''}`} />
      </button>

      {open && (
        <div className={m.overlay} onClick={() => setOpen(false)}>
          <nav className={m.drawer} onClick={(e) => e.stopPropagation()}>
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={m.drawerLink}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <hr className={m.divider} />
            <a className={`${s.btn} ${s.btnGhostNavy} ${m.drawerBtn}`} href="https://app.tochiproperty.com">
              Sign in
            </a>
            <Link className={`${s.btn} ${s.btnSaffron} ${m.drawerBtn}`} href="/contact" onClick={() => setOpen(false)}>
              Get a valuation
            </Link>
          </nav>
        </div>
      )}
    </>
  )
}
