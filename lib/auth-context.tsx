'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'

type AuthRole = 'user' | 'superadmin'

interface AuthContextType {
  isAuthenticated: boolean
  role: AuthRole | null
  login: (email: string, password: string) => void
  loginMockup: () => void
  loginSuperadmin: () => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const AUTH_KEY = 'cumplify_auth'
const ROLE_KEY = 'cumplify_role'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [role, setRole] = useState<AuthRole | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const stored = sessionStorage.getItem(AUTH_KEY)
    const storedRole = sessionStorage.getItem(ROLE_KEY) as AuthRole | null
    if (stored === 'true') {
      setIsAuthenticated(true)
      setRole(storedRole || 'user')
    }
    setIsLoading(false)
  }, [])

  const login = (email: string, password: string) => {
    sessionStorage.setItem(AUTH_KEY, 'true')
    sessionStorage.setItem(ROLE_KEY, 'user')
    setIsAuthenticated(true)
    setRole('user')
    router.push('/')
  }

  const loginMockup = () => {
    sessionStorage.setItem(AUTH_KEY, 'true')
    sessionStorage.setItem(ROLE_KEY, 'user')
    setIsAuthenticated(true)
    setRole('user')
    router.push('/')
  }

  const loginSuperadmin = () => {
    sessionStorage.setItem(AUTH_KEY, 'true')
    sessionStorage.setItem(ROLE_KEY, 'superadmin')
    setIsAuthenticated(true)
    setRole('superadmin')
    router.push('/superadmin')
  }

  const logout = () => {
    sessionStorage.removeItem(AUTH_KEY)
    sessionStorage.removeItem(ROLE_KEY)
    setIsAuthenticated(false)
    setRole(null)
    router.push('/login')
  }

  if (isLoading) {
    return null
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, role, login, loginMockup, loginSuperadmin, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
