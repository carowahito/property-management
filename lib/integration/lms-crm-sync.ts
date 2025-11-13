// Mock client for build
const client = {
  models: {
    Tenant: {
      get: async (args: any) => ({ data: null }),
      create: async (args: any) => ({ data: { id: 'mock-id', ...args } }),
      update: async (args: any) => ({ data: { id: args.id, ...args } })
    },
    User: {
      create: async (args: any) => ({ data: { id: 'mock-id', ...args } })
    }
  }
}

// Types for integration
interface CourseInterestLead {
  firstName: string
  lastName: string
  email: string
  phone?: string
  company?: string
  courseId: string
  courseName: string
  tier: 'PRIMARY' | 'SECONDARY' | 'HIGHER_ED'
  source: 'course_preview' | 'trial_signup' | 'demo_request' | 'contact_form'
  metadata?: {
    viewedCourses?: string[]
    timeSpentOnSite?: number
    downloadedResources?: string[]
    referralSource?: string
    tenantId?: string
  }
}

interface CRMWebhookPayload {
  eventType: 'deal.closed_won' | 'deal.closed_lost' | 'contact.qualified'
  tenantId: string
  dealId?: string
  contactId?: string
  data: any
}

// CRM API Configuration
const CRM_API_BASE = process.env.CRM_API_BASE_URL || 'http://localhost:3001/api'
const CRM_API_KEY = process.env.CRM_API_KEY

