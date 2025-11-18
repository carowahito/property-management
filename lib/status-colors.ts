/**
 * Shared utility functions for status colors across components
 */

export const getPriorityColor = (priority: string) => {
  const colors = {
    URGENT: 'bg-red-100 text-red-800 border-red-300',
    HIGH: 'bg-orange-100 text-orange-800 border-orange-300',
    MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    LOW: 'bg-blue-100 text-blue-800 border-blue-300',
  }
  return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-300'
}

export const getStatusColor = (status: string) => {
  const colors = {
    COMPLETED: 'bg-green-100 text-green-800',
    IN_PROGRESS: 'bg-blue-100 text-blue-800',
    PENDING: 'bg-yellow-100 text-yellow-800',
    CANCELLED: 'bg-gray-100 text-gray-800',
    ACTIVE: 'bg-green-100 text-green-800',
    INACTIVE: 'bg-gray-100 text-gray-800',
    OVERDUE: 'bg-red-100 text-red-800',
    PAID: 'bg-green-100 text-green-800',
    FAILED: 'bg-red-100 text-red-800',
  }
  return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
}

export const getStakeholderColor = (type: string) => {
  const colors = {
    TENANT: 'bg-green-100 text-green-800',
    LANDLORD: 'bg-purple-100 text-purple-800',
    VENDOR: 'bg-orange-100 text-orange-800',
    LEAD: 'bg-indigo-100 text-indigo-800',
    ENQUIRY: 'bg-pink-100 text-pink-800',
  }
  return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'
}

export const getLeadStatusColor = (status: string) => {
  const colors = {
    NEW: 'bg-blue-100 text-blue-800',
    CONTACTED: 'bg-yellow-100 text-yellow-800',
    QUALIFIED: 'bg-purple-100 text-purple-800',
    CONVERTED: 'bg-green-100 text-green-800',
    LOST: 'bg-red-100 text-red-800',
  }
  return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
}

export const getEnquiryStatusColor = (status: string) => {
  const colors = {
    OPEN: 'bg-blue-100 text-blue-800',
    IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
    RESOLVED: 'bg-green-100 text-green-800',
    CLOSED: 'bg-gray-100 text-gray-800',
  }
  return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
}

export const getMessageTypeIcon = (type: string) => {
  const icons = {
    EMAIL: '📧',
    SMS: '💬',
    IN_APP: '🔔',
    SYSTEM: '⚙️',
  }
  return icons[type as keyof typeof icons] || '📨'
}
