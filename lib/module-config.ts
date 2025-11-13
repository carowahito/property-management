// Industry-agnostic modular platform configuration

export interface ModuleConfig {
  id: string
  name: string
  displayName: string
  description: string
  icon: string
  category: 'CORE' | 'BUSINESS' | 'SPECIALIZED'
  isCore: boolean // Core modules cannot be disabled
  dependencies?: string[] // Module IDs this depends on
  pricing: {
    tier: 'FREE' | 'BASIC' | 'PROFESSIONAL' | 'ENTERPRISE'
    monthlyPrice: number
    yearlyDiscount?: number
  }
  features: ModuleFeature[]
  industrySupport: string[]
}

export interface ModuleFeature {
  id: string
  name: string
  description: string
  tier: 'FREE' | 'BASIC' | 'PROFESSIONAL' | 'ENTERPRISE'
  enabled: boolean
}

export interface Industry {
  id: string
  name: string
  description: string
  modules: string[] // Module IDs that are most relevant for this industry
  terminologyOverrides?: Record<string, string> // Customize terms per industry
}

// ===================================
// AVAILABLE MODULES
// ===================================

export const AVAILABLE_MODULES: ModuleConfig[] = [
  // CRM MODULE - Universal for all businesses
  {
    id: 'crm',
    name: 'CRM',
    displayName: 'Customer Relationship Management',
    description: 'Lead management, contact tracking, and sales pipeline',
    icon: '👥',
    category: 'CORE',
    isCore: true,
    pricing: {
      tier: 'FREE',
      monthlyPrice: 0
    },
    features: [
      { id: 'lead_management', name: 'Lead Management', description: 'Capture and track leads', tier: 'FREE', enabled: true },
      { id: 'contact_management', name: 'Contact Management', description: 'Manage customer contacts', tier: 'FREE', enabled: true },
      { id: 'pipeline_management', name: 'Sales Pipeline', description: 'Track deals through sales stages', tier: 'BASIC', enabled: false },
      { id: 'email_automation', name: 'Email Automation', description: 'Automated email campaigns', tier: 'PROFESSIONAL', enabled: false },
      { id: 'ai_lead_scoring', name: 'AI Lead Scoring', description: 'AI-powered lead qualification', tier: 'ENTERPRISE', enabled: false }
    ],
    industrySupport: ['EDUCATION', 'HEALTHCARE', 'REAL_ESTATE', 'TECHNOLOGY', 'MANUFACTURING', 'RETAIL', 'SERVICES']
  },

  // RECORDS MODULE - Configurable record management (Students, Patients, Clients, etc.)
  {
    id: 'records',
    name: 'RECORDS',
    displayName: 'Record Management System',
    description: 'Manage entities and their records (Students, Patients, Clients, etc.)',
    icon: '📋',
    category: 'CORE',
    isCore: false,
    dependencies: ['crm'],
    pricing: {
      tier: 'BASIC',
      monthlyPrice: 29
    },
    features: [
      { id: 'entity_management', name: 'Entity Management', description: 'Create and manage entities', tier: 'BASIC', enabled: true },
      { id: 'record_tracking', name: 'Record Tracking', description: 'Track entity records and history', tier: 'BASIC', enabled: true },
      { id: 'document_management', name: 'Document Management', description: 'File and document storage', tier: 'PROFESSIONAL', enabled: false },
      { id: 'compliance_tracking', name: 'Compliance Tracking', description: 'Regulatory compliance management', tier: 'PROFESSIONAL', enabled: false },
      { id: 'advanced_analytics', name: 'Advanced Analytics', description: 'Detailed reporting and insights', tier: 'ENTERPRISE', enabled: false }
    ],
    industrySupport: ['EDUCATION', 'HEALTHCARE', 'LEGAL', 'GOVERNMENT', 'FINANCIAL']
  },

  // FINANCE MODULE - Universal billing and payment processing
  {
    id: 'finance',
    name: 'FINANCE',
    displayName: 'Financial Management',
    description: 'Invoicing, payments, and financial tracking',
    icon: '💰',
    category: 'BUSINESS',
    isCore: false,
    dependencies: ['records'],
    pricing: {
      tier: 'BASIC',
      monthlyPrice: 39
    },
    features: [
      { id: 'invoicing', name: 'Invoicing', description: 'Generate and send invoices', tier: 'BASIC', enabled: true },
      { id: 'payment_processing', name: 'Payment Processing', description: 'Process payments via Stripe', tier: 'BASIC', enabled: true },
      { id: 'recurring_billing', name: 'Recurring Billing', description: 'Automated subscription billing', tier: 'PROFESSIONAL', enabled: false },
      { id: 'financial_reporting', name: 'Financial Reporting', description: 'Revenue and expense reports', tier: 'PROFESSIONAL', enabled: false },
      { id: 'multi_currency', name: 'Multi-Currency', description: 'Support multiple currencies', tier: 'ENTERPRISE', enabled: false }
    ],
    industrySupport: ['EDUCATION', 'HEALTHCARE', 'REAL_ESTATE', 'TECHNOLOGY', 'MANUFACTURING', 'RETAIL', 'SERVICES', 'LEGAL']
  },

  // LEARNING MODULE - Content delivery (LMS for education, Training for corporate, etc.)
  {
    id: 'learning',
    name: 'LEARNING',
    displayName: 'Learning Management System',
    description: 'Content delivery, courses, and progress tracking',
    icon: '🎓',
    category: 'SPECIALIZED',
    isCore: false,
    dependencies: ['records', 'finance'],
    pricing: {
      tier: 'PROFESSIONAL',
      monthlyPrice: 59
    },
    features: [
      { id: 'content_delivery', name: 'Content Delivery', description: 'Deliver courses and training materials', tier: 'PROFESSIONAL', enabled: true },
      { id: 'progress_tracking', name: 'Progress Tracking', description: 'Track learner progress', tier: 'PROFESSIONAL', enabled: true },
      { id: 'assessments', name: 'Assessments', description: 'Quizzes, tests, and evaluations', tier: 'PROFESSIONAL', enabled: false },
      { id: 'certificates', name: 'Certificates', description: 'Issue completion certificates', tier: 'ENTERPRISE', enabled: false },
      { id: 'video_streaming', name: 'Video Streaming', description: 'Integrated video streaming', tier: 'ENTERPRISE', enabled: false }
    ],
    industrySupport: ['EDUCATION', 'TECHNOLOGY', 'HEALTHCARE', 'MANUFACTURING', 'GOVERNMENT']
  },

  // CERTIFICATION MODULE - Credential and certification management
  {
    id: 'certification',
    name: 'CERTIFICATION',
    displayName: 'Certification & Credentials',
    description: 'Issue and verify certificates, licenses, and credentials',
    icon: '🏆',
    category: 'SPECIALIZED',
    isCore: false,
    dependencies: ['learning'],
    pricing: {
      tier: 'PROFESSIONAL',
      monthlyPrice: 49
    },
    features: [
      { id: 'credential_issuance', name: 'Credential Issuance', description: 'Issue digital credentials', tier: 'PROFESSIONAL', enabled: true },
      { id: 'blockchain_verification', name: 'Blockchain Verification', description: 'Blockchain-verified credentials', tier: 'PROFESSIONAL', enabled: true },
      { id: 'compliance_tracking', name: 'Compliance Tracking', description: 'Track certification compliance', tier: 'ENTERPRISE', enabled: false },
      { id: 'third_party_verification', name: 'Third-Party Verification', description: 'API for external verification', tier: 'ENTERPRISE', enabled: false }
    ],
    industrySupport: ['EDUCATION', 'HEALTHCARE', 'TECHNOLOGY', 'MANUFACTURING', 'LEGAL', 'GOVERNMENT']
  },

  // PROJECT MANAGEMENT MODULE - Universal project and task management
  {
    id: 'projects',
    name: 'PROJECTS',
    displayName: 'Project Management',
    description: 'Comprehensive project and task management with team collaboration',
    icon: '📋',
    category: 'CORE',
    isCore: false,
    dependencies: ['crm'],
    pricing: {
      tier: 'BASIC',
      monthlyPrice: 19
    },
    features: [
      { id: 'project_management', name: 'Project Management', description: 'Create and manage projects', tier: 'BASIC', enabled: true },
      { id: 'task_management', name: 'Task Management', description: 'Task creation, assignment and tracking', tier: 'BASIC', enabled: true },
      { id: 'kanban_boards', name: 'Kanban Boards', description: 'Visual task management boards', tier: 'BASIC', enabled: true },
      { id: 'gantt_charts', name: 'Gantt Charts', description: 'Project timeline and dependency management', tier: 'PROFESSIONAL', enabled: false },
      { id: 'time_tracking', name: 'Time Tracking', description: 'Track time spent on tasks and projects', tier: 'PROFESSIONAL', enabled: false },
      { id: 'team_collaboration', name: 'Team Collaboration', description: 'Comments, file sharing, and notifications', tier: 'PROFESSIONAL', enabled: false },
      { id: 'project_templates', name: 'Project Templates', description: 'Industry-specific project templates', tier: 'PROFESSIONAL', enabled: false },
      { id: 'advanced_analytics', name: 'Advanced Analytics', description: 'Project performance and team analytics', tier: 'ENTERPRISE', enabled: false },
      { id: 'resource_management', name: 'Resource Management', description: 'Team workload and capacity planning', tier: 'ENTERPRISE', enabled: false }
    ],
    industrySupport: ['EDUCATION', 'HEALTHCARE', 'REAL_ESTATE', 'TECHNOLOGY', 'MANUFACTURING', 'RETAIL', 'SERVICES', 'LEGAL', 'GOVERNMENT', 'FINANCIAL']
  },

  // ENGAGEMENT MODULE - Alumni, customer retention, loyalty programs
  {
    id: 'engagement',
    name: 'ENGAGEMENT',
    displayName: 'Engagement & Retention',
    description: 'Alumni management, customer retention, and loyalty programs',
    icon: '🤝',
    category: 'BUSINESS',
    isCore: false,
    dependencies: ['certification'],
    pricing: {
      tier: 'PROFESSIONAL',
      monthlyPrice: 69
    },
    features: [
      { id: 'relationship_management', name: 'Relationship Management', description: 'Manage ongoing relationships', tier: 'PROFESSIONAL', enabled: true },
      { id: 'event_management', name: 'Event Management', description: 'Organize and manage events', tier: 'PROFESSIONAL', enabled: true },
      { id: 'donation_processing', name: 'Donation Processing', description: 'Process donations and fundraising', tier: 'PROFESSIONAL', enabled: false },
      { id: 'loyalty_programs', name: 'Loyalty Programs', description: 'Customer loyalty and rewards', tier: 'ENTERPRISE', enabled: false },
      { id: 'referral_tracking', name: 'Referral Tracking', description: 'Track and incentivize referrals', tier: 'ENTERPRISE', enabled: false }
    ],
    industrySupport: ['EDUCATION', 'HEALTHCARE', 'RETAIL', 'SERVICES', 'TECHNOLOGY']
  }
]