class LMSCRMIntegration {
  private async callCRMAPI(endpoint: string, method: 'GET' | 'POST' | 'PUT' = 'GET', data?: any) {
    const url = `${CRM_API_BASE}${endpoint}`
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CRM_API_KEY}`,
        'X-Source-System': 'lms'
      }
    }

    if (data && method !== 'GET') {
      options.body = JSON.stringify(data)
    }

    try {
      const response = await fetch(url, options)
      if (!response.ok) {
        throw new Error(`CRM API Error: ${response.status} ${response.statusText}`)
      }
      return await response.json()
    } catch (error) {
      console.error('CRM API call failed:', error)
      throw error
    }
  }

  // Lead Generation from LMS Activities
  async createLeadFromCourseInterest(data: CourseInterestLead) {
    const leadScore = this.calculateLeadScore(data)
    
    const leadData = {
      tenantId: data.metadata?.tenantId || 'default',
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      company: data.company,
      status: 'new' as const,
      score: leadScore,
      source: `lms_${data.source}`,
      courseInterest: data.courseName,
      budget: this.estimateBudgetByTier(data.tier),
      timeline: this.estimateTimelineByTier(data.tier),
      metadata: {
        tier: data.tier,
        courseId: data.courseId,
        courseName: data.courseName,
        ...data.metadata
      }
    }

    try {
      const result = await this.callCRMAPI('/leads', 'POST', leadData)
      console.log('Lead created in CRM:', result.leadId)
      
      // Log the lead creation in LMS for tracking
      await this.logLeadActivity(data.email, result.leadId, 'lead_created')
      
      return result
    } catch (error) {
      console.error('Failed to create lead in CRM:', error)
      throw error
    }
  }

  // Calculate lead score based on LMS engagement
  private calculateLeadScore(data: CourseInterestLead): number {
    let score = 0
    
    // Base score by tier
    switch (data.tier) {
      case 'HIGHER_ED':
        score += 40 // Higher education typically has larger budgets
        break
      case 'SECONDARY':
        score += 30
        break
      case 'PRIMARY':
        score += 20
        break
    }
    
    // Source quality scoring
    switch (data.source) {
      case 'demo_request':
        score += 30
        break
      case 'trial_signup':
        score += 25
        break
      case 'contact_form':
        score += 20
        break
      case 'course_preview':
        score += 15
        break
    }
    
    // Engagement scoring
    if (data.metadata) {
      if (data.metadata.viewedCourses && data.metadata.viewedCourses.length > 3) {
        score += 15
      }
      if (data.metadata.timeSpentOnSite && data.metadata.timeSpentOnSite > 600) { // 10+ minutes
        score += 10
      }
      if (data.metadata.downloadedResources && data.metadata.downloadedResources.length > 0) {
        score += 10
      }
    }
    
    // Company information
    if (data.company) {
      score += 10
    }
    
    if (data.phone) {
      score += 5
    }
    
    return Math.min(score, 100) // Cap at 100
  }
  
  private estimateBudgetByTier(tier: string): number {
    switch (tier) {
      case 'HIGHER_ED':
        return 50000 // Universities typically have larger budgets
      case 'SECONDARY':
        return 25000 // High schools, medium budget
      case 'PRIMARY':
        return 10000 // Elementary schools, smaller budget
      default:
        return 15000
    }
  }
  
  private estimateTimelineByTier(tier: string): string {
    switch (tier) {
      case 'HIGHER_ED':
        return '3-6 months' // Universities have longer decision cycles
      case 'SECONDARY':
        return '2-4 months'
      case 'PRIMARY':
        return '1-3 months'
      default:
        return '2-4 months'
    }
  }

  // Handle CRM webhooks
  async handleCRMWebhook(payload: CRMWebhookPayload) {
    switch (payload.eventType) {
      case 'deal.closed_won':
        return await this.handleDealClosedWon(payload)
      case 'deal.closed_lost':
        return await this.handleDealClosedLost(payload)
      case 'contact.qualified':
        return await this.handleContactQualified(payload)
      default:
        console.warn('Unknown CRM webhook event:', payload.eventType)
    }
  }

  private async handleDealClosedWon(payload: CRMWebhookPayload) {
    const { tenantId, dealId, data } = payload
    
    try {
      // Create or update tenant in LMS
      const tenant = await this.createOrUpdateTenant({
        tenantId,
        name: data.companyName || data.contactName,
        domain: data.domain || `${tenantId}.eduai-platform.com`,
        subscription: data.subscriptionTier || 'BASIC',
        maxUsers: data.userCount || 100,
        dealValue: data.dealValue,
        contractStartDate: data.contractStartDate,
        contractEndDate: data.contractEndDate
      })
      
      // Create initial admin user
      if (data.primaryContact) {
        await this.createLMSUser({
          tenantId,
          email: data.primaryContact.email,
          role: 'ADMIN',
          tier: data.tier || 'SECONDARY',
          profile: {
            firstName: data.primaryContact.firstName,
            lastName: data.primaryContact.lastName
          }
        })
      }
      
      // Log success activity back to CRM
      await this.callCRMAPI(`/deals/${dealId}/activities`, 'POST', {
        type: 'note',
        title: 'LMS Account Provisioned',
        description: `LMS tenant ${tenantId} has been successfully created and configured.`,
        status: 'completed'
      })
      
      console.log('Successfully provisioned LMS tenant for closed deal:', dealId)
      return { success: true, tenantId }
      
    } catch (error) {
      console.error('Failed to provision LMS tenant:', error)
      
      // Log error back to CRM
      await this.callCRMAPI(`/deals/${dealId}/activities`, 'POST', {
        type: 'note',
        title: 'LMS Provisioning Failed',
        description: `Failed to provision LMS tenant: ${error instanceof Error ? error.message : String(error)}`,
        status: 'completed'
      })
      
      throw error
    }
  }

  private async handleDealClosedLost(payload: CRMWebhookPayload) {
    // Could trigger re-engagement campaigns or collect feedback
    console.log('Deal closed lost, implementing re-engagement strategy')
  }

  private async handleContactQualified(payload: CRMWebhookPayload) {
    // Could upgrade trial features or provide additional resources
    const { contactId, data } = payload
    
    // Upgrade LMS trial if they have one
    if (data.email) {
      await this.upgradeTrialFeatures(data.email)
    }
  }

  // LMS Operations
  private async createOrUpdateTenant(tenantData: any) {
    try {
      const { data: existingTenant } = await client.models.Tenant.get({ id: tenantData.tenantId })
      
      if (existingTenant) {
        // Update existing tenant
        const { data: updatedTenant } = await client.models.Tenant.update({
          id: tenantData.tenantId,
          ...tenantData,
          updatedAt: new Date().toISOString()
        })
        return updatedTenant
      } else {
        // Create new tenant
        const { data: newTenant } = await client.models.Tenant.create({
          ...tenantData,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
        return newTenant
      }
    } catch (error) {
      console.error('Error creating/updating tenant:', error)
      throw error
    }
  }

  private async createLMSUser(userData: any) {
    try {
      const { data: user } = await client.models.User.create({
        ...userData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      return user
    } catch (error) {
      console.error('Error creating LMS user:', error)
      throw error
    }
  }

  private async upgradeTrialFeatures(email: string) {
    // Implementation to upgrade trial user features
    console.log(`Upgrading trial features for qualified contact: ${email}`)
  }

  private async logLeadActivity(email: string, leadId: string, activity: string) {
    // Log activity in LMS for tracking
    console.log(`Lead activity logged: ${email} - ${activity} - ${leadId}`)
  }

  // Sync user data between systems
  async syncUserToCRM(lmsUser: any) {
    const crmContactData = {
      tenantId: lmsUser.tenantId,
      type: 'customer' as const,
      status: 'active' as const,
      firstName: lmsUser.profile?.firstName || '',
      lastName: lmsUser.profile?.lastName || '',
      email: lmsUser.email,
      source: 'lms_enrollment',
      leadScore: 90, // High score for existing customers
      customFields: {
        lmsUserId: lmsUser.id,
        tier: lmsUser.tier,
        lastLMSActivity: lmsUser.lastAccessedAt,
        totalEnrollments: lmsUser.enrollments?.length || 0
      }
    }

    try {
      const result = await this.callCRMAPI('/contacts', 'POST', crmContactData)
      console.log('User synced to CRM as contact:', result.contactId)
      return result
    } catch (error) {
      console.error('Failed to sync user to CRM:', error)
      throw error
    }
  }
}

// Export singleton instance
export const lmsCrmIntegration = new LMSCRMIntegration()

// Helper functions for React components
export async function trackCourseInterest(data: CourseInterestLead) {
  return await lmsCrmIntegration.createLeadFromCourseInterest(data)
}

export async function handleCRMWebhook(payload: CRMWebhookPayload) {
  return await lmsCrmIntegration.handleCRMWebhook(payload)
}