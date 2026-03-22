'use client';

import { useState } from 'react';

interface Document {
  id: string;
  name: string;
  type: string;
  propertyName: string;
  uploadedDate: string;
  size: string;
  uploadedBy: string;
  status: 'active' | 'expired' | 'expiring-soon';
  expiryDate?: string;
}

export default function DocumentsPage() {
  const [documents] = useState<Document[]>([
    {
      id: '1',
      name: 'Property Deed - Sunset Apartments',
      type: 'Deed',
      propertyName: 'Sunset Apartments',
      uploadedDate: '2024-01-15',
      size: '2.4 MB',
      uploadedBy: 'Samuel Kamau',
      status: 'active',
    },
    {
      id: '2',
      name: 'Insurance Policy 2024',
      type: 'Insurance',
      propertyName: 'Highland House',
      uploadedDate: '2024-02-01',
      size: '1.8 MB',
      uploadedBy: 'Grace Muthoni',
      status: 'expiring-soon',
      expiryDate: '2024-12-31',
    },
    {
      id: '3',
      name: 'Building Permit',
      type: 'Permit',
      propertyName: 'Vista Plaza',
      uploadedDate: '2023-05-10',
      size: '850 KB',
      uploadedBy: 'David Otieno',
      status: 'active',
    },
    {
      id: '4',
      name: 'Fire Safety Certificate',
      type: 'Certificate',
      propertyName: 'Garden Estate',
      uploadedDate: '2023-12-01',
      size: '1.2 MB',
      uploadedBy: 'Admin',
      status: 'expired',
      expiryDate: '2024-11-01',
    },
  ]);

  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDocuments = documents.filter((doc) => {
    const matchesType = filterType === 'all' || doc.type === filterType;
    const matchesSearch =
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.propertyName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const stats = {
    totalDocuments: documents.length,
    activeDocuments: documents.filter((d) => d.status === 'active').length,
    expiringSoon: documents.filter((d) => d.status === 'expiring-soon').length,
    expired: documents.filter((d) => d.status === 'expired').length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-success-100 text-green-800';
      case 'expiring-soon':
        return 'bg-yellow-100 text-yellow-800';
      case 'expired':
        return 'bg-danger-100 text-red-800';
      default:
        return 'bg-neutral-100 text-neutral-800';
    }
  };

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'Deed':
        return '📜';
      case 'Insurance':
        return '🛡️';
      case 'Permit':
        return '📋';
      case 'Certificate':
        return '🏆';
      default:
        return '📄';
    }
  };

  return (
    <div className='p-6 space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-neutral-900'>Property Documents</h1>
          <p className='text-neutral-600 mt-1'>
            Manage all property-related documents and certificates
          </p>
        </div>
        <button className='bg-primary-600 hover:bg-primary-700'>+ Upload Document</button>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
        <div className='bg-surface shadow rounded-lg p-6'>
          <p className='text-sm text-neutral-600'>Total Documents</p>
          <p className='text-3xl font-bold text-neutral-900'>{stats.totalDocuments}</p>
        </div>
        <div className='bg-surface shadow rounded-lg p-6'>
          <p className='text-sm text-neutral-600'>Active</p>
          <p className='text-3xl font-bold text-success-600'>{stats.activeDocuments}</p>
        </div>
        <div className='bg-surface shadow rounded-lg p-6'>
          <p className='text-sm text-neutral-600'>Expiring Soon</p>
          <p className='text-3xl font-bold text-yellow-600'>{stats.expiringSoon}</p>
        </div>
        <div className='bg-surface shadow rounded-lg p-6'>
          <p className='text-sm text-neutral-600'>Expired</p>
          <p className='text-3xl font-bold text-danger-600'>{stats.expired}</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className='bg-surface shadow rounded-lg p-4'>
        <div className='flex gap-4'>
          <input
            type='text'
            placeholder='Search documents...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='flex-1 px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent'
          />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className='px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent'
          >
            <option value='all'>All Types</option>
            <option value='Deed'>Deeds</option>
            <option value='Insurance'>Insurance</option>
            <option value='Permit'>Permits</option>
            <option value='Certificate'>Certificates</option>
          </select>
        </div>
      </div>

      {/* Documents List */}
      <div className='bg-surface shadow rounded-lg overflow-hidden'>
        <table className='min-w-full divide-y divide-neutral-200'>
          <thead className='bg-neutral-50'>
            <tr>
              <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider'>
                Document
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider'>
                Type
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider'>
                Property
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider'>
                Upload Date
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider'>
                Size
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider'>
                Status
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider'>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className='bg-surface divide-y divide-neutral-200'>
            {filteredDocuments.map((doc) => (
              <tr key={doc.id} className='hover:bg-neutral-50'>
                <td className='px-6 py-4'>
                  <div className='flex items-center'>
                    <span className='text-2xl mr-3'>{getDocumentIcon(doc.type)}</span>
                    <div>
                      <div className='text-sm font-medium text-neutral-900'>{doc.name}</div>
                      <div className='text-xs text-neutral-500'>by {doc.uploadedBy}</div>
                    </div>
                  </div>
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-neutral-900'>{doc.type}</td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-neutral-900'>
                  {doc.propertyName}
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-neutral-900'>
                  {doc.uploadedDate}
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-neutral-900'>{doc.size}</td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(doc.status)}`}
                  >
                    {doc.status.replace('-', ' ')}
                  </span>
                  {doc.expiryDate && (
                    <div className='text-xs text-neutral-500 mt-1'>Exp: {doc.expiryDate}</div>
                  )}
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-neutral-500 space-x-2'>
                  <button  >
                    View
                  </button>
                  <button  >
                    Download
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
