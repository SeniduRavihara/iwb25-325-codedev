export type UserRole = "admin" | "user" | "guest"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  avatar?: string
  joinedAt: Date
}

// Mock user data - in real app this would come from database/auth service
export const mockUsers: User[] = [
  {
    id: "1",
    email: "admin@codearena.com",
    name: "Admin User",
    role: "admin",
    joinedAt: new Date("2024-01-01"),
  },
  {
    id: "2",
    email: "john@example.com",
    name: "John Doe",
    role: "user",
    joinedAt: new Date("2024-02-15"),
  },
]

// Mock authentication state
let currentUser: User | null = null

export function getCurrentUser(): User | null {
  return currentUser
}

export function setCurrentUser(user: User | null) {
  currentUser = user
}

export function hasRole(requiredRole: UserRole): boolean {
  if (!currentUser) return false

  const roleHierarchy: Record<UserRole, number> = {
    guest: 0,
    user: 1,
    admin: 2,
  }

  return roleHierarchy[currentUser.role] >= roleHierarchy[requiredRole]
}

export function canAccessAnalytics(): boolean {
  return hasRole("admin")
}

export function canAccessContests(): boolean {
  return hasRole("user")
}

export function canCreateChallenges(): boolean {
  return hasRole("user")
}
