'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { formatDate } from '@/lib/utils';

interface Property {
  id: string;
  name: string;
  totalUnits: number;
  _count: {
    tenants: number;
    leases: number;
    maintenanceRequests: number;
  };
}

interface Payment {
  id: string;
  amount: number;
  status: string;
  paidDate: string | null;
  dueDate: string;
  tenant: { id: string; name: string };
  lease: {
    id: string;
    property: { id: string; name: string };
    unitRef?: { id: string; unitNumber: string } | null;
  };
}

interface MaintenanceRequest {
  id: string;
  title: string;
  status: string;
  priority: string;
  createdAt: string;
  property: { id: string; name: string };
  tenant: { id: string; name: string };
}

interface Unit {
  id: string;
  unitNumber: string;
  status: string;
  monthlyRent: number | null;
  property: { id: string; name: string };
}

async function fetchProperties(): Promise<{ properties: Property[] }> {
  const res = await fetch('/api/properties');
  if (!res.ok) throw new Error('Failed to fetch properties');
  return res.json();
}

async function fetchPayments(): Promise<{ payments: Payment[] }> {
  const res = await fetch('/api/payments?limit=100');
  if (!res.ok) throw new Error('Failed to fetch payments');
  return res.json();
}

async function fetchMaintenanceRequests(): Promise<{ maintenanceRequests: MaintenanceRequest[] }> {
  const res = await fetch('/api/maintenance-requests');
  if (!res.ok) throw new Error('Failed to fetch maintenance requests');
  return res.json();
}

async function fetchUnits(): Promise<{ units: Unit[] }> {
  const res = await fetch('/api/units');
  if (!res.ok) throw new Error('Failed to fetch units');
  return res.json();
}

export default function LandlordDashboard() {
  const { data: propertiesData, isLoading: loadingProperties } = useQuery({
    queryKey: ['landlord-properties'],
    queryFn: fetchProperties,
  });

  const { data: paymentsData, isLoading: loadingPayments } = useQuery({
    queryKey: ['landlord-payments'],
    queryFn: fetchPayments,
  });

  const { data: maintenanceData, isLoading: loadingMaintenance } = useQuery({
    queryKey: ['landlord-maintenance'],
    queryFn: fetchMaintenanceRequests,
  });

  const { data: unitsData, isLoading: loadingUnits } = useQuery({
    queryKey: ['landlord-units'],
    queryFn: fetchUnits,
  });

  const isLoading = loadingProperties || loadingPayments || loadingMaintenance || loadingUnits;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const properties = propertiesData?.properties || [];
  const payments = paymentsData?.payments || [];
  const units = unitsData?.units || [];
  const maintenanceRequests = maintenanceData?.maintenanceRequests || [];

  const totalProperties = properties.length;
  const totalUnits = units.length;
  const occupiedUnits = units.filter((u) => u.status === 'OCCUPIED').length;
  const vacancyRate = totalUnits > 0 ? ((totalUnits - occupiedUnits) / totalUnits) * 100 : 0;

  // Revenue calculations
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  const paidPayments = payments.filter((p) => p.status === 'PAID' && p.paidDate);

  const revenueThisMonth = paidPayments
    .filter((p) => new Date(p.paidDate!) >= thisMonthStart)
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const revenueLastMonth = paidPayments
    .filter((p) => {
      const d = new Date(p.paidDate!);
      return d >= lastMonthStart && d <= lastMonthEnd;
    })
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const revenueChange = revenueLastMonth > 0
    ? ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100
    : 0;

  const pendingMaintenance = maintenanceRequests.filter(
    (r) => r.status === 'PENDING' || r.status === 'IN_PROGRESS'
  ).length;

  const recentPayments = paidPayments.slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-neutral-900 mb-8">Landlord Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-surface shadow rounded-lg p-6">
          <span className="text-3xl mb-2 block">🏢</span>
          <p className="text-sm text-neutral-600">Total Properties</p>
          <p className="text-3xl font-bold text-neutral-900">{totalProperties}</p>
          <p className="text-xs text-neutral-500 mt-1">{totalUnits} units</p>
        </div>
        <div className="bg-surface shadow rounded-lg p-6">
          <span className="text-3xl mb-2 block">👥</span>
          <p className="text-sm text-neutral-600">Occupied Units</p>
          <p className="text-3xl font-bold text-success-600">{occupiedUnits}</p>
          <p className="text-xs text-neutral-500 mt-1">
            {vacancyRate.toFixed(1)}% vacancy rate
          </p>
        </div>
        <div className="bg-surface shadow rounded-lg p-6">
          <span className="text-3xl mb-2 block">💰</span>
          <p className="text-sm text-neutral-600">Revenue This Month</p>
          <p className="text-3xl font-bold text-primary-600">
            KES {revenueThisMonth.toLocaleString()}
          </p>
          <p className={`text-xs mt-1 ${revenueChange >= 0 ? 'text-success-500' : 'text-danger-500'}`}>
            {revenueChange >= 0 ? '+' : ''}{revenueChange.toFixed(1)}% from last month
          </p>
        </div>
        <div className="bg-surface shadow rounded-lg p-6">
          <span className="text-3xl mb-2 block">🔧</span>
          <p className="text-sm text-neutral-600">Pending Maintenance</p>
          <p className="text-3xl font-bold text-danger-600">{pendingMaintenance}</p>
          <p className="text-xs text-neutral-500 mt-1">
            {maintenanceRequests.length} total requests
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-surface shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Payments</h2>
          <div className="space-y-3">
            {recentPayments.length === 0 && (
              <p className="text-sm text-neutral-500">No recent payments</p>
            )}
            {recentPayments.map((payment) => (
              <div key={payment.id} className="flex items-start p-3 bg-neutral-50 rounded">
                <span className="text-2xl mr-3">💵</span>
                <div className="flex-1">
                  <p className="text-sm font-medium">{payment.tenant.name}</p>
                  <p className="text-xs text-neutral-600">
                    {payment.lease.property.name}
                    {payment.lease.unitRef ? ` - ${payment.lease.unitRef.unitNumber}` : ''} - KES{' '}
                    {Number(payment.amount).toLocaleString()}
                  </p>
                  {payment.paidDate && (
                    <p className="text-xs text-neutral-400">{formatDate(payment.paidDate)}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/landlord/properties"
              className="p-4 bg-success-50 text-success-700 rounded-lg hover:bg-success-100 transition-colors text-sm font-medium text-center"
            >
              View Properties
            </Link>
            <Link
              href="/landlord/leases"
              className="p-4 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors text-sm font-medium text-center"
            >
              View Leases
            </Link>
            <Link
              href="/landlord/maintenance"
              className="p-4 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium text-center"
            >
              Maintenance Requests
            </Link>
            <Link
              href="/landlord/financials/statements"
              className="p-4 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors text-sm font-medium text-center"
            >
              Financial Statements
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
