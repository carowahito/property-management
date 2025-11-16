// Shared mock data for all portals (Admin, Tenant, Landlord)

export const mockProperties = [
  {
    id: '1',
    name: 'Sunset Apartments',
    address: '123 Main Street, Downtown',
    units: 8,
    occupied: 8,
    totalRent: 320000,
    landlordId: '1',
    landlord: 'James K. Johnson',
    status: 'Active',
    yearBuilt: 2015,
    type: 'Apartment',
  },
  {
    id: '2',
    name: 'Vista Plaza',
    address: '456 Oak Avenue, Uptown',
    units: 12,
    occupied: 8,
    totalRent: 480000,
    landlordId: '2',
    landlord: 'Sarah M. Williams',
    status: 'Active',
    yearBuilt: 2018,
    type: 'Apartment',
  },
  {
    id: '3',
    name: 'Highland House',
    address: '789 Pine Road, Midtown',
    units: 6,
    occupied: 3,
    totalRent: 180000,
    landlordId: '3',
    landlord: 'Robert J. Brown',
    status: 'Active',
    yearBuilt: 2012,
    type: 'Townhouse',
  },
  {
    id: '4',
    name: 'Garden Estate',
    address: '321 Elm Street, Riverside',
    units: 10,
    occupied: 9,
    totalRent: 360000,
    landlordId: '4',
    landlord: 'Patricia L. Davis',
    status: 'Active',
    yearBuilt: 2019,
    type: 'Apartment',
  },
]

export const mockTenants = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '+254 712 345 678',
    idNumber: '12345678',
    property: 'Sunset Apartments',
    propertyId: '1',
    landlordId: '1',
    unit: '5A',
    rent: 40000,
    status: 'Active',
    moveIn: '2023-06-15',
    moveOut: null,
    leaseEnd: '2025-06-14',
    emergencyContact: 'Jane Smith',
    emergencyPhone: '+254 712 111 111',
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    phone: '+254 722 567 890',
    idNumber: '87654321',
    property: 'Vista Plaza',
    propertyId: '2',
    landlordId: '2',
    unit: '3B',
    rent: 40000,
    status: 'Active',
    moveIn: '2023-08-22',
    moveOut: null,
    leaseEnd: '2025-08-21',
    emergencyContact: 'Robert Johnson',
    emergencyPhone: '+254 722 222 222',
  },
  {
    id: '3',
    name: 'Michael Chen',
    email: 'michael.chen@email.com',
    phone: '+254 733 789 456',
    idNumber: '11111111',
    property: 'Highland House',
    propertyId: '3',
    landlordId: '3',
    unit: '2C',
    rent: 30000,
    status: 'Active',
    moveIn: '2023-11-01',
    moveOut: null,
    leaseEnd: '2025-10-31',
    emergencyContact: 'Lisa Chen',
    emergencyPhone: '+254 733 333 333',
  },
  {
    id: '4',
    name: 'Emma Wilson',
    email: 'emma.w@email.com',
    phone: '+254 744 012 345',
    idNumber: '22222222',
    property: 'Sunset Apartments',
    propertyId: '1',
    landlordId: '1',
    unit: '8D',
    rent: 40000,
    status: 'Active',
    moveIn: '2023-09-15',
    moveOut: null,
    leaseEnd: '2025-09-14',
    emergencyContact: 'Thomas Wilson',
    emergencyPhone: '+254 744 444 444',
  },
  {
    id: '5',
    name: 'David Martinez',
    email: 'david.m@email.com',
    phone: '+254 755 234 567',
    idNumber: '33333333',
    property: 'Garden Estate',
    propertyId: '4',
    landlordId: '4',
    unit: '6F',
    rent: 36000,
    status: 'Active',
    moveIn: '2023-07-10',
    moveOut: null,
    leaseEnd: '2025-07-09',
    emergencyContact: 'Rosa Martinez',
    emergencyPhone: '+254 755 555 555',
  },
  {
    id: '6',
    name: 'Lisa Anderson',
    email: 'lisa.a@email.com',
    phone: '+254 766 456 789',
    idNumber: '44444444',
    property: 'Vista Plaza',
    propertyId: '2',
    landlordId: '2',
    unit: '9G',
    rent: 40000,
    status: 'Active',
    moveIn: '2023-10-05',
    moveOut: null,
    leaseEnd: '2025-10-04',
    emergencyContact: 'Mark Anderson',
    emergencyPhone: '+254 766 666 666',
  },
  {
    id: '7',
    name: 'James Taylor',
    email: 'james.t@email.com',
    phone: '+254 777 678 901',
    idNumber: '55555555',
    property: 'Sunset Apartments',
    propertyId: '1',
    landlordId: '1',
    unit: '2B',
    rent: 40000,
    status: 'Active',
    moveIn: '2023-05-20',
    moveOut: null,
    leaseEnd: '2025-05-19',
    emergencyContact: 'Anne Taylor',
    emergencyPhone: '+254 777 777 777',
  },
  {
    id: '8',
    name: 'Maria Garcia',
    email: 'maria.g@email.com',
    phone: '+254 788 890 123',
    idNumber: '66666666',
    property: 'Garden Estate',
    propertyId: '4',
    landlordId: '4',
    unit: '3H',
    rent: 36000,
    status: 'Active',
    moveIn: '2023-08-01',
    moveOut: null,
    leaseEnd: '2025-07-31',
    emergencyContact: 'Carlos Garcia',
    emergencyPhone: '+254 788 888 888',
  },
]