// ===================================
// INDUSTRY CONFIGURATIONS
// ===================================

export const SUPPORTED_INDUSTRIES: Industry[] = [
  {
    id: 'EDUCATION',
    name: 'Education',
    description: 'Schools, Universities, Training Centers',
    modules: ['crm', 'records', 'finance', 'learning', 'certification', 'projects', 'engagement'],
    terminologyOverrides: {
      'records': 'Student Information System (SIS)',
      'entities': 'Students',
      'learning': 'Learning Management System (LMS)',
      'certification': 'Graduation & Credentials',
      'projects': 'Academic Projects',
      'engagement': 'Alumni Relations'
    }
  },
  {
    id: 'HEALTHCARE',
    name: 'Healthcare',
    description: 'Hospitals, Clinics, Medical Practices',
    modules: ['crm', 'records', 'finance', 'learning', 'certification', 'projects'],
    terminologyOverrides: {
      'records': 'Patient Management System',
      'entities': 'Patients',
      'learning': 'Medical Training',
      'certification': 'Medical Certifications',
      'projects': 'Clinical Projects',
      'crm': 'Patient Relations'
    }
  },
  {
    id: 'REAL_ESTATE',
    name: 'Real Estate',
    description: 'Real Estate Agencies, Property Management',
    modules: ['crm', 'records', 'finance', 'projects'],
    terminologyOverrides: {
      'records': 'Property & Tenant Management',
      'entities': 'Properties & Renters',
      'finance': 'Rent Collection & Billing',
      'projects': 'Property Development',
      'crm': 'Landlord & Tenant Onboarding',
      'invoices': 'Rent Invoices',
      'payments': 'Rent Payments',
      'clients': 'Landlords & Tenants',
      'leads': 'Property Inquiries'
    }
  },
  {
    id: 'TECHNOLOGY',
    name: 'Technology',
    description: 'Software Companies, Tech Services',
    modules: ['crm', 'records', 'finance', 'learning', 'certification', 'projects'],
    terminologyOverrides: {
      'records': 'Client Management',
      'entities': 'Clients',
      'learning': 'Training & Onboarding',
      'certification': 'Technical Certifications'
    }
  },
  {
    id: 'MANUFACTURING',
    name: 'Manufacturing',
    description: 'Manufacturing Companies, Industrial Operations',
    modules: ['crm', 'records', 'finance', 'learning', 'certification', 'projects'],
    terminologyOverrides: {
      'records': 'Operations Management',
      'entities': 'Production Units',
      'learning': 'Training & Safety',
      'certification': 'Compliance & Quality'
    }
  },
  {
    id: 'RETAIL',
    name: 'Retail',
    description: 'Retail Stores, E-commerce, Consumer Brands',
    modules: ['crm', 'finance', 'learning', 'engagement'],
    terminologyOverrides: {
      'crm': 'Customer Management',
      'learning': 'Staff Training',
      'engagement': 'Customer Loyalty'
    }
  },
  {
    id: 'SERVICES',
    name: 'Professional Services',
    description: 'Consulting, Legal, Accounting, etc.',
    modules: ['crm', 'records', 'finance', 'projects', 'engagement'],
    terminologyOverrides: {
      'records': 'Client Management',
      'entities': 'Clients',
      'engagement': 'Client Relations'
    }
  },
  {
    id: 'LEGAL',
    name: 'Legal',
    description: 'Law Firms, Legal Services',
    modules: ['crm', 'records', 'finance', 'certification'],
    terminologyOverrides: {
      'records': 'Case Management',
      'entities': 'Cases',
      'certification': 'Legal Certifications',
      'crm': 'Client Development'
    }
  },
  {
    id: 'GOVERNMENT',
    name: 'Government',
    description: 'Government Agencies, Public Services',
    modules: ['records', 'finance', 'learning', 'certification'],
    terminologyOverrides: {
      'records': 'Citizen Services',
      'entities': 'Citizens',
      'learning': 'Public Training',
      'certification': 'Public Certifications'
    }
  },
  {
    id: 'FINANCIAL',
    name: 'Financial Services',
    description: 'Banks, Insurance, Investment Firms',
    modules: ['crm', 'records', 'finance', 'learning', 'certification', 'projects'],
    terminologyOverrides: {
      'records': 'Client Portfolio Management',
      'entities': 'Clients',
      'learning': 'Financial Education',
      'certification': 'Financial Certifications'
    }
  }
]

