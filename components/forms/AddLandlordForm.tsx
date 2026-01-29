'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';

// Types
interface Owner {
  firstName: string;
  lastName: string;
  nationality: string;
  countryOfResidence: string;
  idNumber: string;
}

interface UnitDetail {
  unitId: string;
  unitNumber: string;
  unitType: string;
  floor: string;
  bedrooms: string;
  bathrooms: string;
  squareFootage: string;
  monthlyRent: string;
  securityDeposit: string;
  securityDepositType: '1_month' | '2_months' | 'custom';
  status: string;
  tenantId: string;
  amenities: string[];
  description: string;
  utilitiesPaidByTenant: string[];
  monthlyServiceCharge: string;
  leaseTerm: string;
  leaseTermCustom: string;
}

interface LandlordFormData {
  // Property Type
  propertyType: 'residential' | 'commercial';
  
  // Section A: Landlord Details
  firstName: string;
  lastName: string;
  idNumber: string;
  phoneNumber: string;
  email: string;
  postalAddress: string;
  physicalAddress: string;
  preferredCommunication: 'whatsapp' | 'phone' | 'email';
  
  // Section B: Ownership Details
  isNamedPersonLegalOwner: boolean;
  ownershipType: 'individual' | 'joint' | 'company';
  companyName: string;
  companyRegNumber: string;
  contactPersonName: string;
  contactPersonPhone: string;
  contactPersonEmail: string;
  additionalOwners: Owner[];
  
  // Section C: Property Details
  selectedPropertyId: string;
  propertyName: string;
  areaEstate: string;
  streetLandmark: string;
  county: string;
  propertyStatus: 'vacant' | 'partially_occupied' | 'fully_occupied';
  
  // Landlord Units
  landlordUnits: UnitDetail[];
  
  // Section D: Management Services Required
  servicesRequired: string[];
  managementStartDate: string;
  
  // Section E: Financial & Access Details
  rentCollectionMethod: 'mpesa' | 'bank' | 'mixed';
  mpesaDepositType: 'mobile' | 'paybill';
  mpesaMobileNumber: string;
  mpesaPaybillNumber: string;
  mpesaAccountNumber: string;
  propertyAccess: 'keys_available' | 'caretaker_on_site' | 'owner_managed';
  bankName: string;
  bankAccountNumber: string;
  bankBranch: string;
  
  // Property Condition & Maintenance
  propertyCondition: 'excellent' | 'good' | 'fair' | 'needs_repairs';
  knownIssues: string;
  preferredVendorIds: string[];
  maxRepairAmountWithoutApproval: string;
  
  // Insurance & Compliance
  insuranceCarrier: string;
  policyNumber: string;
  insuranceExpiration: string;
  landRatesUpToDate: boolean;
  propertyCompliant: boolean;
  occupationCertificatesInPlace: boolean;
  
  // Special Instructions
  restrictions: string[];
  otherInstructions: string;
  additionalNotes: string;
  
  // Pricing & Commission
  monthlyManagementFeePercent: string;
  tenantPlacementFeeMonths: string;
  commercialLeasingFeeType: 'percent_annual' | 'months_rent';
  commercialLeasingFeePercent: string;
  commercialLeasingFeeMonths: string;
  rentRemittanceDays: string;
  rentRemittanceDate: string;
  rentRemittanceType: 'working_days' | 'specific_date';
  
  // Document Uploads
  idCopy: File | null;
  kraPin: File | null;
  titleCopy: File | null;
  companyCR12: File | null;
  companyIncorporation: File | null;
  authorityLetter: File | null;
  otherDocuments: Array<{ file: File; description: string }>;
  
  // Management Agreement
  generateManagementAgreement: boolean;
}

// Mock data for properties and units
const mockProperties = [
  { 
    id: '1', 
    name: 'Sunset Apartments', 
    address: 'Kilimani, Nairobi',
    type: 'residential',
    units: [
      { id: 'u1', name: '1A', type: '2br', floor: '1', status: 'vacant' }, 
      { id: 'u2', name: '1B', type: '2br', floor: '1', status: 'occupied' }, 
      { id: 'u3', name: '2A', type: '3br', floor: '2', status: 'vacant' }
    ] 
  },
  { 
    id: '2', 
    name: 'Vista Plaza', 
    address: 'Westlands, Nairobi',
    type: 'commercial',
    units: [
      { id: 'u4', name: '101', type: 'office', floor: '1', status: 'vacant' }, 
      { id: 'u5', name: '102', type: 'retail', floor: '1', status: 'occupied' }
    ] 
  },
  { 
    id: '3', 
    name: 'Highland House', 
    address: 'Karen, Nairobi',
    type: 'residential',
    units: [
      { id: 'u6', name: 'A1', type: '1br', floor: 'G', status: 'vacant' }, 
      { id: 'u7', name: 'B1', type: '1br', floor: 'G', status: 'vacant' }
    ] 
  },
];

// Mock tenants for unit assignment
const mockTenants = [
  { id: 't1', name: 'Alice Wanjiku', phone: '+254 722 111 111', email: 'alice@email.com' },
  { id: 't2', name: 'Bob Kamau', phone: '+254 733 222 222', email: 'bob@email.com' },
  { id: 't3', name: 'Carol Akinyi', phone: '+254 711 333 333', email: 'carol@email.com' },
  { id: 't4', name: 'David Omondi', phone: '+254 722 444 444', email: 'david@email.com' },
  { id: 't5', name: 'Esther Muthoni', phone: '+254 733 555 555', email: 'esther@email.com' },
];

// Mock vendors for maintenance
const mockVendors = [
  { id: 'v1', name: 'ProFix Plumbing', specialty: 'Plumbing', phone: '+254 722 100 100' },
  { id: 'v2', name: 'Spark Electric Services', specialty: 'Electrical', phone: '+254 733 200 200' },
  { id: 'v3', name: 'CleanPro Janitorial', specialty: 'Cleaning', phone: '+254 711 300 300' },
  { id: 'v4', name: 'CoolAir HVAC', specialty: 'HVAC', phone: '+254 722 400 400' },
  { id: 'v5', name: 'SecureGuard Services', specialty: 'Security', phone: '+254 733 500 500' },
  { id: 'v6', name: 'GreenScape Landscaping', specialty: 'Landscaping', phone: '+254 711 600 600' },
  { id: 'v7', name: 'PaintPro Decorators', specialty: 'Painting', phone: '+254 722 700 700' },
  { id: 'v8', name: 'Roofing Masters', specialty: 'Roofing', phone: '+254 733 800 800' },
  { id: 'v9', name: 'Pest Control Kenya', specialty: 'Pest Control', phone: '+254 711 900 900' },
  { id: 'v10', name: 'General Repairs Ltd', specialty: 'General Maintenance', phone: '+254 722 000 000' },
];

// Residential unit types
const residentialUnitTypes = [
  { value: 'studio', label: 'Studio', bedrooms: '0' },
  { value: 'bedsitter', label: 'Bedsitter', bedrooms: '0' },
  { value: '1br', label: '1 Bedroom', bedrooms: '1' },
  { value: '2br', label: '2 Bedroom', bedrooms: '2' },
  { value: '3br', label: '3 Bedroom', bedrooms: '3' },
  { value: '4br', label: '4 Bedroom', bedrooms: '4' },
  { value: '5br', label: '5+ Bedroom', bedrooms: '5' },
  { value: 'penthouse', label: 'Penthouse', bedrooms: '' },
  { value: 'duplex', label: 'Duplex', bedrooms: '' },
  { value: 'townhouse', label: 'Townhouse', bedrooms: '' },
  { value: 'villa', label: 'Villa', bedrooms: '' },
];

