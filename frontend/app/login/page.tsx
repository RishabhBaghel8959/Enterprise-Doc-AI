"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "../auth-context"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      await login(username, password)
      router.push("/")
    } catch (err: any) {
      setError(err.message || "Login failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b0f19] to-[#1a1f2e] text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">EnterpriseDocAI</h1>
          <p className="text-gray-400">Sign in to your account</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="bg-[#111827] border border-gray-700 rounded-2xl p-8 space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-200 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-[#0b0f19] border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none transition"
              placeholder="Enter your username"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#0b0f19] border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none transition"
              placeholder="Enter your password"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition"
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Signup Link */}
        <p className="text-center text-gray-400 mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-blue-500 hover:text-blue-400">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