// ===================================
// UTILITY FUNCTIONS
// ===================================

export function getAvailableModulesForIndustry(industryId: string): ModuleConfig[] {
  const industry = SUPPORTED_INDUSTRIES.find(ind => ind.id === industryId)
  if (!industry) return AVAILABLE_MODULES

  return AVAILABLE_MODULES.filter(mod => industry.modules.includes(mod.id))
}

export function getModuleDisplayName(moduleId: string, industryId: string): string {
  const industry = SUPPORTED_INDUSTRIES.find(ind => ind.id === industryId)
  const moduleItem = AVAILABLE_MODULES.find(mod => mod.id === moduleId)

  if (industry?.terminologyOverrides?.[moduleId]) {
    return industry.terminologyOverrides[moduleId]
  }

  return moduleItem?.displayName || moduleId
}

export function calculateMonthlyPrice(enabledModules: string[]): number {
  return AVAILABLE_MODULES
    .filter(mod => enabledModules.includes(mod.id))
    .reduce((total, mod) => total + mod.pricing.monthlyPrice, 0)
}

export function getModuleDependencies(moduleId: string): string[] {
  const moduleItem = AVAILABLE_MODULES.find(mod => mod.id === moduleId)
  return moduleItem?.dependencies || []
}

export function validateModuleConfiguration(enabledModules: string[]): {
  valid: boolean
  errors: string[]
  requiredModules: string[]
} {
  const errors: string[] = []
  const requiredModules: Set<string> = new Set()

  // Always require CRM as it's core
  requiredModules.add('crm')

  // Check dependencies for each enabled module
  enabledModules.forEach(moduleId => {
    const dependencies = getModuleDependencies(moduleId)
    dependencies.forEach(dep => {
      requiredModules.add(dep)
      if (!enabledModules.includes(dep)) {
        errors.push(`Module '${moduleId}' requires '${dep}' to be enabled`)
      }
    })
  })

  return {
    valid: errors.length === 0,
    errors,
    requiredModules: Array.from(requiredModules)
  }
}