// Commercial unit types
const commercialUnitTypes = [
  { value: 'office', label: 'Office Space', bedrooms: '' },
  { value: 'retail', label: 'Retail Space / Shop', bedrooms: '' },
  { value: 'warehouse', label: 'Warehouse', bedrooms: '' },
  { value: 'showroom', label: 'Showroom', bedrooms: '' },
  { value: 'restaurant', label: 'Restaurant Space', bedrooms: '' },
  { value: 'industrial', label: 'Industrial Unit', bedrooms: '' },
  { value: 'godown', label: 'Godown', bedrooms: '' },
  { value: 'kiosk', label: 'Kiosk / Stall', bedrooms: '' },
  { value: 'workshop', label: 'Workshop', bedrooms: '' },
];

// Unit status options
const unitStatuses = [
  { value: 'vacant', label: 'Vacant' },
  { value: 'occupied', label: 'Occupied' },
  { value: 'maintenance', label: 'Under Maintenance' },
  { value: 'reserved', label: 'Reserved' },
];

// Residential unit amenities
const residentialAmenities = [
  'Balcony', 'En-suite', 'Walk-in Closet', 'Air Conditioning', 'Furnished', 
  'Semi-furnished', 'Kitchen Appliances', 'Water Heater', 'CCTV', 'Intercom',
  'Garden', 'Parking', 'Swimming Pool Access', 'Gym Access', 'DSQ'
];

// Commercial unit amenities
const commercialAmenities = [
  'Air Conditioning', 'Reception Area', 'Conference Room', 'Kitchenette', 
  'Server Room', 'Loading Bay', 'Parking', 'CCTV', '24/7 Access', 
  'Backup Generator', 'Elevator Access', 'Fiber Internet Ready'
];

// Residential property restrictions
const residentialRestrictions = [
  'No Pets', 'No Smoking', 'No Subletting', 'No Short-term Rentals', 
  'No Business Use', 'Families Only', 'No Parties/Events', 'Quiet Hours (10PM-7AM)'
];

// Commercial property restrictions
const commercialRestrictions = [
  'No Subletting', 'No Heavy Machinery', 'No Hazardous Materials', 
  'No Food Preparation', 'No Overnight Stay', 'Business Hours Only', 
  'No Signage Without Approval', 'No Structural Modifications'
];

// Utilities options
const utilitiesOptions = ['Water', 'Electricity', 'Internet', 'Gas', 'Service Charge', 'Garbage Collection'];

// Lease term options
const leaseTermOptions = [
  { value: '6_months', label: '6 Months' },
  { value: '12_months', label: '12 Months' },
  { value: '24_months', label: '24 Months' },
  { value: 'custom', label: 'Custom' },
];

interface AddLandlordFormProps {
  onClose: () => void;
  onSubmit: (data: LandlordFormData) => void;
}

