"use client"

import { useEffect, useRef, useState } from "react"
import { useAuth } from "../app/auth-context"
import { Plus, Menu, X, LogOut, Trash2 } from "lucide-react"
import ReactMarkdown from "react-markdown"

interface Message {
  id?: number
  role: "user" | "assistant"
  content: string
}

interface ChatSession {
  id: number
  title: string
  created_at: string
}

export default function Chat() {
  const { token, user, logout } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const bottomRef = useRef<any>(null)

  // Load sessions on mount
  useEffect(() => {
    if (token) {
      loadSessions()
    }
  }, [token])

  // Auto scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const loadSessions = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/chat/sessions", {
        headers: { "Authorization": `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setSessions(data)
      }
    } catch (err) {
      console.error("Failed to load sessions:", err)
    }
  }

  const createNewSession = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/chat/sessions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setCurrentSessionId(data.id)
        setMessages([])
        loadSessions()
      }
    } catch (err) {
      console.error("Failed to create session:", err)
    }
  }

  const loadSession = async (sessionId: number) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/chat/sessions/${sessionId}`, {
        headers: { "Authorization": `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages)
        setCurrentSessionId(sessionId)
        setMobileMenuOpen(false)
      }
    } catch (err) {
      console.error("Failed to load session:", err)
    }
  }

  const deleteSession = async (sessionId: number) => {
    try {
      await fetch(`http://127.0.0.1:8000/chat/sessions/${sessionId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` },
      })
      loadSessions()
      if (currentSessionId === sessionId) {
        setMessages([])
        setCurrentSessionId(null)
      }
    } catch (err) {
      console.error("Failed to delete session:", err)
    }
  }

  const send = async () => {
    if (!query.trim()) return

    // Create new session if none exists
    if (!currentSessionId) {
      const res = await fetch("http://127.0.0.1:8000/chat/sessions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setCurrentSessionId(data.id)
      }
    }

    setLoading(true)
    const userMessage: Message = { role: "user", content: query }
    setMessages(prev => [...prev, userMessage])
    setQuery("")

    try {
      const res = await fetch("http://127.0.0.1:8000/query/ask-stream", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ query, session_id: currentSessionId }),
      })

      if (!res.body) {
        setLoading(false)
        return
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let botText = ""

      setMessages(prev => [...prev, { role: "assistant", content: "" }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        botText += chunk

        setMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1].content = botText
          return updated
        })
      }

      loadSessions()
    } catch (err) {
      console.error("Error sending message:", err)
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return <div className="flex items-center justify-center h-screen text-white">Loading...</div>
  }

  return (
    <div className="flex h-full bg-[#0b0f19] text-white">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-0"
        } transition-all duration-300 border-r border-gray-800 flex flex-col bg-[#0f1419] overflow-hidden`}
      >
        {/* New Chat Button */}
        <div className="p-4 border-b border-gray-800">
          <button
            onClick={createNewSession}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition"
          >
            <Plus size={18} />
            New Chat
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {sessions.map(session => (
            <div
              key={session.id}
              className={`p-3 rounded-lg cursor-pointer group flex items-center justify-between transition ${
                currentSessionId === session.id
                  ? "bg-blue-600 text-white"
                  : "bg-[#1f2937] hover:bg-[#2a3544] text-gray-200"
              }`}
            >
              <div
                onClick={() => loadSession(session.id)}
                className="flex-1 truncate"
              >
                <p className="text-sm font-medium truncate">{session.title}</p>
                <p className="text-xs opacity-60">
                  {new Date(session.created_at).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  deleteSession(session.id)
                }}
                className="opacity-0 group-hover:opacity-100 transition ml-2"
              >
                <Trash2 size={16} className="text-red-400 hover:text-red-300" />
              </button>
            </div>
          ))}
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-800 space-y-3">
          <div className="bg-[#1f2937] rounded-lg p-3">
            <p className="text-xs text-gray-400 mb-1">Logged in as</p>
            <p className="text-sm font-medium">{user?.username}</p>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 bg-red-600/20 hover:bg-red-600/30 text-red-300 font-semibold py-2 rounded-lg transition border border-red-600/30"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-[#0f1419]">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <h2 className="text-lg font-medium">Ask your documents</h2>
          <div className="w-6" />
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-center">
              <div>
                <p className="text-3xl font-bold mb-2">Welcome! 👋</p>
                <p className="text-gray-400">
                  Start a new conversation or upload documents to get started
                </p>
              </div>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-2xl rounded-lg p-4 ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-[#1f2937] text-gray-100 border border-gray-700"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <ReactMarkdown className="prose prose-invert text-sm">
                      {msg.content}
                    </ReactMarkdown>
                  ) : (
                    <p className="text-sm">{msg.content}</p>
                  )}
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-[#1f2937] border border-gray-700 rounded-lg p-4">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="p-6 border-t border-gray-800 bg-[#0f1419]">
          <div className="flex gap-3 max-w-4xl mx-auto">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && !loading && send()}
              placeholder="Ask a question..."
              className="flex-1 bg-[#1f2937] border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none transition"
              disabled={loading}
            />
            <button
              onClick={send}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold px-6 py-3 rounded-lg transition"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}