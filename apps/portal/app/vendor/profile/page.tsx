'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function VendorProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    // Vendor Type Selection
    vendorType: 'company', // 'individual' or 'company'
    
    // Individual tradesman fields
    firstName: 'John',
    lastName: 'Kimani',
    idNumber: 'ID-12345678',
    
    // Company fields
    name: 'Nairobi Plumbing Services',
    businessLicense: 'BL-2023-00456',
    
    // Common fields
    category: 'Plumbing',
    email: 'info@nairobi-plumbing.com',
    phone: '+254 712 345 678',
    alternatePhone: '+254 720 987 654',
    address: '123 Industrial Area, Nairobi',
    city: 'Nairobi',
    county: 'Nairobi County',
    postalCode: '00100',
    taxId: 'KRA-P051234567A', // Optional for individuals
    certifications: 'Licensed Plumber, Gas Fitter Certified',
    yearsExperience: '12',
    employees: '8', // Only for companies
    serviceAreas: 'Nairobi, Kiambu, Machakos',
    emergencyAvailable: true,
    description: 'Professional plumbing services with over 12 years of experience. We specialize in residential and commercial plumbing installations, repairs, and maintenance.'
  })

  const [bankingInfo, setBankingInfo] = useState({
    bankName: 'Equity Bank',
    accountName: 'Nairobi Plumbing Services Ltd',
    accountNumber: '0123456789',
    branch: 'Industrial Area Branch',
    mpesaNumber: '+254 712 345 678',
    mpesaName: 'NAIROBI PLUMBING'
  })

  const stats = {
    rating: 4.8,
    totalJobs: 47,
    completedJobs: 44,
    activeJobs: 3,
    totalEarnings: 1250000,
    completionRate: 93.6,
    onTimeDelivery: 95.5
  }

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle save
    console.log('Saving profile:', profileData)
    setIsEditing(false)
  }

  const handleSaveBanking = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle save
    console.log('Saving banking info:', bankingInfo)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Vendor Profile</h1>
          <p className="text-neutral-600 mt-1">Manage your business information and settings</p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-warning-600 text-white px-6 py-2 rounded-lg hover:bg-warning-700"
          >
            Edit Profile
          </button>
        )}
      </div>

      {/* Performance Stats */}
      <div className="bg-surface shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-neutral-900 mb-4">Performance Metrics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-warning-600">{stats.rating} ⭐</div>
            <p className="text-sm text-neutral-600 mt-1">Average Rating</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-neutral-900">{stats.totalJobs}</div>
            <p className="text-sm text-neutral-600 mt-1">Total Jobs</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-success-600">{stats.completionRate}%</div>
            <p className="text-sm text-neutral-600 mt-1">Completion Rate</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600">{stats.onTimeDelivery}%</div>
            <p className="text-sm text-neutral-600 mt-1">On-Time Delivery</p>
          </div>
        </div>
      </div>

      {/* Business Information */}
      <div className="bg-surface shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-neutral-900 mb-4">
          {profileData.vendorType === 'individual' ? 'Personal Information' : 'Business Information'}
        </h2>
        
        <form onSubmit={handleSaveProfile}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Vendor Type Selection */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Vendor Type <span className="text-danger-600">*</span>
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    disabled={!isEditing}
                    checked={profileData.vendorType === 'individual'}
                    onChange={() => setProfileData({ ...profileData, vendorType: 'individual' })}
                    className="mr-2"
                  />
                  <span className="text-sm">Individual Tradesman/Sole Proprietor</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    disabled={!isEditing}
                    checked={profileData.vendorType === 'company'}
                    onChange={() => setProfileData({ ...profileData, vendorType: 'company' })}
                    className="mr-2"
                  />
                  <span className="text-sm">Registered Company</span>
                </label>
              </div>
              <p className="text-xs text-neutral-500 mt-1">
                {profileData.vendorType === 'individual' 
                  ? 'For individual plumbers, electricians, and other tradesmen working independently'
                  : 'For registered businesses with a company name and business license'}
              </p>
            </div>

            {/* Individual Fields */}
            {profileData.vendorType === 'individual' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    First Name <span className="text-danger-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!isEditing}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-warning-500 disabled:bg-neutral-50"
                    value={profileData.firstName}
                    onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Last Name <span className="text-danger-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!isEditing}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-warning-500 disabled:bg-neutral-50"
                    value={profileData.lastName}
                    onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    ID Number <span className="text-danger-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!isEditing}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-warning-500 disabled:bg-neutral-50"
                    placeholder="12345678"
                    value={profileData.idNumber}
                    onChange={(e) => setProfileData({ ...profileData, idNumber: e.target.value })}
                  />
                </div>
              </>
            )}

            {/* Company Fields */}
            {profileData.vendorType === 'company' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Business Name <span className="text-danger-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!isEditing}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-warning-500 disabled:bg-neutral-50"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Business License Number
                  </label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-warning-500 disabled:bg-neutral-50"
                    value={profileData.businessLicense}
                    onChange={(e) => setProfileData({ ...profileData, businessLicense: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Number of Employees
                  </label>
                  <input
                    type="number"
                    disabled={!isEditing}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-warning-500 disabled:bg-neutral-50"
                    value={profileData.employees}
                    onChange={(e) => setProfileData({ ...profileData, employees: e.target.value })}
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Category
              </label>
              <select
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-warning-500 disabled:bg-neutral-50"
                value={profileData.category}
                onChange={(e) => setProfileData({ ...profileData, category: e.target.value })}
              >
                <option value="Plumbing">Plumbing</option>
                <option value="Electrical">Electrical</option>
                <option value="HVAC">HVAC</option>
                <option value="Cleaning">Cleaning</option>
                <option value="Landscaping">Landscaping</option>
                <option value="General Maintenance">General Maintenance</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-warning-500 disabled:bg-neutral-50"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-warning-500 disabled:bg-neutral-50"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Alternate Phone
              </label>
              <input
                type="tel"
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-warning-500 disabled:bg-neutral-50"
                value={profileData.alternatePhone}
                onChange={(e) => setProfileData({ ...profileData, alternatePhone: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Years of Experience
              </label>
              <input
                type="number"
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-warning-500 disabled:bg-neutral-50"
                value={profileData.yearsExperience}
                onChange={(e) => setProfileData({ ...profileData, yearsExperience: e.target.value })}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                {profileData.vendorType === 'individual' ? 'Home/Office Address' : 'Business Address'}
              </label>
              <input
                type="text"
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-warning-500 disabled:bg-neutral-50"
                value={profileData.address}
                onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                City
              </label>
              <input
                type="text"
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-warning-500 disabled:bg-neutral-50"
                value={profileData.city}
                onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                County
              </label>
              <input
                type="text"
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-warning-500 disabled:bg-neutral-50"
                value={profileData.county}
                onChange={(e) => setProfileData({ ...profileData, county: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Tax ID (KRA PIN)
              </label>
              <input
                type="text"
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-warning-500 disabled:bg-neutral-50"
                value={profileData.taxId}
                onChange={(e) => setProfileData({ ...profileData, taxId: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Business License Number
              </label>
              <input
                type="text"
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-warning-500 disabled:bg-neutral-50"
                value={profileData.businessLicense}
                onChange={(e) => setProfileData({ ...profileData, businessLicense: e.target.value })}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Certifications
              </label>
              <input
                type="text"
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-warning-500 disabled:bg-neutral-50"
                value={profileData.certifications}
                onChange={(e) => setProfileData({ ...profileData, certifications: e.target.value })}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Service Areas (comma-separated)
              </label>
              <input
                type="text"
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-warning-500 disabled:bg-neutral-50"
                value={profileData.serviceAreas}
                onChange={(e) => setProfileData({ ...profileData, serviceAreas: e.target.value })}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Business Description
              </label>
              <textarea
                rows={4}
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-warning-500 disabled:bg-neutral-50"
                value={profileData.description}
                onChange={(e) => setProfileData({ ...profileData, description: e.target.value })}
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  disabled={!isEditing}
                  checked={profileData.emergencyAvailable}
                  onChange={(e) => setProfileData({ ...profileData, emergencyAvailable: e.target.checked })}
                  className="rounded border-neutral-300 text-warning-600 focus:ring-warning-500 disabled:opacity-50"
                />
                <span className="ml-2 text-sm text-neutral-700">Available for emergency calls (24/7)</span>
              </label>
            </div>
          </div>

          {isEditing && (
            <div className="flex gap-3 mt-6">
              <button
                type="submit"
                className="bg-warning-600 text-white px-6 py-2 rounded-lg hover:bg-warning-700"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-6 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50"
              >
                Cancel
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Banking Information */}
      <div className="bg-surface shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-neutral-900 mb-4">Banking & Payment Information</h2>
        
        <form onSubmit={handleSaveBanking}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Bank Name
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-warning-500"
                value={bankingInfo.bankName}
                onChange={(e) => setBankingInfo({ ...bankingInfo, bankName: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Branch
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-warning-500"
                value={bankingInfo.branch}
                onChange={(e) => setBankingInfo({ ...bankingInfo, branch: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Account Name
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-warning-500"
                value={bankingInfo.accountName}
                onChange={(e) => setBankingInfo({ ...bankingInfo, accountName: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Account Number
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-warning-500"
                value={bankingInfo.accountNumber}
                onChange={(e) => setBankingInfo({ ...bankingInfo, accountNumber: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                M-Pesa Number
              </label>
              <input
                type="tel"
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-warning-500"
                value={bankingInfo.mpesaNumber}
                onChange={(e) => setBankingInfo({ ...bankingInfo, mpesaNumber: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                M-Pesa Account Name
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-warning-500"
                value={bankingInfo.mpesaName}
                onChange={(e) => setBankingInfo({ ...bankingInfo, mpesaName: e.target.value })}
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="submit"
              className="bg-warning-600 text-white px-6 py-2 rounded-lg hover:bg-warning-700"
            >
              Update Banking Info
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
