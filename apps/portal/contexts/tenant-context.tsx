'use client'

import React from 'react'

const TenantContext = React.createContext<any>(null)

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <TenantContext.Provider value={{}}>
      {children}
    </TenantContext.Provider>
  )
}

export const useTenant = () => {
  const context = React.useContext(TenantContext)
  if (!context) {
    throw new Error('useTenant must be used within TenantProvider')
  }
  return context
}