export const mockLandlords = [
  {
    id: '1',
    name: 'James K. Johnson',
    email: 'james.johnson@email.com',
    phone: '+254 700 111 222',
    idNumber: 'LD001',
    properties: ['1'],
    totalUnits: 8,
    totalTenants: 8,
    status: 'Active',
    bankAccount: 'Kenya Commercial Bank',
    accountNumber: '1234567890',
    taxId: 'P051234567A',
  },
  {
    id: '2',
    name: 'Sarah M. Williams',
    email: 'sarah.williams@email.com',
    phone: '+254 700 333 444',
    idNumber: 'LD002',
    properties: ['2'],
    totalUnits: 12,
    totalTenants: 8,
    status: 'Active',
    bankAccount: 'Equity Bank',
    accountNumber: '0987654321',
    taxId: 'P051234568A',
  },
  {
    id: '3',
    name: 'Robert J. Brown',
    email: 'robert.brown@email.com',
    phone: '+254 700 555 666',
    idNumber: 'LD003',
    properties: ['3'],
    totalUnits: 6,
    totalTenants: 3,
    status: 'Active',
    bankAccount: 'NCBA Bank',
    accountNumber: '5555555555',
    taxId: 'P051234569A',
  },
  {
    id: '4',
    name: 'Patricia L. Davis',
    email: 'patricia.davis@email.com',
    phone: '+254 700 777 888',
    idNumber: 'LD004',
    properties: ['4'],
    totalUnits: 10,
    totalTenants: 9,
    status: 'Active',
    bankAccount: 'Standard Chartered Bank',
    accountNumber: '6666666666',
    taxId: 'P051234570A',
  },
]

export const mockAdmins = [
  {
    id: '1',
    name: 'Alice Johnson',
    email: 'alice.admin@propmanage.com',
    phone: '+254 700 999 000',
    role: 'Super Admin',
    department: 'Administration',
    status: 'Active',
    permissions: ['all'],
  },
  {
    id: '2',
    name: 'Bob Smith',
    email: 'bob.admin@propmanage.com',
    phone: '+254 700 888 111',
    role: 'Property Manager',
    department: 'Properties',
    status: 'Active',
    permissions: ['properties', 'tenants', 'leases', 'maintenance'],
  },
  {
    id: '3',
    name: 'Carol White',
    email: 'carol.admin@propmanage.com',
    phone: '+254 700 777 222',
    role: 'Finance Manager',
    department: 'Finance',
    status: 'Active',
    permissions: ['payments', 'financial-reports', 'invoices'],
  },
]

export const mockVendorUsers = [
  {
    id: '1',
    vendorId: '1',
    name: 'Quick Repairs Ltd',
    email: 'info@quickrepairs.com',
    phone: '+254 722 100 200',
    role: 'Vendor Admin',
    status: 'Active',
  },
  {
    id: '2',
    vendorId: '2',
    name: 'Professional Cleaners',
    email: 'clean@profclean.com',
    phone: '+254 722 300 400',
    role: 'Vendor Admin',
    status: 'Active',
  },
  {
    id: '3',
    vendorId: '3',
    name: 'Premier Security Services',
    email: 'security@premier.com',
    phone: '+254 722 500 600',
    role: 'Vendor Admin',
    status: 'Active',
  },
  {
    id: '4',
    vendorId: '4',
    name: 'Landscape Designs',
    email: 'landscape@designs.com',
    phone: '+254 722 700 800',
    role: 'Vendor Admin',
    status: 'Active',
  },
  {
    id: '5',
    vendorId: '5',
    name: 'Fix-It Fast Services',
    email: 'contact@fixitfast.com',
    phone: '+254 722 900 100',
    role: 'Vendor Admin',
    status: 'Active',
  },
]

