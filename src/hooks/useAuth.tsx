import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { API_BASE } from '../lib/api'

interface User {
  id: string
  phoneNumber?: string | null
  name?: string | null
  email?: string | null
  role: string
  shop?: any
  seller?: any
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (token: string, user: User) => void
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
  refreshUser: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchUser = async () => {
    const token = localStorage.getItem('tirelink_token')
    if (!token) {
      setIsLoading(false)
      return
    }
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setUser(data)
      } else {
        localStorage.removeItem('tirelink_token')
      }
    } catch {
      // Offline - keep existing user if any
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { fetchUser() }, [])

  const login = (token: string, userData: User) => {
    localStorage.setItem('tirelink_token', token)
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('tirelink_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, login, logout, refreshUser: fetchUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
