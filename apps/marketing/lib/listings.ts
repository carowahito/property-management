// Static listings data for the marketing site. These are illustrative content
// used by the /listings index and /listings/[slug] detail page — production data
// will eventually come from the portal.

export type ListingVariant = '' | 'V2' | 'V3' | 'V4' | 'V5' | 'V6'

export type Listing = {
  slug: string
  title: string
  addr: string
  area: string
  price: string
  status: 'For rent' | 'For sale' | 'Featured'
  beds: string
  baths: string
  size: string
  variant: ListingVariant
  featured?: boolean
  extras?: string[]
}

export const LISTINGS: readonly Listing[] = [
  {
    slug: 'riverside-gardens-7c',
    title: 'Riverside Gardens 7C — penthouse',
    addr: 'Kilimani · 4 mins walk to Yaya Centre',
    area: 'Kilimani',
    price: 'KSh 150,000 / mo',
    status: 'Featured',
    beds: '3 beds',
    baths: '3 baths',
    size: '168 sqm',
    variant: 'V3',
    featured: true,
    extras: ['Furnished', '2 parking'],
  },
  {
    slug: 'the-crescent-3a',
    title: 'The Crescent, 3A',
    addr: 'Kileleshwa, Nairobi',
    area: 'Kileleshwa',
    price: 'KSh 65,000 / mo',
    status: 'For rent',
    beds: '1 bed',
    baths: '1 bath',
    size: '72 sqm',
    variant: '',
  },
  {
    slug: 'lenana-court-4b',
    title: 'Lenana Court, 4B',
    addr: 'Westlands, Nairobi',
    area: 'Westlands',
    price: 'KSh 95,000 / mo',
    status: 'For rent',
    beds: '2 beds',
    baths: '2 baths',
    size: '112 sqm',
    variant: 'V2',
  },
  {
    slug: 'heritage-villas-14',
    title: 'Heritage Villas, 14',
    addr: 'Lavington · Gated',
    area: 'Lavington',
    price: 'KSh 220,000 / mo',
    status: 'For rent',
    beds: '4 beds',
    baths: '4 baths',
    size: '3,200 sqft',
    variant: 'V4',
  },
  {
    slug: 'brookside-heights-12',
    title: 'Brookside Heights 12',
    addr: 'Westlands, Nairobi',
    area: 'Westlands',
    price: 'KSh 78,000 / mo',
    status: 'For rent',
    beds: '2 beds',
    baths: '2 baths',
    size: '98 sqm',
    variant: '',
  },
  {
    slug: 'mvuli-apartments-8c',
    title: 'Mvuli Apartments 8C',
    addr: 'Westlands, Nairobi',
    area: 'Westlands',
    price: 'KSh 110,000 / mo',
    status: 'For rent',
    beds: '3 beds',
    baths: '2 baths',
    size: '134 sqm',
    variant: 'V3',
  },
  {
    slug: 'the-westbrook-2f',
    title: 'The Westbrook 2F',
    addr: 'Lavington, Nairobi',
    area: 'Lavington',
    price: 'KSh 85,000 / mo',
    status: 'For rent',
    beds: '2 beds',
    baths: '2 baths',
    size: '104 sqm',
    variant: 'V2',
  },
  {
    slug: 'karen-country-house',
    title: 'Karen Country House',
    addr: 'Karen · 1/2 acre plot',
    area: 'Karen',
    price: 'KSh 175,000 / mo',
    status: 'For rent',
    beds: '4 beds',
    baths: '3 baths',
    size: '4,100 sqft',
    variant: 'V4',
  },
  {
    slug: 'parklands-studios-9',
    title: 'Parklands Studios 9',
    addr: 'Parklands, Nairobi',
    area: 'Parklands',
    price: 'KSh 58,000 / mo',
    status: 'For rent',
    beds: 'Studio',
    baths: '1 bath',
    size: '48 sqm',
    variant: '',
  },
  {
    slug: 'spring-valley-4a',
    title: 'Spring Valley 4A',
    addr: 'Spring Valley, Nairobi',
    area: 'Spring Valley',
    price: 'KSh 135,000 / mo',
    status: 'For rent',
    beds: '3 beds',
    baths: '2 baths',
    size: '148 sqm',
    variant: 'V3',
  },
  {
    slug: 'riara-cottage',
    title: 'Riara Cottage',
    addr: 'Riara, Nairobi',
    area: 'Riara',
    price: 'KSh 92,000 / mo',
    status: 'For rent',
    beds: '2 beds',
    baths: '2 baths',
    size: '116 sqm',
    variant: 'V2',
  },
] as const

export function findListing(slug: string) {
  return LISTINGS.find((l) => l.slug === slug)
}