export default function AddLandlordForm({ onClose, onSubmit }: AddLandlordFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 7;
  
  const fileRefs = {
    idCopy: useRef<HTMLInputElement>(null),
    kraPin: useRef<HTMLInputElement>(null),
    titleCopy: useRef<HTMLInputElement>(null),
    companyCR12: useRef<HTMLInputElement>(null),
    companyIncorporation: useRef<HTMLInputElement>(null),
    authorityLetter: useRef<HTMLInputElement>(null),
    otherDoc: useRef<HTMLInputElement>(null),
  };
  
  const [otherDocDescription, setOtherDocDescription] = useState('');
  const [showAgreementNote, setShowAgreementNote] = useState(false);
  
  const [formData, setFormData] = useState<LandlordFormData>({
    propertyType: 'residential',
    firstName: '',
    lastName: '',
    idNumber: '',
    phoneNumber: '',
    email: '',
    postalAddress: '',
    physicalAddress: '',
    preferredCommunication: 'whatsapp',
    isNamedPersonLegalOwner: true,
    ownershipType: 'individual',
    companyName: '',
    companyRegNumber: '',
    contactPersonName: '',
    contactPersonPhone: '',
    contactPersonEmail: '',
    additionalOwners: [],
    selectedPropertyId: '',
    propertyName: '',
    areaEstate: '',
    streetLandmark: '',
    county: 'Nairobi',
    propertyStatus: 'vacant',
    landlordUnits: [],
    servicesRequired: [],
    managementStartDate: '',
    rentCollectionMethod: 'mpesa',
    mpesaDepositType: 'mobile',
    mpesaMobileNumber: '',
    mpesaPaybillNumber: '',
    mpesaAccountNumber: '',
    propertyAccess: 'caretaker_on_site',
    bankName: '',
    bankAccountNumber: '',
    bankBranch: '',
    propertyCondition: 'good',
    knownIssues: '',
    preferredVendorIds: [],
    maxRepairAmountWithoutApproval: '',
    insuranceCarrier: '',
    policyNumber: '',
    insuranceExpiration: '',
    landRatesUpToDate: false,
    propertyCompliant: false,
    occupationCertificatesInPlace: false,
    restrictions: [],
    otherInstructions: '',
    additionalNotes: '',
    monthlyManagementFeePercent: '',
    tenantPlacementFeeMonths: '1',
    commercialLeasingFeeType: 'months_rent',
    commercialLeasingFeePercent: '',
    commercialLeasingFeeMonths: '1',
    rentRemittanceDays: '5',
    rentRemittanceDate: '5',
    rentRemittanceType: 'working_days',
    idCopy: null,
    kraPin: null,
    titleCopy: null,
    companyCR12: null,
    companyIncorporation: null,
    authorityLetter: null,
    otherDocuments: [],
    generateManagementAgreement: false,
  });

  // Get unit types based on property type
  const getUnitTypes = () => {
    return formData.propertyType === 'residential' ? residentialUnitTypes : commercialUnitTypes;
  };

  // Get amenities based on property type
  const getAmenities = () => {
    return formData.propertyType === 'residential' ? residentialAmenities : commercialAmenities;
  };

  // Get restrictions based on property type
  const getRestrictions = () => {
    return formData.propertyType === 'residential' ? residentialRestrictions : commercialRestrictions;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleArrayToggle = (field: keyof LandlordFormData, value: string) => {
    setFormData(prev => {
      const currentArray = prev[field] as string[];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(v => v !== value)
        : [...currentArray, value];
      return { ...prev, [field]: newArray };
    });
  };

  const handleFileChange = (field: keyof LandlordFormData, file: File | null) => {
    setFormData(prev => ({ ...prev, [field]: file }));
  };

  // Additional Owners Management (for Joint Ownership)
  const addAdditionalOwner = () => {
    setFormData(prev => ({
      ...prev,
      additionalOwners: [...prev.additionalOwners, { 
        firstName: '', 
        lastName: '', 
        nationality: 'Kenyan', 
        countryOfResidence: 'Kenya', 
        idNumber: '' 
      }]
    }));
  };

  const updateAdditionalOwner = (index: number, field: keyof Owner, value: string) => {
    setFormData(prev => ({
      ...prev,
      additionalOwners: prev.additionalOwners.map((owner, i) => 
        i === index ? { ...owner, [field]: value } : owner
      )
    }));
  };

  const removeAdditionalOwner = (index: number) => {
    setFormData(prev => ({
      ...prev,
      additionalOwners: prev.additionalOwners.filter((_, i) => i !== index)
    }));
  };

  // Property Selection Handler
  const handlePropertySelection = (propertyId: string) => {
    if (propertyId === 'add_new') {
      window.location.href = '/admin/properties';
      return;
    }
    
    const property = mockProperties.find(p => p.id === propertyId);
    setFormData(prev => ({
      ...prev,
      selectedPropertyId: propertyId,
      propertyName: property?.name || '',
      landlordUnits: []
    }));
  };

  // Get bedrooms from unit type
  const getBedroomsFromType = (unitType: string): string => {
    const allTypes = [...residentialUnitTypes, ...commercialUnitTypes];
    const type = allTypes.find(t => t.value === unitType);
    return type?.bedrooms || '';
  };

  // Unit Management for Landlord
  const addLandlordUnit = () => {
    const newUnit: UnitDetail = {
      unitId: `new_${Date.now()}`,
      unitNumber: '',
      unitType: '',
      floor: '',
      bedrooms: '',
      bathrooms: '1',
      squareFootage: '',
      monthlyRent: '',
      securityDeposit: '',
      securityDepositType: '1_month',
      status: 'vacant',
      tenantId: '',
      amenities: [],
      description: '',
      utilitiesPaidByTenant: [],
      monthlyServiceCharge: '',
      leaseTerm: '12_months',
      leaseTermCustom: '',
    };
    setFormData(prev => ({
      ...prev,
      landlordUnits: [...prev.landlordUnits, newUnit]
    }));
  };

  const selectExistingUnit = (unitId: string) => {
    const property = mockProperties.find(p => p.id === formData.selectedPropertyId);
    const existingUnit = property?.units.find(u => u.id === unitId);
    
    if (existingUnit && !formData.landlordUnits.find(u => u.unitId === unitId)) {
      const bedrooms = getBedroomsFromType(existingUnit.type);
      const unitDetail: UnitDetail = {
        unitId: existingUnit.id,
        unitNumber: existingUnit.name,
        unitType: existingUnit.type,
        floor: existingUnit.floor,
        bedrooms: bedrooms,
        bathrooms: '1',
        squareFootage: '',
        monthlyRent: '',
        securityDeposit: '',
        securityDepositType: '1_month',
        status: existingUnit.status,
        tenantId: '',
        amenities: [],
        description: '',
        utilitiesPaidByTenant: [],
        monthlyServiceCharge: '',
        leaseTerm: '12_months',
        leaseTermCustom: '',
      };
      setFormData(prev => ({
        ...prev,
        landlordUnits: [...prev.landlordUnits, unitDetail]
      }));
    }
  };

  const updateLandlordUnit = (index: number, field: keyof UnitDetail, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      landlordUnits: prev.landlordUnits.map((unit, i) => {
        if (i === index) {
          const updatedUnit = { ...unit, [field]: value };
          
          // Auto-assign bedrooms when unit type changes
          if (field === 'unitType' && typeof value === 'string') {
            const bedrooms = getBedroomsFromType(value);
            if (bedrooms) {
              updatedUnit.bedrooms = bedrooms;
            }
          }
          
          // Clear tenant when status changes from occupied
          if (field === 'status' && value !== 'occupied') {
            updatedUnit.tenantId = '';
          }
          
          return updatedUnit;
        }
        return unit;
      })
    }));
  };

  const toggleUnitAmenity = (index: number, amenity: string) => {
    setFormData(prev => ({
      ...prev,
      landlordUnits: prev.landlordUnits.map((unit, i) => {
        if (i === index) {
          const newAmenities = unit.amenities.includes(amenity)
            ? unit.amenities.filter(a => a !== amenity)
            : [...unit.amenities, amenity];
          return { ...unit, amenities: newAmenities };
        }
        return unit;
      })
    }));
  };

  const toggleUnitUtility = (index: number, utility: string) => {
    setFormData(prev => ({
      ...prev,
      landlordUnits: prev.landlordUnits.map((unit, i) => {
        if (i === index) {
          const newUtilities = unit.utilitiesPaidByTenant.includes(utility)
            ? unit.utilitiesPaidByTenant.filter(u => u !== utility)
            : [...unit.utilitiesPaidByTenant, utility];
          return { ...unit, utilitiesPaidByTenant: newUtilities };
        }
        return unit;
      })
    }));
  };

  const removeLandlordUnit = (index: number) => {
    setFormData(prev => ({
      ...prev,
      landlordUnits: prev.landlordUnits.filter((_, i) => i !== index)
    }));
  };

  const addOtherDocument = (file: File) => {
    if (otherDocDescription.trim()) {
      setFormData(prev => ({
        ...prev,
        otherDocuments: [...prev.otherDocuments, { file, description: otherDocDescription }]
      }));
      setOtherDocDescription('');
    }
  };

  const removeOtherDocument = (index: number) => {
    setFormData(prev => ({
      ...prev,
      otherDocuments: prev.otherDocuments.filter((_, i) => i !== index)
    }));
  };

  const handleGenerateAgreement = () => {
    setFormData(prev => ({ ...prev, generateManagementAgreement: true }));
    setShowAgreementNote(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // Consistent input styling for all fields
  const inputClass = "w-full h-10 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent";
  const selectClass = "w-full h-10 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white";
  const textareaClass = "w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";
  const smallLabelClass = "block text-xs font-medium text-gray-600 mb-1";
  const checkboxClass = "h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded";

  const getSelectedProperty = () => mockProperties.find(p => p.id === formData.selectedPropertyId);

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            {/* Property Type Toggle */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <label className={labelClass}>Property Type *</label>
              <div className="flex gap-4 mt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="propertyType"
                    value="residential"
                    checked={formData.propertyType === 'residential'}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span className="text-sm font-medium">Residential Property</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="propertyType"
                    value="commercial"
                    checked={formData.propertyType === 'commercial'}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span className="text-sm font-medium">Commercial Property</span>
                </label>
              </div>
            </div>

            {/* Section A: Landlord Details */}
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Section A: Landlord Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>National ID / Passport Number *</label>
                  <input
                    type="text"
                    name="idNumber"
                    value={formData.idNumber}
                    onChange={handleInputChange}
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>Phone Number *</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="+254 7XX XXX XXX"
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>Postal Address</label>
                  <input
                    type="text"
                    name="postalAddress"
                    value={formData.postalAddress}
                    onChange={handleInputChange}
                    placeholder="P.O. Box 12345"
                    className={inputClass}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Physical Address</label>
                  <input
                    type="text"
                    name="physicalAddress"
                    value={formData.physicalAddress}
                    onChange={handleInputChange}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Preferred Method of Communication</label>
                  <select
                    name="preferredCommunication"
                    value={formData.preferredCommunication}
                    onChange={handleInputChange}
                    className={selectClass}
                  >
                    <option value="whatsapp">WhatsApp</option>
                    <option value="phone">Phone Call</option>
                    <option value="email">Email</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            {/* Section B: Ownership Details */}
            <h4 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Section B: Ownership Details</h4>
            
            <div className="space-y-4">
              {/* Legal Owner Question */}
              <div className="bg-gray-50 rounded-lg p-4">
                <label className={labelClass}>
                  Is {formData.firstName || 'the named person'} {formData.lastName || ''} the legal owner of the property? *
                </label>
                <div className="flex gap-6 mt-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="isNamedPersonLegalOwner"
                      checked={formData.isNamedPersonLegalOwner === true}
                      onChange={() => setFormData(prev => ({ ...prev, isNamedPersonLegalOwner: true }))}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="font-medium">Yes</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="isNamedPersonLegalOwner"
                      checked={formData.isNamedPersonLegalOwner === false}
                      onChange={() => setFormData(prev => ({ ...prev, isNamedPersonLegalOwner: false }))}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="font-medium">No</span>
                  </label>
                </div>
              </div>

              {/* Authority Letter Upload - Required if NOT legal owner */}
              {!formData.isNamedPersonLegalOwner && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <label className={labelClass}>
                    Authority Letter / Power of Attorney *
                    <span className="text-red-500 ml-1">(Required)</span>
                  </label>
                  <p className="text-sm text-amber-700 mb-3">
                    Since {formData.firstName || 'the named person'} is not the legal owner, please attach the authority letter or power of attorney.
                  </p>
                  <input
                    type="file"
                    ref={fileRefs.authorityLetter}
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileChange('authorityLetter', e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileRefs.authorityLetter.current?.click()}
                    className={`${inputClass} text-left ${formData.authorityLetter ? 'text-gray-900 bg-green-50 border-green-300' : 'text-gray-400'}`}
                  >
                    {formData.authorityLetter ? (
                      <span className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {formData.authorityLetter.name}
                      </span>
                    ) : (
                      'Click to upload authority letter...'
                    )}
                  </button>
                </div>
              )}

              {/* Ownership Type */}
              <div>
                <label className={labelClass}>Ownership Type *</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
                  {[
                    { value: 'individual', label: 'Individual', icon: '👤' },
                    { value: 'joint', label: 'Joint Ownership', icon: '👥' },
                    { value: 'company', label: 'Company / Limited Entity', icon: '🏢' },
                  ].map(option => (
                    <label 
                      key={option.value}
                      className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition ${
                        formData.ownershipType === option.value 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="ownershipType"
                        value={option.value}
                        checked={formData.ownershipType === option.value}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600"
                      />
                      <span className="text-xl">{option.icon}</span>
                      <span className="font-medium">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Company Details - Show if Company selected */}
              {formData.ownershipType === 'company' && (
                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                  <h5 className="font-medium text-gray-700">Company Details</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Company Name *</label>
                      <input
                        type="text"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleInputChange}
                        className={inputClass}
                        required
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Registration Number *</label>
                      <input
                        type="text"
                        name="companyRegNumber"
                        value={formData.companyRegNumber}
                        onChange={handleInputChange}
                        className={inputClass}
                        required
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Contact Person Name *</label>
                      <input
                        type="text"
                        name="contactPersonName"
                        value={formData.contactPersonName}
                        onChange={handleInputChange}
                        className={inputClass}
                        required
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Contact Person Phone *</label>
                      <input
                        type="tel"
                        name="contactPersonPhone"
                        value={formData.contactPersonPhone}
                        onChange={handleInputChange}
                        placeholder="+254 7XX XXX XXX"
                        className={inputClass}
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className={labelClass}>Contact Person Email</label>
                      <input
                        type="email"
                        name="contactPersonEmail"
                        value={formData.contactPersonEmail}
                        onChange={handleInputChange}
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Joint Ownership - Additional Owners */}
              {formData.ownershipType === 'joint' && (
                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h5 className="font-medium text-gray-700">Additional Named Owners</h5>
                    <Button type="button" variant="outline" size="sm" onClick={addAdditionalOwner}>
                      + Add Owner
                    </Button>
                  </div>
                  
                  {formData.additionalOwners.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Click &quot;Add Owner&quot; to include additional owners for joint ownership
                    </p>
                  )}
                  
                  {formData.additionalOwners.map((owner, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h6 className="font-medium text-gray-700">Owner {index + 2}</h6>
                        <button
                          type="button"
                          onClick={() => removeAdditionalOwner(index)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className={smallLabelClass}>First Name *</label>
                          <input
                            type="text"
                            value={owner.firstName}
                            onChange={(e) => updateAdditionalOwner(index, 'firstName', e.target.value)}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={smallLabelClass}>Last Name *</label>
                          <input
                            type="text"
                            value={owner.lastName}
                            onChange={(e) => updateAdditionalOwner(index, 'lastName', e.target.value)}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={smallLabelClass}>ID Number *</label>
                          <input
                            type="text"
                            value={owner.idNumber}
                            onChange={(e) => updateAdditionalOwner(index, 'idNumber', e.target.value)}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={smallLabelClass}>Nationality</label>
                          <input
                            type="text"
                            value={owner.nationality}
                            onChange={(e) => updateAdditionalOwner(index, 'nationality', e.target.value)}
                            className={inputClass}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className={smallLabelClass}>Country of Residence</label>
                          <input
                            type="text"
                            value={owner.countryOfResidence}
                            onChange={(e) => updateAdditionalOwner(index, 'countryOfResidence', e.target.value)}
                            placeholder="For diaspora clients"
                            className={inputClass}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            {/* Section C: Property Details */}
            <h4 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Section C: Property Details</h4>
            
            {/* Property Selection Dropdown */}
            <div>
              <label className={labelClass}>Select Property *</label>
              <select
                value={formData.selectedPropertyId}
                onChange={(e) => handlePropertySelection(e.target.value)}
                className={selectClass}
              >
                <option value="">-- Select a property --</option>
                {mockProperties
                  .filter(p => p.type === formData.propertyType)
                  .map(property => (
                  <option key={property.id} value={property.id}>
                    {property.name} - {property.address} ({property.units.length} units)
                  </option>
                ))}
                <option value="add_new" className="text-blue-600 font-medium">
                  ➕ Add New Property
                </option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Showing {formData.propertyType} properties only. Select an existing property or add a new one.
              </p>
            </div>

            {/* Selected Property Info */}
            {formData.selectedPropertyId && formData.selectedPropertyId !== 'add_new' && (
              <>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h5 className="font-medium text-blue-800 mb-2">Selected Property</h5>
                  <p className="text-sm text-blue-700">{getSelectedProperty()?.name}</p>
                  <p className="text-xs text-blue-600">{getSelectedProperty()?.address}</p>
                </div>

                {/* Unit Selection */}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h5 className="font-medium text-gray-800">Landlord&apos;s Units</h5>
                      <p className="text-sm text-gray-500">Select existing units or add new units owned by this landlord</p>
                    </div>
                  </div>

                  {/* Existing Units to Select */}
                  {getSelectedProperty() && getSelectedProperty()!.units.length > 0 && (
                    <div className="mb-4">
                      <label className={smallLabelClass}>Select Existing Units</label>
                      <div className="flex flex-wrap gap-2">
                        {getSelectedProperty()!.units.map(unit => {
                          const isSelected = formData.landlordUnits.some(u => u.unitId === unit.id);
                          return (
                            <button
                              key={unit.id}
                              type="button"
                              onClick={() => !isSelected && selectExistingUnit(unit.id)}
                              disabled={isSelected}
                              className={`px-3 py-2 rounded-lg text-sm border transition ${
                                isSelected 
                                  ? 'bg-blue-100 border-blue-300 text-blue-700 cursor-not-allowed' 
                                  : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                              }`}
                            >
                              Unit {unit.name} ({unit.type}) {isSelected && '✓'}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Add New Unit Button */}
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={addLandlordUnit}
                    className="mb-4"
                  >
                    + Add New Unit
                  </Button>

                  {/* Landlord's Units Configuration */}
                  {formData.landlordUnits.length > 0 && (
                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                      {formData.landlordUnits.map((unit, index) => (
                        <div key={unit.unitId} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h6 className="font-semibold text-gray-800">
                              Unit {index + 1}: {unit.unitNumber || 'New Unit'}
                            </h6>
                            <button
                              type="button"
                              onClick={() => removeLandlordUnit(index)}
                              className="text-red-500 hover:text-red-700 text-sm"
                            >
                              Remove
                            </button>
                          </div>

                          {/* Row 1: Basic Unit Info */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                            <div>
                              <label className={smallLabelClass}>Unit Number *</label>
                              <input
                                type="text"
                                value={unit.unitNumber}
                                onChange={(e) => updateLandlordUnit(index, 'unitNumber', e.target.value)}
                                className={inputClass}
                                placeholder="e.g., A1, 101"
                              />
                            </div>
                            <div>
                              <label className={smallLabelClass}>Unit Type *</label>
                              <select
                                value={unit.unitType}
                                onChange={(e) => updateLandlordUnit(index, 'unitType', e.target.value)}
                                className={selectClass}
                              >
                                <option value="">Select type...</option>
                                {getUnitTypes().map(type => (
                                  <option key={type.value} value={type.value}>{type.label}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className={smallLabelClass}>Floor</label>
                              <input
                                type="text"
                                value={unit.floor}
                                onChange={(e) => updateLandlordUnit(index, 'floor', e.target.value)}
                                className={inputClass}
                                placeholder="e.g., 1, 2, G"
                              />
                            </div>
                            <div>
                              <label className={smallLabelClass}>Status *</label>
                              <select
                                value={unit.status}
                                onChange={(e) => updateLandlordUnit(index, 'status', e.target.value)}
                                className={selectClass}
                              >
                                {unitStatuses.map(status => (
                                  <option key={status.value} value={status.value}>{status.label}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          {/* Row 2: Tenant Assignment (only if Occupied) */}
                          {unit.status === 'occupied' && (
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
                              <label className={smallLabelClass}>Assign Tenant *</label>
                              <select
                                value={unit.tenantId}
                                onChange={(e) => {
                                  if (e.target.value === 'add_new') {
                                    window.location.href = '/admin/tenants';
                                  } else {
                                    updateLandlordUnit(index, 'tenantId', e.target.value);
                                  }
                                }}
                                className={selectClass}
                              >
                                <option value="">-- Select Tenant --</option>
                                {mockTenants.map(tenant => (
                                  <option key={tenant.id} value={tenant.id}>
                                    {tenant.name} ({tenant.phone})
                                  </option>
                                ))}
                                <option value="add_new" className="text-blue-600">
                                  ➕ Add New Tenant
                                </option>
                              </select>
                              <p className="text-xs text-amber-600 mt-1">
                                Unit is marked as occupied - please assign a tenant
                              </p>
                            </div>
                          )}

                          {/* Row 3: Size and Rooms (only for residential) */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                            {formData.propertyType === 'residential' && (
                              <>
                                <div>
                                  <label className={smallLabelClass}>Bedrooms</label>
                                  <input
                                    type="number"
                                    value={unit.bedrooms}
                                    onChange={(e) => updateLandlordUnit(index, 'bedrooms', e.target.value)}
                                    className={`${inputClass} ${getBedroomsFromType(unit.unitType) ? 'bg-gray-100' : ''}`}
                                    min="0"
                                    placeholder="0"
                                    readOnly={!!getBedroomsFromType(unit.unitType)}
                                  />
                                  {getBedroomsFromType(unit.unitType) && (
                                    <p className="text-xs text-gray-500 mt-1">Auto-set from type</p>
                                  )}
                                </div>
                                <div>
                                  <label className={smallLabelClass}>Bathrooms</label>
                                  <input
                                    type="number"
                                    value={unit.bathrooms}
                                    onChange={(e) => updateLandlordUnit(index, 'bathrooms', e.target.value)}
                                    className={inputClass}
                                    min="0"
                                    step="0.5"
                                    placeholder="1"
                                  />
                                </div>
                              </>
                            )}
                            <div>
                              <label className={smallLabelClass}>Size (sq ft)</label>
                              <input
                                type="number"
                                value={unit.squareFootage}
                                onChange={(e) => updateLandlordUnit(index, 'squareFootage', e.target.value)}
                                className={inputClass}
                                min="0"
                                placeholder="500"
                              />
                            </div>
                            <div>
                              <label className={smallLabelClass}>Monthly Rent (KES) *</label>
                              <input
                                type="number"
                                value={unit.monthlyRent}
                                onChange={(e) => updateLandlordUnit(index, 'monthlyRent', e.target.value)}
                                className={inputClass}
                                min="0"
                                placeholder="25000"
                              />
                            </div>
                          </div>

                          {/* Row 4: Financial Details */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                            <div>
                              <label className={smallLabelClass}>Security Deposit</label>
                              <select
                                value={unit.securityDepositType}
                                onChange={(e) => {
                                  const value = e.target.value as '1_month' | '2_months' | 'custom';
                                  updateLandlordUnit(index, 'securityDepositType', value);
                                  if (value === '1_month' && unit.monthlyRent) {
                                    updateLandlordUnit(index, 'securityDeposit', unit.monthlyRent);
                                  } else if (value === '2_months' && unit.monthlyRent) {
                                    updateLandlordUnit(index, 'securityDeposit', String(Number(unit.monthlyRent) * 2));
                                  }
                                }}
                                className={selectClass}
                              >
                                <option value="1_month">1 Month Rent</option>
                                <option value="2_months">2 Months Rent</option>
                                <option value="custom">Custom Amount</option>
                              </select>
                            </div>
                            {unit.securityDepositType === 'custom' && (
                              <div>
                                <label className={smallLabelClass}>Deposit Amount (KES)</label>
                                <input
                                  type="number"
                                  value={unit.securityDeposit}
                                  onChange={(e) => updateLandlordUnit(index, 'securityDeposit', e.target.value)}
                                  className={inputClass}
                                  min="0"
                                  placeholder="25000"
                                />
                              </div>
                            )}
                            <div>
                              <label className={smallLabelClass}>Service Charge (KES)</label>
                              <input
                                type="number"
                                value={unit.monthlyServiceCharge}
                                onChange={(e) => updateLandlordUnit(index, 'monthlyServiceCharge', e.target.value)}
                                className={inputClass}
                                min="0"
                                placeholder="3000"
                              />
                            </div>
                            <div>
                              <label className={smallLabelClass}>Lease Term</label>
                              <select
                                value={unit.leaseTerm}
                                onChange={(e) => updateLandlordUnit(index, 'leaseTerm', e.target.value)}
                                className={selectClass}
                              >
                                {leaseTermOptions.map(option => (
                                  <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                              </select>
                            </div>
                            {unit.leaseTerm === 'custom' && (
                              <div>
                                <label className={smallLabelClass}>Custom Term</label>
                                <input
                                  type="text"
                                  value={unit.leaseTermCustom}
                                  onChange={(e) => updateLandlordUnit(index, 'leaseTermCustom', e.target.value)}
                                  className={inputClass}
                                  placeholder="e.g., 18 months"
                                />
                              </div>
                            )}
                          </div>

                          {/* Row 5: Utilities Paid By Tenant */}
                          <div className="mb-3">
                            <label className={smallLabelClass}>Utilities Paid By Tenant</label>
                            <div className="flex flex-wrap gap-3 mt-1">
                              {utilitiesOptions.map(utility => (
                                <label key={utility} className="flex items-center gap-1 text-sm">
                                  <input
                                    type="checkbox"
                                    checked={unit.utilitiesPaidByTenant.includes(utility)}
                                    onChange={() => toggleUnitUtility(index, utility)}
                                    className={checkboxClass}
                                  />
                                  {utility}
                                </label>
                              ))}
                            </div>
                          </div>

                          {/* Row 6: Unit Amenities */}
                          <div className="mb-3">
                            <label className={smallLabelClass}>Unit Amenities</label>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {getAmenities().map(amenity => (
                                <label key={amenity} className="flex items-center gap-1 text-xs">
                                  <input
                                    type="checkbox"
                                    checked={unit.amenities.includes(amenity)}
                                    onChange={() => toggleUnitAmenity(index, amenity)}
                                    className="w-3 h-3 text-blue-600 rounded"
                                  />
                                  {amenity}
                                </label>
                              ))}
                            </div>
                          </div>

                          {/* Row 7: Description */}
                          <div>
                            <label className={smallLabelClass}>Unit Description</label>
                            <textarea
                              value={unit.description}
                              onChange={(e) => updateLandlordUnit(index, 'description', e.target.value)}
                              className={textareaClass}
                              rows={2}
                              placeholder="Additional details about this unit..."
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            {/* Section D: Management Services */}
            <h4 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Section D: Management Services</h4>
            
            <div>
              <label className={labelClass}>Services Required *</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                {[
                  { value: 'full_management', label: 'Full Property Management' },
                  { value: 'tenant_sourcing', label: 'Tenant Sourcing & Screening' },
                  { value: 'rent_collection', label: 'Rent Collection & Remittance' },
                  { value: 'lease_preparation', label: 'Lease Preparation & Renewals' },
                  { value: 'maintenance', label: 'Maintenance & Repairs Coordination' },
                  { value: 'utility_management', label: 'Utility & Service Charge Management' },
                  { value: 'eviction', label: 'Tenant Notices & Eviction Coordination (where lawful)' },
                  { value: 'inspections', label: 'Property Inspections' },
                  { value: 'legal_compliance', label: 'Legal Compliance & Notices' },
                ].map(service => (
                  <label key={service.value} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <input
                      type="checkbox"
                      checked={formData.servicesRequired.includes(service.value)}
                      onChange={() => handleArrayToggle('servicesRequired', service.value)}
                      className={checkboxClass}
                    />
                    <span className="text-sm">{service.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Preferred Management Start Date</label>
                <input
                  type="date"
                  name="managementStartDate"
                  value={formData.managementStartDate}
                  onChange={handleInputChange}
                  className={inputClass}
                />
              </div>
            </div>

            {/* Section E: Financial & Access Details */}
            <h4 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2 mt-8">Section E: Financial & Access Details</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Rent Collection Method Preferred *</label>
                <select
                  name="rentCollectionMethod"
                  value={formData.rentCollectionMethod}
                  onChange={handleInputChange}
                  className={selectClass}
                >
                  <option value="mpesa">M-Pesa</option>
                  <option value="bank">Bank Transfer</option>
                  <option value="mixed">Mixed (M-Pesa & Bank)</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Property Access for Viewing</label>
                <select
                  name="propertyAccess"
                  value={formData.propertyAccess}
                  onChange={handleInputChange}
                  className={selectClass}
                >
                  <option value="keys_available">Keys Available</option>
                  <option value="caretaker_on_site">Caretaker on Site</option>
                  <option value="owner_managed">Owner-managed</option>
                </select>
              </div>
            </div>

            {/* M-Pesa Details - Show when M-Pesa or Mixed selected */}
            {(formData.rentCollectionMethod === 'mpesa' || formData.rentCollectionMethod === 'mixed') && (
              <div className="border border-green-200 bg-green-50 rounded-lg p-4 space-y-4">
                <h5 className="font-medium text-green-800 flex items-center gap-2">
                  <span className="text-xl">📱</span> M-Pesa Deposit Details
                </h5>
                
                <div>
                  <label className={labelClass}>Deposit To *</label>
                  <div className="flex gap-4 mt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="mpesaDepositType"
                        value="mobile"
                        checked={formData.mpesaDepositType === 'mobile'}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-green-600"
                      />
                      <span className="text-sm font-medium">Mobile Number</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="mpesaDepositType"
                        value="paybill"
                        checked={formData.mpesaDepositType === 'paybill'}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-green-600"
                      />
                      <span className="text-sm font-medium">Paybill Number</span>
                    </label>
                  </div>
                </div>

                {formData.mpesaDepositType === 'mobile' && (
                  <div>
                    <label className={labelClass}>M-Pesa Registered Mobile Number *</label>
                    <input
                      type="tel"
                      name="mpesaMobileNumber"
                      value={formData.mpesaMobileNumber}
                      onChange={handleInputChange}
                      placeholder="+254 7XX XXX XXX"
                      className={inputClass}
                    />
                    <p className="text-xs text-gray-500 mt-1">This number will receive rent payments via M-Pesa</p>
                  </div>
                )}

                {formData.mpesaDepositType === 'paybill' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Paybill Number *</label>
                      <input
                        type="text"
                        name="mpesaPaybillNumber"
                        value={formData.mpesaPaybillNumber}
                        onChange={handleInputChange}
                        placeholder="e.g., 123456"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Account Number *</label>
                      <input
                        type="text"
                        name="mpesaAccountNumber"
                        value={formData.mpesaAccountNumber}
                        onChange={handleInputChange}
                        placeholder="Account reference"
                        className={inputClass}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Bank Details - Show when Bank or Mixed selected */}
            {(formData.rentCollectionMethod === 'bank' || formData.rentCollectionMethod === 'mixed') && (
              <div className="border border-blue-200 bg-blue-50 rounded-lg p-4 space-y-4">
                <h5 className="font-medium text-blue-800 flex items-center gap-2">
                  <span className="text-xl">🏦</span> Bank Details (for Payouts)
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Bank Name *</label>
                    <select
                      name="bankName"
                      value={formData.bankName}
                      onChange={handleInputChange}
                      className={selectClass}
                    >
                      <option value="">Select bank...</option>
                      <option value="KCB">Kenya Commercial Bank (KCB)</option>
                      <option value="Equity">Equity Bank</option>
                      <option value="Cooperative">Co-operative Bank</option>
                      <option value="ABSA">ABSA Bank Kenya</option>
                      <option value="Standard Chartered">Standard Chartered</option>
                      <option value="NCBA">NCBA Bank</option>
                      <option value="DTB">Diamond Trust Bank</option>
                      <option value="Stanbic">Stanbic Bank</option>
                      <option value="I&M">I&M Bank</option>
                      <option value="Family">Family Bank</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Account Number *</label>
                    <input
                      type="text"
                      name="bankAccountNumber"
                      value={formData.bankAccountNumber}
                      onChange={handleInputChange}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Branch</label>
                    <input
                      type="text"
                      name="bankBranch"
                      value={formData.bankBranch}
                      onChange={handleInputChange}
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Pricing & Commission Section */}
            <h4 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2 mt-8">Pricing & Commission</h4>
            
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 space-y-4">
              <h5 className="font-medium text-purple-800">
                {formData.propertyType === 'residential' ? '🏠 Residential Properties' : '🏢 Commercial Properties'}
              </h5>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Monthly Management Fee *</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      name="monthlyManagementFeePercent"
                      value={formData.monthlyManagementFeePercent}
                      onChange={handleInputChange}
                      className={inputClass}
                      min="0"
                      max="100"
                      step="0.5"
                      placeholder="e.g., 10"
                    />
                    <span className="text-sm text-gray-600 whitespace-nowrap">% of monthly rent collected</span>
                  </div>
                </div>
                
                {formData.propertyType === 'residential' ? (
                  <div>
                    <label className={labelClass}>Tenant Placement Fee *</label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Equivalent to</span>
                      <input
                        type="number"
                        name="tenantPlacementFeeMonths"
                        value={formData.tenantPlacementFeeMonths}
                        onChange={handleInputChange}
                        className={`${inputClass} w-20`}
                        min="0"
                        step="0.5"
                        placeholder="1"
                      />
                      <span className="text-sm text-gray-600 whitespace-nowrap">month&apos;s rent (one-time, per new tenant)</span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className={labelClass}>Tenant Placement / Leasing Fee *</label>
                    <div className="space-y-2">
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="commercialLeasingFeeType"
                            value="percent_annual"
                            checked={formData.commercialLeasingFeeType === 'percent_annual'}
                            onChange={handleInputChange}
                            className="h-4 w-4 text-purple-600"
                          />
                          <span className="text-sm">% of annual rent</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="commercialLeasingFeeType"
                            value="months_rent"
                            checked={formData.commercialLeasingFeeType === 'months_rent'}
                            onChange={handleInputChange}
                            className="h-4 w-4 text-purple-600"
                          />
                          <span className="text-sm">Month(s) rent</span>
                        </label>
                      </div>
                      
                      {formData.commercialLeasingFeeType === 'percent_annual' ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            name="commercialLeasingFeePercent"
                            value={formData.commercialLeasingFeePercent}
                            onChange={handleInputChange}
                            className={`${inputClass} w-24`}
                            min="0"
                            max="100"
                            step="0.5"
                            placeholder="e.g., 15"
                          />
                          <span className="text-sm text-gray-600">% of annual rent</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            name="commercialLeasingFeeMonths"
                            value={formData.commercialLeasingFeeMonths}
                            onChange={handleInputChange}
                            className={`${inputClass} w-24`}
                            min="0"
                            step="0.5"
                            placeholder="e.g., 1"
                          />
                          <span className="text-sm text-gray-600">month(s) rent</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Payment & Disbursement */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
              <h5 className="font-medium text-gray-800">💰 Payment & Disbursement</h5>
              
              <div>
                <label className={labelClass}>Rent will be remitted to the landlord *</label>
                <div className="flex gap-4 mt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="rentRemittanceType"
                      value="working_days"
                      checked={formData.rentRemittanceType === 'working_days'}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="text-sm">Within working days</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="rentRemittanceType"
                      value="specific_date"
                      checked={formData.rentRemittanceType === 'specific_date'}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="text-sm">By specific date</span>
                  </label>
                </div>
              </div>

              {formData.rentRemittanceType === 'working_days' ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Within</span>
                  <input
                    type="number"
                    name="rentRemittanceDays"
                    value={formData.rentRemittanceDays}
                    onChange={handleInputChange}
                    className={`${inputClass} w-20`}
                    min="1"
                    max="30"
                    placeholder="5"
                  />
                  <span className="text-sm text-gray-600">working days of rent collection</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">By the</span>
                  <input
                    type="number"
                    name="rentRemittanceDate"
                    value={formData.rentRemittanceDate}
                    onChange={handleInputChange}
                    className={`${inputClass} w-20`}
                    min="1"
                    max="28"
                    placeholder="5"
                  />
                  <span className="text-sm text-gray-600">of every month</span>
                </div>
              )}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            {/* Property Condition & Maintenance */}
            <h4 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Property Condition & Maintenance</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Current Condition of Property *</label>
                <div className="flex flex-wrap gap-3 mt-2">
                  {[
                    { value: 'excellent', label: 'Excellent' },
                    { value: 'good', label: 'Good' },
                    { value: 'fair', label: 'Fair' },
                    { value: 'needs_repairs', label: 'Needs Repairs' },
                  ].map(option => (
                    <label key={option.value} className="flex items-center gap-1">
                      <input
                        type="radio"
                        name="propertyCondition"
                        value={option.value}
                        checked={formData.propertyCondition === option.value}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600"
                      />
                      <span className="text-sm">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className={labelClass}>Max Repair Amount Without Owner Approval (KES)</label>
                <input
                  type="number"
                  name="maxRepairAmountWithoutApproval"
                  value={formData.maxRepairAmountWithoutApproval}
                  onChange={handleInputChange}
                  placeholder="e.g., 10000"
                  className={inputClass}
                />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Known Issues or Required Repairs</label>
                <textarea
                  name="knownIssues"
                  value={formData.knownIssues}
                  onChange={handleInputChange}
                  rows={3}
                  className={textareaClass}
                />
              </div>
            </div>

            {/* Preferred Maintenance Vendors */}
            <div>
              <label className={labelClass}>Preferred Maintenance Vendors</label>
              <p className="text-xs text-gray-500 mb-2">Select vendors from our system or add new ones. You can select multiple vendors.</p>
              
              <div className="border border-gray-200 rounded-lg p-4 space-y-3">
                {/* Selected Vendors Display */}
                {formData.preferredVendorIds.length > 0 && (
                  <div className="flex flex-wrap gap-2 pb-3 border-b">
                    {formData.preferredVendorIds.map(vendorId => {
                      const vendor = mockVendors.find(v => v.id === vendorId);
                      return vendor ? (
                        <span 
                          key={vendorId} 
                          className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                          {vendor.name} ({vendor.specialty})
                          <button
                            type="button"
                            onClick={() => handleArrayToggle('preferredVendorIds', vendorId)}
                            className="ml-1 text-blue-600 hover:text-blue-800"
                          >
                            ×
                          </button>
                        </span>
                      ) : null;
                    })}
                  </div>
                )}
                
                {/* Vendor Selection Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {mockVendors.map(vendor => (
                    <label 
                      key={vendor.id} 
                      className={`flex items-center gap-2 p-2 rounded cursor-pointer transition ${
                        formData.preferredVendorIds.includes(vendor.id)
                          ? 'bg-blue-50 border border-blue-200'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.preferredVendorIds.includes(vendor.id)}
                        onChange={() => handleArrayToggle('preferredVendorIds', vendor.id)}
                        className={checkboxClass}
                      />
                      <div>
                        <span className="text-sm font-medium">{vendor.name}</span>
                        <span className="text-xs text-gray-500 ml-2">({vendor.specialty})</span>
                      </div>
                    </label>
                  ))}
                </div>
                
                {/* Add New Vendor Option */}
                <button
                  type="button"
                  onClick={() => window.location.href = '/admin/vendors'}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium mt-2"
                >
                  <span>➕</span> Add New Vendor
                </button>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            {/* Insurance & Compliance */}
            <h4 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Insurance & Compliance</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Property Insurance Carrier</label>
                <input
                  type="text"
                  name="insuranceCarrier"
                  value={formData.insuranceCarrier}
                  onChange={handleInputChange}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Policy Number</label>
                <input
                  type="text"
                  name="policyNumber"
                  value={formData.policyNumber}
                  onChange={handleInputChange}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Expiration Date</label>
                <input
                  type="date"
                  name="insuranceExpiration"
                  value={formData.insuranceExpiration}
                  onChange={handleInputChange}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="space-y-3 mt-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="landRatesUpToDate"
                  checked={formData.landRatesUpToDate}
                  onChange={handleInputChange}
                  className={checkboxClass}
                />
                <span className="text-sm">Land rates & county fees are up to date</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="propertyCompliant"
                  checked={formData.propertyCompliant}
                  onChange={handleInputChange}
                  className={checkboxClass}
                />
                <span className="text-sm">Property complies with local building regulations</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="occupationCertificatesInPlace"
                  checked={formData.occupationCertificatesInPlace}
                  onChange={handleInputChange}
                  className={checkboxClass}
                />
                <span className="text-sm">Occupation certificates are in place</span>
              </label>
            </div>

            {/* Special Instructions - Tailored by property type */}
            <h4 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2 mt-8">
              Special Instructions ({formData.propertyType === 'residential' ? 'Residential' : 'Commercial'})
            </h4>
            
            <div>
              <label className={labelClass}>
                Property Restrictions ({formData.propertyType === 'residential' ? 'Residential' : 'Commercial'})
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                {getRestrictions().map(restriction => (
                  <label key={restriction} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.restrictions.includes(restriction)}
                      onChange={() => handleArrayToggle('restrictions', restriction)}
                      className={checkboxClass}
                    />
                    <span className="text-sm">{restriction}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className={labelClass}>
                Other Instructions {formData.propertyType === 'commercial' && '(e.g., loading hours, signage rules)'}
              </label>
              <textarea
                name="otherInstructions"
                value={formData.otherInstructions}
                onChange={handleInputChange}
                rows={3}
                className={textareaClass}
                placeholder={formData.propertyType === 'residential' 
                  ? "Any specific instructions for property management..." 
                  : "Any specific instructions for commercial property management (e.g., loading hours, signage rules, tenant industry restrictions)..."
                }
              />
            </div>

            <div>
              <label className={labelClass}>Additional Notes</label>
              <textarea
                name="additionalNotes"
                value={formData.additionalNotes}
                onChange={handleInputChange}
                rows={3}
                className={textareaClass}
                placeholder="Any other relevant information..."
              />
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            {/* Document Uploads */}
            <h4 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Document Uploads</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* ID Copy */}
              <div>
                <label className={labelClass}>Copy of ID / Passport *</label>
                <input
                  type="file"
                  ref={fileRefs.idCopy}
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileChange('idCopy', e.target.files?.[0] || null)}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileRefs.idCopy.current?.click()}
                  className={`${inputClass} text-left h-auto py-3 ${formData.idCopy ? 'bg-green-50 border-green-300' : ''}`}
                >
                  {formData.idCopy ? (
                    <span className="flex items-center gap-2 text-green-700">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {formData.idCopy.name}
                    </span>
                  ) : (
                    <span className="text-gray-400">Click to upload...</span>
                  )}
                </button>
              </div>

              {/* KRA PIN */}
              <div>
                <label className={labelClass}>KRA PIN Certificate</label>
                <input
                  type="file"
                  ref={fileRefs.kraPin}
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileChange('kraPin', e.target.files?.[0] || null)}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileRefs.kraPin.current?.click()}
                  className={`${inputClass} text-left h-auto py-3 ${formData.kraPin ? 'bg-green-50 border-green-300' : ''}`}
                >
                  {formData.kraPin ? (
                    <span className="flex items-center gap-2 text-green-700">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {formData.kraPin.name}
                    </span>
                  ) : (
                    <span className="text-gray-400">Click to upload...</span>
                  )}
                </button>
              </div>

              {/* Title Copy */}
              <div>
                <label className={labelClass}>Copy of Title / Lease / Sale Agreement</label>
                <input
                  type="file"
                  ref={fileRefs.titleCopy}
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileChange('titleCopy', e.target.files?.[0] || null)}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileRefs.titleCopy.current?.click()}
                  className={`${inputClass} text-left h-auto py-3 ${formData.titleCopy ? 'bg-green-50 border-green-300' : ''}`}
                >
                  {formData.titleCopy ? (
                    <span className="flex items-center gap-2 text-green-700">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {formData.titleCopy.name}
                    </span>
                  ) : (
                    <span className="text-gray-400">Click to upload...</span>
                  )}
                </button>
              </div>

              {/* Company Documents - only for company ownership */}
              {formData.ownershipType === 'company' && (
                <>
                  <div>
                    <label className={labelClass}>CR12 Document *</label>
                    <input
                      type="file"
                      ref={fileRefs.companyCR12}
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileChange('companyCR12', e.target.files?.[0] || null)}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileRefs.companyCR12.current?.click()}
                      className={`${inputClass} text-left h-auto py-3 ${formData.companyCR12 ? 'bg-green-50 border-green-300' : ''}`}
                    >
                      {formData.companyCR12 ? (
                        <span className="flex items-center gap-2 text-green-700">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {formData.companyCR12.name}
                        </span>
                      ) : (
                        <span className="text-gray-400">Click to upload...</span>
                      )}
                    </button>
                  </div>

                  <div>
                    <label className={labelClass}>Certificate of Incorporation</label>
                    <input
                      type="file"
                      ref={fileRefs.companyIncorporation}
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileChange('companyIncorporation', e.target.files?.[0] || null)}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileRefs.companyIncorporation.current?.click()}
                      className={`${inputClass} text-left h-auto py-3 ${formData.companyIncorporation ? 'bg-green-50 border-green-300' : ''}`}
                    >
                      {formData.companyIncorporation ? (
                        <span className="flex items-center gap-2 text-green-700">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {formData.companyIncorporation.name}
                        </span>
                      ) : (
                        <span className="text-gray-400">Click to upload...</span>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Other Documents */}
            <div className="border-t pt-4">
              <label className={labelClass}>Other Supporting Documents</label>
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  value={otherDocDescription}
                  onChange={(e) => setOtherDocDescription(e.target.value)}
                  placeholder="Document description..."
                  className={inputClass}
                />
                <input
                  type="file"
                  ref={fileRefs.otherDoc}
                  accept="image/*,.pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) addOtherDocument(file);
                  }}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileRefs.otherDoc.current?.click()}
                  disabled={!otherDocDescription.trim()}
                >
                  Add
                </Button>
              </div>

              {formData.otherDocuments.length > 0 && (
                <div className="mt-3 space-y-2">
                  {formData.otherDocuments.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span className="text-sm">
                        <strong>{doc.description}:</strong> {doc.file.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeOtherDocument(index)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Management Agreement - Clickable Button */}
            <div className="border-t pt-4">
              <h5 className="font-medium text-gray-800 mb-3">Management Agreement</h5>
              
              {!formData.generateManagementAgreement ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGenerateAgreement}
                  className="flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Generate Management Agreement
                </Button>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <div>
                      <p className="font-medium text-green-800">Management Agreement will be generated</p>
                      <p className="text-sm text-green-700 mt-1">
                        A draft property management agreement document will be prepared based on the details provided. 
                        This draft will be reviewed and approved by the admin before being issued to the landlord for signing.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, generateManagementAgreement: false }));
                          setShowAgreementNote(false);
                        }}
                        className="text-sm text-green-600 hover:text-green-800 mt-2 underline"
                      >
                        Cancel agreement generation
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {showAgreementNote && formData.generateManagementAgreement && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> The management agreement will include all the terms, fees, and conditions specified in this form. 
                    Ensure all pricing and commission details in Step 4 are accurate before submission.
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const canSubmit = () => {
    // Basic validation
    if (!formData.firstName || !formData.lastName || !formData.idNumber || !formData.phoneNumber || !formData.email) {
      return false;
    }
    if (!formData.isNamedPersonLegalOwner && !formData.authorityLetter) {
      return false;
    }
    if (formData.ownershipType === 'company' && (!formData.companyName || !formData.companyRegNumber)) {
      return false;
    }
    return true;
  };

  const steps = [
    'Landlord Details',
    'Ownership',
    'Property & Units',
    'Services & Financial',
    'Condition',
    'Compliance',
    'Documents'
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Add New Landlord</h2>
            <button onClick={onClose} className="text-white/80 hover:text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center justify-between mt-4">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                  currentStep > index + 1 
                    ? 'bg-green-500 text-white' 
                    : currentStep === index + 1 
                      ? 'bg-white text-blue-600' 
                      : 'bg-blue-500/50 text-white/70'
                }`}>
                  {currentStep > index + 1 ? '✓' : index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-8 h-0.5 mx-1 ${currentStep > index + 1 ? 'bg-green-500' : 'bg-blue-500/50'}`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs">
            {steps.map((step, index) => (
              <span key={index} className={currentStep === index + 1 ? 'text-white font-medium' : 'text-white/70'}>
                {step}
              </span>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-220px)]">
          {renderStep()}
        </div>

        {/* Footer */}
        <div className="border-t p-4 bg-gray-50 flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : onClose()}
          >
            {currentStep > 1 ? 'Previous' : 'Cancel'}
          </Button>
          <div className="flex gap-2">
            {currentStep < totalSteps ? (
              <Button
                type="button"
                variant="primary"
                onClick={() => setCurrentStep(currentStep + 1)}
              >
                Next
              </Button>
            ) : (
              <Button
                type="button"
                variant="primary"
                onClick={handleSubmit}
                disabled={!canSubmit()}
              >
                Submit Application
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