export const mockVendors = [
  {
    id: '1',
    name: 'Quick Repairs Ltd',
    email: 'info@quickrepairs.com',
    phone: '+254 722 100 200',
    category: 'Maintenance',
    specialization: 'Plumbing, Electrical, General Repairs',
    status: 'Active',
    rating: 4.8,
    serviceArea: 'Downtown, Uptown',
  },
  {
    id: '2',
    name: 'Professional Cleaners',
    email: 'clean@profclean.com',
    phone: '+254 722 300 400',
    category: 'Cleaning',
    specialization: 'Apartment Cleaning, Carpet Cleaning',
    status: 'Active',
    rating: 4.6,
    serviceArea: 'All Areas',
  },
  {
    id: '3',
    name: 'Premier Security Services',
    email: 'security@premier.com',
    phone: '+254 722 500 600',
    category: 'Security',
    specialization: 'CCTV, Guards, Patrols',
    status: 'Active',
    rating: 4.9,
    serviceArea: 'Downtown, Midtown, Riverside',
  },
  {
    id: '4',
    name: 'Landscape Designs',
    email: 'landscape@designs.com',
    phone: '+254 722 700 800',
    category: 'Landscaping',
    specialization: 'Garden Design, Maintenance',
    status: 'Active',
    rating: 4.7,
    serviceArea: 'Uptown, Riverside',
  },
]

export const mockBuyers = [
  {
    id: '1',
    name: 'Investment Group Kenya',
    email: 'invest@igkenya.com',
    phone: '+254 700 200 300',
    type: 'Corporate Buyer',
    interestedProperties: ['2', '4'],
    budget: 50000000,
    status: 'Active',
    contactPerson: 'Mr. Kipchoge',
  },
  {
    id: '2',
    name: 'John Kariuki',
    email: 'john.kariuki@email.com',
    phone: '+254 700 400 500',
    type: 'Individual',
    interestedProperties: ['1'],
    budget: 8000000,
    status: 'Active',
    contactPerson: 'John Kariuki',
  },
  {
    id: '3',
    name: 'Real Estate Development Co',
    email: 'dev@redco.com',
    phone: '+254 700 600 700',
    type: 'Corporate Buyer',
    interestedProperties: ['3'],
    budget: 15000000,
    status: 'Active',
    contactPerson: 'Ms. Njeri',
  },
]

export const mockPayments = [
  {
    id: '1',
    tenantName: 'John Smith',
    tenantId: '1',
    landlordId: '1',
    landlordName: 'James K. Johnson',
    propertyId: '1',
    amount: 40000,
    month: 'November 2024',
    status: 'Paid',
    date: '2024-11-05',
    method: 'M-Pesa',
    transactionId: 'TXN001',
  },
  {
    id: '2',
    tenantName: 'Sarah Johnson',
    tenantId: '2',
    landlordId: '2',
    landlordName: 'Sarah M. Williams',
    propertyId: '2',
    amount: 40000,
    month: 'November 2024',
    status: 'Paid',
    date: '2024-11-06',
    method: 'Bank Transfer',
    transactionId: 'TXN002',
  },
  {
    id: '3',
    tenantName: 'Michael Chen',
    tenantId: '3',
    landlordId: '3',
    landlordName: 'Robert J. Brown',
    propertyId: '3',
    amount: 30000,
    month: 'November 2024',
    status: 'Overdue',
    date: '2024-11-10',
    method: 'Pending',
    transactionId: 'TXN003',
  },
  {
    id: '4',
    tenantName: 'Emma Wilson',
    tenantId: '4',
    landlordId: '1',
    landlordName: 'James K. Johnson',
    propertyId: '1',
    amount: 40000,
    month: 'November 2024',
    status: 'Paid',
    date: '2024-11-03',
    method: 'M-Pesa',
    transactionId: 'TXN004',
  },
]

