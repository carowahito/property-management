import type { Metadata } from 'next'
import Link from 'next/link'
import { Nav } from '@/components/Nav'
import { Footer } from '@/components/Footer'
import { LISTINGS, type Listing } from '@/lib/listings'
import s from '@/styles/shared.module.css'
import p from './page.module.css'

export const metadata: Metadata = {
  title: 'Listings — Tochi Property',
  description:
    'Browse every Nairobi home Tochi manages. All listings are owner-verified, occupancy-checked, and photographed by us. No ghost units.',
}

export default function ListingsPage() {
  const featured = LISTINGS.find((l) => l.featured)
  const standard = LISTINGS.filter((l) => !l.featured)
  const firstHalf = standard.slice(0, 4)
  const secondHalf = standard.slice(4)

  return (
    <>
      <Nav current="listings" />

      <section className={p.listHead}>
        <div className={s.container}>
          <div className={p.headRow}>
            <div>
              <span className={s.label}>240 homes across Nairobi</span>
              <h1>
                Browse <span className={p.accent}>every home</span> we manage.
              </h1>
            </div>
            <p className={p.lede}>
              All listings are owner-verified, occupancy-checked, and photographed by Tochi. No
              ghost units.
            </p>
          </div>
        </div>
      </section>

      <section className={p.filterBar}>
        <div className={`${s.container} ${p.filterInner}`}>
          <div className={p.tabGroup}>
            <button type="button" className={p.tabActive}>
              For rent · 187
            </button>
            <button type="button">For sale · 53</button>
          </div>
          <span className={p.filterChip}>
            Westlands, +2 <span className={p.caret}>▾</span>
          </span>
          <span className={p.filterChip}>
            Apartment <span className={p.caret}>▾</span>
          </span>
          <span className={p.filterChip}>
            2+ beds <span className={p.caret}>▾</span>
          </span>
          <span className={`${p.filterChip} ${p.filterChipActive}`}>
            50k – 150k <span className={p.caret}>▾</span>
          </span>
          <span className={p.filterChip}>
            More filters <span className={p.caret}>▾</span>
          </span>
          <div className={p.sortGroup}>
            <span>Sort:</span>
            <span className={p.filterChip} style={{ background: 'var(--white)' }}>
              Newest first <span className={p.caret}>▾</span>
            </span>
          </div>
        </div>
      </section>

      <section className={p.results}>
        <div className={s.container}>
          <div className={p.resultsHead}>
            <div className={p.count}>94 results · Nairobi · For rent</div>
            <div className={p.toggle}>
              <button type="button" className={p.toggleActive}>
                Grid
              </button>
              <button type="button">Map</button>
              <button type="button">List</button>
            </div>
          </div>

          <div className={p.listingsGrid}>
            {featured ? <ListingCard listing={featured} featured /> : null}
            {firstHalf.map((listing) => (
              <ListingCard key={listing.slug} listing={listing} />
            ))}
          </div>

          <div className={p.mapCta}>
            <div>
              <h3>See every listing on the map</h3>
              <p>
                Filter by distance to school, work, hospital — or your favourite coffee shop.
              </p>
            </div>
            <Link className={`${s.btn} ${s.btnSaffron}`} href="/listings">
              Open map view <span className={s.arrow}>→</span>
            </Link>
          </div>

          <div className={p.listingsGrid}>
            {secondHalf.map((listing) => (
              <ListingCard key={listing.slug} listing={listing} />
            ))}
          </div>

          <div className={p.pagination}>
            <button type="button" className={p.paginationArrow}>
              ←
            </button>
            <button type="button" className={p.paginationActive}>
              1
            </button>
            <button type="button">2</button>
            <button type="button">3</button>
            <button type="button">…</button>
            <button type="button">8</button>
            <button type="button" className={p.paginationArrow}>
              →
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}

function ListingCard({ listing, featured = false }: { listing: Listing; featured?: boolean }) {
  const variantClass = listing.variant ? s[`listing${listing.variant}`] : ''
  return (
    <Link
      href={`/listings/${listing.slug}`}
      className={`${s.listing} ${variantClass} ${featured ? p.featuredCard : ''}`}
    >
      <div className={s.photo}>
        <span className={s.tag}>{listing.status}</span>
        <div className={s.price}>{listing.price}</div>
      </div>
      <div className={s.body}>
        <h3>{listing.title}</h3>
        <p className={s.addr}>{listing.addr}</p>
        <div className={s.specs}>
          <span>{listing.beds}</span>
          <span>{listing.baths}</span>
          <span>{listing.size}</span>
          {listing.extras?.map((extra) => <span key={extra}>{extra}</span>)}
        </div>
      </div>
    </Link>
  )
}
