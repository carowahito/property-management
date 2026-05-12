'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface Contractor {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  trade: string;
  businessRegistration: string | null;
  kraPin: string | null;
  insurance: boolean;
  isVetted: boolean;
  isActive: boolean;
  rating: number | null;
  totalJobs: number;
  createdAt: string;
  _count: { workOrders: number };
}

interface ContractorsResponse {
  contractors: Contractor[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const TRADES = [
  'plumbing',
  'electrical',
  'carpentry',
  'painting',
  'security',
  'general',
  'roofing',
  'masonry',
  'hvac',
  'landscaping',
];

async function fetchContractors(trade: string): Promise<ContractorsResponse> {
  const params = new URLSearchParams();
  if (trade !== 'all') params.set('trade', trade);
  const response = await fetch(`/api/contractors?${params.toString()}`);
  if (!response.ok) throw new Error('Failed to fetch contractors');
  return response.json();
}

function StarRating({ rating }: { rating: number | null }) {
  const stars = rating ? Math.round(Number(rating)) : 0;
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-4 h-4 ${star <= stars ? 'text-yellow-400 fill-yellow-400' : 'text-neutral-300'}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      {rating !== null && (
        <span className="text-xs text-neutral-500 ml-1">({Number(rating).toFixed(1)})</span>
      )}
    </div>
  );
}

export default function ContractorsPage() {
  const queryClient = useQueryClient();
  const [filterTrade, setFilterTrade] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    trade: 'general',
    businessRegistration: '',
    kraPin: '',
    insurance: false,
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['contractors', filterTrade],
    queryFn: () => fetchContractors(filterTrade),
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await fetch('/api/contractors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create contractor');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contractors'] });
      setShowAddForm(false);
      setFormData({
        name: '',
        phone: '',
        email: '',
        trade: 'general',
        businessRegistration: '',
        kraPin: '',
        insurance: false,
      });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, field, value }: { id: string; field: string; value: boolean }) => {
      const res = await fetch(`/api/contractors/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      });
      if (!res.ok) throw new Error('Failed to update');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contractors'] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-danger-50 border border-danger-200 rounded-lg p-4">
        <p className="text-red-800">Failed to load contractors. Please try again.</p>
      </div>
    );
  }

  const contractors = data?.contractors || [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Contractor Directory</h1>
          <p className="text-neutral-600 mt-1">Manage contractors and service providers</p>
        </div>
        <Button variant="primary" size="lg" onClick={() => setShowAddForm(!showAddForm)}>
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Contractor
        </Button>
      </div>

      {/* Add Contractor Form */}
      {showAddForm && (
        <div className="bg-surface shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Add New Contractor</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createMutation.mutate(formData);
            }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Phone *</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Trade *</label>
              <select
                value={formData.trade}
                onChange={(e) => setFormData({ ...formData, trade: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {TRADES.map((t) => (
                  <option key={t} value={t}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Business Registration</label>
              <input
                type="text"
                value={formData.businessRegistration}
                onChange={(e) => setFormData({ ...formData, businessRegistration: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">KRA PIN</label>
              <input
                type="text"
                value={formData.kraPin}
                onChange={(e) => setFormData({ ...formData, kraPin: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="insurance"
                checked={formData.insurance}
                onChange={(e) => setFormData({ ...formData, insurance: e.target.checked })}
                className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
              />
              <label htmlFor="insurance" className="text-sm font-medium text-neutral-700">
                Has Insurance
              </label>
            </div>
            <div className="md:col-span-2 lg:col-span-3 flex gap-3">
              <Button type="submit" variant="primary" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Saving...' : 'Save Contractor'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
              {createMutation.isError && (
                <p className="text-sm text-red-600 self-center">
                  {(createMutation.error as Error).message}
                </p>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Filter */}
      <div className="bg-surface shadow rounded-lg p-4">
        <div className="flex gap-4">
          <select
            value={filterTrade}
            onChange={(e) => setFilterTrade(e.target.value)}
            className="px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Trades</option>
            {TRADES.map((t) => (
              <option key={t} value={t}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Contractors List */}
      <div className="bg-surface shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-neutral-200">
          <thead className="bg-neutral-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Trade
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Phone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Rating
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Jobs
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Vetted
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Active
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-surface divide-y divide-neutral-200">
            {contractors.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-neutral-500">
                  No contractors found. Add your first contractor above.
                </td>
              </tr>
            ) : (
              contractors.map((contractor) => (
                <tr key={contractor.id} className="hover:bg-neutral-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-neutral-900">{contractor.name}</div>
                    {contractor.email && (
                      <div className="text-xs text-neutral-500">{contractor.email}</div>
                    )}
                    {contractor.insurance && (
                      <span className="inline-flex px-1.5 py-0.5 text-xs font-medium rounded bg-green-50 text-green-700 mt-1">
                        Insured
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-primary-100 text-primary-800 capitalize">
                      {contractor.trade}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                    {contractor.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StarRating rating={contractor.rating} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                    {contractor.totalJobs}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() =>
                        toggleMutation.mutate({
                          id: contractor.id,
                          field: 'isVetted',
                          value: !contractor.isVetted,
                        })
                      }
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full cursor-pointer transition ${
                        contractor.isVetted
                          ? 'bg-success-100 text-green-800'
                          : 'bg-neutral-100 text-neutral-600'
                      }`}
                    >
                      {contractor.isVetted ? 'Vetted' : 'Not Vetted'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() =>
                        toggleMutation.mutate({
                          id: contractor.id,
                          field: 'isActive',
                          value: !contractor.isActive,
                        })
                      }
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full cursor-pointer transition ${
                        contractor.isActive
                          ? 'bg-success-100 text-green-800'
                          : 'bg-danger-100 text-red-800'
                      }`}
                    >
                      {contractor.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                    <button
                      onClick={() =>
                        toggleMutation.mutate({
                          id: contractor.id,
                          field: 'isActive',
                          value: false,
                        })
                      }
                      className="text-red-600 hover:text-red-800"
                    >
                      Deactivate
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
