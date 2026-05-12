/**
 * Shared utility functions for status colors across components
 */

export const getPriorityColor = (priority: string) => {
  const colors = {
    URGENT: 'bg-danger-100 text-danger-800 border-danger-300',
    HIGH: 'bg-warning-100 text-warning-800 border-warning-300',
    MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    LOW: 'bg-primary-100 text-primary-800 border-primary-300',
  }
  return colors[priority as keyof typeof colors] || 'bg-neutral-100 text-neutral-800 border-neutral-300'
}

export const getStatusColor = (status: string) => {
  const colors = {
    COMPLETED: 'bg-success-100 text-success-800',
    IN_PROGRESS: 'bg-primary-100 text-primary-800',
    PENDING: 'bg-yellow-100 text-yellow-800',
    CANCELLED: 'bg-neutral-100 text-neutral-800',
    ACTIVE: 'bg-success-100 text-success-800',
    INACTIVE: 'bg-neutral-100 text-neutral-800',
    OVERDUE: 'bg-danger-100 text-danger-800',
    PAID: 'bg-success-100 text-success-800',
    FAILED: 'bg-danger-100 text-danger-800',
  }
  return colors[status as keyof typeof colors] || 'bg-neutral-100 text-neutral-800'
}

export const getStakeholderColor = (type: string) => {
  const colors = {
    TENANT: 'bg-success-100 text-success-800',
    LANDLORD: 'bg-purple-100 text-purple-800',
    VENDOR: 'bg-warning-100 text-warning-800',
    LEAD: 'bg-indigo-100 text-indigo-800',
    ENQUIRY: 'bg-pink-100 text-pink-800',
  }
  return colors[type as keyof typeof colors] || 'bg-neutral-100 text-neutral-800'
}

export const getLeadStatusColor = (status: string) => {
  const colors = {
    NEW: 'bg-primary-100 text-primary-800',
    CONTACTED: 'bg-yellow-100 text-yellow-800',
    QUALIFIED: 'bg-purple-100 text-purple-800',
    CONVERTED: 'bg-success-100 text-success-800',
    LOST: 'bg-danger-100 text-danger-800',
  }
  return colors[status as keyof typeof colors] || 'bg-neutral-100 text-neutral-800'
}

export const getEnquiryStatusColor = (status: string) => {
  const colors = {
    OPEN: 'bg-primary-100 text-primary-800',
    IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
    RESOLVED: 'bg-success-100 text-success-800',
    CLOSED: 'bg-neutral-100 text-neutral-800',
  }
  return colors[status as keyof typeof colors] || 'bg-neutral-100 text-neutral-800'
}

export const getMessageTypeIcon = (type: string) => {
  const icons = {
    EMAIL: '📧',
    SMS: '💬',
    IN_APP: '🔔',
    SYSTEM: '⚙️',
    WHATSAPP: '💚', // WhatsApp green heart
  }
  return icons[type as keyof typeof icons] || '📨'
}
