import { redirect } from 'next/navigation'

export default function TenantPage() {
  // Redirect /tenant to /tenant/dashboard
  redirect('/tenant/dashboard')
}
