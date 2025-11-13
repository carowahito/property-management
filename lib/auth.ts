// Mock auth imports for build
type AuthUser = {
  userId: string
  username: string
}

export async function getUserProfile(userId: string) {
  try {
    // Mock implementation for build
    return {
      id: userId,
      email: 'user@example.com',
      name: 'Mock User'
    }
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return null
  }
}

export async function createUserProfile(userData: {
  email: string
  role: 'STUDENT' | 'TEACHER' | 'ADMIN' | 'PARENT'
  tier: 'PRIMARY' | 'SECONDARY' | 'HIGHER_ED'
  tenantId?: string
}) {
  try {
    // Mock implementation for build
    return {
      id: 'mock-id',
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  } catch (error) {
    console.error('Error creating user profile:', error)
    throw error
  }
}

export function determineUserTier(age: number): 'PRIMARY' | 'SECONDARY' | 'HIGHER_ED' {
  if (age <= 11) return 'PRIMARY'
  if (age <= 18) return 'SECONDARY'
  return 'HIGHER_ED'
}

export async function getCurrentUserWithProfile(): Promise<{
  authUser: AuthUser | null
  userProfile: any | null
}> {
  try {
    // Mock implementation for build
    const authUser: AuthUser = { userId: 'mock-user', username: 'mockuser' }
    const userProfile = await getUserProfile(authUser.userId)
    return { authUser, userProfile }
  } catch (error) {
    return { authUser: null, userProfile: null }
  }
}