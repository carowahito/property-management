/**
 * API Client for Property Management System
 * Provides typed functions for making API calls
 */

type FetchOptions = {
  method?: string
  body?: any
  headers?: HeadersInit
}

async function fetchAPI<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {} } = options

  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  }

  if (body) {
    config.body = JSON.stringify(body)
  }

  const response = await fetch(`/api${endpoint}`, config)

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'An error occurred' }))
    throw new Error(error.error || 'Request failed')
  }

  return response.json()
}

// Tasks API
export const tasksAPI = {
  getAll: (params?: URLSearchParams) =>
    fetchAPI(`/tasks${params ? `?${params}` : ''}`),

  getById: (id: string) =>
    fetchAPI(`/tasks/${id}`),

  create: (data: any) =>
    fetchAPI('/tasks', { method: 'POST', body: data }),

  update: (id: string, data: any) =>
    fetchAPI(`/tasks/${id}`, { method: 'PATCH', body: data }),

  delete: (id: string) =>
    fetchAPI(`/tasks/${id}`, { method: 'DELETE' }),
}

// Leads API
export const leadsAPI = {
  getAll: (params?: URLSearchParams) =>
    fetchAPI(`/leads${params ? `?${params}` : ''}`),

  getById: (id: string) =>
    fetchAPI(`/leads/${id}`),

  create: (data: any) =>
    fetchAPI('/leads', { method: 'POST', body: data }),

  update: (id: string, data: any) =>
    fetchAPI(`/leads/${id}`, { method: 'PATCH', body: data }),

  delete: (id: string) =>
    fetchAPI(`/leads/${id}`, { method: 'DELETE' }),
}

// Messages API
export const messagesAPI = {
  getAll: (params?: URLSearchParams) =>
    fetchAPI(`/messages${params ? `?${params}` : ''}`),

  create: (data: any) =>
    fetchAPI('/messages', { method: 'POST', body: data }),
}

// Properties API
export const propertiesAPI = {
  getAll: (params?: URLSearchParams) =>
    fetchAPI(`/properties${params ? `?${params}` : ''}`),

  getById: (id: string) =>
    fetchAPI(`/properties/${id}`),
}

// Tenants API
export const tenantsAPI = {
  getAll: (params?: URLSearchParams) =>
    fetchAPI(`/tenants${params ? `?${params}` : ''}`),

  getById: (id: string) =>
    fetchAPI(`/tenants/${id}`),
}

// Landlords API
export const landlordsAPI = {
  getAll: (params?: URLSearchParams) =>
    fetchAPI(`/landlords${params ? `?${params}` : ''}`),

  getById: (id: string) =>
    fetchAPI(`/landlords/${id}`),
}

// Vendors API
export const vendorsAPI = {
  getAll: (params?: URLSearchParams) =>
    fetchAPI(`/vendors${params ? `?${params}` : ''}`),

  getById: (id: string) =>
    fetchAPI(`/vendors/${id}`),
}
