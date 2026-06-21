"use client"

import { createContext, useContext, useState, useEffect } from "react"

interface AuthContextType {
  user: { id: number; username: string } | null
  token: string | null
  login: (username: string, password: string) => Promise<void>
  signup: (email: string, username: string, password: string) => Promise<void>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ id: number; username: string } | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("token")
    const savedUser = localStorage.getItem("user")
    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (username: string, password: string) => {
    const res = await fetch("http://127.0.0.1:8000/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })

    if (!res.ok) {
      throw new Error("Login failed")
    }

    const data = await res.json()
    setToken(data.access_token)
    const userData = { id: data.user_id, username: data.username }
    setUser(userData)
    localStorage.setItem("token", data.access_token)
    localStorage.setItem("user", JSON.stringify(userData))
  }

  const signup = async (email: string, username: string, password: string) => {
    const res = await fetch("http://127.0.0.1:8000/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, username, password }),
    })

    if (!res.ok) {
      throw new Error("Signup failed")
    }

    const data = await res.json()
    setToken(data.access_token)
    const userData = { id: data.user_id, username: data.username }
    setUser(userData)
    localStorage.setItem("token", data.access_token)
    localStorage.setItem("user", JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem("token")
    localStorage.removeItem("user")
  }

  return (
    <AuthContext.Provider value={{ user, token, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