export const mockMaintenanceRequests = [
  {
    id: '1',
    tenantName: 'John Smith',
    tenantId: '1',
    landlordId: '1',
    property: 'Sunset Apartments',
    propertyId: '1',
    unit: '5A',
    issue: 'Leaky kitchen faucet',
    priority: 'Medium',
    status: 'In Progress',
    dateSubmitted: '2024-11-10',
    vendorId: '1',
    vendorName: 'Quick Repairs Ltd',
    estimatedCost: 2500,
  },
  {
    id: '2',
    tenantName: 'Sarah Johnson',
    tenantId: '2',
    landlordId: '2',
    property: 'Vista Plaza',
    propertyId: '2',
    unit: '3B',
    issue: 'AC not cooling',
    priority: 'High',
    status: 'Scheduled',
    dateSubmitted: '2024-11-11',
    vendorId: '1',
    vendorName: 'Quick Repairs Ltd',
    estimatedCost: 5000,
  },
  {
    id: '3',
    tenantName: 'Michael Chen',
    tenantId: '3',
    landlordId: '3',
    property: 'Highland House',
    propertyId: '3',
    unit: '2C',
    issue: 'Broken door lock',
    priority: 'High',
    status: 'Completed',
    dateSubmitted: '2024-11-08',
    vendorId: '1',
    vendorName: 'Quick Repairs Ltd',
    estimatedCost: 1500,
  },
]

export const mockLeases = [
  {
    id: '1',
    tenantId: '1',
    tenantName: 'John Smith',
    landlordId: '1',
    landlordName: 'James K. Johnson',
    property: 'Sunset Apartments',
    propertyId: '1',
    unit: '5A',
    startDate: '2023-06-15',
    endDate: '2025-06-14',
    monthlyRent: 40000,
    status: 'Active',
    renewal: false,
    termsFile: '/leases/lease-001.pdf',
  },
  {
    id: '2',
    tenantId: '2',
    tenantName: 'Sarah Johnson',
    landlordId: '2',
    landlordName: 'Sarah M. Williams',
    property: 'Vista Plaza',
    propertyId: '2',
    unit: '3B',
    startDate: '2023-08-22',
    endDate: '2025-08-21',
    monthlyRent: 40000,
    status: 'Active',
    renewal: false,
    termsFile: '/leases/lease-002.pdf',
  },
  {
    id: '3',
    tenantId: '3',
    tenantName: 'Michael Chen',
    landlordId: '3',
    landlordName: 'Robert J. Brown',
    property: 'Highland House',
    propertyId: '3',
    unit: '2C',
    startDate: '2023-11-01',
    endDate: '2025-10-31',
    monthlyRent: 30000,
    status: 'Active',
    renewal: true,
    termsFile: '/leases/lease-003.pdf',
  },
]

export const mockNotifications = [
  {
    id: '1',
    type: 'payment',
    title: 'Payment Due',
    message: 'Your rent for November is due on November 1st',
    date: '2024-10-25',
    read: false,
    userId: '1',
  },
  {
    id: '2',
    type: 'maintenance',
    title: 'Maintenance Completed',
    message: 'Your maintenance request has been completed',
    date: '2024-11-09',
    read: true,
    userId: '1',
  },
  {
    id: '3',
    type: 'lease',
    title: 'Lease Renewal',
    message: 'Your lease will expire in 6 months. Renewal terms available.',
    date: '2024-11-01',
    read: true,
    userId: '3',
  },
  {
    id: '4',
    type: 'payment',
    title: 'Payment Received',
    message: 'Payment of KSh 40,000 received from John Smith',
    date: '2024-11-05',
    read: false,
    userId: 'LD001',
  },
  {
    id: '5',
    type: 'vendor',
    title: 'Service Request',
    message: 'New maintenance request assigned to your company',
    date: '2024-11-11',
    read: true,
    userId: 'V1',
  },
]

export const mockInvoices = [
  {
    id: 'INV001',
    landlordId: '1',
    landlordName: 'James K. Johnson',
    amount: 80000,
    period: 'November 2024',
    dueDate: '2024-11-30',
    status: 'Paid',
    items: [
      { description: 'Unit 5A - John Smith', amount: 40000 },
      { description: 'Unit 8D - Emma Wilson', amount: 40000 },
    ],
  },
  {
    id: 'INV002',
    landlordId: '2',
    landlordName: 'Sarah M. Williams',
    amount: 80000,
    period: 'November 2024',
    dueDate: '2024-11-30',
    status: 'Pending',
    items: [
      { description: 'Unit 3B - Sarah Johnson', amount: 40000 },
      { description: 'Unit 9G - Lisa Anderson', amount: 40000 },
    ],
  },
]

// ============================================================================
// HELPER FUNCTIONS - Query relationships between entities
// ============================================================================

// Get entity by ID
export const getLandlordById = (id: string) => mockLandlords.find(l => l.id === id)
export const getPropertyById = (id: string) => mockProperties.find(p => p.id === id)
export const getTenantById = (id: string) => mockTenants.find(t => t.id === id)
export const getVendorById = (id: string) => mockVendors.find(v => v.id === id)

// Get related entities
export const getPropertiesByLandlordId = (landlordId: string) => 
  mockProperties.filter(p => p.landlordId === landlordId)

export const getTenantsByLandlordId = (landlordId: string) =>
  mockTenants.filter(t => t.landlordId === landlordId)

export const getTenantsByPropertyId = (propertyId: string) =>
  mockTenants.filter(t => t.propertyId === propertyId)

export const getPaymentsByTenantId = (tenantId: string) =>
  mockPayments.filter(p => p.tenantId === tenantId)

export const getPaymentsByLandlordId = (landlordId: string) =>
  mockPayments.filter(p => p.landlordId === landlordId)

export const getPaymentsByPropertyId = (propertyId: string) =>
  mockPayments.filter(p => p.propertyId === propertyId)

export const getMaintenanceByTenantId = (tenantId: string) =>
  mockMaintenanceRequests.filter(m => m.tenantId === tenantId)

export const getMaintenanceByLandlordId = (landlordId: string) =>
  mockMaintenanceRequests.filter(m => m.landlordId === landlordId)

export const getMaintenanceByPropertyId = (propertyId: string) =>
  mockMaintenanceRequests.filter(m => m.propertyId === propertyId)

export const getLeaseByTenantId = (tenantId: string) =>
  mockLeases.find(l => l.tenantId === tenantId)

export const getLeasesByLandlordId = (landlordId: string) =>
  mockLeases.filter(l => l.landlordId === landlordId)

export const getLeasesByPropertyId = (propertyId: string) =>
  mockLeases.filter(l => l.propertyId === propertyId)

// Calculate statistics
export const getPropertyStats = (propertyId: string) => {
  const property = getPropertyById(propertyId)
  const tenants = getTenantsByPropertyId(propertyId)
  const payments = getPaymentsByPropertyId(propertyId)
  
  if (!property) return null
  
  const currentMonthPayments = payments.filter(p => p.month === 'November 2024' && p.status === 'Paid')
  const totalCollected = currentMonthPayments.reduce((sum, p) => sum + p.amount, 0)
  
  return {
    totalUnits: property.units,
    occupiedUnits: property.occupied,
    vacantUnits: property.units - property.occupied,
    occupancyRate: (property.occupied / property.units) * 100,
    totalRent: property.totalRent,
    collectedThisMonth: totalCollected,
    tenantCount: tenants.length,
  }
}

export const getLandlordStats = (landlordId: string) => {
  const properties = getPropertiesByLandlordId(landlordId)
  const tenants = getTenantsByLandlordId(landlordId)
  const payments = getPaymentsByLandlordId(landlordId)
  
  const totalUnits = properties.reduce((sum, p) => sum + p.units, 0)
  const occupiedUnits = properties.reduce((sum, p) => sum + p.occupied, 0)
  const totalRent = properties.reduce((sum, p) => sum + p.totalRent, 0)
  
  const paidPayments = payments.filter(p => 
    p.status === 'Paid' && p.month === 'November 2024'
  )
  const pendingPayments = payments.filter(p => 
    p.status === 'Pending' && p.month === 'November 2024'
  )
  
  return {
    totalProperties: properties.length,
    totalUnits,
    occupiedUnits,
    vacantUnits: totalUnits - occupiedUnits,
    occupancyRate: (occupiedUnits / totalUnits) * 100,
    totalTenants: tenants.length,
    monthlyRevenue: totalRent,
    collectedThisMonth: paidPayments.reduce((sum, p) => sum + p.amount, 0),
    pendingThisMonth: pendingPayments.reduce((sum, p) => sum + p.amount, 0),
  }
}

export const getTenantStats = (tenantId: string) => {
  const tenant = getTenantById(tenantId)
  const payments = getPaymentsByTenantId(tenantId)
  const maintenance = getMaintenanceByTenantId(tenantId)
  const lease = getLeaseByTenantId(tenantId)
  
  if (!tenant) return null
  
  const paidPayments = payments.filter(p => p.status === 'Paid')
  const pendingPayments = payments.filter(p => p.status === 'Pending' || p.status === 'Overdue')
  
  return {
    monthlyRent: tenant.rent,
    totalPaid: paidPayments.reduce((sum, p) => sum + p.amount, 0),
    totalPending: pendingPayments.reduce((sum, p) => sum + p.amount, 0),
    maintenanceRequests: maintenance.length,
    openMaintenanceRequests: maintenance.filter(m => m.status !== 'Completed').length,
    leaseEndDate: tenant.leaseEnd,
    daysUntilLeaseEnd: Math.ceil((new Date(tenant.leaseEnd).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
  }
}
